import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Users, Gift, ExternalLink, Sparkles, Save, Trash2, Plus, Calendar, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";
import {
  getTeamWithMembers,
  getWishlist,
  upsertWishlist,
  hasAssignments,
  getAssignment,
  createAssignments,
  getTeamMembers
} from "@/lib/database";
import type { TeamWithMembers, Wishlist, WishlistItem, AssignmentWithDetails } from "@/lib/types";
import { CURRENCY_SYMBOLS } from "@/lib/types";

export default function TeamPage({ params }: { params: { teamId: string } }) {
  const { user, profile, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const teamId = params.teamId;

  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [myWishlist, setMyWishlist] = useState<Wishlist | null>(null);
  const [assignment, setAssignment] = useState<AssignmentWithDetails | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Wishlist items state (max 3)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([{ brand: "", item: "", link: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedAssignment, setRevealedAssignment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user && teamId) {
      loadTeamData();
    }
  }, [user, teamId]);

  async function loadTeamData() {
    if (!user) return;
    try {
      setIsLoading(true);

      const [teamData, wishlistData, hasAssignmentsData] = await Promise.all([
        getTeamWithMembers(teamId),
        getWishlist(teamId, user.id),
        hasAssignments(teamId),
      ]);

      setTeam(teamData);
      setMyWishlist(wishlistData);
      setHasDrawn(hasAssignmentsData);

      if (wishlistData?.items?.length) {
        setWishlistItems(wishlistData.items);
      }

      if (hasAssignmentsData) {
        const assignmentData = await getAssignment(teamId, user.id);
        setAssignment(assignmentData);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveWishlist() {
    if (!user) return;

    // Filter out empty items
    const validItems = wishlistItems.filter(item => item.item.trim());
    if (validItems.length === 0) {
      toast({ title: "Add at least one item", description: "Please add at least one wishlist item.", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      await upsertWishlist(teamId, user.id, validItems);
      toast({ title: "Wishlist saved! 🎁", description: "Your preferences have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDrawNames() {
    if (!user || !team) return;

    const members = team.members;
    if (members.length < 3) {
      toast({ title: "Need more members", description: "You need at least 3 members to draw names.", variant: "destructive" });
      return;
    }

    try {
      setIsDrawing(true);

      // Create derangement (no one gets themselves)
      const memberIds = members.map(m => m.user_id);
      let shuffled = [...memberIds];
      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 100) {
        shuffled = [...memberIds].sort(() => Math.random() - 0.5);
        valid = true;
        for (let i = 0; i < memberIds.length; i++) {
          if (memberIds[i] === shuffled[i]) {
            valid = false;
            break;
          }
        }
        attempts++;
      }

      if (!valid) {
        toast({ title: "Error", description: "Failed to create valid assignments. Please try again.", variant: "destructive" });
        return;
      }

      const assignmentList = memberIds.map((giverId, i) => ({
        giverId,
        receiverId: shuffled[i],
      }));

      await createAssignments(teamId, user.id, assignmentList);

      toast({ title: "Names drawn! 🎄", description: "Secret Santa assignments have been created." });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D93849', '#4CA977', '#FFC107'] });

      setHasDrawn(true);

      // Reload assignment
      setTimeout(async () => {
        const assignmentData = await getAssignment(teamId, user.id);
        setAssignment(assignmentData);
      }, 500);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDrawing(false);
    }
  }

  const addWishlistItem = () => {
    if (wishlistItems.length >= 3) {
      toast({ title: "Maximum 3 items", description: "You can only add up to 3 wishlist items." });
      return;
    }
    setWishlistItems([...wishlistItems, { brand: "", item: "", link: "" }]);
  };

  const removeWishlistItem = (index: number) => {
    if (wishlistItems.length <= 1) return;
    setWishlistItems(wishlistItems.filter((_, i) => i !== index));
  };

  const updateWishlistItem = (index: number, field: keyof WishlistItem, value: string) => {
    const updated = [...wishlistItems];
    updated[index] = { ...updated[index], [field]: value };
    setWishlistItems(updated);
  };

  const getGoogleShoppingLink = (brand?: string, item?: string) => {
    const query = encodeURIComponent(`${brand || ""} ${item || ""}`.trim());
    return `https://www.google.com/search?tbm=shop&q=${query}`;
  };

  const copyInviteCode = () => {
    if (!team) return;
    const url = `${window.location.origin}/join/${team.invite_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied!", description: `Invite code: ${team.invite_code}` });
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || isLoading) {
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

  const isOwner = team?.owner_id === user?.id;
  const currencySymbol = team ? CURRENCY_SYMBOLS[team.currency] : "$";

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
                  <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Gift className="w-8 h-8 text-primary" />
                      <span className="text-4xl font-display text-primary" data-testid="text-team-name">{team.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {isOwner && (
                        <span className="text-sm bg-accent/20 text-accent-foreground px-4 py-2 rounded-full font-bold">
                          OWNER
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-2 rounded-lg">
                      <Users className="w-4 h-4" />
                      <span data-testid="text-member-count">{team.members.length} member{team.members.length !== 1 && 's'}</span>
                    </div>
                    <div className="bg-secondary/30 px-3 py-2 rounded-lg">
                      Budget: {currencySymbol}{team.budget_min} - {currencySymbol}{team.budget_max}
                    </div>
                    {team.exchange_date && (
                      <div className="flex items-center gap-2 bg-secondary/30 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        {new Date(team.exchange_date).toLocaleDateString()}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyInviteCode}
                      className="bg-white/50"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {team.invite_code}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="px-3 py-1 bg-secondary/20 rounded-full text-sm font-medium"
                        data-testid={`member-${member.user_id}`}
                      >
                        {member.profile?.first_name || member.profile?.email || "Member"}
                        {member.user_id === user?.id && <span className="ml-1 text-primary">(You)</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wishlist Section */}
            <Card className="glass-panel border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-display text-foreground">Your Wishlist</span>
                  <span className="text-sm text-muted-foreground">{wishlistItems.length}/3 items</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/50 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Item {index + 1}</span>
                      {wishlistItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWishlistItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`brand-${index}`}>Brand / Store</Label>
                        <Input
                          id={`brand-${index}`}
                          value={item.brand || ""}
                          onChange={(e) => updateWishlistItem(index, "brand", e.target.value)}
                          placeholder="e.g. Nike, Sephora"
                          className="bg-white/70"
                          data-testid={`input-brand-${index}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`item-${index}`}>Item Name *</Label>
                        <Input
                          id={`item-${index}`}
                          value={item.item}
                          onChange={(e) => updateWishlistItem(index, "item", e.target.value)}
                          placeholder="e.g. Air Force 1s"
                          className="bg-white/70"
                          required
                          data-testid={`input-item-${index}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`link-${index}`}>Link (optional)</Label>
                        <Input
                          id={`link-${index}`}
                          value={item.link || ""}
                          onChange={(e) => updateWishlistItem(index, "link", e.target.value)}
                          placeholder="https://..."
                          type="url"
                          className="bg-white/70"
                          data-testid={`input-link-${index}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex gap-3">
                  {wishlistItems.length < 3 && (
                    <Button
                      variant="outline"
                      onClick={addWishlistItem}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveWishlist}
                    disabled={isSaving}
                    className="flex-1 rounded-full"
                    data-testid="button-save-wishlist"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Wishlist"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Draw Names (Owner Only) */}
            {isOwner && !hasDrawn && team && team.members.length >= 3 && (
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
                    onClick={handleDrawNames}
                    disabled={isDrawing}
                    className="px-12 py-6 text-lg rounded-full shadow-xl"
                    data-testid="button-draw-names"
                  >
                    {isDrawing ? "Drawing..." : "Draw Names! 🎄"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isOwner && !hasDrawn && team && team.members.length < 3 && (
              <Card className="glass-panel border-0 shadow-xl">
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need at least 3 members to draw names. Share the invite code <strong>{team.invite_code}</strong> with more people!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Assignment Reveal */}
            {hasDrawn && (
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
                          <h3 className="text-5xl font-display text-primary mb-2" data-testid="text-receiver-name">
                            {assignment.receiver.first_name || assignment.receiver.email}
                          </h3>
                          <p className="text-muted-foreground">
                            Budget: {currencySymbol}{team?.budget_min} - {currencySymbol}{team?.budget_max}
                          </p>
                        </div>

                        {assignment.wishlist && assignment.wishlist.items.length > 0 && (
                          <div className="bg-secondary/20 p-6 rounded-xl space-y-4">
                            <div className="text-xs font-bold text-secondary-foreground/70 uppercase tracking-wider">Their Wishlist</div>
                            {assignment.wishlist.items.map((item, idx) => (
                              <div key={idx} className="bg-white/50 p-4 rounded-lg space-y-2">
                                <div className="font-semibold">{item.item}</div>
                                {item.brand && (
                                  <div className="text-sm text-muted-foreground">Brand: {item.brand}</div>
                                )}
                                <div className="flex gap-2">
                                  {item.link && (
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center text-xs font-bold text-primary hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" /> Product Link
                                    </a>
                                  )}
                                  <a
                                    href={getGoogleShoppingLink(item.brand, item.item)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-xs font-bold text-accent-foreground hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                    data-testid={`link-find-gift-${idx}`}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Google Shopping
                                  </a>
                                </div>
                              </div>
                            ))}
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
