import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TeamPage from "@/pages/team";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle ?join=teamId query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinTeamId = params.get("join");
    
    if (joinTeamId && isAuthenticated) {
      // Join the team and redirect
      fetch(`/api/teams/${joinTeamId}/join`, {
        method: "POST",
        credentials: "include",
      })
        .then(res => {
          if (res.ok) {
            setLocation(`/team/${joinTeamId}`);
          } else {
            setLocation("/");
          }
        })
        .catch(() => setLocation("/"));
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
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
