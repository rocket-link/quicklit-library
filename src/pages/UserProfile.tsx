
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profiles } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "@/components/ui/sonner";
import { UserCircle } from "lucide-react";

const profileFormSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { profile } = await profiles.getProfile(user.id);
      return profile;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user?.id) throw new Error("User ID not found");
      return profiles.updateProfile(user.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile", { 
        description: error instanceof Error ? error.message : "Unknown error" 
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("User ID not found");
      return profiles.uploadAvatar(user.id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Avatar uploaded successfully");
      setAvatarFile(null);
    },
    onError: (error) => {
      toast.error("Failed to upload avatar", { 
        description: error instanceof Error ? error.message : "Unknown error" 
      });
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profileData?.username || "",
      full_name: profileData?.full_name || "",
      bio: profileData?.bio || "",
    },
    values: {
      username: profileData?.username || "",
      full_name: profileData?.full_name || "",
      bio: profileData?.bio || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      <h1 className="mb-8 gradient-text">Your Profile</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 space-y-4 bg-white rounded-lg shadow-md">
              <Avatar className="w-32 h-32 border-2 border-purple-100">
                <AvatarImage 
                  src={avatarPreview || profileData?.avatar_url || undefined} 
                  alt={profileData?.full_name || user?.email || "User"} 
                />
                <AvatarFallback className="text-4xl bg-quicklit-purple">
                  <UserCircle className="w-20 h-20 text-white" />
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full">
                <label htmlFor="avatar-upload" className="w-full">
                  <div className="px-4 py-2 text-sm text-center text-white rounded-md cursor-pointer bg-quicklit-purple hover:bg-quicklit-dark-purple">
                    Change Avatar
                  </div>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="w-full pt-4 text-center border-t">
                <h3 className="text-lg font-semibold">{profileData?.full_name || user?.email?.split('@')[0]}</h3>
                <p className="text-sm text-gray-500">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johnsmith" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          This is your public username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          How you want your name to appear on the platform.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description that appears on your public profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-quicklit-purple hover:bg-quicklit-dark-purple"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Reading Preferences</h2>
            <p className="text-gray-500">
              Preference settings will be available soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Your Subscription</h2>
            <p className="mb-4 text-gray-500">
              Manage your subscription details here.
            </p>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
