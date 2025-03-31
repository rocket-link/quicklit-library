
import { useState } from "react";
import { useParams } from "react-router-dom";
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
  Pause
} from "lucide-react";
import { Book } from "@/types/book";

// Mock book data
const BOOKS: Record<string, Book & { summary: string, keyIdeas: string[], progress?: number }> = {
  "1": {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg",
    category: "Self-Improvement",
    readTime: 15,
    progress: 0,
    summary: `"Atomic Habits" by James Clear is a comprehensive guide to breaking bad behaviors and adopting good ones. In this groundbreaking book, Clear outlines a practical framework for improving every day – focusing on tiny changes and small habits that lead to remarkable results.

    The core idea is that small, incremental changes compound over time to create substantial transformation. Clear introduces the concept of the 1% improvement – suggesting that if you get 1% better each day for one year, you'll end up 37 times better.

    The book is structured around the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. Each law provides actionable strategies for creating good habits and breaking bad ones.

    Clear emphasizes the importance of identity-based habits, suggesting that the most effective way to change habits is to focus not on what you want to achieve, but on who you wish to become. According to him, "Every action you take is a vote for the type of person you wish to become."

    The book also introduces the concept of habit stacking – building new habits by identifying a current habit you already do each day and then stacking your new behavior on top. This technique makes habit formation more manageable by using existing routines as triggers.

    Clear debunks the myth of dramatic transformation, emphasizing instead the importance of small, consistent improvements. He illustrates how the power of compound interest applies not just to finances, but to our habits and daily behaviors as well.`,
    keyIdeas: [
      "Habits are the compound interest of self-improvement.",
      "If you want better results, focus on your system, not your goals.",
      "Behavior that is rewarded gets repeated.",
      "The most practical way to change your habits is to focus on who you wish to become.",
      "Environment is the invisible hand that shapes human behavior.",
      "Small changes often appear to make no difference until you cross a critical threshold."
    ]
  },
  // Additional mock books would be defined here
};

const BookSummary = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("read");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get book based on ID
  const book = id ? BOOKS[id] : null;

  if (!book) {
    return (
      <div className="container flex items-center justify-center h-screen px-4 mx-auto md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Book not found</h2>
          <p className="mt-2 text-gray-500">The book you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      {/* Book Header */}
      <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
        {/* Book Cover */}
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-quicklit-purple to-quicklit-dark-purple rounded-lg blur-lg opacity-25"></div>
            <img
              src={book.coverImage}
              alt={book.title}
              className="relative object-cover w-48 h-64 rounded-md shadow-lg"
            />
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">{book.title}</h1>
          <p className="mb-4 text-lg text-gray-600">by {book.author}</p>
          
          <div className="flex flex-wrap mb-6 space-x-2">
            <span className="px-3 py-1 text-sm bg-purple-100 rounded-full text-quicklit-purple">
              {book.category}
            </span>
            <span className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-700">
              <Clock className="w-4 h-4 mr-1" />
              {book.readTime} min read
            </span>
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
            <div className="max-w-3xl mx-auto prose">
              {book.summary.split('\n\n').map((paragraph, index) => (
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
          </TabsContent>

          {/* Listen Tab */}
          <TabsContent value="listen">
            <div className="max-w-3xl mx-auto">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="mb-4 text-xl font-bold">Audio Summary</h3>
                
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-32 h-44 object-cover rounded-md shadow"
                  />
                  
                  <div className="w-full mt-4">
                    <div className="relative h-1 mb-2 bg-gray-200 rounded-full">
                      <div className="absolute h-full rounded-full bg-quicklit-purple" style={{ width: "30%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>4:20</span>
                      <span>15:00</span>
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
                </div>
              </div>
              
              <p className="mt-4 text-sm text-center text-gray-500">
                Audio unavailable in preview mode. Sign in to listen to audio summaries.
              </p>
            </div>
          </TabsContent>

          {/* Key Ideas Tab */}
          <TabsContent value="key-ideas">
            <div className="max-w-3xl mx-auto">
              <h3 className="mb-6 text-2xl font-bold">Key Ideas from {book.title}</h3>
              <ul className="space-y-6">
                {book.keyIdeas.map((idea, index) => (
                  <li key={index} className="flex">
                    <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 font-bold text-white rounded-full bg-quicklit-purple">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-lg font-semibold">{idea}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default BookSummary;
