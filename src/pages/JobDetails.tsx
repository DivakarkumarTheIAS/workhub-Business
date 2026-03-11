import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import {
    Building2, MapPin, DollarSign,
    ChevronLeft, ExternalLink, CheckCircle2, XCircle, Search
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Job } from "@/types/job";
import { toast } from "sonner";

interface Application {
    id: string;
    name: string;
    role: string;
    status: string;
    match: number;
    avatar: string;
    applied: string;
    rejectionDescription?: string;
    shortlistGreeting?: string;
}

const Modal = ({ isOpen, onClose, title, children, onConfirm }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-8">
                    <h3 className="text-xl font-medium text-slate-900 mb-2">{title}</h3>
                    <div className="mt-4">{children}</div>
                    <div className="mt-8 flex gap-3">
                        <button onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-600 font-medium hover:bg-slate-100 transition-all">Cancel</button>
                        <button onClick={onConfirm} className="flex-1 h-12 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<{
        open: boolean;
        type: 'Reject' | 'Shortlist' | 'Waitlist' | null;
        userId: string | null;
        value: string;
    }>({ open: false, type: null, userId: null, value: "" });

    useEffect(() => {
        if (!id) return;

        // Fetch Job Details and its applicants
        const jobDocRef = doc(db, "job_posts", id);
        const unsubscribeJob = onSnapshot(jobDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setJob({ id: docSnap.id, ...data } as Job);

                // Extract applicants from the map
                if (data.applicants) {
                    const appsData = Object.entries(data.applicants).map(([userId, app]: [string, any]) => {
                        const name = app.applicantName || app.workerName || app.name || "Anonymous";
                        const status = (app.status || "Pending").charAt(0).toUpperCase() + (app.status || "Pending").slice(1).toLowerCase();

                        return {
                            id: userId,
                            name: name,
                            role: app.applicantRole || app.workerRole || app.role || "Professional",
                            status: status === "Applied" ? "Pending" : status, // Normalize 'applied' to 'Pending' for owner UI
                            match: app.matchScore || app.match || 85,
                            avatar: app.applicantAvatar || (name.charAt(0).toUpperCase()),
                            applied: app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : (app.timestamp ? new Date(app.timestamp).toLocaleDateString() : "Recent"),
                            rejectionDescription: app.rejectionDescription,
                            shortlistGreeting: app.shortlistGreeting
                        } as Application;
                    });
                    setApplications(appsData);
                }
            }
            setLoading(false);
        });

        return () => {
            unsubscribeJob();
        };
    }, [id]);

    const updateStatus = async (targetUserId: string, status: string, extraData?: any) => {
        if (!id) return;
        try {
            const token = await user?.getIdToken();

            // If status is "Approved", we use the approveBid endpoint to create the project/contract
            if (status === 'Approved') {
                const app = applications.find(a => a.id === targetUserId);
                const promise = fetch('https://work-hub-backend-production.up.railway.app/api/approveBid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        postId: id,
                        workerId: targetUserId,
                        workerName: app?.name,
                        title: job?.jobTitle,
                        description: job?.jobSummary,
                        mode: job?.postType === 'project' ? 'freelancer' : 'job',
                        bidAmount: job?.salaryMin || 0
                    })
                }).then(res => res.json());

                toast.promise(promise, {
                    loading: 'Finalizing hire...',
                    success: 'Successfully hired! Project created.',
                    error: (err: any) => `Failed to hire: ${err.message}`
                });

                return;
            }

            const response = await fetch('https://work-hub-backend-production.up.railway.app/api/updateApplicationStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobId: id,
                    targetUserId,
                    status,
                    mode: job?.postType === 'project' ? 'freelancer' : 'job',
                    ...extraData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update status");
            }

            toast.success(`Application ${status.toLowerCase()} successfully`);
        } catch (error: any) {
            console.error("Error updating application status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleActionClick = (userId: string, type: 'Reject' | 'Shortlist' | 'Waitlist') => {
        setModalState({ open: true, type, userId, value: "" });
    };

    const confirmAction = async () => {
        if (!modalState.userId || !modalState.type) return;

        const extraData: any = {};
        if (modalState.type === 'Reject') extraData.rejectionDescription = modalState.value;
        if (modalState.type === 'Shortlist') extraData.shortlistGreeting = modalState.value;

        await updateStatus(modalState.userId, modalState.type === 'Reject' ? 'Rejected' : (modalState.type === 'Shortlist' ? 'Shortlisted' : 'Waitlisted'), extraData);
        setModalState({ open: false, type: null, userId: null, value: "" });
    };

    const filteredApps = applications.filter(app => {
        if (filter === "All") return true;
        if (filter === "Hired") return app.status === "Approved";
        return app.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-light animate-pulse">Fetching project details...</p>
                </div>
            </div>
        );
    }

    if (!job && !loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                        <Building2 className="size-8" />
                    </div>
                    <h2 className="text-xl font-medium text-slate-900">Job Not Found</h2>
                    <p className="text-slate-500 text-sm font-light">The job listing you're looking for might have been removed or is no longer available.</p>
                    <Link to="/talents/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium">
                        <ChevronLeft className="size-4" />
                        Back to Job Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE]">
                {/* Header */}
                <div className="bg-[#191B2D] text-white pt-24 pb-32 px-6 md:px-12 relative overflow-hidden">
                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <Link to="/talents/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium mb-8 transition-colors">
                            <ChevronLeft className="size-4" />
                            Back to Job Hub
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-medium uppercase tracking-widest border border-indigo-500/20">
                                    Active Posting
                                </div>
                                <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{job?.jobTitle || "Loading Job..."}</h1>
                                <div className="flex flex-wrap gap-6 text-white/50 text-sm font-light">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4" />
                                        {job?.companyName || "Nexus Global"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        {job?.jobLocation || "Remote"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="size-4" />
                                        {job?.salaryType === 'Negotiable' ? 'Negotiable' : `₹${job?.salaryMin} - ₹${job?.salaryMax}`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="h-11 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all">
                                    Edit Posting
                                </button>
                                <button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-medium transition-all shadow-xl shadow-indigo-600/20">
                                    Promote Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 -mt-16 pb-20 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Applications */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-medium text-slate-900">Application Pipeline</h2>
                                        <p className="text-xs text-slate-400 font-light">Review and manage candidates for this role.</p>
                                    </div>

                                    <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
                                        {["All", "Pending", "Shortlisted", "Waitlisted", "Offered", "Hired", "Rejected"].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                className={`px-4 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                    }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {filteredApps.map((app) => (
                                        <div key={app.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-500 border border-slate-200 overflow-hidden">
                                                    {app.avatar.length > 2 ? (
                                                        <img src={app.avatar} alt={app.name} className="size-full object-cover" />
                                                    ) : (
                                                        app.avatar
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-sm font-medium text-slate-900">{app.name}</h3>
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-medium tracking-tight">
                                                            {app.match}% Match
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 font-light">{app.role} • {app.applied}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {app.status === "Rejected" ? (
                                                    <span className="text-[11px] font-medium text-rose-500 px-3 py-1 bg-rose-50 rounded-lg">Rejected</span>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {(app.status === "Pending" || app.status === "Waitlisted" || app.status === "Shortlisted") && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleActionClick(app.id, 'Reject')}
                                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="size-5" />
                                                                </button>
                                                                {app.status !== 'Waitlisted' && (
                                                                    <button
                                                                        onClick={() => handleActionClick(app.id, 'Waitlist')}
                                                                        className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                                        title="Waitlist"
                                                                    >
                                                                        <MapPin className="size-5" />
                                                                    </button>
                                                                )}
                                                                {app.status !== 'Shortlisted' && (
                                                                    <button
                                                                        onClick={() => handleActionClick(app.id, 'Shortlist')}
                                                                        className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                                        title="Shortlist"
                                                                    >
                                                                        <CheckCircle2 className="size-5" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {app.status === "Shortlisted" && (
                                                            <button
                                                                onClick={() => updateStatus(app.id, "Offered")}
                                                                className="h-9 px-4 bg-indigo-600 text-white rounded-lg text-[10px] font-medium hover:bg-indigo-500 transition-all shadow-md"
                                                            >
                                                                Send Offer
                                                            </button>
                                                        )}
                                                        {(app.status === "Shortlisted" || app.status === "Offered") && (
                                                            <button
                                                                onClick={() => updateStatus(app.id, "Approved")}
                                                                className="h-9 px-4 bg-emerald-600 text-white rounded-lg text-[10px] font-medium hover:bg-emerald-500 transition-all shadow-md"
                                                            >
                                                                Hire Now
                                                            </button>
                                                        )}
                                                        {app.status !== "Pending" && app.status !== "Waitlisted" && app.status !== "Shortlisted" && app.status !== "Offered" && (
                                                            <span className={`text-[11px] font-medium px-3 py-1 rounded-lg ${app.status === "Approved" ? "text-emerald-500 bg-emerald-50" :
                                                                "text-slate-500 bg-slate-50"
                                                                }`}>
                                                                {app.status === "Approved" ? "Hired" : app.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <Link
                                                    to={`/talents/profile/${app.id}`}
                                                    className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <ExternalLink className="size-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredApps.length === 0 && (
                                    <div className="p-12 text-center text-slate-400">
                                        <Search className="size-8 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">No applications found in this category.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Stats & Info */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
                                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Performance</h3>
                                <div className="grid gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Total Applications</p>
                                        <p className="text-2xl font-semibold text-slate-900">{applications.length}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Status</p>
                                        <p className="text-2xl font-semibold text-slate-900">{job?.status || "Open"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
                                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Quick Tools</h3>
                                <div className="space-y-3">
                                    <button className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-medium hover:bg-indigo-100 transition-all">
                                        Download All Resumes
                                    </button>
                                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-all">
                                        Schedule Bulk Interview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalState.open}
                onClose={() => setModalState({ ...modalState, open: false })}
                title={modalState.type === 'Reject' ? "Reject Application" : "Shortlist Candidate"}
                onConfirm={confirmAction}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-light">
                        {modalState.type === 'Reject'
                            ? "Please provide a short reason for rejection. This will be shown to the candidate."
                            : "Draft a personalized greeting letter for the candidate. This will be shown in a premium format."}
                    </p>
                    <textarea
                        value={modalState.value}
                        onChange={(e) => setModalState({ ...modalState, value: e.target.value })}
                        placeholder={modalState.type === 'Reject' ? "Reason for rejection..." : "Dear Candidate, we are pleased to inform you..."}
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                    />
                </div>
            </Modal>
        </PageTransition>
    );
};

export default JobDetails;
