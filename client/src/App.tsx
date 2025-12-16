import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TeamPage from "@/pages/team";
import NotFound from "@/pages/not-found";
import { getTeamByInviteCode } from "@/lib/database";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [joining, setJoining] = useState(false);

  // Handle /join/:inviteCode route
  useEffect(() => {
    const handleJoinRoute = async () => {
      if (location.startsWith("/join/") && isAuthenticated) {
        const inviteCode = location.replace("/join/", "");
        if (inviteCode) {
          setJoining(true);
          // Redirect to dashboard with join parameter
          setLocation(`/?join=${inviteCode}`);
        }
      }
    };
    handleJoinRoute();
  }, [location, isAuthenticated, setLocation]);

  if (isLoading || joining) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Landing} />
      <Route path="/join/:inviteCode">
        {(params) => {
          // If not authenticated, show landing with join intent
          if (!isAuthenticated) {
            // Store the invite code so user can join after login
            sessionStorage.setItem("pendingJoinCode", params.inviteCode);
            return <Landing />;
          }
          // Redirect will happen in useEffect above
          return null;
        }}
      </Route>
      <Route path="/team/:teamId">
        {(params) => <TeamPage params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
