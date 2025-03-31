
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if URL has signup parameter
    const searchParams = new URLSearchParams(location.search);
    const signupParam = searchParams.get("signup");
    setIsSignUp(signupParam === "true");
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would connect to Supabase Auth
      // For now, let's simulate an auth request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isSignUp) {
        // Sign up logic
        toast({
          title: "Account created!",
          description: "Welcome to QuickLit. Your account has been created successfully."
        });
      } else {
        // Sign in logic
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in."
        });
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "There was a problem with your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-quicklit-purple" />
            <span className="text-2xl font-bold">QuickLit</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Enter your details to create an account" 
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col">
              <Button 
                type="submit" 
                className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              
              <p className="mt-4 text-sm text-center text-gray-500">
                {isSignUp 
                  ? "Already have an account? " 
                  : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-quicklit-purple hover:underline focus:outline-none"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
