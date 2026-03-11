import { HardDrive, FileText, Image as ImageIcon, Music, Play } from "lucide-react";
import { ClayCard } from "./ClayCard";
import { motion } from "framer-motion";

const storageData = [
    { name: "Documents", size: "12.4 GB", count: "1,234 files", color: "bg-indigo-500", icon: FileText },
    { name: "Images", size: "8.2 GB", count: "456 files", color: "bg-blue-400", icon: ImageIcon },
    { name: "Videos", size: "24.1 GB", count: "89 files", color: "bg-slate-400", icon: Play },
    { name: "Others", size: "5.3 GB", count: "210 files", color: "bg-slate-200", icon: Music },
];

export const StorageCard = () => {
    return (
        <ClayCard className="flex flex-col gap-8 p-8 bg-white border-0 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 font-outfit tracking-tight">System Storage</h3>
                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
                    <HardDrive className="size-5" />
                </div>
            </div>

            <div className="relative size-56 mx-auto flex items-center justify-center group">
                <svg className="size-full -rotate-90 transform">
                    <circle
                        cx="112"
                        cy="112"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-50"
                    />
                    <motion.circle
                        cx="112"
                        cy="112"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={565.48}
                        initial={{ strokeDashoffset: 565.48 }}
                        animate={{ strokeDashoffset: 565.48 * (1 - 0.72) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        className="text-indigo-600 drop-shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-900 font-outfit tracking-tighter">72%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Utilization</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {storageData.map((item) => (
                    <div key={item.name} className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300 group">
                        <div className="flex items-center gap-2">
                            <div className={`size-2 rounded-full ${item.color}`}></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-base font-black text-slate-900 font-outfit tracking-tight">{item.size}</span>
                        </div>
                    </div>
                ))}
            </div>

            <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-black/5"
            >
                Expand Capacity
            </motion.button>
        </ClayCard>
    );
};
