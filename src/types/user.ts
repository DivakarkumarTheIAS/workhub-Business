export type UserRole = 'worker' | 'businessOwner' | 'admin' | 'none';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    bannerImage?: string;
    username?: string;
    bio?: string;
    skills?: string[];
    badges?: string[];
    portfolio?: Record<string, any>;
    createdAt?: number; // timestamp
    businessEmail?: string;
    isVerified: boolean;
    isFirstLogin: boolean;
    location?: string;
    jobCategory?: string;
    resumeUrl?: string;
    activeMode: 'job' | 'freelancer';
    subscriptionTier: 'Free' | 'Pro' | 'Elite';
    subscriptionExpiry?: number;
    walletBalance: number;

    // Stats for Dashboard
    totalEarnings: number;
    pendingClearance: number;
    completedProjects: number;
    rating: number;
    ratingsCount: number;

    // Personal/Professional details
    fullName?: string;
    totalExperience?: number;
    currentCompany?: string;
    expectedSalary?: number;
    jobPreference?: string[];
    hourlyRate?: number;
    availability?: string;

    phoneNumber?: string;
    walletAddress?: string;
    isBanned: boolean;

    // Saved Items
    savedJobIds: string[];
    savedProjectIds: string[];

    // Business Owner Request
    ownerRequestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    ownerRequestData?: {
        companyName: string;
        businessType: string;
        managerName: string;
        website?: string;
        description: string;
        requestedAt: string;
    };
    rejectionReason?: string;
    companyLogo?: string;
}
