import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { Bell, Shield, Globe, Lock, Moon, Eye, ChevronRight, LogOut, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const { user } = useDashboard();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [twoFactor, setTwoFactor] = useState(true);

    if (!user) return null;

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const sections = [
        {
            title: "Security Engineering",
            items: [
                {
                    icon: Shield,
                    label: "Two-Factor Authentication",
                    value: twoFactor ? "Active" : "Disabled",
                    onClick: () => setTwoFactor(!twoFactor),
                    type: "toggle"
                },
                {
                    icon: Lock,
                    label: "Corporate Password",
                    value: "Last changed 12 days ago",
                    type: "link"
                }
            ]
        },
        {
            title: "Global Preferences",
            items: [
                {
                    icon: Moon,
                    label: "System Appearance",
                    value: "Intelligent Dark Mode",
                    type: "link"
                },
                {
                    icon: Globe,
                    label: "Primary Language",
                    value: "English (US)",
                    type: "link"
                }
            ]
        },
        {
            title: "Communication Pulse",
            items: [
                {
                    icon: Bell,
                    label: "Critical Alerts",
                    value: emailNotifications,
                    onClick: () => setEmailNotifications(!emailNotifications),
                    type: "toggle"
                },
                {
                    icon: Eye,
                    label: "Privacy Visibility",
                    value: "Enterprise Only",
                    type: "select"
                }
            ]
        },
        ...(user.role === 'worker' ? [{
            title: "Enterprise Opportunity",
            items: [
                {
                    icon: Building2,
                    label: "Verify Business Credentials",
                    value: user.ownerRequestStatus === 'pending'
                        ? "Verification in progress"
                        : user.ownerRequestStatus === 'rejected'
                            ? "Last request rejected"
                            : "Become a Business Owner",
                    onClick: () => navigate("/become-owner"),
                    type: "link"
                }
            ]
        }] : [])
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[800px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 px-2">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-12 rounded-xl border border-slate-100 p-1 bg-white shadow-sm overflow-hidden">
                                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="size-full object-cover rounded-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                                    <p className="text-sm font-medium text-slate-900 leading-none">{user.displayName}</p>
                                </div>
                            </div>
                            <h1 className="text-3xl font-medium text-slate-900 tracking-tighter mb-2">Platform Engine</h1>
                            <p className="text-sm font-light text-slate-400 max-w-sm">Fine-tune your enterprise security and workspace preferences.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest">Active System</span>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {sections.map((section) => (
                            <section key={section.title} className="space-y-6">
                                <h3 className="text-[11px] font-medium text-slate-300 uppercase tracking-[0.2em]">{section.title}</h3>
                                <div className="space-y-2">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.label}
                                            onClick={item.type === 'link' ? item.onClick : item.type !== 'toggle' ? () => { } : item.onClick}
                                            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <item.icon className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                                    {typeof item.value === 'string' && (
                                                        <p className="text-[10px] font-light text-slate-400">{item.value}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {item.type === 'toggle' ? (
                                                <div className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                                                </div>
                                            ) : (
                                                <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}

                        <div className="pt-8 mt-8 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors font-medium text-xs"
                            >
                                <LogOut className="size-4" />
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Settings;
