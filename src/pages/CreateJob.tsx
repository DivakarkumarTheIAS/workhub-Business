import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import {
    Briefcase, Building2, MapPin, DollarSign, ListChecks, ArrowRight, ArrowLeft,
    CheckCircle2, Globe, Users, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Job } from "@/types/job";
import { toast } from "sonner";
import { uploadFile } from "@/lib/storage";
import { Camera, Loader2, X } from "lucide-react";
import { useRef } from "react";

const CreateJob = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Overview
        jobTitle: "",
        jobCategory: "Technology",
        workMode: "Remote" as Job['workMode'],
        employmentType: "Full-time" as Job['employmentType'],
        jobLocation: "",
        jobSummary: "",

        // Step 2: Requirements
        requiredSkillsString: "",
        experienceMin: 0,
        experienceMax: 5,
        education: "Bachelor's Degree",
        responsibilities: "",

        // Step 3: Company & Settings
        companyName: "",
        companyIndustry: "Software Development",
        companyWebsite: "",
        openings: 1,
        applyMethod: "In-App" as Job['applyMethod'],
        resumeRequired: true,

        // Step 4: Financials & Review
        salaryMin: 50000,
        salaryMax: 100000,
        salaryType: "Annual" as Job['salaryType'],
        deadlineDate: "",
        postImage: "",
        maxApplications: 50, // Default to a reasonable number
    });

    const categories = ["Technology", "Finance", "Healthcare", "Design", "Marketing", "Sales", "Other"];
    const workModes: Job['workMode'][] = ["On-site", "Remote", "Hybrid"];
    const employmentTypes: Job['employmentType'][] = ["Full-time", "Part-time", "Internship", "Contract"];
    const salaryTypes: Job['salaryType'][] = ["Monthly", "Annual", "Negotiable"];

    const next = () => setStep(s => Math.min(s + 1, 4));
    const back = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const requiredSkills = formData.requiredSkillsString.split(',').map(s => s.trim()).filter(Boolean);

            // Fetch latest user data for companyLogo
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            const companyLogo = userData?.companyLogo || "";

            const jobPost: Partial<Job> = {
                ownerId: user.uid,
                ownerName: user.displayName || "Anonymous",
                ownerPhoto: companyLogo, // Use company logo as owner photo for the post
                jobTitle: formData.jobTitle,
                jobCategory: formData.jobCategory,
                employmentType: formData.employmentType,
                workMode: formData.workMode,
                experienceMin: Number(formData.experienceMin),
                experienceMax: Number(formData.experienceMax),

                companyName: formData.companyName,
                companyIndustry: formData.companyIndustry,
                companyWebsite: formData.companyWebsite,
                companySize: "10-50", // Default

                jobSummary: formData.jobSummary,
                responsibilities: formData.responsibilities,
                requiredSkills: requiredSkills,

                salaryMax: Number(formData.salaryMax),
                salaryMin: Number(formData.salaryMin),
                salaryType: formData.salaryType,
                jobLocation: formData.jobLocation,
                education: formData.education,

                openings: Number(formData.openings),
                maxApplications: Number(formData.maxApplications),
                deadlineDate: formData.deadlineDate,
                applyMethod: formData.applyMethod,
                resumeRequired: formData.resumeRequired,

                postImage: formData.postImage,
                companyLogo: companyLogo,
                status: 'pending',
                createdAt: serverTimestamp(),
                applicationsCount: 0,
                isVerified: false,
                postType: 'job'
            };

            await addDoc(collection(db, "job_posts"), jobPost);
            toast.success("Job posting created successfully!");
            setStep(5);
        } catch (error) {
            console.error("Error creating job:", error);
            toast.error("Failed to post job. Please check your connection.");
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
                            ? "bg-[#191B2D] text-white shadow-lg shadow-indigo-100 scale-110"
                            : "bg-slate-100 text-slate-400"
                            }`}>
                            {step > s ? <CheckCircle2 className="size-4" /> : s}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-500 ${step === s ? "text-[#191B2D]" : "text-slate-300"
                            }`}>
                            {s === 1 ? "Overview" : s === 2 ? "Requirements" : s === 3 ? "Company" : "Finalize"}
                        </span>
                        {s < 4 && <div className={`w-8 h-[2px] rounded-full transition-colors duration-500 ${step > s ? "bg-[#191B2D]" : "bg-slate-100"}`} />}
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
            <div className="min-h-screen bg-[#FDFDFF]">
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
                                    <CheckCircle2 className="size-12" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold text-[#191B2D]">Posting Sent for Approval</h2>
                                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                        Your job opening has been queued. Our enterprise verification team will review and list it within 24 hours.
                                    </p>
                                </div>
                                <div className="pt-6 flex flex-col gap-4">
                                    <Link to="/talents/jobs" className="w-full py-5 bg-[#191B2D] text-white rounded-3xl text-[14px] font-bold hover:shadow-2xl hover:shadow-indigo-200 transition-all">
                                        Go to Job Hub
                                    </Link>
                                    <button onClick={() => setStep(1)} className="text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                        Create another listing
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
                                            <h3 className="text-2xl font-bold text-[#191B2D]">Role Foundation</h3>
                                            <p className="text-sm text-slate-400">Establish the core specifications of the available position.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Professional Title</label>
                                                <div className="group relative">
                                                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        required
                                                        value={formData.jobTitle}
                                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                        placeholder="e.g. Lead Full-Stack Architect"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>

                                            {/* Job Image Upload */}
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Job Banner / Image (Optional)</label>
                                                <div className="relative h-48 rounded-[25px] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-3 group hover:border-indigo-100 hover:bg-slate-50 transition-all overflow-hidden">
                                                    {formData.postImage ? (
                                                        <>
                                                            <img src={formData.postImage} className="size-full object-cover" alt="Job" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, postImage: "" })}
                                                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all cursor-pointer"
                                                            >
                                                                {uploadingImage ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[13px] font-bold text-slate-600">Select professional image</p>
                                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file || !user?.uid) return;

                                                            setUploadingImage(true);
                                                            try {
                                                                const url = await uploadFile(`job_images/${user.uid}_${Date.now()}`, file);
                                                                setFormData({ ...formData, postImage: url });
                                                                toast.success("Image uploaded!");
                                                            } catch (err: any) {
                                                                console.error(err);
                                                                toast.error(err.message || "Upload failed");
                                                            } finally {
                                                                setUploadingImage(false);
                                                                if (e.target) e.target.value = ""; // Clear for re-upload
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Domain Category</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <select
                                                        value={formData.jobCategory}
                                                        onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium appearance-none"
                                                    >
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Work Mode</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {workModes.map(mode => (
                                                        <button
                                                            key={mode}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, workMode: mode })}
                                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.workMode === mode
                                                                ? "bg-[#191B2D] text-white border-[#191B2D] shadow-lg shadow-indigo-100"
                                                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            {mode}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Job Location</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        required
                                                        value={formData.jobLocation}
                                                        onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                                                        placeholder="e.g. London, UK / Remote"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Employment Type</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {employmentTypes.map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, employmentType: type })}
                                                            className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${formData.employmentType === type
                                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Executive Summary</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={formData.jobSummary}
                                                    onChange={(e) => setFormData({ ...formData, jobSummary: e.target.value })}
                                                    placeholder="Provide a high-level overview of the role's mission and impact..."
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[25px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium resize-none placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-[#191B2D]">Talent Calibration</h3>
                                            <p className="text-sm text-slate-400">Specify the expertise and responsibilities required for this role.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Technical Skills (Comma Separated)</label>
                                                <div className="relative">
                                                    <ListChecks className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        required
                                                        value={formData.requiredSkillsString}
                                                        onChange={(e) => setFormData({ ...formData, requiredSkillsString: e.target.value })}
                                                        placeholder="e.g. Rust, WebAssembly, Kubernetes, gRPC"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Min Experience (Years)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.experienceMin}
                                                    onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Max Experience (Years)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.experienceMax}
                                                    onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Key Responsibilities</label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    value={formData.responsibilities}
                                                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                                    placeholder="Detailed list of daily duties and core delivery goals..."
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[25px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-[#191B2D]">Entity Presence</h3>
                                            <p className="text-sm text-slate-400">Details about the hiring organization and application settings.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Company Name</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        required
                                                        value={formData.companyName}
                                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                        placeholder="e.g. Nexus Global"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Organization Website</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        value={formData.companyWebsite}
                                                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                                        placeholder="https://example.com"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Available Openings</label>
                                                <div className="relative">
                                                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.openings}
                                                        onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Max Applications</label>
                                                <div className="relative">
                                                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.maxApplications}
                                                        onChange={(e) => setFormData({ ...formData, maxApplications: parseInt(e.target.value) })}
                                                        placeholder="e.g. 50"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                    Policy Settings
                                                </label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.resumeRequired}
                                                            onChange={(e) => setFormData({ ...formData, resumeRequired: e.target.checked })}
                                                            className="size-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-[13px] font-bold text-slate-700">Require Professional CV</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-[#191B2D]">Economic Strategy</h3>
                                            <p className="text-sm text-slate-400">Finalize compensation structure and deadline.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Min Salary</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.salaryMin}
                                                        onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Max Salary</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.salaryMax}
                                                        onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) })}
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Frequency</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {salaryTypes.map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, salaryType: type })}
                                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.salaryType === type
                                                                ? "bg-[#191B2D] text-white border-[#191B2D]"
                                                                : "bg-white text-slate-500 border-slate-100"
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deadline Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.deadlineDate}
                                                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                                                    className="w-full px-6 py-5 bg-slate-50 border-0 rounded-[20px] text-[15px] focus:ring-4 focus:ring-indigo-50 transition-all font-medium appearance-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-8 bg-[#191B2D] rounded-[30px] shadow-2xl space-y-4">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="p-3 bg-white/10 rounded-2xl">
                                                    <ShieldCheck className="size-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">Elite Verification Ready</h4>
                                                    <p className="text-[11px] text-white/50 tracking-wide uppercase font-bold">Standard Review Protocol</p>
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-[13px] leading-relaxed">
                                                By listing this opportunity, you confirm the details are accurate and adhere to our professional recruitment standards. Nexus Global reserves the right to moderate postings.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-10 flex items-center justify-between border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={back}
                                        disabled={step === 1 || loading}
                                        className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-[#191B2D] transition-all disabled:opacity-0"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="h-14 px-10 bg-[#191B2D] text-white rounded-3xl text-[14px] font-bold hover:shadow-2xl hover:shadow-indigo-100 transition-all flex items-center gap-3 group disabled:opacity-50"
                                    >
                                        {loading ? "Processing..." : step === 4 ? "Authorize Publication" : "Next Segment"}
                                        {!loading && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
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

export default CreateJob;
