
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
import { Book } from "@/types/book";

// Mock data for user dashboard
const READING_PROGRESS = 68;
const TOTAL_BOOKS_READ = 12;
const READING_STREAK = 5;
const TOTAL_READING_TIME = 186;

// Mock recommended books
const RECOMMENDED_BOOKS: Book[] = [
  {
    id: "5",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41r6F2LRf8L._SX329_BO1,204,203,200_.jpg",
    category: "Finance",
    readTime: 15
  },
  {
    id: "6",
    title: "Mindset",
    author: "Carol S. Dweck",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41j2-Rz1jiL._SX322_BO1,204,203,200_.jpg",
    category: "Psychology",
    readTime: 14
  },
  {
    id: "7",
    title: "Essentialism",
    author: "Greg McKeown",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41YMJNG1IVL._SX331_BO1,204,203,200_.jpg",
    category: "Productivity",
    readTime: 16
  },
  {
    id: "8",
    title: "Never Split the Difference",
    author: "Chris Voss",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51yKczFDuFL._SX330_BO1,204,203,200_.jpg",
    category: "Negotiation",
    readTime: 15
  }
];

// Mock in-progress books
const IN_PROGRESS_BOOKS: (Book & { progress: number })[] = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg",
    category: "Self-Improvement",
    readTime: 15,
    progress: 75
  },
  {
    id: "3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
    category: "History",
    readTime: 17,
    progress: 30
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
                <p className="mt-1 text-xs text-gray-500">{TOTAL_BOOKS_READ}/20 books</p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Reading Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Continue Reading</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
              {IN_PROGRESS_BOOKS.map((book) => (
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
                      <button className="mt-4 text-sm font-medium text-quicklit-purple hover:text-quicklit-dark-purple">
                        Continue Reading
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {RECOMMENDED_BOOKS.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <h2 className="text-2xl font-bold">Books In Progress</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {IN_PROGRESS_BOOKS.map((book) => (
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
                    <button className="mt-4 text-sm font-medium text-quicklit-purple hover:text-quicklit-dark-purple">
                      Continue Reading
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {RECOMMENDED_BOOKS.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
