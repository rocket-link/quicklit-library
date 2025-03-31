
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookCard from "@/components/BookCard";
import { useQuery } from "@tanstack/react-query";
import { dashboard, summaries } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { Book } from "@/types/book";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Get user's dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      const { dashboardData, error } = await dashboard.getUserDashboardData();
      if (error) throw error;
      return dashboardData || {
        readingStreak: 0,
        booksRead: 0,
        readingTime: 0,
        yearlyGoal: { current: 0, target: 20 }
      };
    },
    enabled: !!user
  });

  // Get in-progress books
  const { data: inProgressBooks, isLoading: inProgressLoading } = useQuery({
    queryKey: ["in-progress", user?.id],
    queryFn: async () => {
      // This would ideally be a specific API endpoint, using getAllSummaries as a proxy
      const { summaries: data } = await summaries.getAllSummaries(1, 5);
      
      // Transform data to match the needed format with progress
      // In a real app, this would come from the API with actual progress data
      return (data || []).slice(0, 2).map((summary, index) => ({
        id: summary.id,
        title: summary.title || summary.books?.title || "Unknown Title",
        author: summary.books?.authors?.name || "Unknown Author",
        coverImage: summary.books?.cover_image_url || "/placeholder.svg",
        category: "In Progress",
        readTime: summary.reading_time || 15,
        progress: index === 0 ? 75 : 30 // Mock progress, would come from API
      }));
    },
    enabled: !!user
  });

  // Get recommended books
  const { data: recommendedBooks, isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended", user?.id],
    queryFn: async () => {
      // Again, ideally a specific recommendation endpoint
      const { summaries: data } = await summaries.getAllSummaries(1, 4);
      
      return (data || []).map(summary => ({
        id: summary.id,
        title: summary.title || summary.books?.title || "Unknown Title",
        author: summary.books?.authors?.name || "Unknown Author",
        coverImage: summary.books?.cover_image_url || "/placeholder.svg",
        category: "Recommended",
        readTime: summary.reading_time || 15
      }));
    }
  });

  const isLoading = authLoading || dashboardLoading || inProgressLoading || recommendedLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to login
  if (!user && !authLoading) {
    navigate('/auth');
    return null;
  }

  // Stats from dashboard data or defaults
  const READING_STREAK = dashboardData?.readingStreak || 0;
  const TOTAL_BOOKS_READ = dashboardData?.booksRead || 0;
  const TOTAL_READING_TIME = dashboardData?.readingTime || 0;
  const READING_PROGRESS = dashboardData?.yearlyGoal ? 
    Math.round((dashboardData.yearlyGoal.current / dashboardData.yearlyGoal.target) * 100) : 0;

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="gradient-text">Your Dashboard</h1>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* Reading Streak Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Reading Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{READING_STREAK} days</div>
                <p className="text-xs text-gray-500">Keep it up!</p>
              </CardContent>
            </Card>

            {/* Books Read Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Books Read</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{TOTAL_BOOKS_READ}</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>

            {/* Reading Time Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Reading Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{TOTAL_READING_TIME} mins</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>

            {/* 2023 Goal Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">2023 Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{READING_PROGRESS}%</div>
                <Progress value={READING_PROGRESS} className="h-2 mt-2" />
                <p className="mt-1 text-xs text-gray-500">
                  {dashboardData?.yearlyGoal?.current || 0}/{dashboardData?.yearlyGoal?.target || 20} books
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Reading Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Continue Reading</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
              {inProgressBooks && inProgressBooks.length > 0 ? inProgressBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="flex h-full">
                    <div className="flex-shrink-0 w-1/3">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow p-4">
                      <div>
                        <h3 className="mb-1 text-lg font-bold">{book.title}</h3>
                        <p className="mb-2 text-sm text-gray-500">{book.author}</p>
                        <div className="w-full h-2 mb-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full rounded-full bg-quicklit-purple" 
                            style={{ width: `${book.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{book.progress}% complete</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/book/${book.id}`)}
                        className="mt-4 text-sm font-medium text-quicklit-purple hover:text-quicklit-dark-purple"
                      >
                        Continue Reading
                      </button>
                    </div>
                  </div>
                </Card>
              )) : (
                <p className="col-span-2 text-center text-gray-500">
                  No books in progress. Start reading from the library!
                </p>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {recommendedBooks && recommendedBooks.length > 0 ? recommendedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              )) : (
                <p className="col-span-4 text-center text-gray-500">
                  No recommendations available. Check back soon!
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <h2 className="text-2xl font-bold">Books In Progress</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {inProgressBooks && inProgressBooks.length > 0 ? inProgressBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="flex h-full">
                  <div className="flex-shrink-0 w-1/3">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-grow p-4">
                    <div>
                      <h3 className="mb-1 text-lg font-bold">{book.title}</h3>
                      <p className="mb-2 text-sm text-gray-500">{book.author}</p>
                      <div className="w-full h-2 mb-1 bg-gray-200 rounded-full">
                        <div 
                          className="h-full rounded-full bg-quicklit-purple" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{book.progress}% complete</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/book/${book.id}`)}
                      className="mt-4 text-sm font-medium text-quicklit-purple hover:text-quicklit-dark-purple"
                    >
                      Continue Reading
                    </button>
                  </div>
                </div>
              </Card>
            )) : (
              <p className="col-span-2 text-center text-gray-500">
                No books in progress. Start reading from the library!
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {recommendedBooks && recommendedBooks.length > 0 ? recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            )) : (
              <p className="col-span-4 text-center text-gray-500">
                No recommendations available. Check back soon!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
