import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import {
    Globe, Clock, DollarSign,
    ChevronLeft, CheckCircle2, Star, XCircle, Search, MapPin
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import type { Project } from "@/types/project";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Bid {
    id: string;
    name: string;
    expert: string;
    bid: string;
    rating: number;
    avatar: string;
    tags: string[];
    status: string;
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

const ProjectDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<{
        open: boolean;
        type: 'Reject' | 'Shortlist' | 'Waitlist' | null;
        userId: string | null;
        value: string;
    }>({ open: false, type: null, userId: null, value: "" });

    useEffect(() => {
        if (!id) return;

        let activeProjectUnsubscribe: () => void;

        const projectRef = doc(db, "project_posts", id);
        const unsubscribe = onSnapshot(projectRef, (docSnap) => {
            if (docSnap.exists()) {
                const postData = docSnap.data();

                // Set initial data from project post
                setProject({ id: docSnap.id, ...postData } as Project);

                if (postData.applicants) {
                    const bidsData = Object.entries(postData.applicants).map(([userId, bid]: [string, any]) => ({
                        id: userId,
                        name: bid.applicantName || bid.name || "Expert",
                        expert: bid.applicantRole || bid.role || "Specialist",
                        bid: bid.bidAmount ? `₹${bid.bidAmount}` : "N/A",
                        rating: bid.rating || 5.0,
                        avatar: (bid.applicantName || bid.name || "?").charAt(0).toUpperCase(),
                        tags: bid.skills || [],
                        status: bid.status || "Pending"
                    } as Bid));
                    setBids(bidsData);
                }

                // Listen to the active project collection
                const activeProjectQuery = query(collection(db, "projects"), where("jobId", "==", id));
                if (activeProjectUnsubscribe) activeProjectUnsubscribe();
                activeProjectUnsubscribe = onSnapshot(activeProjectQuery, (activeSnapshot) => {
                    if (!activeSnapshot.empty) {
                        const activeData = activeSnapshot.docs[0].data();
                        const activeId = activeSnapshot.docs[0].id;

                        // Merge active data into project state
                        setProject((prev: any) => ({
                            ...prev,
                            ...activeData,
                            id: activeId, // Use active project ID
                            postId: id, // Retain original post id just in case
                        }));

                        // Fetch contract for active project
                        if (activeData.status === 'setup' || activeData.status === 'filled') {
                            const contractQuery = query(collection(db, "contracts"), where("projectId", "==", activeId));
                            getDocs(contractQuery).then(contractSnap => {
                                if (!contractSnap.empty) {
                                    setContract({ id: contractSnap.docs[0].id, ...contractSnap.docs[0].data() });
                                }
                            });
                        }
                    }
                });
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (activeProjectUnsubscribe) activeProjectUnsubscribe();
        };
    }, [id]);

    const updateStatus = async (targetUserId: string, status: string, extraData?: string) => {
        if (!id || !user) return;
        try {
            if (status === 'approved') {
                const promise = fetch('https://work-hub-backend-production.up.railway.app/api/approveBid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        postId: id,
                        workerId: targetUserId,
                        userId: user.uid,
                        mode: project?.postType === 'job' ? 'job' : 'project',
                        title: project?.projectTitle,
                        bidAmount: bids.find(b => b.id === targetUserId)?.bid.replace('₹', '')
                    })
                }).then(res => res.json());

                toast.promise(promise, {
                    loading: 'Initiating project setup...',
                    success: (data) => {
                        if (data.success) return 'Project setup initiated! Redirecting to setup...';
                        throw new Error(data.error || 'Failed to approve bid');
                    },
                    error: (err) => err.message
                });
            } else {
                const promise = fetch('https://work-hub-backend-production.up.railway.app/api/updateApplicationStatus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: id,
                        targetUserId,
                        status,
                        mode: project?.postType === 'job' ? 'job' : 'project',
                        rejectionDescription: status === 'Rejected' ? extraData : undefined,
                        shortlistGreeting: status === 'Shortlisted' ? extraData : undefined
                    })
                }).then(res => res.json());

                toast.promise(promise, {
                    loading: `Updating status to ${status}...`,
                    success: (data) => {
                        if (data.success) return `Status updated to ${status}!`;
                        throw new Error(data.message || `Failed to update status`);
                    },
                    error: (err) => err.message
                });
            }
        } catch (error) {
            console.error("Error updating bid status:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    const depositFunds = async () => {
        if (!project || !user) return;
        try {
            const depositAmount = project.depositAmount || project.budgetMin;
            const promise = fetch('https://work-hub-backend-production.up.railway.app/api/processDeposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    amount: depositAmount
                })
            }).then(res => res.json());

            toast.promise(promise, {
                loading: 'Processing deposit...',
                success: (data) => {
                    if (data.success) return 'Deposit successful! Project funds secured.';
                    throw new Error(data.error || 'Failed to process deposit');
                },
                error: (err) => err.message
            });
        } catch (error) {
            console.error("Error depositing funds:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    const handleActionClick = (userId: string, type: 'Reject' | 'Shortlist' | 'Waitlist') => {
        setModalState({ open: true, type, userId, value: "" });
    };

    const confirmAction = async () => {
        if (!modalState.userId || !modalState.type) return;
        await updateStatus(modalState.userId, modalState.type === 'Reject' ? 'Rejected' : (modalState.type === 'Shortlist' ? 'Shortlisted' : 'Waitlisted'), modalState.value);
        setModalState({ open: false, type: null, userId: null, value: "" });
    };

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

    if (!project && !loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                        <Globe className="size-8" />
                    </div>
                    <h2 className="text-xl font-medium text-slate-900">Project Not Found</h2>
                    <p className="text-slate-500 text-sm font-light">The project you're looking for might have been removed or is no longer available.</p>
                    <Link to="/talents/freelance" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium">
                        <ChevronLeft className="size-4" />
                        Back to Freelance Hub
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
                        <Link to="/talents/freelance" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium mb-8 transition-colors">
                            <ChevronLeft className="size-4" />
                            Back to Freelance Hub
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium uppercase tracking-widest border border-emerald-500/20">
                                    {project?.status === 'filled' ? 'Bidding Closed' : 'Open for Bidding'}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{project?.projectTitle}</h1>
                                <div className="flex flex-wrap gap-6 text-white/50 text-sm font-light">
                                    <div className="flex items-center gap-2">
                                        <Globe className="size-4" />
                                        {project?.projectLocation || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4" />
                                        {project?.projectDuration || '3 Months'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="size-4" />
                                        {project?.projectType === 'Fixed' ? `₹${project?.budgetMin} - ₹${project?.budgetMax}` : 'Negotiable'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="h-11 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all">
                                    Edit Project
                                </button>
                                <button className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-medium transition-all shadow-xl shadow-emerald-600/20">
                                    Invite Experts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 -mt-16 pb-20 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Bids List or Project Setup */}
                        <div className="lg:col-span-2 space-y-6">
                            {project?.status === 'setup' ? (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 md:p-12 space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-medium text-slate-900">Finalize Project Setup</h2>
                                        <p className="text-sm text-slate-400 font-light max-w-xl">
                                            The project is now in the setup phase. Complete the follow steps to officially start the work.
                                        </p>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Step 1: Contract */}
                                        <div className="flex gap-6 relative">
                                            <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-100" />
                                            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${contract?.ownerAccepted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                                                {contract?.ownerAccepted ? <CheckCircle2 className="size-4" /> : "1"}
                                            </div>
                                            <div className="space-y-4 pb-8 flex-1">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-medium text-slate-900">Contract Agreement</h3>
                                                    <p className="text-xs text-slate-400 font-light">The contract has been pre-signed by you. Waiting for worker signature.</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Contract Status</span>
                                                    <span className={`text-[10px] font-bold uppercase ${contract?.workerAccepted ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {contract?.workerAccepted ? 'Signed by Worker' : 'Pending Signature'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Payment */}
                                        <div className="flex gap-6 relative">
                                            <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-slate-100 text-slate-400">
                                                2
                                            </div>
                                            <div className="space-y-4 pb-8 flex-1">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-medium text-slate-400">Initial Deposit</h3>
                                                    <p className="text-xs text-slate-400 opacity-60 font-light">Deposit the project value to the secure escrow to initiate work.</p>
                                                </div>
                                                <button
                                                    onClick={depositFunds}
                                                    disabled={!contract?.workerAccepted || project?.depositPaid}
                                                    className={`h-11 px-8 rounded-xl text-xs font-medium transition-all ${project?.depositPaid ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed' : contract?.workerAccepted ? 'bg-slate-900 text-white shadow-lg focus:ring-4 focus:ring-slate-900/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                                >
                                                    {project?.depositPaid ? "Deposit Secured \u2713" : `Deposit \u20B9${project?.depositAmount || project?.budgetMin || 0}`}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-medium text-slate-900">Expert Submissions</h2>
                                            <p className="text-xs text-slate-400 font-light">Active bids from top-tier specialists.</p>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                            {bids.length} Total Bids
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-50">
                                        {bids.map((bid) => (
                                            <div key={bid.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-2xl bg-slate-900 flex items-center justify-center text-sm font-medium text-white shadow-lg">
                                                        {bid.avatar}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-sm font-medium text-slate-900">{bid.name}</h3>
                                                            <div className="flex items-center gap-1 text-amber-500">
                                                                <Star className="size-3 fill-current" />
                                                                <span className="text-[10px] font-medium">{bid.rating}</span>
                                                            </div>
                                                            {bid.status === 'approved' && (
                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-medium">Hired</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{bid.expert}</p>
                                                        <div className="flex gap-2 pt-1">
                                                            {bid.tags.slice(0, 3).map(t => (
                                                                <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-medium uppercase">{t}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="text-right">
                                                        <p className="text-lg font-semibold text-slate-900">{bid.bid}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Quote</p>
                                                    </div>
                                                    {bid.status === 'Pending' || bid.status === 'Waitlisted' || bid.status === 'Shortlisted' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleActionClick(bid.id, 'Reject')}
                                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="size-5" />
                                                            </button>
                                                            {bid.status !== 'Waitlisted' && (
                                                                <button
                                                                    onClick={() => handleActionClick(bid.id, 'Waitlist')}
                                                                    className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                                    title="Waitlist"
                                                                >
                                                                    <MapPin className="size-5" />
                                                                </button>
                                                            )}
                                                            {bid.status !== 'Shortlisted' && (
                                                                <button
                                                                    onClick={() => handleActionClick(bid.id, 'Shortlist')}
                                                                    className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                                    title="Shortlist"
                                                                >
                                                                    <CheckCircle2 className="size-5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => updateStatus(bid.id, "approved")}
                                                                className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[11px] font-medium hover:bg-emerald-600 transition-all shadow-lg"
                                                            >
                                                                Accept Bid
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-4 py-2 rounded-xl text-[11px] font-medium uppercase ${bid.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                                                            }`}>
                                                            {bid.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {bids.length === 0 && (
                                            <div className="p-12 text-center text-slate-400">
                                                <Search className="size-8 mx-auto mb-4 opacity-20" />
                                                <p className="text-sm">No bids submitted yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6 text-center">
                                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Project Value</h3>
                                <p className="text-3xl font-semibold text-emerald-600">₹{project?.depositAmount || project?.budgetMin || 0}</p>
                                <p className="text-xs text-slate-400 font-light -mt-4">Target Budget / Escrow</p>
                                <div className="h-px bg-slate-50 w-full" />
                                <div className="flex justify-between items-center text-left">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase">Escrow Status</p>
                                        <p className="text-xs font-medium text-slate-900">Protected</p>
                                    </div>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalState.open}
                onClose={() => setModalState({ ...modalState, open: false })}
                title={modalState.type === 'Reject' ? "Reject Proposal" : (modalState.type === 'Shortlist' ? "Shortlist Expert" : "Waitlist Expert")}
                onConfirm={confirmAction}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-light">
                        {modalState.type === 'Reject'
                            ? "Please provide a short reason for rejection. This will be shown to the candidate."
                            : (modalState.type === 'Shortlist'
                                ? "Draft a personalized greeting letter for the expert. This will be shown in a premium format."
                                : "The candidate will be moved to the waitlist. You can add an optional note.")}
                    </p>
                    <textarea
                        value={modalState.value}
                        onChange={(e) => setModalState({ ...modalState, value: e.target.value })}
                        placeholder={modalState.type === 'Reject' ? "Reason for rejection..." : (modalState.type === 'Shortlist' ? "Dear Expert, we are impressed by your portfolio..." : "Note for waitlist...")}
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                    />
                </div>
            </Modal>
        </PageTransition>
    );
};

export default ProjectDetails;
