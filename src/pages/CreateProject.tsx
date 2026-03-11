import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import {
    Lightbulb, Globe, Clock, DollarSign, ListChecks, ArrowRight, ArrowLeft,
    CheckCircle2, Target, ShieldCheck, Zap, Layers, Calendar, ImagePlus, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadFile } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/types/project";
import { toast } from "sonner";

const CreateProject = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Project Scope
        projectTitle: "",
        projectCategory: "Development",
        projectType: "Fixed" as Project['projectType'],
        workMode: "Remote" as Project['workMode'],
        projectLocation: "",
        projectDescription: "",

        // Step 2: Technical Needs
        requiredSkillsString: "",
        experienceLevel: "Intermediate" as Project['experienceLevel'],
        deliverablesString: "",
        proposalQuestionsString: "",

        // Step 3: Company & Governance
        companyName: "",
        ndaRequired: false,
        maxApplications: 50,

        // Step 4: Budget & Duration
        budgetMin: 1000,
        budgetMax: 5000,
        projectDuration: "1-3 Months",
        depositAmount: 500,
        deadlineDate: "",
        postImage: "",
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            if (e.target) e.target.value = ""; // Clear for re-selection
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
    };

    const categories = ["Development", "Design", "Marketing", "Writing", "Consulting", "Other"];
    const experienceLevels: Project['experienceLevel'][] = ["Beginner", "Intermediate", "Expert"];
    const projectTypes: Project['projectType'][] = ["Fixed", "Hourly"];

    const next = () => setStep(s => Math.min(s + 1, 4));
    const back = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            let postImageUrl = "";
            if (selectedFile) {
                postImageUrl = await uploadFile(`project_posts/${user.uid}_${Date.now()}_${selectedFile.name}`, selectedFile);
            }

            // Fetch owner's company logo
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            const companyLogo = userData?.companyLogo || "";

            const requiredSkills = formData.requiredSkillsString.split(',').map(s => s.trim()).filter(Boolean);
            const deliverables = formData.deliverablesString.split('\n').map(s => s.trim()).filter(Boolean);
            const proposalQuestions = formData.proposalQuestionsString.split('\n').map(s => s.trim()).filter(Boolean);

            const projectPost: Partial<Project> = {
                ownerId: user.uid,
                ownerName: user.displayName || "Anonymous",
                ownerPhoto: companyLogo, // Use company logo as owner photo for the post
                projectTitle: formData.projectTitle,
                projectCategory: formData.projectCategory,
                projectType: formData.projectType,
                workMode: formData.workMode,
                projectLocation: formData.projectLocation,
                projectDescription: formData.projectDescription,
                postImage: postImageUrl,

                requiredSkills: requiredSkills,
                experienceLevel: formData.experienceLevel,
                deliverables: deliverables,

                companyName: formData.companyName,
                ndaRequired: formData.ndaRequired,
                maxApplications: Number(formData.maxApplications),
                deadlineDate: formData.deadlineDate,

                budgetMin: Number(formData.budgetMin),
                budgetMax: Number(formData.budgetMax),
                projectDuration: formData.projectDuration,
                depositAmount: Number(formData.depositAmount),
                proposalQuestions: proposalQuestions,

                status: 'pending',
                postType: 'project', // Fixed: 'project' instead of 'freelance'
                createdAt: serverTimestamp(),
                applicationsCount: 0,
                isVerified: false
            };

            await addDoc(collection(db, "project_posts"), projectPost);
            toast.success("Project launched successfully!");
            setStep(5);
        } catch (error) {
            console.error("Error launching project:", error);
            toast.error("Failed to launch project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6 border-b border-slate-100 flex items-center justify-between mb-8">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center gap-3 shrink-0">
                        <div className={`size-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-110"
                            : "bg-slate-100 text-slate-400"
                            }`}>
                            {step > s ? <CheckCircle2 className="size-4" /> : s}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-500 ${step === s ? "text-emerald-700" : "text-slate-300"
                            }`}>
                            {s === 1 ? "Scope" : s === 2 ? "Technical" : s === 3 ? "Governance" : "Economic"}
                        </span>
                        {s < 4 && <div className={`w-8 h-[2px] rounded-full transition-colors duration-500 ${step > s ? "bg-emerald-600" : "bg-slate-100"}`} />}
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate(-1)}
                className="text-[12px] font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
                Cancel
            </button>
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F8FAFC]">
                {renderStepIndicators()}

                <div className="max-w-4xl mx-auto px-6 pb-24">
                    <AnimatePresence mode="wait">
                        {step === 5 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-16 rounded-[40px] border border-slate-100 shadow-2xl text-center space-y-8"
                            >
                                <div className="size-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 rotate-6">
                                    <Zap className="size-12 fill-emerald-500" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold text-slate-900">Project Mission Initiated</h2>
                                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                        Your project has been broadcasted to our elite freelancer network. Expect high-quality bids within minutes.
                                    </p>
                                </div>
                                <div className="pt-6 flex flex-col gap-4">
                                    <Link to="/talents/freelance" className="w-full py-5 bg-emerald-600 text-white rounded-3xl text-[14px] font-bold hover:shadow-2xl hover:shadow-emerald-200 transition-all">
                                        Go to Freelance Hub
                                    </Link>
                                    <button onClick={() => setStep(1)} className="text-[13px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                                        Launch another mission
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white p-10 md:p-14 rounded-[40px] border border-slate-100 shadow-2xl space-y-10"
                                onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); next(); }}
                            >
                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                                <Target className="size-6 text-emerald-500" />
                                                Project Blueprint
                                            </h3>
                                            <p className="text-sm text-slate-400">Define the core vision and operational parameters of your project.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Project Identifier</label>
                                                <div className="group relative">
                                                    <Lightbulb className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                                                    <input
                                                        required
                                                        value={formData.projectTitle}
                                                        onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                                                        placeholder="e.g. NextGen Mobile Banking Interface"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Domain</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <select
                                                        value={formData.projectCategory}
                                                        onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium appearance-none"
                                                    >
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Payment Strategy</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {projectTypes.map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, projectType: type })}
                                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.projectType === type
                                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-50"
                                                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Operational Mode</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {["On-site", "Remote", "Hybrid"].map(m => (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, workMode: m as any })}
                                                            className={`py-3 rounded-lg text-[10px] font-bold transition-all border ${formData.workMode === m
                                                                ? "bg-slate-900 text-white border-slate-900"
                                                                : "bg-white text-slate-400 border-slate-100"
                                                                }`}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Location</label>
                                                <input
                                                    value={formData.projectLocation}
                                                    onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                                                    placeholder="City, Country"
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium placeholder:text-slate-300"
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Scope of Excellence</label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    value={formData.projectDescription}
                                                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                                                    placeholder="Describe the technical hurdles, goals, and mission impact..."
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[30px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none placeholder:text-slate-300"
                                                />
                                            </div>

                                            <div className="space-y-4 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Project Visualization</label>
                                                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] hover:bg-slate-100 hover:border-emerald-200 transition-all group relative">
                                                    {imagePreview ? (
                                                        <div className="relative w-full aspect-video rounded-[30px] overflow-hidden">
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={removeImage}
                                                                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform"
                                                            >
                                                                <X className="size-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-4">
                                                            <div className="size-20 bg-white rounded-[28px] flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
                                                                <ImagePlus className="size-8 text-emerald-600" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[15px] font-bold text-slate-900">Upload Project Image</p>
                                                                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">PNG, JPG, WEBP (Max 5MB)</p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                                <Layers className="size-6 text-emerald-500" />
                                                Technical Calibrations
                                            </h3>
                                            <p className="text-sm text-slate-400">Specify the expertise level and delivery requirements.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Required Expertise (Comma Separated)</label>
                                                <div className="relative">
                                                    <ListChecks className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        required
                                                        value={formData.requiredSkillsString}
                                                        onChange={(e) => setFormData({ ...formData, requiredSkillsString: e.target.value })}
                                                        placeholder="e.g. React Native, Web3.js, Solidity, UX Design"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Expertise Tier</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {experienceLevels.map(lvl => (
                                                        <button
                                                            key={lvl}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                                                            className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${formData.experienceLevel === lvl
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                                                : "bg-white text-slate-400 border-slate-100"
                                                                }`}
                                                        >
                                                            {lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mission Deliverables (One per line)</label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.deliverablesString}
                                                    onChange={(e) => setFormData({ ...formData, deliverablesString: e.target.value })}
                                                    placeholder="Design Prototype&#10;Smart Contract Audit&#10;Technical Documentation"
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[25px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Candidate Screening Questions (One per line)</label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.proposalQuestionsString}
                                                    onChange={(e) => setFormData({ ...formData, proposalQuestionsString: e.target.value })}
                                                    placeholder="What's your experience with high-traffic fintech apps?&#10;Can you provide samples of similar architectures?"
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[25px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                                <ShieldCheck className="size-6 text-emerald-500" />
                                                Organizational Governance
                                            </h3>
                                            <p className="text-sm text-slate-400">Settings for project privacy and company identity.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Company Representative</label>
                                                <input
                                                    required
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                    placeholder="Organization Name"
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Max Bid Submissions</label>
                                                <input
                                                    type="number"
                                                    value={formData.maxApplications}
                                                    onChange={(e) => setFormData({ ...formData, maxApplications: parseInt(e.target.value) })}
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-4 col-span-2">
                                                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-[25px] cursor-pointer hover:bg-slate-100 transition-all border-2 border-transparent hover:border-emerald-100">
                                                    <div className={`p-3 rounded-xl transition-colors ${formData.ndaRequired ? "bg-emerald-600 text-white" : "bg-white text-slate-300"}`}>
                                                        <ShieldCheck className="size-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-[14px] font-bold text-slate-900">Enforce Non-Disclosure Agreement</h4>
                                                        <p className="text-[11px] text-slate-400">Candidates must sign an NDA before viewing sensitive project details.</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.ndaRequired}
                                                        onChange={(e) => setFormData({ ...formData, ndaRequired: e.target.checked })}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                                <DollarSign className="size-6 text-emerald-500" />
                                                Economic Architecture
                                            </h3>
                                            <p className="text-sm text-slate-400">Finalize the investment scale and mission timeline.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Investment Floor</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.budgetMin}
                                                        onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Investment Ceiling</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.budgetMax}
                                                        onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Project Lifespan</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        required
                                                        value={formData.projectDuration}
                                                        onChange={(e) => setFormData({ ...formData, projectDuration: e.target.value })}
                                                        placeholder="e.g. 3 Months"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Commitment Deposit</label>
                                                <input
                                                    type="number"
                                                    value={formData.depositAmount}
                                                    onChange={(e) => setFormData({ ...formData, depositAmount: parseInt(e.target.value) })}
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Submission Deadline</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.deadlineDate}
                                                        onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[22px] text-[15px] focus:ring-4 focus:ring-emerald-50 transition-all font-medium appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-emerald-950 rounded-[40px] shadow-2xl relative overflow-hidden">
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                                            <div className="flex items-center gap-4 text-white relative z-10">
                                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                                    <ShieldCheck className="size-6 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">SafeHub Protocol</h4>
                                                    <p className="text-[10px] text-emerald-500 tracking-[0.2em] uppercase font-black">Escrow Protected</p>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-emerald-100/60 text-[13px] leading-relaxed relative z-10">
                                                Launching this project authorizes Nexus to facilitate expert matchmaking. Funds are released only upon your verification of milestones.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-10 flex items-center justify-between border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={back}
                                        disabled={step === 1 || loading}
                                        className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-0"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Step Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="h-16 px-12 bg-emerald-600 text-white rounded-[24px] text-[15px] font-black tracking-wide hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center gap-4 group disabled:opacity-50"
                                    >
                                        {loading ? "Broadcasting..." : step === 4 ? "Launch Active Mission" : "Advance Pipeline"}
                                        {!loading && <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
};

export default CreateProject;
