import { ShieldCheck, AlertCircle, ArrowUpRight } from "lucide-react";
import { ClayCard } from "./ClayCard";
import { motion } from "framer-motion";

export const ComplianceCard = () => {
    return (
        <ClayCard className="bg-[#191B2D] text-white border-0 shadow-2xl shadow-black/10 p-8 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-500">
                    <ShieldCheck className="size-6 text-white" />
                </div>
                <button type="button" className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group-hover:scale-105">
                    <ArrowUpRight className="size-5" />
                </button>
            </div>

            <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black mb-3 font-outfit tracking-tight">Compliance Score</h3>
                <p className="text-white/40 text-[15px] font-medium leading-relaxed">
                    Documentation status is at <span className="text-indigo-400 font-black tracking-tight">84%</span>. Complete verify to unlock full features.
                </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 flex items-center gap-5 mb-10 border border-white/5 relative z-10">
                <div className="size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="size-6 text-rose-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-rose-500">Action Required</span>
                    <span className="text-[11px] text-white/30 font-black uppercase tracking-widest">TIN Verification</span>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/30">Verification Level</span>
                    <span className="text-sm font-black font-outfit">84%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    />
                </div>
            </div>

            {/* Subtle light effect */}
            <div className="absolute -bottom-20 -right-20 size-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        </ClayCard>
    );
};
