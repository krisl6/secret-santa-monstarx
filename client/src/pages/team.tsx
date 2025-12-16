import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { redirectToLogin, isUnauthorizedError } from "@/lib/auth-utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Users, Gift, ExternalLink, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";
import type { User } from "@shared/models/auth";
import type { Wishlist } from "@shared/schema";

interface TeamDetailsResponse {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members: User[];
}

interface AssignmentResponse {
  assignment: {
    id: string;
    teamId: string;
    giverId: string;
    receiverId: string;
  };
  receiver: User;
  wishlist: Wishlist | null;
}

export default function TeamPage({ params }: { params: { teamId: string } }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const teamId = params.teamId;
  const [wishlistBrand, setWishlistBrand] = useState("");
  const [wishlistItem, setWishlistItem] = useState("");
  const [revealedAssignment, setRevealedAssignment] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin(toast);
    }
  }, [isAuthenticated, authLoading]);

  const { data: team } = useQuery<TeamDetailsResponse>({
    queryKey: [`/api/teams/${teamId}`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated && !!teamId,
  });

  const { data: myWishlist } = useQuery<Wishlist | null>({
    queryKey: [`/api/teams/${teamId}/wishlist`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/wishlist`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated && !!teamId,
  });

  const { data: hasAssignmentsData } = useQuery<{ hasAssignments: boolean }>({
    queryKey: [`/api/teams/${teamId}/has-assignments`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/has-assignments`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated && !!teamId,
  });

  const { data: assignment, refetch: refetchAssignment } = useQuery<AssignmentResponse | null>({
    queryKey: [`/api/teams/${teamId}/assignment`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/assignment`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated && !!teamId && hasAssignmentsData?.hasAssignments === true,
  });

  const saveWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brand: wishlistBrand, item: wishlistItem }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/wishlist`] });
      toast({ title: "Wishlist saved!", description: "Your preferences have been updated." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        redirectToLogin(toast);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const drawNamesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/draw`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/has-assignments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/assignment`] });
      toast({ title: "Names drawn!", description: "Secret Santa assignments have been created." });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D93849', '#4CA977', '#FFC107'] });
      setTimeout(() => refetchAssignment(), 500);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        redirectToLogin(toast);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getGoogleShoppingLink = (brand: string, item: string) => {
    const query = encodeURIComponent(`${brand} ${item}`);
    return `https://www.google.com/search?tbm=shop&q=${query}`;
  };

  useEffect(() => {
    if (myWishlist) {
      setWishlistBrand(myWishlist.brand || "");
      setWishlistItem(myWishlist.item || "");
    }
  }, [myWishlist]);

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

  const isOwner = team?.ownerId === user?.id;
  const hasAssignments = hasAssignmentsData?.hasAssignments || false;

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed font-sans text-foreground"
         style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-white/40 backdrop-blur-sm">
        
        {/* Header */}
        <div className="border-b border-white/20 bg-white/60 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/"}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Team Header */}
            {team && (
              <Card className="glass-panel border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-8 h-8 text-primary" />
                      <span className="text-4xl font-display text-primary" data-testid="text-team-name">{team.name}</span>
                    </div>
                    {isOwner && (
                      <span className="text-sm bg-accent/20 text-accent-foreground px-4 py-2 rounded-full font-bold">OWNER</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span data-testid="text-member-count">{team.members.length} member{team.members.length !== 1 && 's'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <div 
                        key={member.id}
                        className="px-3 py-1 bg-secondary/20 rounded-full text-sm font-medium"
                        data-testid={`member-${member.id}`}
                      >
                        {member.firstName || member.email}
                        {member.id === user?.id && <span className="ml-1 text-primary">(You)</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wishlist Section */}
            <Card className="glass-panel border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-display text-foreground">Your Wishlist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Favorite Brand / Store</Label>
                  <Input
                    id="brand"
                    value={wishlistBrand}
                    onChange={(e) => setWishlistBrand(e.target.value)}
                    placeholder="e.g. Nike, Sephora, Lego"
                    className="h-12 bg-white/50"
                    data-testid="input-brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item">Specific Item or Category</Label>
                  <Input
                    id="item"
                    value={wishlistItem}
                    onChange={(e) => setWishlistItem(e.target.value)}
                    placeholder="e.g. Air Force 1s, Lip Gloss, Star Wars Set"
                    className="h-12 bg-white/50"
                    data-testid="input-item"
                  />
                </div>
                <Button 
                  onClick={() => saveWishlistMutation.mutate()}
                  disabled={saveWishlistMutation.isPending}
                  className="w-full rounded-full"
                  data-testid="button-save-wishlist"
                >
                  <Save className="w-4 h-4 mr-2" /> 
                  {saveWishlistMutation.isPending ? "Saving..." : "Save Wishlist"}
                </Button>
              </CardContent>
            </Card>

            {/* Draw Names (Owner Only) */}
            {isOwner && !hasAssignments && team && team.members.length >= 3 && (
              <Card className="glass-panel border-0 shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-3xl font-display text-foreground">Ready to Draw Names?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Once you draw names, everyone will be able to see who they're gifting to!
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => drawNamesMutation.mutate()}
                    disabled={drawNamesMutation.isPending}
                    className="px-12 py-6 text-lg rounded-full shadow-xl"
                    data-testid="button-draw-names"
                  >
                    {drawNamesMutation.isPending ? "Drawing..." : "Draw Names! 🎄"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isOwner && !hasAssignments && team && team.members.length < 3 && (
              <Card className="glass-panel border-0 shadow-xl">
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need at least 3 members to draw names. Share the team link with more people!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Assignment Reveal */}
            {hasAssignments && (
              <Card className={`
                glass-panel border-0 shadow-2xl transition-all duration-500 cursor-pointer
                ${revealedAssignment ? "ring-2 ring-primary" : ""}
              `}
              onClick={() => setRevealedAssignment(!revealedAssignment)}
              data-testid="card-assignment"
              >
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {!revealedAssignment ? (
                      <motion.div
                        key="hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-6"
                      >
                        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                          <Gift className="w-10 h-10 text-secondary-foreground" />
                        </div>
                        <h3 className="text-3xl font-display text-foreground">Your Secret Santa Assignment</h3>
                        <p className="text-muted-foreground uppercase tracking-widest font-bold">Tap to Reveal</p>
                      </motion.div>
                    ) : assignment ? (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-6"
                      >
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">You are gifting to:</p>
                          <h3 className="text-5xl font-display text-primary mb-6" data-testid="text-receiver-name">
                            {assignment.receiver.firstName || assignment.receiver.email}
                          </h3>
                        </div>

                        {assignment.wishlist && (assignment.wishlist.brand || assignment.wishlist.item) && (
                          <div className="bg-secondary/20 p-6 rounded-xl space-y-3">
                            <div className="text-xs font-bold text-secondary-foreground/70 uppercase tracking-wider">Their Wishlist</div>
                            {assignment.wishlist.brand && (
                              <div className="text-base" data-testid="text-receiver-brand">
                                <span className="font-semibold">Brand:</span> {assignment.wishlist.brand}
                              </div>
                            )}
                            {assignment.wishlist.item && (
                              <div className="text-base" data-testid="text-receiver-item">
                                <span className="font-semibold">Item:</span> {assignment.wishlist.item}
                              </div>
                            )}
                            
                            <a 
                              href={getGoogleShoppingLink(assignment.wishlist.brand || "", assignment.wishlist.item || "")}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-2"
                              onClick={(e) => e.stopPropagation()}
                              data-testid="link-find-gift"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" /> Find Gift Online
                            </a>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground text-center mt-4">Tap to hide</p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-muted-foreground">Loading assignment...</div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
