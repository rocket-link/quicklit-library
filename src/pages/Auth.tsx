import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { Lock, Mail, User, Github, Mail as MailIcon, Facebook } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Please enter your name" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithOAuth, user, loading } = useAuth();
  
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setActiveTab('signup');
    }
  }, [location]);

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSignInSubmit = async (data: SignInFormValues) => {
    try {
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again"
      });
    }
  };

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
      });
      if (!error) {
        toast.success("Account created successfully", {
          description: "Please check your email to verify your account"
        });
        setActiveTab("signin");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      toast.error(`${provider} sign in failed`, {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text">QuickLit</h1>
          <p className="mt-2 text-gray-600">Learn faster with book summaries</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                              <Input placeholder="you@example.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                              <Input type="password" placeholder="••••••" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500 bg-white">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <MailIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('facebook')}
                  >
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('twitter')}
                  >
                    <Github className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="link"
                  className="text-quicklit-purple"
                  onClick={() => setActiveTab("signup")}
                >
                  Don't have an account? Sign Up
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to start reading summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                              <Input placeholder="John Doe" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                              <Input placeholder="you@example.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                              <Input type="password" placeholder="••••••" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>

                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500 bg-white">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <MailIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('facebook')}
                  >
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('twitter')}
                  >
                    <Github className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="link"
                  className="text-quicklit-purple"
                  onClick={() => setActiveTab("signin")}
                >
                  Already have an account? Sign In
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
