
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import FloatingVoiceAssistant from "./components/FloatingVoiceAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ServiceProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Outlet />
          <FloatingVoiceAssistant />
        </TooltipProvider>
      </AuthProvider>
    </ServiceProvider>
  </QueryClientProvider>
);

export default App;
