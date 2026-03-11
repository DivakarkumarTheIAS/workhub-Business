import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Chrome, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const { signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            toast.success("Welcome back to Qwok!");
            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Failed to sign in with Google. Please try again.");
            toast.error("Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] right-[-10%] size-96 bg-indigo-200 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-emerald-100 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/80 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50">
                        {/* Logo & Header */}
                        {/* Logo & Header */}
                        <div className="text-center space-y-4 mb-10">
                            <div className="inline-flex h-20 w-auto transition-all mx-auto">
                                <img
                                    src="/src/assets/qwok.svg"
                                    alt="Qwok Business"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                            <p className="text-sm text-slate-400 font-light tracking-[0.2em] uppercase">Enterprise Workforce Management</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="size-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Social Login */}
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all shadow-sm group"
                            >
                                <Chrome className="size-5 text-slate-900 group-hover:scale-110 transition-transform" />
                                <span>Sign in with Google</span>
                                {isLoading && (
                                    <div className="size-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin ml-2" />
                                )}
                            </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4 px-2">
                                <div className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Secure SSO Protocol Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.3em]">Built for the future of work</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
