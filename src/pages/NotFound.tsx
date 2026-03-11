import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6">
                <div className="max-w-xl w-full text-center space-y-8">
                    <div className="relative">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[8rem] font-medium text-slate-100 leading-none select-none"
                        >
                            404
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <span className="text-2xl font-medium text-slate-900 uppercase tracking-tighter bg-white/50 backdrop-blur-sm px-5 py-1.5 rounded-xl border border-white/50 shadow-sm">
                                Page Not Found
                            </span>
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-400 font-light text-sm max-w-xs mx-auto">
                            The requested resource could not be located on the platform.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link to="/">
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#191B2D] text-white rounded-xl font-medium text-xs uppercase tracking-wide transition-all shadow-lg"
                            >
                                <Home className="size-4" />
                                Return Home
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default NotFound;
