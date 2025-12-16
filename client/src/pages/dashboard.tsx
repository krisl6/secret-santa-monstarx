import { useEffect, useState } from "react";
import { useAuth, signOut } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Plus, Users, LogOut, Gift, Sparkles, Copy, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";
import { createTeam, getUserTeams, getTeamByInviteCode, addTeamMember } from "@/lib/database";
import type { Team, Currency } from "@/lib/types";
import { CURRENCY_OPTIONS, CURRENCY_SYMBOLS } from "@/lib/types";

export default function Dashboard() {
  const { user, profile, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  // Create team form state
  const [newTeamName, setNewTeamName] = useState("");
  const [budgetMin, setBudgetMin] = useState("10");
  const [budgetMax, setBudgetMax] = useState("50");
  const [currency, setCurrency] = useState<Currency>("SGD");
  const [exchangeDate, setExchangeDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Join team state
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading]);

  // Load teams
  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  // Handle ?join= parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");

    if (joinCode && isAuthenticated && user) {
      handleJoinTeam(joinCode);
      // Clear the URL parameter
      window.history.replaceState({}, '', '/');
    }
  }, [isAuthenticated, user]);

  async function loadTeams() {
    if (!user) return;
    try {
      setIsLoadingTeams(true);
      const userTeams = await getUserTeams(user.id);
      setTeams(userTeams);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTeams(false);
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newTeamName.trim()) return;

    try {
      setIsCreating(true);
      const team = await createTeam({
        name: newTeamName.trim(),
        ownerId: user.id,
        budgetMin: parseInt(budgetMin) || 0,
        budgetMax: parseInt(budgetMax) || 50,
        currency,
        exchangeDate: exchangeDate || null,
      });

      setTeams([...teams, team]);
      setCreateDialogOpen(false);
      setNewTeamName("");
      setBudgetMin("10");
      setBudgetMax("50");
      setCurrency("SGD");
      setExchangeDate("");

      toast({ title: "Team created! 🎄", description: "Share the invite code with your friends." });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinTeam(code?: string) {
    const codeToUse = code || inviteCode.trim().toUpperCase();
    if (!user || !codeToUse) return;

    try {
      setIsJoining(true);

      const team = await getTeamByInviteCode(codeToUse);
      if (!team) {
        toast({ title: "Team not found", description: "Check the invite code and try again.", variant: "destructive" });
        return;
      }

      await addTeamMember(team.id, user.id);
      await loadTeams();

      setJoinDialogOpen(false);
      setInviteCode("");

      toast({ title: "Joined team! 🎉", description: `You're now part of ${team.name}.` });

      // Navigate to team page
      window.location.href = `/team/${team.id}`;
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast({ title: "Already a member", description: "You're already part of this team." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsJoining(false);
    }
  }

  const copyInviteLink = (team: Team) => {
    const url = `${window.location.origin}/join/${team.invite_code}`;
    navigator.clipboard.writeText(url);
    setCopiedTeamId(team.id);
    toast({ title: "Link copied!", description: `Invite code: ${team.invite_code}` });
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  if (authLoading || isLoadingTeams) {
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
                {profile?.email || profile?.first_name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
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
            <div className="flex gap-4 justify-center flex-wrap">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full px-8 shadow-lg" data-testid="button-create-team">
                    <Plus className="w-5 h-5 mr-2" /> Create New Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Team 🎄</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g. Office Squad 2024"
                        required
                        data-testid="input-team-name"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="budget-min">Min Budget</Label>
                        <Input
                          id="budget-min"
                          type="number"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          placeholder="10"
                          min="0"
                          data-testid="input-budget-min"
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget-max">Max Budget</Label>
                        <Input
                          id="budget-max"
                          type="number"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          placeholder="50"
                          min="0"
                          data-testid="input-budget-max"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                          <SelectTrigger id="currency" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="exchange-date">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Gift Exchange Date (optional)
                      </Label>
                      <Input
                        id="exchange-date"
                        type="date"
                        value={exchangeDate}
                        onChange={(e) => setExchangeDate(e.target.value)}
                        data-testid="input-exchange-date"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isCreating} data-testid="button-submit-team">
                      {isCreating ? "Creating..." : "Create Team"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full px-8 shadow-lg" data-testid="button-join-team">
                    <Users className="w-5 h-5 mr-2" /> Join Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Team</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); handleJoinTeam(); }} className="space-y-4">
                    <div>
                      <Label htmlFor="invite-code">Invite Code</Label>
                      <Input
                        id="invite-code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="e.g. ABC123"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        required
                        data-testid="input-invite-code"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        Enter the 6-character code from your friend
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isJoining} data-testid="button-submit-join">
                      {isJoining ? "Joining..." : "Join Team"}
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
                    Create a new team to start your Secret Santa exchange, or join an existing team with an invite code.
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
                          <span className="text-2xl font-display text-primary" data-testid={`text-team-name-${team.id}`}>
                            {team.name}
                          </span>
                          {team.owner_id === user?.id && (
                            <span className="text-xs bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-bold">
                              OWNER
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="bg-secondary/30 px-2 py-1 rounded">
                            Budget: {CURRENCY_SYMBOLS[team.currency]}{team.budget_min} - {CURRENCY_SYMBOLS[team.currency]}{team.budget_max}
                          </span>
                          {team.exchange_date && (
                            <span className="bg-secondary/30 px-2 py-1 rounded">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(team.exchange_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyInviteLink(team);
                            }}
                            data-testid={`button-copy-link-${team.id}`}
                          >
                            {copiedTeamId === team.id ? (
                              <><Check className="w-4 h-4 mr-2" /> Copied!</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-2" /> {team.invite_code}</>
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
