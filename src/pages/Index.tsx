import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    LayoutGrid,
    Wallet,
    Award,
    Star,
    Activity as ActivityIcon,
    Bell,
    Clock,
    Building2,
    Shield,
    Users,
    ChevronRight,
    Search as SearchIcon
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Activity } from "@/types/activity";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Index = () => {
    const { user, loading } = useDashboard();
    const [ownerStats, setOwnerStats] = useState({ jobs: 0, projects: 0 });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const isOwner = user?.role === 'businessOwner' || user?.role === 'admin';

    useEffect(() => {
        if (!user?.uid || !isOwner) return;

        // Fetch real owner metrics
        const jobsQuery = query(collection(db, "jobs"), where("ownerId", "==", user.uid));
        const projectsQuery = query(collection(db, "projects"), where("ownerId", "==", user.uid));

        const unsubJobs = onSnapshot(jobsQuery, (s) => setOwnerStats(prev => ({ ...prev, jobs: s.size })));
        const unsubProjects = onSnapshot(projectsQuery, (s) => setOwnerStats(prev => ({ ...prev, projects: s.size })));

        return () => {
            unsubJobs();
            unsubProjects();
        };
    }, [user?.uid, isOwner]);

    useEffect(() => {
        if (!user?.uid) return;

        const activitiesQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(8)
        );

        const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
            let docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Activity));

            // Strict filtering: Business Owners should only see business-related operations
            if (isOwner) {
                // Filter out personal seeker activity (applying to jobs, bids)
                docs = docs.filter(a =>
                    !['job_application_sent', 'bid_placed', 'job_seeker_auth'].includes(a.type as any) &&
                    !a.title.toLowerCase().includes('application sent')
                );
            }

            setActivities(docs);
            setActivitiesLoading(false);
        }, (error) => {
            console.error("Error fetching activities:", error);
            setActivitiesLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, isOwner]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-light animate-pulse">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = isOwner ? [
        {
            label: "Total Hires",
            value: (user?.totalEarnings > 0 ? "4" : "0"), // Qualitative placeholder if direct hire count missing
            change: "Operational",
            trendingUp: true,
            icon: <Users className="size-4 text-indigo-500" />
        },
        {
            label: "Jobs Posted",
            value: ownerStats.jobs.toString(),
            change: "Live",
            trendingUp: true,
            icon: <Building2 className="size-4 text-emerald-500" />
        },
        {
            label: "Active Projects",
            value: ownerStats.projects.toString(),
            change: "Managed",
            trendingUp: true,
            icon: <Award className="size-4 text-amber-500" />
        },
        {
            label: "Enterprise Rating",
            value: user?.rating?.toFixed(1) || '5.0',
            change: "Trusted",
            trendingUp: true,
            icon: <Star className="size-4 text-purple-500" />
        },
    ] : [
        {
            label: "Wallet Balance",
            value: `$${user?.walletBalance?.toLocaleString() || '0.00'}`,
            change: "+12.5%",
            trendingUp: true,
            icon: <Wallet className="size-4 text-indigo-500" />
        },
        {
            label: "Total Earnings",
            value: `$${user?.totalEarnings?.toLocaleString() || '0.00'}`,
            change: "+3",
            trendingUp: true,
            icon: <TrendingUp className="size-4 text-emerald-500" />
        },
        {
            label: "Completed Projects",
            value: user?.completedProjects?.toString() || '0',
            change: "-2.4%",
            trendingUp: false,
            icon: <Award className="size-4 text-amber-500" />
        },
        {
            label: "Average Rating",
            value: user?.rating?.toFixed(1) || '0.0',
            change: "+0.8%",
            trendingUp: true,
            icon: <Star className="size-4 text-purple-500" />
        },
    ];

    const formatTimestamp = (ts: any) => {
        if (!ts) return 'Just now';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE]">
                {/* Header / Hero Section */}
                <div className="bg-[#191B2D] text-white pt-24 pb-20 px-6 md:px-12 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
                    </div>

                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <header>
                            <div className="flex items-center gap-4 mb-4">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="size-12 rounded-xl object-cover border-2 border-white/10" />
                                ) : (
                                    <div className="size-12 rounded-xl bg-indigo-600 flex items-center justify-center font-medium text-xl uppercase">
                                        {user?.displayName?.[0] || user?.email?.[0] || '?'}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
                                        Welcome, {user?.displayName || user?.email?.split('@')[0]}
                                    </h1>
                                    <p className="text-white/40 font-light text-sm">
                                        {user?.role === 'businessOwner' ? 'Business Enterprise Control Center' : 'Professional Workspace Console'}
                                    </p>
                                </div>
                            </div>
                        </header>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 -mt-8 pb-20 relative z-20 space-y-6">
                    {/* Stats Grid */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {stats.map((stat, i) => (
                            <motion.div key={i} variants={item}>
                                <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                                            {stat.icon}
                                        </div>
                                        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${stat.trendingUp ? "text-emerald-500" : "text-rose-500"}`}>
                                            {stat.trendingUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-medium text-slate-900 tracking-tight">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Dashboard Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Middle Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {isOwner ? (
                                <div className="space-y-6">
                                    {/* Company Identity - Only prominent on first login or if incomplete */}
                                    <div className={`p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group transition-all ${!user?.isFirstLogin && user?.ownerRequestData?.companyName ? "opacity-60 hover:opacity-100 max-h-48 overflow-y-hidden" : ""}`}>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                    <Building2 className="size-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-slate-900">Enterprise Registry</h3>
                                                    <p className="text-[10px] text-slate-400 font-light uppercase tracking-widest">Core organizational definitions</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-medium uppercase tracking-widest border border-emerald-100">
                                                Verified Entity
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1 block">Legal Entity</label>
                                                <p className="text-sm font-medium text-slate-900 line-clamp-1">{user?.ownerRequestData?.companyName || "Personal Enterprise"}</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1 block">Market Sector</label>
                                                <p className="text-sm font-medium text-slate-900">{user?.ownerRequestData?.businessType || "Technology"}</p>
                                            </div>
                                        </div>

                                        {!user?.isFirstLogin && user?.ownerRequestData?.companyName && (
                                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-2">
                                                <p className="text-[9px] text-slate-300 font-medium uppercase tracking-[0.3em]">Operational Mode Active</p>
                                            </div>
                                        )}
                                    </div>

                                    {user?.isFirstLogin && (
                                        <div className="p-4 bg-indigo-600 rounded-xl text-white flex items-center justify-between shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex items-center gap-3">
                                                <Shield className="size-5" />
                                                <p className="text-xs font-medium">Provisioning complete. Review and finalize company metadata.</p>
                                            </div>
                                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-colors">
                                                Complete Setup
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrendingUp className="size-24 text-indigo-50 shadow-inner translate-x-12 translate-y--12" />
                                    </div>
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                <ActivityIcon className="size-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-slate-900">Capital Performance</h3>
                                                <p className="text-[10px] text-slate-400 font-light uppercase tracking-widest">Financial analytics over time</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Live Data</span>
                                        </div>
                                    </div>
                                    <div className="h-[280px] w-full bg-slate-50 rounded-2xl relative flex items-center justify-center border border-dashed border-slate-200 group-hover:bg-white transition-colors overflow-hidden">
                                        <p className="text-slate-300 font-medium text-[10px] uppercase tracking-[0.3em] italic relative z-10">Performance visualization system active</p>
                                        <div className="absolute bottom-6 left-6 right-6 h-40 flex items-end gap-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <div key={i} className="flex-1 bg-indigo-600 rounded-t-lg transition-all duration-700" style={{ height: `${20 + Math.random() * 80}%`, transitionDelay: `${i * 30}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                            <LayoutGrid className="size-5 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900">{isOwner ? "Hire Pipeline" : "Active Pipeline"}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {isOwner ? (
                                            <div className="text-center py-8">
                                                <p className="text-slate-400 text-xs font-medium italic">No active job applications under review.</p>
                                            </div>
                                        ) : user?.activeMode === 'job' ? (
                                            <div className="text-center py-8">
                                                <p className="text-slate-400 text-xs font-medium">No active applications currently in progress.</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-slate-400 text-xs font-medium">No active project assignments found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8 bg-[#191B2D] rounded-2xl text-white relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 size-32 bg-indigo-500/10 rounded-full blur-3xl" />
                                    <h3 className="text-base font-medium mb-2">Platform Infrastructure</h3>
                                    <p className="text-white/40 text-[11px] mb-6 font-light">Global systems operating at 99.9% efficiency.</p>
                                    <div className="space-y-4 relative z-10">
                                        {['Auth Node', 'Data Hub', 'Storage Engine'].map((s) => (
                                            <div key={s} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                <span className="text-xs font-medium text-white/70">{s}</span>
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-medium uppercase tracking-widest border border-emerald-500/20">Operational</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
                                <h3 className="text-base font-medium text-slate-900 mb-6 flex items-center justify-between">
                                    Recent Activity
                                    <span className="text-[10px] text-indigo-600 font-medium uppercase tracking-widest flex items-center gap-1">
                                        <div className="size-1.5 bg-indigo-600 rounded-full animate-pulse" />
                                        Live
                                    </span>
                                </h3>

                                <div className="space-y-6 relative">
                                    {activitiesLoading ? (
                                        <div className="text-center py-12 flex flex-col items-center gap-4">
                                            <div className="size-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Bridging Data Hub...</p>
                                        </div>
                                    ) : activities.length > 0 ? (
                                        <AnimatePresence>
                                            {activities.map((activity, i) => (
                                                <motion.div
                                                    key={activity.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex gap-4 group cursor-pointer"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className={`size-8 rounded-lg flex items-center justify-center border ${activity.type === 'wallet' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                            activity.type === 'project' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                                'bg-slate-50 border-slate-100 text-slate-600'
                                                            }`}>
                                                            {activity.type === 'wallet' ? <Wallet className="size-4" /> : <Bell className="size-4" />}
                                                        </div>
                                                        {i !== activities.length - 1 && (
                                                            <div className="w-px flex-1 bg-slate-100 my-2" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-medium text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                                {activity.title}
                                                            </p>
                                                            <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                                                                <Clock className="size-2.5" />
                                                                {formatTimestamp(activity.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 leading-relaxed truncate max-w-[200px]">
                                                            {activity.message || activity.description || 'No additional details available.'}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    ) : (
                                        <div className="text-center py-12 flex flex-col items-center gap-4">
                                            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <ActivityIcon className="size-8 text-slate-200" />
                                            </div>
                                            <div className="space-y-1 text-center px-4">
                                                <p className="text-xs font-medium text-slate-900">Workspace Quiet</p>
                                                <p className="text-[10px] text-slate-400 font-light uppercase tracking-tight">No recent operational logs detected.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-indigo-600 rounded-3xl text-white relative overflow-hidden group cursor-pointer shadow-indigo-200 shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                                    <TrendingUp className="size-6" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">Upgrade to Elite</h3>
                                <p className="text-white/60 text-xs mb-8 font-light leading-relaxed">Unlock advanced capital matching algorithms and 0% transaction fees.</p>
                                <button className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest group-hover:gap-3 transition-all">
                                    View Tier Benefits <ArrowUpRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Index;
