export interface Activity {
    id: string;
    userId: string;
    title: string;
    message?: string;
    description?: string;
    type: 'project' | 'wallet' | 'system' | 'job' | 'rating';
    createdAt: any; // Firestore Timestamp
    icon?: string;
}
