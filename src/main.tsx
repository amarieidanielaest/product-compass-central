import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import HelpCenter from "./pages/HelpCenter.tsx";
import { RoadmapIntegration } from "./pages/RoadmapIntegration.tsx";
import { CustomerPortalIntegration } from "./components/customer/CustomerPortalIntegration.tsx";
import { CustomerInvitation } from "./pages/CustomerInvitation.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext.tsx";
import { Toaster } from '@/components/ui/sonner';
import { AccessibilityManager } from '@/components/AccessibilityManager';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="auth" element={<Auth />} />
          <Route path="help" element={
            <ProtectedRoute>
              <HelpCenter />
            </ProtectedRoute>
          } />
          <Route path="roadmap-integration" element={
            <ProtectedRoute>
              <RoadmapIntegration />
            </ProtectedRoute>
          } />
          <Route path="portal/:organization/:boardSlug" element={
            <CustomerAuthProvider>
              <CustomerPortalIntegration />
            </CustomerAuthProvider>
          } />
          <Route path="invitation/:token" element={<CustomerInvitation />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <AccessibilityManager />
    </BrowserRouter>
  </StrictMode>
);
