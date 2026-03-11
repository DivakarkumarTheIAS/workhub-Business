import { useState, useEffect } from "react";
import { Search, MapPin, Globe, Plus, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/types/project";



// Standardized typography and layout for Freelance Hub

const FreelanceHub = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.uid) {
                setLoading(false);
                return;
            }
            // Projects view shows ONLY the current user's projects for management
            const q = fsQuery(
                collection(db, "project_posts"),
                where("ownerId", "==", user.uid)
            );

            let postsData: any[] = [];
            let projectsData: any[] = [];

            const updateCombined = () => {
                const projectMap = new Map(projectsData.map(p => [p.projectPostId, p]));

                const combined = postsData.map(post => {
                    if (projectMap.has(post.id)) {
                        const proj = projectMap.get(post.id);
                        return {
                            ...post,
                            _isUnified: true,
                            projectId: proj.id,
                            status: proj.status,
                            agreedAmount: proj.amount,
                            workerId: proj.workerId,
                            depositPaid: proj.depositPaid
                        };
                    }
                    return post;
                });

                // Manual sort with safety
                const sortedProjects = [...combined].sort((a, b) => {
                    const getMs = (val: any) => {
                        if (!val) return 0;
                        if (val.toDate) return val.toDate().getTime();
                        if (val.seconds) return val.seconds * 1000;
                        if (typeof val === 'number') return val;
                        return 0;
                    };
                    return getMs(b.createdAt) - getMs(a.createdAt);
                });

                setProjects(sortedProjects as Project[]);
                setLoading(false);
            };

            const unsubscribePosts = onSnapshot(
                fsQuery(collection(db, "project_posts"), where("ownerId", "==", user.uid)),
                (snapshot) => {
                    postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    updateCombined();
                },
                (err) => {
                    console.error("Project posts fetch error:", err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            const unsubscribeProjects = onSnapshot(
                fsQuery(collection(db, "projects"), where("ownerId", "==", user.uid)),
                (snapshot) => {
                    projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    updateCombined();
                },
                (err) => {
                    console.error("Projects fetch error:", err);
                }
            );

            return () => {
                unsubscribePosts();
                unsubscribeProjects();
            };
        } catch (err: any) {
            console.error("Query setup error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [user?.uid]); // Changed dependency to user?.uid

    const filteredProjects = projects.filter(p =>
        p.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FE] font-poppins">
            {/* Integrated Hero Section */}
            <div className="bg-[#191B2D] text-white pt-24 pb-20 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
                </div>

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Freelance Hub</h1>
                            <p className="text-white/40 font-light text-sm max-w-xl">
                                Manage your posted freelance projects and hire experts.
                            </p>
                        </div>
                        <Link to="/talents/freelance/create" className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-medium transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2">
                            <Plus className="size-4" />
                            Create Project
                        </Link>
                    </header>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 -mt-8 pb-20 relative z-20 space-y-8">
                {/* Search & Filter */}
                <div className="p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-1.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by niche, skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm w-full outline-none transition-all placeholder:text-slate-400 font-medium font-poppins"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 p-1 h-full min-h-[48px]">
                        <button
                            className="px-5 h-10 rounded-lg text-[12px] font-medium transition-all bg-[#191B2D] text-white shadow-lg"
                        >
                            My Projects
                        </button>
                    </div>
                </div>

                {/* Diagnostic Info - Fail-Safe Display */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-[12px] text-slate-600 font-medium space-y-2">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">🟢 <span className="text-slate-400">Total Postings:</span> {projects.length}</span>
                        <span className="flex items-center gap-2">🔵 <span className="text-slate-400">Search Matches:</span> {filteredProjects.length}</span>
                        <span className="flex items-center gap-2">👤 <span className="text-slate-400">Owner ID:</span> {user?.uid?.slice(0, 8)}...</span>
                    </div>
                    {filteredProjects.length > 0 && (
                        <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 italic">
                            Loading Registry: {filteredProjects.map(p => p.projectTitle).join(' | ')}
                        </div>
                    )}
                    {error && <div className="text-rose-500 font-bold bg-rose-50 p-2 rounded">SYSTEM ERROR: {error}</div>}
                </div>

                {/* Main Content Area - High Contrast Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-30 pb-32">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 bg-slate-50 rounded-[32px] border border-slate-100 animate-pulse" />
                        ))
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map((p) => (
                            <div
                                key={p.id}
                                className="flex flex-col p-8 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm hover:border-emerald-500 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:ring-2 group-hover:ring-emerald-500 transition-all overflow-hidden relative">
                                        {p.postImage || p.companyLogo ? (
                                            <img src={p.postImage || p.companyLogo} className="w-full h-full object-cover" alt="Project" />
                                        ) : (
                                            <Globe size={24} />
                                        )}
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest border ${p.status === 'pending'
                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                        : p.deadlineDate && new Date(p.deadlineDate) < new Date()
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : p.maxApplications && (p.applicationsCount || 0) >= p.maxApplications
                                                ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                : (p as any)._isUnified
                                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {p.status === 'pending'
                                            ? 'Pending Review'
                                            : p.deadlineDate && new Date(p.deadlineDate) < new Date()
                                                ? 'Deadline Done'
                                                : p.maxApplications && (p.applicationsCount || 0) >= p.maxApplications
                                                    ? 'Max Applications Filled'
                                                    : p.status || 'Live & Active'}
                                    </div>
                                </div>

                                <div className="flex-1 mb-6">
                                    <h3 className="text-slate-900 font-medium text-lg leading-tight mb-1">{p.projectTitle || 'Project Mission'}</h3>
                                    <p className="text-slate-400 text-xs font-light uppercase tracking-wider">{p.companyName || 'Corporate Client'}</p>
                                    {(p as any)._isUnified && (
                                        <p className="mt-2 text-[11px] text-indigo-500 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Worker Assigned
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {Array.isArray(p.requiredSkills) && p.requiredSkills.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[9px] font-medium uppercase border border-slate-100">{skill}</span>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                        <DollarSign size={14} />
                                        <span className="text-[12px]">
                                            {(p as any)._isUnified ? `₹${(p as any).agreedAmount} (Agreed)` : `₹${p.budgetMin} - ₹${p.budgetMax}`}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/talents/freelance/${p.id}`}
                                        className="bg-[#191B2D] text-white px-5 py-2.5 rounded-xl text-[11px] font-medium hover:bg-indigo-600 transition-all flex items-center gap-2"
                                    >
                                        {(p as any)._isUnified ? 'Manage Project' : 'View Details'}
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px]">
                            <Globe size={48} className="mx-auto text-slate-100 mb-4" />
                            <h3 className="text-slate-900 font-medium text-lg">No Missions Assigned</h3>
                            <p className="text-slate-400 text-sm font-light mt-2 max-w-xs mx-auto">Launch a new mission to begin sourcing talent.</p>
                            <Link
                                to="/talents/freelance/create"
                                className="mt-8 inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:shadow-xl transition-all"
                            >
                                <Plus size={18} />
                                Post New Project
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreelanceHub;
