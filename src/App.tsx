
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserManagement from "./components/UserManagement";
import OrganizationManagement from "./components/OrganizationManagement";
import CustomerPortal from "./components/CustomerPortal";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import HelpCenter from "./pages/HelpCenter";
import HelpCenterAdmin from "./components/HelpCenterAdmin";
import FloatingVoiceAssistant from "./components/FloatingVoiceAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ServiceProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/help/category/:categoryId" element={<HelpCenter />} />
              <Route path="/help/article/:articleId" element={<HelpCenter />} />
              <Route path="/admin/help" element={
                <ProtectedRoute requiredRole="admin">
                  <HelpCenterAdmin />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/organizations" element={
                <ProtectedRoute requiredRole="admin">
                  <OrganizationManagement />
                </ProtectedRoute>
              } />
              {/* Public customer portal routes */}
              <Route path="/portal/:organizationSlug/:boardSlug" element={<CustomerPortal />} />
              <Route path="/portal/:organizationSlug" element={<CustomerPortal />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingVoiceAssistant />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ServiceProvider>
  </QueryClientProvider>
);

export default App;
