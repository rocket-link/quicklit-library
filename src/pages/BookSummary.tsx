
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  BookAudio,
  BookmarkPlus,
  BookmarkCheck,
  Clock,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Lock
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { summaries } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const BookSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("read");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch summary data
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["summary", id],
    queryFn: async () => {
      if (!id) throw new Error("Summary ID is required");
      const { summary: data, error } = await summaries.getSummary(id);
      if (error) throw error;
      return data;
    }
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Summary ID is required");
      return summaries.toggleBookmark(id);
    },
    onSuccess: (data) => {
      setIsBookmarked(data?.data?.bookmarked || false);
      toast.success(data?.data?.bookmarked ? "Summary bookmarked" : "Bookmark removed");
    },
    onError: (error) => {
      toast.error("Failed to update bookmark", { 
        description: error instanceof Error ? error.message : "Please try again later" 
      });
    }
  });

  // Update reading progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressValue: number) => {
      if (!id) throw new Error("Summary ID is required");
      return summaries.updateReadingProgress(id, progressValue);
    },
    onSuccess: () => {
      toast.success("Reading progress updated");
    }
  });

  // Handle toggling bookmark
  const toggleBookmark = () => {
    if (!user) {
      toast.info("Please sign in to bookmark summaries", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }
    toggleBookmarkMutation.mutate();
  };

  // Handle audio playback
  const toggleAudio = () => {
    if (!user && summary?.is_premium) {
      toast.info("Please sign in to access audio", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress
  const handleProgress = (newProgress: number) => {
    setProgress(newProgress);
    updateProgressMutation.mutate(newProgress);
  };

  // Simulate reading progress by tracking scroll position
  useEffect(() => {
    if (activeTab !== "read") return;
    
    const updateProgressFromScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      
      if (maxScroll > 0) {
        const currentProgress = Math.round((scrollPosition / maxScroll) * 100);
        setProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", updateProgressFromScroll);
    return () => window.removeEventListener("scroll", updateProgressFromScroll);
  }, [activeTab]);

  // If loading or error
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !summary) {
    return (
      <div className="container flex items-center justify-center h-screen px-4 mx-auto md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Summary not found</h2>
          <p className="mt-2 text-gray-500">
            {error instanceof Error ? error.message : "The summary you're looking for doesn't exist or has been removed."}
          </p>
          <Button 
            onClick={() => navigate("/library")}
            className="mt-4 bg-quicklit-purple hover:bg-quicklit-dark-purple"
          >
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const isPremiumContent = summary.is_premium;
  const canAccessPremium = user ? true : !isPremiumContent; // Simplified, ideally check subscription status

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      {/* Book Header */}
      <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
        {/* Book Cover */}
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-quicklit-purple to-quicklit-dark-purple rounded-lg blur-lg opacity-25"></div>
            <img
              src={summary.book.cover_image_url || "/placeholder.svg"}
              alt={summary.title}
              className="relative object-cover w-48 h-64 rounded-md shadow-lg"
            />
            {isPremiumContent && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                PREMIUM
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">{summary.title}</h1>
          {summary.subtitle && (
            <p className="mb-2 text-xl text-gray-600">{summary.subtitle}</p>
          )}
          <p className="mb-4 text-lg text-gray-600">by {summary.book.author.name}</p>
          
          <div className="flex flex-wrap mb-6 space-x-2">
            <span className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-700">
              <Clock className="w-4 h-4 mr-1" />
              {summary.reading_time} min read
            </span>
            {summary.audio_duration && (
              <span className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-700">
                <BookAudio className="w-4 h-4 mr-1" />
                {Math.round(summary.audio_duration / 60)} min listen
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={toggleBookmark}
              variant="outline"
              className="flex items-center"
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-5 h-5 mr-2" />
                  Bookmarked
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-5 h-5 mr-2" />
                  Add to Library
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Reading Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Your progress</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content Tabs */}
      <Tabs
        defaultValue="read"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="read" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Read
          </TabsTrigger>
          <TabsTrigger value="listen" className="flex items-center">
            <BookAudio className="w-4 h-4 mr-2" />
            Listen
          </TabsTrigger>
          <TabsTrigger value="key-ideas">Key Ideas</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          {/* Read Tab */}
          <TabsContent value="read">
            {!canAccessPremium ? (
              <div className="flex flex-col items-center p-8 text-center bg-gray-50 rounded-lg">
                <Lock className="w-12 h-12 mb-4 text-quicklit-purple" />
                <h3 className="mb-2 text-xl font-semibold">Premium Content</h3>
                <p className="mb-4 text-gray-600">
                  This summary is available to premium subscribers only.
                </p>
                <Button 
                  onClick={() => navigate("/auth?signup=true")}
                  className="bg-quicklit-purple hover:bg-quicklit-dark-purple"
                >
                  Upgrade to Premium
                </Button>
              </div>
            ) : (
              <>
                <div className="max-w-3xl mx-auto prose">
                  {summary.text_content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Progress Controls */}
                <div className="flex items-center justify-between max-w-3xl mx-auto mt-8">
                  <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous Section
                  </Button>

                  <Button 
                    onClick={() => handleProgress(100)} 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center text-quicklit-purple hover:text-quicklit-dark-purple"
                  >
                    Mark as Complete
                  </Button>

                  <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
                    Next Section
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Listen Tab */}
          <TabsContent value="listen">
            <div className="max-w-3xl mx-auto">
              {!canAccessPremium || !summary.audio_url ? (
                <div className="flex flex-col items-center p-8 text-center bg-gray-50 rounded-lg">
                  <Lock className="w-12 h-12 mb-4 text-quicklit-purple" />
                  <h3 className="mb-2 text-xl font-semibold">Premium Feature</h3>
                  <p className="mb-4 text-gray-600">
                    Audio summaries are available to premium subscribers only.
                  </p>
                  <Button 
                    onClick={() => navigate("/auth?signup=true")}
                    className="bg-quicklit-purple hover:bg-quicklit-dark-purple"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="mb-4 text-xl font-bold">Audio Summary</h3>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={summary.book.cover_image_url || "/placeholder.svg"}
                      alt={summary.title}
                      className="w-32 h-44 object-cover rounded-md shadow"
                    />
                    
                    <div className="w-full mt-4">
                      <div className="relative h-1 mb-2 bg-gray-200 rounded-full">
                        <div className="absolute h-full rounded-full bg-quicklit-purple" style={{ width: "30%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0:00</span>
                        <span>{Math.floor(summary.audio_duration / 60)}:{(summary.audio_duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center w-full space-x-4">
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={toggleAudio}
                        variant="default"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-quicklit-purple hover:bg-quicklit-dark-purple"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Hidden audio element */}
                    {summary.audio_url && (
                      <audio 
                        src={summary.audio_url} 
                        id="audio-player" 
                        className="hidden"
                        controls={false} 
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Key Ideas Tab */}
          <TabsContent value="key-ideas">
            <div className="max-w-3xl mx-auto">
              {!canAccessPremium ? (
                <div className="flex flex-col items-center p-8 text-center bg-gray-50 rounded-lg">
                  <Lock className="w-12 h-12 mb-4 text-quicklit-purple" />
                  <h3 className="mb-2 text-xl font-semibold">Premium Content</h3>
                  <p className="mb-4 text-gray-600">
                    Key ideas are available to premium subscribers only.
                  </p>
                  <Button 
                    onClick={() => navigate("/auth?signup=true")}
                    className="bg-quicklit-purple hover:bg-quicklit-dark-purple"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="mb-6 text-2xl font-bold">Key Ideas from {summary.title}</h3>
                  <ul className="space-y-6">
                    {summary.key_insights && summary.key_insights.length > 0 ? (
                      summary.key_insights
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((idea, index) => (
                          <li key={idea.id} className="flex">
                            <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 font-bold text-white rounded-full bg-quicklit-purple">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-lg font-semibold">{idea.title}</p>
                              <p className="text-gray-700">{idea.content}</p>
                            </div>
                          </li>
                        ))
                    ) : (
                      <li className="text-center text-gray-500">No key insights available for this summary.</li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default BookSummary;
