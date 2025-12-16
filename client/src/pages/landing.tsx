import { motion } from "framer-motion";
import { Gift, Users, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed font-sans text-foreground"
         style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full space-y-12"
        >
          {/* Hero */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-2xl mb-4">
              <Gift className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-display text-primary drop-shadow-sm">
              Secret Santa
            </h1>
            <p className="text-xl md:text-2xl text-foreground font-medium max-w-2xl mx-auto">
              Organize your company's holiday gift exchange with ease. Everyone gets their own login, fills their wishlist privately, and discovers who they're gifting to.
            </p>
            <Button 
              size="lg" 
              className="text-xl px-10 py-8 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-105 bg-primary text-primary-foreground"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <LogIn className="mr-3 w-6 h-6" /> Get Started
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="glass-panel border-0 shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display text-foreground">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  First person creates a team, then shares the link with coworkers. Everyone joins with their own account.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0 shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-display text-foreground">Private Wishlists</h3>
                <p className="text-muted-foreground">
                  Each person fills out their own wishlist with favorite brands and items. Only their Secret Santa will see it.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0 shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-display text-foreground">Easy Shopping Links</h3>
                <p className="text-muted-foreground">
                  When you see your assignment, get instant shopping links to find the perfect gift for your match.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
