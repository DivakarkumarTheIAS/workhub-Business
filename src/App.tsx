import TopNavbar from "@/components/TopNavbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import JobHub from "@/pages/JobHub";
import FreelanceHub from "@/pages/FreelanceHub";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Premium from "@/pages/Premium";
import CreateJob from "@/pages/CreateJob";
import JobDetails from "@/pages/JobDetails";
import TalentProfile from "@/pages/TalentProfile";
import CreateProject from "@/pages/CreateProject";
import ProjectDetails from "@/pages/ProjectDetails";
import Login from "@/pages/Login";
import BecomeOwner from "@/pages/BecomeOwner";
import NotFound from "@/pages/NotFound";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";

const queryClient = new QueryClient();

import { useDashboard } from "@/context/DashboardContext";
import { toast } from "sonner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { user: profile, loading: dashboardLoading } = useDashboard();
  const location = useLocation();

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
        <div className="size-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // Allow admins, business owners, or approved requests
  const isAuthorized =
    profile?.role === 'businessOwner' ||
    profile?.role === 'admin' ||
    profile?.ownerRequestStatus === 'approved';

  // If they are on the become-owner page, let them through regardless of role
  // as long as they are authenticated (to allow them to apply)
  if (location.pathname === "/become-owner") {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    // Instead of signing out, we'll just redirect to the become-owner page
    // This allows them to see their application status or apply
    toast.error("Access Restricted: Business Owner clearance required for this section.");
    return <Navigate to="/become-owner" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/login";

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {showNavbar && <TopNavbar />}
      <main className="flex-1 w-full relative">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/talents/jobs" element={<ProtectedRoute><JobHub /></ProtectedRoute>} />
          <Route path="/talents/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
          <Route path="/talents/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/talents/profile/:userId" element={<ProtectedRoute><TalentProfile /></ProtectedRoute>} />
          <Route path="/talents/freelance" element={<ProtectedRoute><FreelanceHub /></ProtectedRoute>} />
          <Route path="/talents/freelance/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/talents/freelance/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/become-owner" element={<ProtectedRoute><BecomeOwner /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />

          <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toaster position="top-center" />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <DashboardProvider>
            <AppContent />
          </DashboardProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
