import { ArrowUpDown } from "lucide-react";

const transactions = [
    { id: "1", name: "Figma Pro plan", type: "Subscription", date: "Oct 20, 2022", time: "10:32 PM", amount: "$64.00", status: "Completed", icon: "https://api.dicebear.com/7.x/icons/svg?seed=figma", color: "text-emerald-600 bg-emerald-50" },
    { id: "2", name: "Fiverr International", type: "Receive", date: "Oct 20, 2022", time: "10:32 PM", amount: "$100.00", status: "Completed", icon: "https://api.dicebear.com/7.x/icons/svg?seed=fiverr", color: "text-emerald-600 bg-emerald-50" },
    { id: "3", name: "Upwork Global", type: "Receive", date: "Oct 19, 2022", time: "09:15 AM", amount: "$150.00", status: "Completed", icon: "https://api.dicebear.com/7.x/icons/svg?seed=upwork", color: "text-emerald-600 bg-emerald-50" },
];

export const RecentFilesTable = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-50">
                        <th className="pb-4 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Name <ArrowUpDown className="size-3" />
                        </th>
                        <th className="pb-4 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="pb-4 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Date <ArrowUpDown className="size-3" />
                        </th>
                        <th className="pb-4 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="pb-4 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Status <ArrowUpDown className="size-3" />
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                            <td className="py-5">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-white border border-slate-100 p-2 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                                        <img src={tx.icon} alt={tx.name} className="size-full object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tx.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Application</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5">
                                <span className="text-sm font-bold text-slate-600">{tx.type}</span>
                            </td>
                            <td className="py-5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-600">{tx.date}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.time}</span>
                                </div>
                            </td>
                            <td className="py-5">
                                <span className="text-sm font-black text-slate-900">{tx.amount}</span>
                            </td>
                            <td className="py-5">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none ${tx.color}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
