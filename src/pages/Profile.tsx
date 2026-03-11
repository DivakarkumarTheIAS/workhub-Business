import { useState, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { PageTransition } from "@/components/PageTransition";
import { Mail, MapPin, Phone, Globe, Edit3, ShieldCheck, Link as LinkIcon, Camera, Loader2, Save, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";

const Profile = () => {
    const { user } = useDashboard();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit State
    const [editData, setEditData] = useState({
        displayName: user?.displayName || "",
        bio: user?.bio || "",
        location: user?.location || "",
        phoneNumber: user?.phoneNumber || ""
    });

    if (!user) return null;

    const handleSave = async () => {
        setUploading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), editData);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setUploading(false);
        }
    };

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "March 2024";

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFDFF] py-24 md:py-32">
                <div className="max-w-[1000px] mx-auto px-6">
                    {/* Minimal Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
                        <div className="relative group">
                            <div className="size-32 md:size-40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 ring-4 ring-white relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                                <img src={user.companyLogo || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`} alt={user.displayName} className="size-full object-cover" />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-20">
                                        <Loader2 className="size-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 size-10 bg-white shadow-xl rounded-2xl flex items-center justify-center z-30 border border-slate-50 text-indigo-600 hover:text-indigo-500 cursor-pointer transition-all hover:scale-110"
                            >
                                <Camera className="size-4" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !user?.uid) return;

                                    setUploading(true);
                                    try {
                                        const url = await uploadFile(`company_logos/${user.uid}_${Date.now()}`, file);
                                        await updateDoc(doc(db, 'users', user.uid), {
                                            companyLogo: url
                                        });
                                        toast.success("Company logo updated!");
                                    } catch (err: any) {
                                        console.error(err);
                                        toast.error(err.message || "Failed to upload logo");
                                    } finally {
                                        setUploading(false);
                                        if (e.target) e.target.value = ""; // Clear for re-uploading
                                    }
                                }}
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left pt-2 space-y-4">
                            <div className="space-y-1">
                                {isEditing ? (
                                    <input
                                        value={editData.displayName}
                                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                        className="text-3xl font-medium text-slate-900 tracking-tight bg-slate-50 border-0 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-indigo-100 outline-none"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-medium text-slate-900 tracking-tight">{user.displayName}</h1>
                                )}
                                <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest">{user.subscriptionTier} Member</p>
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    className="text-slate-500 max-w-lg leading-relaxed font-light bg-slate-50 border-0 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                                    rows={3}
                                    placeholder="Write a short professional summary..."
                                />
                            ) : (
                                <p className="text-slate-500 max-w-lg leading-relaxed font-light">
                                    {user.bio || "No professional summary provided yet."}
                                </p>
                            )}

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <span className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck className="size-4 text-emerald-500" />
                                    {user.isVerified ? "Verified Member" : "Standard Member"}
                                </span>
                                <span className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                                    <LinkIcon className="size-4 text-slate-300" />
                                    Joined {joinedDate}
                                </span>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={uploading}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-500 transition-all disabled:opacity-50"
                                        >
                                            {uploading ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-all"
                                        >
                                            <X className="size-3" />
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditData({
                                                displayName: user.displayName,
                                                bio: user.bio || "",
                                                location: user.location || "",
                                                phoneNumber: user.phoneNumber || ""
                                            });
                                            setIsEditing(true);
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#191B2D] text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-all"
                                    >
                                        <Edit3 className="size-3" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h2 className="text-sm font-medium text-slate-900 uppercase tracking-[0.2em] mb-6">Security & Contact</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="mt-1 size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <Mail className="size-4" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-slate-300 uppercase tracking-widest block mb-0.5">Official Email</label>
                                        <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">{user.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="mt-1 size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <Phone className="size-4" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-medium text-slate-300 uppercase tracking-widest block mb-0.5">Contact Phone</label>
                                        {isEditing ? (
                                            <input
                                                value={editData.phoneNumber}
                                                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                className="text-sm font-medium text-slate-700 bg-slate-50 border-0 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-indigo-100 outline-none"
                                                placeholder="Phone Number"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">{user.phoneNumber || "Not provided"}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="mt-1 size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <MapPin className="size-4" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-medium text-slate-300 uppercase tracking-widest block mb-0.5">Base Office</label>
                                        {isEditing ? (
                                            <input
                                                value={editData.location}
                                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                className="text-sm font-medium text-slate-700 bg-slate-50 border-0 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-indigo-100 outline-none"
                                                placeholder="Location"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">{user.location || "Remote"}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="mt-1 size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <Globe className="size-4" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-slate-300 uppercase tracking-widest block mb-0.5">Timezone</label>
                                        <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">UTC+5:30 (IST)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Metrics */}
                        <div className="space-y-8">
                            <h2 className="text-sm font-medium text-slate-900 uppercase tracking-[0.2em] mb-6">Expertise Focus</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {(user.skills && user.skills.length > 0 ? user.skills : ['Add Skills', 'Add Expertise']).map(skill => (
                                    <div key={skill} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-default">
                                        <div className="size-2 bg-indigo-600 rounded-full mb-3 group-hover:scale-150 transition-transform" />
                                        <span className="text-xs font-medium text-slate-700">{skill}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl shadow-slate-900/10">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 mb-2">Platform Status</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold italic tracking-tighter">Qwok {user.subscriptionTier?.toUpperCase()}</span>
                                    <div className="h-6 px-3 bg-white/10 rounded-full flex items-center text-[9px] font-semibold uppercase tracking-widest border border-white/10">
                                        {user.isVerified ? "Active" : "Standard"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;
