import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Search, MapPin, DollarSign, Building2, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Job } from "@/types/job";



const JobHub = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            if (!user?.uid) return;
            const q = fsQuery(collection(db, "job_posts"), where("ownerId", "==", user.uid));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const jobsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Job));

                const sortedJobs = [...jobsData].sort((a, b) => {
                    const getMs = (val: any) => {
                        if (!val) return 0;
                        if (val.toDate) return val.toDate().getTime();
                        if (val.seconds) return val.seconds * 1000;
                        if (typeof val === 'number') return val;
                        return 0;
                    };
                    return getMs(b.createdAt) - getMs(a.createdAt);
                });

                setJobs(sortedJobs);
                setLoading(false);
            }, (err) => {
                console.error("Firestore error:", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            console.error("Query setup error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [user?.uid]);

    const filtered = (jobs || []).filter(j => {
        const search = (searchQuery || "").toLowerCase();
        const title = (j.jobTitle || "").toLowerCase();
        const company = (j.companyName || "").toLowerCase();
        return title.includes(search) || company.includes(search);
    });

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE]">
                {/* Hero / Header */}
                <div className="bg-[#191B2D] text-white pt-24 pb-20 px-6 md:px-12 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
                    </div>

                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Enterprise Job Hub</h1>
                                <p className="text-white/40 font-light text-sm max-w-xl">
                                    Post roles, track approvals, and manage applicants in your professional workspace.
                                </p>
                            </div>
                            <Link to="/talents/jobs/create" className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-medium transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2">
                                <Plus className="size-4" />
                                Post a Job
                            </Link>
                        </header>
                    </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 -mt-8 pb-20 relative z-20 space-y-8">
                    {/* Controls */}
                    <div className="p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-1.5">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter your postings or browse nexus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm w-full outline-none transition-all placeholder:text-slate-400 font-medium font-poppins"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 p-1 h-full min-h-[48px]">
                            <button
                                className="px-5 h-10 rounded-lg text-[12px] font-medium transition-all bg-[#191B2D] text-white shadow-lg"
                            >
                                My Postings
                            </button>
                        </div>
                    </div>

                    {/* Error Handling */}
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-medium animate-pulse">
                            System Error: {error}
                        </div>
                    )}

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Postings</p>
                            <p className="text-xl font-medium text-slate-900">{jobs.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Pending Approval</p>
                            <p className="text-xl font-medium text-amber-500">{jobs.filter(j => j.status?.toLowerCase() === 'pending').length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Live Roles</p>
                            <p className="text-xl font-medium text-emerald-500">{jobs.filter(j => j.status?.toLowerCase() === 'approved').length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">New Applicants</p>
                            <p className="text-xl font-medium text-indigo-600">
                                {jobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0)}
                            </p>
                        </div>
                    </div>

                    {/* Job Grid - Improved Visibility */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-[300px] bg-white rounded-3xl border border-slate-100 animate-pulse transition-all" />
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group flex flex-col p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:ring-2 group-hover:ring-indigo-500 transition-all overflow-hidden relative">
                                            {job.postImage || job.companyLogo ? (
                                                <img src={job.postImage || job.companyLogo} className="size-full object-cover" alt="Post" />
                                            ) : (
                                                <Building2 className="size-6" />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {job.status?.toLowerCase() === 'pending' ? (
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-medium uppercase tracking-wider">Pending Review</span>
                                            ) : (
                                                job.deadlineDate && new Date(job.deadlineDate) < new Date() ? (
                                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-medium uppercase tracking-wider">Deadline Done</span>
                                                ) : job.maxApplications && (job.applicationsCount || 0) >= job.maxApplications ? (
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[9px] font-medium uppercase tracking-wider">Max Applications Filled</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-medium uppercase tracking-wider">Live & Active</span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-6 flex-1">
                                        <h3 className="font-medium text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{job.jobTitle || 'Untitled Role'}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <span>{job.companyName || 'Anonymous'}</span>
                                            <span className="size-1 bg-slate-200 rounded-full" />
                                            <span className="flex items-center gap-1"><MapPin className="size-3" />{job.jobLocation || 'Remote'}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100/50 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase">Applicants</p>
                                            <p className="text-base font-medium text-slate-900">{job.applicationsCount || 0}</p>
                                        </div>
                                        <Link
                                            to={`/talents/jobs/${job.id}`}
                                            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-[11px] font-medium hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            View Logs
                                        </Link>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                                            <DollarSign className="size-3" />
                                            <span className="text-[12px]">
                                                {job.salaryType === 'Negotiable' ? 'Negotiable' : `₹${job.salaryMin} - ₹${job.salaryMax}`}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/talents/jobs/${job.id}`}
                                            className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-900 hover:translate-x-1 transition-all"
                                        >
                                            Manage Pool
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                                <Search className="size-12 mx-auto text-slate-100 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">No Postings Found</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-light">
                                    Ready to scale? Create your first job posting to find verified talent.
                                </p>
                                <Link to="/talents/jobs/create" className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[13px] font-medium hover:shadow-2xl hover:shadow-indigo-200 transition-all">
                                    <Plus className="size-4" />
                                    Create New Role
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default JobHub;
