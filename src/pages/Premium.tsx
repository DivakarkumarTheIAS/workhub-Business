import { PageTransition } from "@/components/PageTransition";
import { Star, CheckCircle2, Zap, ShieldCheck, Crown } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
    {
        name: "Professional",
        price: "$49",
        desc: "For serious individual contributors",
        features: ["Unlimited Bids", "Priority Matching", "Advanced Analytics", "Verification Badge"],
        accent: "indigo"
    },
    {
        name: "Enterprise",
        price: "$199",
        desc: "For growing organizations",
        features: ["Dedicated Support", "API Access", "Team Management", "White-labeled Portfolios"],
        accent: "emerald"
    }
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const Premium = () => {
    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8F9FE]">
                {/* Hero */}
                <div className="bg-[#191B2D] text-white pt-24 pb-20 px-6 md:px-12 relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px]" />
                    </div>

                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-medium uppercase tracking-widest mb-6 border border-amber-500/20">
                            <Crown className="size-3" />
                            Premium Access
                        </div>
                        <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                            Scale your professional <br /> impact with Premium
                        </h1>
                        <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-light">
                            Unlock exclusive features designed for top-tier freelancers and enterprise organizations.
                        </p>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="max-w-5xl mx-auto px-6 -mt-12 pb-20 relative z-20">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {plans.map((plan) => (
                            <motion.div key={plan.name} variants={item}>
                                <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col items-center text-center">
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">{plan.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mb-6">{plan.desc}</p>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-semibold text-slate-900">{plan.price}</span>
                                        <span className="text-slate-400 text-sm font-light">/month</span>
                                    </div>

                                    <div className="w-full space-y-4 mb-10 text-left">
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-center gap-3">
                                                <CheckCircle2 className={`size-4 ${plan.accent === 'indigo' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                                                <span className="text-[13px] font-light text-slate-600">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className={`w-full py-4 rounded-2xl text-xs font-medium transition-all mt-auto ${plan.accent === 'indigo'
                                        ? 'bg-[#191B2D] text-white hover:bg-indigo-600'
                                        : 'bg-emerald-600 text-white hover:bg-indigo-600 shadow-lg shadow-emerald-500/20'
                                        }`}>
                                        Upgrade to {plan.name}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Trust Bar */}
                    <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-50 contrast-50 grayscale">
                        <Zap className="size-6" />
                        <ShieldCheck className="size-6" />
                        <Star className="size-6" />
                        <Crown className="size-6" />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Premium;
