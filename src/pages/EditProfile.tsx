import { useState, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { PageTransition } from "@/components/PageTransition";
import { Mail, MapPin, Phone, Globe, Edit3, ShieldCheck, Link as LinkIcon, Camera, Loader2, Save, X, Upload, DollarSign, Briefcase, Clock, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";

const EditProfile = () => {
    const { user } = useDashboard();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const fileInputRefs = {
        photo: useRef<HTMLInputElement>(null),
        banner: useRef<HTMLInputElement>(null),
        resume: useRef<HTMLInputElement>(null),
        logo: useRef<HTMLInputElement>(null)
    };

    // Edit State
    const [editData, setEditData] = useState({
        displayName: user?.displayName || "",
        fullName: user?.fullName || "",
        bio: user?.bio || "",
        location: user?.location || "",
        phoneNumber: user?.phoneNumber || "",
        businessEmail: user?.businessEmail || "",
        skills: user?.skills || [],
        totalExperience: user?.totalExperience || 0,
        currentCompany: user?.currentCompany || "",
        expectedSalary: user?.expectedSalary || 0,
        hourlyRate: user?.hourlyRate || 0,
        availability: user?.availability || "Available",
        jobPreference: user?.jobPreference || [],
        jobCategory: user?.jobCategory || "",
        username: user?.username || ""
    });

    const [newSkill, setNewSkill] = useState("");

    if (!user) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), editData);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (field: string, filePath: string, file: File) => {
        setUploading(field);
        try {
            const url = await uploadFile(filePath, file);
            await updateDoc(doc(db, 'users', user.uid), {
                [field]: url
            });
            toast.success(`${field} updated successfully!`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || `Failed to upload ${field}`);
        } finally {
            setUploading(null);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
            setEditData({
                ...editData,
                skills: [...editData.skills, newSkill.trim()]
            });
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setEditData({
            ...editData,
            skills: editData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const addJobPreference = (preference: string) => {
        if (!editData.jobPreference.includes(preference)) {
            setEditData({
                ...editData,
                jobPreference: [...editData.jobPreference, preference]
            });
        }
    };

    const removeJobPreference = (preference: string) => {
        setEditData({
            ...editData,
            jobPreference: editData.jobPreference.filter(p => p !== preference)
        });
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[1200px] mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-medium text-slate-900 tracking-tight mb-2">Edit Profile</h1>
                        <p className="text-slate-500">Update your professional information and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Profile Images */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Profile Photo */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">Profile Photo</label>
                                <div className="relative group">
                                    <div className="size-32 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                                        <img
                                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                                            alt={user.displayName}
                                            className="size-full object-cover"
                                        />
                                        {uploading === 'photoURL' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="size-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRefs.photo.current?.click()}
                                        className="absolute -bottom-2 -right-2 size-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors"
                                    >
                                        <Camera className="size-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRefs.photo}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file && user?.uid) {
                                                handleFileUpload('photoURL', `profile_photos/${user.uid}_${Date.now()}`, file);
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Banner Image */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">Banner Image</label>
                                <div className="relative group">
                                    <div className="h-24 rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                                        {user.bannerImage && (
                                            <img
                                                src={user.bannerImage}
                                                alt="Banner"
                                                className="size-full object-cover"
                                            />
                                        )}
                                        {uploading === 'bannerImage' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="size-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRefs.banner.current?.click()}
                                        className="absolute top-2 right-2 size-8 bg-white/20 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        <Camera className="size-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRefs.banner}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file && user?.uid) {
                                                handleFileUpload('bannerImage', `banner_images/${user.uid}_${Date.now()}`, file);
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Company Logo (for business owners) */}
                            {user.role === 'businessOwner' && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Company Logo</label>
                                    <div className="relative group">
                                        <div className="size-20 rounded-xl overflow-hidden shadow-lg bg-white border-2 border-slate-100">
                                            {user.companyLogo && (
                                                <img
                                                    src={user.companyLogo}
                                                    alt="Company Logo"
                                                    className="size-full object-cover"
                                                />
                                            )}
                                            {uploading === 'companyLogo' && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                    <Loader2 className="size-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRefs.logo.current?.click()}
                                            className="absolute -bottom-2 -right-2 size-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors"
                                        >
                                            <Camera className="size-3" />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRefs.logo}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file && user?.uid) {
                                                    handleFileUpload('companyLogo', `company_logos/${user.uid}_${Date.now()}`, file);
                                                    e.target.value = "";
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Basic Information */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Display Name</label>
                                        <input
                                            type="text"
                                            value={editData.displayName}
                                            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="Your display name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="Your full legal name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Username</label>
                                        <input
                                            type="text"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="Your username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Job Category</label>
                                        <select
                                            value={editData.jobCategory}
                                            onChange={(e) => setEditData({ ...editData, jobCategory: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                        >
                                            <option value="">Select category</option>
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Business">Business</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-6">
                                    <label className="text-sm font-medium text-slate-700">Bio</label>
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={editData.phoneNumber}
                                            onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Business Email</label>
                                        <input
                                            type="email"
                                            value={editData.businessEmail}
                                            onChange={(e) => setEditData({ ...editData, businessEmail: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="business@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Location</label>
                                        <input
                                            type="text"
                                            value={editData.location}
                                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Professional Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                                        <input
                                            type="number"
                                            value={editData.totalExperience}
                                            onChange={(e) => setEditData({ ...editData, totalExperience: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Current Company</label>
                                        <input
                                            type="text"
                                            value={editData.currentCompany}
                                            onChange={(e) => setEditData({ ...editData, currentCompany: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="Current company"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Expected Salary ($)</label>
                                        <input
                                            type="number"
                                            value={editData.expectedSalary}
                                            onChange={(e) => setEditData({ ...editData, expectedSalary: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="50000"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Hourly Rate ($)</label>
                                        <input
                                            type="number"
                                            value={editData.hourlyRate}
                                            onChange={(e) => setEditData({ ...editData, hourlyRate: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="50"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Availability</label>
                                        <select
                                            value={editData.availability}
                                            onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Busy">Busy</option>
                                            <option value="Not Available">Not Available</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Skills</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            className="flex-1 px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                            placeholder="Add a skill..."
                                        />
                                        <button
                                            onClick={addSkill}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {editData.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                                            >
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill(skill)}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Job Preferences */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Job Preferences</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'On-site'].map(pref => (
                                            <label key={pref} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editData.jobPreference.includes(pref)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            addJobPreference(pref);
                                                        } else {
                                                            removeJobPreference(pref);
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700">{pref}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Resume Upload */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-900 mb-6">Resume</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => fileInputRefs.resume.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <Upload className="size-4" />
                                            {user.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                                        </button>
                                        {user.resumeUrl && (
                                            <a
                                                href={user.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-500 text-sm"
                                            >
                                                View Current Resume
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRefs.resume}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file && user?.uid) {
                                                handleFileUpload('resumeUrl', `resumes/${user.uid}_${Date.now()}.${file.name.split('.').pop()}`, file);
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default EditProfile;
