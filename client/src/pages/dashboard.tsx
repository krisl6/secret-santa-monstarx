import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { redirectToLogin, isUnauthorizedError } from "@/lib/auth-utils";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Plus, Users, LogOut, Gift, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";
import type { Team } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin(toast);
    }
  }, [isAuthenticated, authLoading]);

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setCreateDialogOpen(false);
      toast({ title: "Team created!", description: "Share the team link with your colleagues." });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        redirectToLogin(toast);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setJoinDialogOpen(false);
      toast({ title: "Joined team!", description: "You're now part of the Secret Santa exchange." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        redirectToLogin(toast);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyTeamLink = (teamId: string) => {
    const url = `${window.location.origin}/?join=${teamId}`;
    navigator.clipboard.writeText(url);
    setCopiedTeamId(teamId);
    toast({ title: "Link copied!", description: "Share this with your team members." });
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed font-sans text-foreground"
         style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-white/40 backdrop-blur-sm">
        
        {/* Header */}
        <div className="border-b border-white/20 bg-white/60 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-display text-primary" data-testid="text-app-title">Secret Santa</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground" data-testid="text-user-email">
                {user?.email || `${user?.firstName} ${user?.lastName}`}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full px-8 shadow-lg" data-testid="button-create-team">
                    <Plus className="w-5 h-5 mr-2" /> Create New Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name") as string;
                    if (name.trim()) createTeamMutation.mutate(name.trim());
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input 
                        id="team-name" 
                        name="name" 
                        placeholder="e.g. Engineering Team 2024" 
                        required
                        data-testid="input-team-name"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createTeamMutation.isPending} data-testid="button-submit-team">
                      {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full px-8 shadow-lg" data-testid="button-join-team">
                    <Users className="w-5 h-5 mr-2" /> Join Existing Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Team</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const teamId = formData.get("teamId") as string;
                    if (teamId.trim()) joinTeamMutation.mutate(teamId.trim());
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="team-id">Team ID</Label>
                      <Input 
                        id="team-id" 
                        name="teamId" 
                        placeholder="Paste the team ID here" 
                        required
                        data-testid="input-team-id"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={joinTeamMutation.isPending} data-testid="button-submit-join">
                      {joinTeamMutation.isPending ? "Joining..." : "Join Team"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
              <Card className="glass-panel border-0 shadow-xl">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-display text-foreground">No Teams Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create a new team to start your Secret Santa exchange, or join an existing team with a team ID.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="glass-panel border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/team/${team.id}`}
                          data-testid={`card-team-${team.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-2xl font-display text-primary" data-testid={`text-team-name-${team.id}`}>{team.name}</span>
                          {team.ownerId === user?.id && (
                            <span className="text-xs bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-bold">OWNER</span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyTeamLink(team.id);
                            }}
                            data-testid={`button-copy-link-${team.id}`}
                          >
                            {copiedTeamId === team.id ? (
                              <><Check className="w-4 h-4 mr-2" /> Copied!</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-2" /> Copy Link</>
                            )}
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/team/${team.id}`;
                            }}
                            data-testid={`button-open-team-${team.id}`}
                          >
                            Open Team →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
