
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, BookAudio, Clock } from "lucide-react";
import { motion } from "framer-motion";
import BookCard from "@/components/BookCard";
import PricingSection from "@/components/PricingSection";

// Temporarily mocked data for featured books
const FEATURED_BOOKS = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg",
    category: "Self-Improvement",
    readTime: 15
  },
  {
    id: "2",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41wI53OEpCL._SX322_BO1,204,203,200_.jpg",
    category: "Psychology",
    readTime: 16
  },
  {
    id: "3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
    category: "History",
    readTime: 17
  },
  {
    id: "4",
    title: "Deep Work",
    author: "Cal Newport",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51vmivI5KvL._SX329_BO1,204,203,200_.jpg",
    category: "Productivity",
    readTime: 14
  }
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50">
        <div className="container px-4 mx-auto md:px-6">
          <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="gradient-text">
                Learn Faster with Key Insights from Top Books
              </h1>
              <p className="text-lg text-gray-600">
                Get the most important ideas from best-selling books in just 15 minutes.
                Read or listen to summaries curated by our AI and expert team.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?signup=true">
                  <Button size="lg" className="bg-quicklit-purple hover:bg-quicklit-dark-purple">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/library">
                  <Button size="lg" variant="outline">
                    Explore Library
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-quicklit-purple to-quicklit-dark-purple rounded-lg blur-lg opacity-25"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-6">
                  <img 
                    src="https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg" 
                    alt="Featured Book" 
                    className="w-48 h-64 object-cover mx-auto rounded-md shadow-md"
                  />
                  <div className="mt-4 text-center">
                    <h3 className="font-bold">Atomic Habits</h3>
                    <p className="text-sm text-gray-500">by James Clear</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto md:px-6">
          <motion.div 
            className="max-w-3xl mx-auto mb-12 text-center"
            {...fadeIn}
          >
            <h2 className="mb-4 gradient-text">How QuickLit Works</h2>
            <p className="text-lg text-gray-600">
              We've simplified the learning process so you can gain knowledge efficiently
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <motion.div 
              className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-lg book-card-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BookOpen className="w-12 h-12 mb-4 text-quicklit-purple" />
              <h3 className="mb-2 text-xl font-semibold">Read</h3>
              <p className="text-gray-600">
                Access concise 15-minute summaries of the world's best nonfiction books
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-lg book-card-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <BookAudio className="w-12 h-12 mb-4 text-quicklit-purple" />
              <h3 className="mb-2 text-xl font-semibold">Listen</h3>
              <p className="text-gray-600">
                Turn reading time into listening time with our high-quality audio summaries
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-lg book-card-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Clock className="w-12 h-12 mb-4 text-quicklit-purple" />
              <h3 className="mb-2 text-xl font-semibold">Learn</h3>
              <p className="text-gray-600">
                Save time and extract key insights in minutes, not hours
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto md:px-6">
          <motion.div 
            className="flex flex-wrap items-center justify-between mb-10"
            {...fadeIn}
          >
            <h2 className="gradient-text">Featured Summaries</h2>
            <Link to="/library">
              <Button variant="ghost" className="text-quicklit-purple hover:text-quicklit-dark-purple">
                View All
              </Button>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_BOOKS.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials or other sections would go here */}
    </div>
  );
};

export default HomePage;
