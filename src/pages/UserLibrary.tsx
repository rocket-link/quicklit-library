
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import BookCard from "@/components/BookCard";
import { Book } from "@/types/book";

// Mock library books data
const LIBRARY_BOOKS: Book[] = [
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
  },
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
  },
  {
    id: "9",
    title: "Outliers",
    author: "Malcolm Gladwell",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41LO6QRvIuL._SX302_BO1,204,203,200_.jpg",
    category: "Psychology",
    readTime: 15
  },
  {
    id: "10",
    title: "Range",
    author: "David Epstein",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41ojVxguwnL._SX329_BO1,204,203,200_.jpg",
    category: "Science",
    readTime: 16
  },
  {
    id: "11",
    title: "The Almanack of Naval Ravikant",
    author: "Eric Jorgenson",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41AhNnxufEL._SX331_BO1,204,203,200_.jpg",
    category: "Philosophy",
    readTime: 14
  },
  {
    id: "12",
    title: "Grit",
    author: "Angela Duckworth",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51r1FcXQ7nL._SX330_BO1,204,203,200_.jpg",
    category: "Psychology",
    readTime: 15
  }
];

// Unique categories
const CATEGORIES = [...new Set(LIBRARY_BOOKS.map(book => book.category))];

const UserLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");

  // Filter and sort books
  const filteredBooks = LIBRARY_BOOKS.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    ) && (categoryFilter === "" || book.category === categoryFilter);
  }).sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "author") {
      return a.author.localeCompare(b.author);
    } else {
      // sort by read time
      return a.readTime - b.readTime;
    }
  });

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      <h1 className="mb-8 gradient-text">Book Library</h1>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Sort by Title</SelectItem>
            <SelectItem value="author">Sort by Author</SelectItem>
            <SelectItem value="readTime">Sort by Read Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-xl text-gray-500">No books found matching your criteria</p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserLibrary;
