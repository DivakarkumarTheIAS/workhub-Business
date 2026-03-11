import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Building2, Briefcase, User, Globe, FileText, CheckCircle2, Clock, XCircle, LayoutDashboard } from "lucide-react";

const BecomeOwner = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { user: profile, loading: profileLoading } = useDashboard();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        businessType: "",
        managerName: "",
        website: "",
        description: ""
    });

    if (!user) return null;

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
                <div className="size-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                ownerRequestStatus: "pending",
                ownerRequestData: {
                    ...formData,
                    requestedAt: new Date().toISOString(),
                },
                updatedAt: serverTimestamp()
            });

            setIsSubmitted(true);
            toast.success("Request submitted for admin approval!");
        } catch (error: any) {
            console.error("Error submitting request:", error);
            toast.error("Failed to submit request: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Status UI Components
    if (profile?.ownerRequestStatus === 'pending' || isSubmitted) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 text-center space-y-6">
                        <div className="size-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="size-10 text-amber-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Request Pending</h2>
                        <p className="text-sm font-light text-slate-400 leading-relaxed">
                            Your application to become a Business Owner is currently being reviewed by our administration team.
                            We'll notify you as soon as your account is upgraded.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full h-12 bg-slate-900 text-white rounded-2xl text-xs font-medium hover:bg-amber-600 transition-all"
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (profile?.ownerRequestStatus === 'approved' || profile?.role === 'businessOwner' || profile?.role === 'admin') {
        return (
            <PageTransition>
                <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 text-center space-y-6">
                        <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="size-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Access Granted</h2>
                        <p className="text-sm font-light text-slate-400 leading-relaxed">
                            Congratulations! Your Business Owner status is active. You can now access all enterprise features and workforce management tools.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-sm font-medium shadow-xl shadow-indigo-200 hover:bg-slate-900 hover:shadow-none transition-all flex items-center justify-center gap-3"
                        >
                            <LayoutDashboard className="size-5" />
                            Enter Control Center
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (profile?.ownerRequestStatus === 'rejected') {
        return (
            <PageTransition>
                <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 text-center space-y-6">
                        <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="size-10 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Request Refused</h2>
                        <p className="text-sm font-light text-slate-400 leading-relaxed px-4">
                            {profile.rejectionReason || "Unfortunately, your application couldn't be approved at this time. Please contact support for more details."}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full h-12 bg-slate-900 text-white rounded-2xl text-xs font-medium hover:bg-rose-600 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[600px] mx-auto px-6">
                    <div className="mb-12">
                        <h1 className="text-3xl font-medium text-slate-900 tracking-tighter mb-2">Elevate to Business Owner</h1>
                        <p className="text-sm font-light text-slate-400">Apply for business credentials to start hiring and managing projects.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            placeholder="Enter your registered company name"
                                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest ml-1">Business Type</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.businessType}
                                                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                                placeholder="e.g. Technology"
                                                className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest ml-1">Manager Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.managerName}
                                                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                                placeholder="Full Name"
                                                className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest ml-1">Website (Optional)</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://company.com"
                                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest ml-1">Company Description</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-6 size-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Briefly describe your company and hiring needs..."
                                            rows={4}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-300 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-slate-900 text-white rounded-2xl text-sm font-medium shadow-xl shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <span className={isLoading ? "opacity-0" : "flex items-center gap-2"}>
                                    Submit for Verification
                                </span>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
};

export default BecomeOwner;
