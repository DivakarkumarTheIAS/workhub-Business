import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/types/user";
import { PageTransition } from "@/components/PageTransition";
import {
    Mail, MapPin, Phone, Globe, ShieldCheck,
    Link as LinkIcon, ArrowLeft, Briefcase,
    GraduationCap, Award, Star, MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TalentProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const [talent, setTalent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTalentProfile = async () => {
            if (!userId) return;
            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    setTalent({ uid: userDoc.id, ...userDoc.data() } as User);
                }
            } catch (error) {
                console.error("Error fetching talent profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTalentProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[1000px] mx-auto px-6 space-y-8">
                    <Skeleton className="h-10 w-32" />
                    <div className="flex flex-col md:flex-row gap-10">
                        <Skeleton className="size-40 rounded-[2.5rem]" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!talent) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-medium text-slate-900">Profile Not Found</h2>
                    <p className="text-slate-500">The requested talent profile could not be located.</p>
                    <Link to="/talents/jobs" className="text-indigo-600 hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="size-4" /> Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const joinedDate = talent.createdAt
        ? new Date(talent.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "Recent Member";

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[1000px] mx-auto px-6">
                    {/* Back Navigation */}
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-12 group transition-colors"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Back to Applications</span>
                    </button>

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
                        <div className="relative">
                            <div className="size-32 md:size-40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 ring-4 ring-white relative z-10">
                                <img
                                    src={talent.photoURL || `https://ui-avatars.com/api/?name=${talent.displayName}&background=6366f1&color=fff`}
                                    alt={talent.displayName}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-2 space-y-4">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-medium text-slate-900 tracking-tight">{talent.fullName || talent.displayName}</h1>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 shadow-sm">
                                        <Star className="size-3 fill-amber-500 text-amber-500" />
                                        <span className="text-[10px] font-bold">{talent.rating?.toFixed(1) || "5.0"}</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest">
                                    {talent.jobCategory || "Professional Talent"}
                                </p>
                            </div>
                            <p className="text-slate-500 max-w-lg leading-relaxed font-light">
                                {talent.bio || "Crafting excellence and delivering professional results for innovative projects."}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-emerald-500" />
                                    {talent.isVerified ? "Verified Expert" : "Standard Talent"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <LinkIcon className="size-4 text-slate-300" />
                                    Joined {joinedDate}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="size-4 text-slate-300" />
                                    {talent.location || "Remote"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Detail Column */}
                        <div className="md:col-span-2 space-y-12">
                            {/* Skills Section */}
                            <section>
                                <h2 className="text-sm font-medium text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Award className="size-4 text-indigo-600" /> Core Expertise
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {(talent.skills && talent.skills.length > 0 ? talent.skills : ['UI Design', 'Frontend Development', 'Creative Problem Solving']).map(skill => (
                                        <span key={skill} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium text-slate-600 shadow-sm hover:border-indigo-100 hover:text-indigo-600 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Experience Section */}
                            <section>
                                <h2 className="text-sm font-medium text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Briefcase className="size-4 text-indigo-600" /> Professional History
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-slate-900">Senior Role / Independent Professional</h3>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                {talent.totalExperience || 3}+ Years Exp
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                                            Extensive experience working on high-impact projects, specializing in {talent.jobCategory || "industrial standard practices"}.
                                            Proven track record of reliability and high-quality delivery.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Education/Other */}
                            <section>
                                <h2 className="text-sm font-medium text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <GraduationCap className="size-4 text-indigo-600" /> Educational Background
                                </h2>
                                <div className="p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                                    <p className="text-xs text-slate-400 text-center italic">Educational details are kept private until verification.</p>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-8">
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-indigo-200/20 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 size-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />

                                <div className="relative z-10 space-y-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Expected Rate</p>
                                        <p className="text-2xl font-semibold tracking-tighter">${talent.hourlyRate || "45"}.00 <span className="text-xs font-normal text-white/50">/ hr</span></p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-4">
                                            <span className="text-white/60">Projects Done</span>
                                            <span className="font-medium">{talent.completedProjects || 12}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-4">
                                            <span className="text-white/60">Success Rate</span>
                                            <span className="font-medium">98%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/60">Availability</span>
                                            <span className="text-emerald-400 font-medium">{talent.availability || "Full-time"}</span>
                                        </div>
                                    </div>

                                    <button className="w-full h-12 bg-white text-slate-900 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg shadow-white/5 flex items-center justify-center gap-2">
                                        <MessageSquare className="size-4" /> Message Talent
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 px-4">
                                <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Contact Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 group cursor-default">
                                        <Mail className="size-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        <span className="text-xs text-slate-500 font-medium truncate">{talent.email}</span>
                                    </div>
                                    {talent.phoneNumber && (
                                        <div className="flex items-center gap-3 group cursor-default">
                                            <Phone className="size-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                            <span className="text-xs text-slate-500 font-medium">{talent.phoneNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 group cursor-default">
                                        <Globe className="size-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        <span className="text-xs text-slate-500 font-medium">Professional Profile</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default TalentProfile;
