export interface Project {
    id: string;
    ownerId: string;
    projectTitle: string;
    projectCategory: string;
    projectType: 'Fixed' | 'Hourly';
    experienceLevel: 'Beginner' | 'Intermediate' | 'Expert';
    projectLocation: string;
    workMode: 'On-site' | 'Remote' | 'Hybrid';

    // Company Details
    companyName?: string;
    companyLogo?: string;
    ownerName?: string;
    ownerPhoto?: string;

    // Project Description
    projectDescription: string;
    deliverables: string[];
    referenceFiles?: string[];

    // Skills, Budget & Timeline
    requiredSkills: string[];
    budgetMin: number;
    budgetMax: number;
    projectDuration: string;
    startDate?: any;

    // Proposal Settings
    proposalQuestions?: string[];
    ndaRequired: boolean;
    autoCloseLimit?: number;
    maxApplications?: number;
    deadlineDate?: any;

    // New Fields for Project Flow
    depositAmount?: number;
    depositPaid?: boolean;
    termsAndConditions?: string;

    status: 'pending' | 'approved' | 'rejected' | 'open' | 'filled' | 'closed' | 'setup';
    createdAt: any;
    applicants?: Record<string, {
        status: string;
        rejectionDescription?: string;
        shortlistGreeting?: string;
        [key: string]: any;
    }>;
    applicationsCount: number;
    postType: 'job' | 'project';
    isVerified: boolean;
    postImage?: string;
}
