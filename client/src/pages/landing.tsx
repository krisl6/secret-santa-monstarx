import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Users, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithEmail } from "@/hooks/use-auth";
import bgImage from "@assets/generated_images/festive_winter_background_with_subtle_holiday_elements.png";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      await signInWithEmail(email);
      setEmailSent(true);
      toast({
        title: "Check your email! 📧",
        description: "We sent you a magic link to sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed font-sans text-foreground"
      style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8">

        {/* Figma Design Section 1 */}
        <div className="relative w-full max-w-[1737px] min-h-[1482px] mb-12 overflow-hidden hidden lg:block">
          {/* Main Group 2 Image */}
          <motion.img
            src="https://api.builder.io/api/v1/image/assets/TEMP/e9e6aab083e922bcc01e37d9626f8652ef8a3bda?width=1640"
            alt="Group 2"
            className="absolute left-[14%] top-[8%] w-[47%] h-auto z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Christmas Toy Drive Illustration */}
          <motion.img
            src="https://api.builder.io/api/v1/image/assets/TEMP/d6e37606d3ba77a2571a565fdd1869635bcb21d0?width=1212"
            alt="christmas-toy-drive/amico"
            className="absolute left-[10%] top-[56%] w-[35%] h-auto z-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Christmas Giveaway Illustration */}
          <motion.img
            src="https://api.builder.io/api/v1/image/assets/TEMP/d8a3be8cb6160030f08668de4a9344ef523f5463?width=1212"
            alt="christmas-giveaway/amico"
            className="absolute left-[56%] top-[35%] w-[35%] h-auto z-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Decorative Star SVGs */}
          <motion.svg
            className="absolute left-[58%] top-[45%] w-[2.7%] h-auto fill-[#EBEBEB] z-20"
            width="47"
            height="50"
            viewBox="0 0 47 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <path d="M20.6786 0L27.0242 21.5994L46.822 20.138L29.9268 30.5674L35.4918 49.5844L22.3 36.1124L9.88886 48.1832L14.6732 30.5674L0 22.28L17.5958 21.5994L20.6786 0Z" fill="#EBEBEB" />
          </motion.svg>

          <motion.svg
            className="absolute left-[59%] top-[45%] w-[0.35%] h-[1.9%] fill-[#E0E0E0] z-20"
            width="7"
            height="28"
            viewBox="0 0 7 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <path d="M1.42126 27.6247L0 0L6.34565 21.5994L1.42126 27.6247Z" fill="#E0E0E0" />
          </motion.svg>

          <motion.svg
            className="absolute left-[58.5%] top-[46.5%] w-[0.7%] h-[1.4%] fill-[#E0E0E0] z-20"
            width="13"
            height="21"
            viewBox="0 0 13 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <path d="M0 20.5585L12.211 0L12.4111 8.48765L0 20.5585Z" fill="#E0E0E0" />
          </motion.svg>

          <motion.svg
            className="absolute left-[58%] top-[46%] w-[1.3%] h-[0.5%] fill-[#E0E0E0] z-20"
            width="23"
            height="9"
            viewBox="0 0 23 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <path d="M14.6732 8.28739L22.0998 5.34475L0 0L14.6732 8.28739Z" fill="#E0E0E0" />
          </motion.svg>

          <motion.svg
            className="absolute left-[59%] top-[46%] w-[1.4%] h-[2%] fill-[#E0E0E0] z-20"
            width="25"
            height="30"
            viewBox="0 0 25 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <path d="M24.7222 0L0 7.48669L13.392 29.4464L7.82702 10.4293L24.7222 0Z" fill="#E0E0E0" />
          </motion.svg>
        </div>

        {/* Mobile/Tablet Responsive Version */}
        <div className="relative w-full mb-12 overflow-hidden lg:hidden">
          <div className="flex flex-col items-center space-y-8">
            {/* Main Group 2 Image */}
            <motion.img
              src="https://api.builder.io/api/v1/image/assets/TEMP/e9e6aab083e922bcc01e37d9626f8652ef8a3bda?width=1640"
              alt="Group 2"
              className="w-full max-w-md h-auto z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Illustrations Stack */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl px-4">
              <motion.img
                src="https://api.builder.io/api/v1/image/assets/TEMP/d6e37606d3ba77a2571a565fdd1869635bcb21d0?width=1212"
                alt="christmas-toy-drive/amico"
                className="w-full md:w-1/2 h-auto"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />

              <motion.img
                src="https://api.builder.io/api/v1/image/assets/TEMP/d8a3be8cb6160030f08668de4a9344ef523f5463?width=1212"
                alt="christmas-giveaway/amico"
                className="w-full md:w-1/2 h-auto"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </div>

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
              Organize your holiday gift exchange with ease. Everyone gets their own login, fills their wishlist privately, and discovers who they're gifting to.
            </p>

            {/* Auth Section */}
            <Card className="glass-panel border-0 shadow-2xl max-w-md mx-auto">
              <CardContent className="p-8 space-y-6">
                {emailSent ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Check your email!</h3>
                    <p className="text-muted-foreground">
                      We sent a magic link to <strong>{email}</strong>. Click it to sign in.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setEmailSent(false)}
                      className="text-sm"
                    >
                      Use a different email
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-full text-lg py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      data-testid="button-google-signin"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/70 px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-center bg-white/50"
                        required
                        data-testid="input-email"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="lg"
                        className="w-full text-lg py-6 rounded-full"
                        disabled={isLoading || !email.trim()}
                        data-testid="button-email-signin"
                      >
                        <Mail className="w-5 h-5 mr-3" />
                        Send Magic Link
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
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
                  First person creates a team, then shares the invite code with friends. Everyone joins with their own account.
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
                  Each person fills out up to 3 wishlist items with brands and links. Only their Secret Santa will see it.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0 shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-display text-foreground">Easy Shopping</h3>
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
