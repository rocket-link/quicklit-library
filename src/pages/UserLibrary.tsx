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
import { useQuery } from "@tanstack/react-query";
import { summaries, categories, books } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Book } from "@/types/book";

const UserLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { categories: data } = await categories.getAllCategories();
      return data || [];
    }
  });

  const { 
    data: booksData, 
    isLoading: booksLoading,
    refetch
  } = useQuery({
    queryKey: ["books", currentPage, categoryFilter],
    queryFn: async () => {
      const { books: data, error } = await books.getBooks();
      
      if (error) {
        console.error("Error fetching books:", error);
        return [];
      }
      
      console.log("Books loaded:", data?.length || 0);
      return data || [];
    }
  });
  
  const filteredBooks = booksData ? booksData.filter((book) => {
    if (!searchTerm) return true;
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "author") {
      return a.author.localeCompare(b.author);
    } else {
      // sort by read time
      return a.readTime - b.readTime;
    }
  }) : [];

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };
  
  const isLoading = booksLoading || categoriesLoading;

  return (
    <div className="container px-4 py-8 mx-auto md:px-6">
      <h1 className="mb-8 gradient-text">Book Library</h1>

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categoriesData?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
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

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredBooks && filteredBooks.length > 0 ? (
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

      {!isLoading && booksData && booksData.length > 0 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserLibrary;
