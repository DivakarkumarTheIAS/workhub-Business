import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type { User } from '../types/user';

interface DashboardContextType {
    user: User | null;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    userMode: 'seeker' | 'freelancer';
    setUserMode: (mode: 'seeker' | 'freelancer') => void;
    loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const { user: firebaseUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userMode, setUserMode] = useState<'seeker' | 'freelancer'>('seeker');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firebaseUser) {
            setUser(null);
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data() as User;
                setUser(userData);
                // Sync mode if activeMode is present
                if (userData.activeMode === 'job') {
                    setUserMode('seeker');
                } else if (userData.activeMode === 'freelancer') {
                    setUserMode('freelancer');
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user dashboard data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firebaseUser]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <DashboardContext.Provider
            value={{
                user,
                isSidebarOpen,
                toggleSidebar,
                userMode,
                setUserMode,
                loading
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
