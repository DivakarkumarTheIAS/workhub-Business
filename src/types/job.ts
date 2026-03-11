export interface Job {
    id: string;
    ownerId: string;
    jobTitle: string;
    jobCategory: string;
    employmentType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
    workMode: 'On-site' | 'Remote' | 'Hybrid';
    experienceMin: number;
    experienceMax: number;

    // Company Details
    companyName: string;
    companyLogo?: string;
    companyIndustry: string;
    companySize?: string;
    companyWebsite?: string;

    // Job Description
    jobSummary: string;
    responsibilities: string;
    requiredSkills: string[];
    preferredSkills?: string[];

    // Salary & Location
    salaryMin?: number;
    salaryMax?: number;
    salaryType: 'Monthly' | 'Annual' | 'Negotiable';
    jobLocation: string;
    shiftType?: string;
    education: string;

    // Application Settings
    openings: number;
    applyMethod: 'In-App' | 'External';
    resumeRequired: boolean;
    screeningQuestions?: string[];
    maxApplications?: number;
    deadlineDate?: any;

    status: 'pending' | 'approved' | 'rejected' | 'filled' | 'closed';
    createdAt: any;
    applicants?: Record<string, any>;
    applicationsCount: number;
    postType: 'job' | 'project';
    isVerified: boolean;
    postImage?: string;
    ownerName?: string;
    ownerPhoto?: string;
}
