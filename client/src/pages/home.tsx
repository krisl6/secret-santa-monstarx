import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Plus, Trash2, Gift, Sparkles, ArrowRight, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";

type Participant = {
  id: string;
  name: string;
  brand: string;
  item: string;
  assignedTo?: string; // The ID of the person they are gifting TO
};

export default function Home() {
  const [step, setStep] = useState<"welcome" | "participants" | "wishlists" | "draw" | "results">("welcome");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentWishlistIndex, setCurrentWishlistIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Load from local storage on mount (optional persistence for better DX)
  useEffect(() => {
    const saved = localStorage.getItem("secret-santa-participants");
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("secret-santa-participants", JSON.stringify(participants));
  }, [participants]);

  const addParticipant = (name: string) => {
    if (!name.trim()) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setParticipants([...participants, { id: newId, name: name.trim(), brand: "", item: "" }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateWishlist = (id: string, field: "brand" | "item", value: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const startDraw = () => {
    if (participants.length < 3) {
      toast({
        title: "Not enough people!",
        description: "You need at least 3 people for a Secret Santa.",
        variant: "destructive",
      });
      return;
    }

    // Simple shuffle logic (derangement)
    let shuffled = [...participants];
    let valid = false;

    // Retry until no one has themselves
    while (!valid) {
      shuffled = [...participants].sort(() => Math.random() - 0.5);
      valid = true;
      for (let i = 0; i < participants.length; i++) {
        if (participants[i].id === shuffled[i].id) {
          valid = false;
          break;
        }
      }
    }

    const newParticipants = participants.map((p, i) => ({
      ...p,
      assignedTo: shuffled[i].id,
    }));

    setParticipants(newParticipants);
    setStep("results");
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D93849', '#4CA977', '#FFC107']
    });
  };

  const getGoogleShoppingLink = (brand: string, item: string) => {
    const query = encodeURIComponent(`${brand} ${item}`);
    return `https://www.google.com/search?tbm=shop&q=${query}`;
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed font-sans text-foreground selection:bg-primary/20"
         style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8">
        
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-4">
                  <Gift className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display text-primary drop-shadow-sm">
                  Secret Santa
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-xs mx-auto">
                  The easiest way to organize your holiday gift exchange without any logins.
                </p>
              </div>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setStep("participants")}
              >
                Start Exchange <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === "participants" && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md w-full"
            >
              <Card className="glass-panel border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display text-primary">Who's joining?</h2>
                    <p className="text-sm text-muted-foreground">Add everyone who wants to participate.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem("name") as HTMLInputElement;
                      addParticipant(input.value);
                      input.value = "";
                      input.focus();
                    }}
                    className="flex gap-2"
                  >
                    <Input 
                      name="name" 
                      placeholder="Enter name..." 
                      className="h-12 text-lg bg-white/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                      autoFocus
                    />
                    <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </form>

                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                    {participants.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground italic">
                        No elves added yet...
                      </div>
                    )}
                    <AnimatePresence>
                      {participants.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 bg-white/60 rounded-lg group"
                        >
                          <span className="font-medium text-lg">{p.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeParticipant(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-border/50">
                    <span className="text-sm text-muted-foreground font-medium">
                      {participants.length} participant{participants.length !== 1 && "s"}
                    </span>
                    <Button 
                      onClick={() => setStep("wishlists")}
                      disabled={participants.length < 3}
                      className="rounded-full px-6"
                    >
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "wishlists" && participants.length > 0 && (
            <motion.div
              key="wishlists"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md w-full"
            >
              <Card className="glass-panel border-0 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-secondary/30">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${((currentWishlistIndex + 1) / participants.length) * 100}%` }}
                  />
                </div>
                
                <CardContent className="p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                      Wishlist {currentWishlistIndex + 1} of {participants.length}
                    </span>
                    <h2 className="text-4xl font-display text-foreground">
                      Hi, <span className="text-primary">{participants[currentWishlistIndex].name}</span>!
                    </h2>
                    <p className="text-muted-foreground">What are you hoping for this year?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-base font-medium">Favorite Brand / Store</Label>
                      <Input
                        id="brand"
                        value={participants[currentWishlistIndex].brand}
                        onChange={(e) => updateWishlist(participants[currentWishlistIndex].id, "brand", e.target.value)}
                        placeholder="e.g. Nike, Sephora, Lego"
                        className="h-12 bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item" className="text-base font-medium">Specific Item or Category</Label>
                      <Input
                        id="item"
                        value={participants[currentWishlistIndex].item}
                        onChange={(e) => updateWishlist(participants[currentWishlistIndex].id, "item", e.target.value)}
                        placeholder="e.g. Air Force 1s, Lip Gloss, Star Wars Set"
                        className="h-12 bg-white/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                     <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (currentWishlistIndex > 0) setCurrentWishlistIndex(i => i - 1);
                        else setStep("participants");
                      }}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => {
                        if (currentWishlistIndex < participants.length - 1) {
                          setCurrentWishlistIndex(i => i + 1);
                        } else {
                          setStep("draw");
                        }
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full shadow-lg"
                    >
                      {currentWishlistIndex === participants.length - 1 ? "Finish" : "Next Person"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "draw" && (
            <motion.div
              key="draw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="space-y-4">
                 <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl mb-4 animate-bounce">
                  <Sparkles className="w-12 h-12 text-accent" />
                </div>
                <h2 className="text-5xl font-display text-primary">Ready to Draw?</h2>
                <p className="text-lg text-muted-foreground">
                  We'll shuffle the names and assign a Secret Santa to everyone.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  onClick={startDraw}
                  className="text-xl px-12 py-8 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all"
                >
                  Draw Names! 🎄
                </Button>
                
                <Button variant="ghost" onClick={() => setStep("wishlists")}>
                  Go Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl"
            >
              <div className="text-center mb-10 space-y-2">
                <h2 className="text-4xl md:text-5xl font-display text-primary">The Results</h2>
                <p className="text-muted-foreground">Pass the device around. Click your name to see who you got!</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (confirm("This will clear all matches. Are you sure?")) {
                      setStep("participants");
                      setRevealed({});
                    }
                  }}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participants.map((p) => {
                  const target = participants.find(t => t.id === p.assignedTo);
                  const isRevealed = revealed[p.id];

                  return (
                    <motion.div 
                      key={p.id}
                      layoutId={p.id}
                      className="relative perspective-1000"
                    >
                      <Card className={`
                        overflow-hidden transition-all duration-500 cursor-pointer h-full min-h-[200px] shadow-lg hover:shadow-xl border-0
                        ${isRevealed ? "ring-2 ring-primary" : "bg-white/80"}
                      `}
                      onClick={() => setRevealed(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      >
                        <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                          {!isRevealed ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-2xl">🎅</span>
                              </div>
                              <h3 className="text-2xl font-bold text-foreground">{p.name}</h3>
                              <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Tap to Reveal</p>
                            </div>
                          ) : (
                             <div className="space-y-4 animate-in fade-in zoom-in duration-300 w-full">
                               <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">You are gifting to:</div>
                               <h3 className="text-3xl font-display text-primary">{target?.name}</h3>
                               
                               {(target?.brand || target?.item) && (
                                 <div className="bg-secondary/20 p-4 rounded-xl space-y-2 mt-4 text-left">
                                   <div className="text-xs font-bold text-secondary-foreground/70 uppercase tracking-wider">Their Wishlist</div>
                                   {target.brand && (
                                     <div className="text-sm">
                                       <span className="font-semibold">Brand:</span> {target.brand}
                                     </div>
                                   )}
                                   {target.item && (
                                     <div className="text-sm">
                                       <span className="font-semibold">Item:</span> {target.item}
                                     </div>
                                   )}
                                   
                                   <a 
                                     href={getGoogleShoppingLink(target?.brand || "", target?.item || "")}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="inline-flex items-center text-xs font-bold text-primary hover:underline mt-2"
                                     onClick={(e) => e.stopPropagation()}
                                   >
                                     <ExternalLink className="w-3 h-3 mr-1" /> Find Gift Online
                                   </a>
                                 </div>
                               )}
                               
                               <div className="text-xs text-muted-foreground mt-4">Tap to hide</div>
                             </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
