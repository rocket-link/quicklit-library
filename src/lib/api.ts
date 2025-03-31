// Import any necessary dependencies here
// This is a placeholder file - you would replace this with your actual API implementation

// Create a shared mock database for consistency across API functions
const mockDatabase = {
  books: [
    {
      id: "book-1",
      title: "Atomic Habits",
      author_name: "James Clear",
      description: "Tiny Changes, Remarkable Results",
      cover_image_url: "https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg",
      category_ids: ["3"],
      published_year: 2018,
      isbn: "978-1847941831",
      readTime: 15
    },
    {
      id: "book-2",
      title: "Deep Work",
      author_name: "Cal Newport",
      description: "Rules for Focused Success in a Distracted World",
      cover_image_url: "https://images-na.ssl-images-amazon.com/images/I/51vmivI5KvL._SX329_BO1,204,203,200_.jpg",
      category_ids: ["4"],
      published_year: 2016,
      isbn: "978-0349411903",
      readTime: 18
    },
    {
      id: "book-3",
      title: "Thinking, Fast and Slow",
      author_name: "Daniel Kahneman",
      description: "A groundbreaking tour of the mind",
      cover_image_url: "https://images-na.ssl-images-amazon.com/images/I/41wI53OEpCL._SX322_BO1,204,203,200_.jpg",
      category_ids: ["5"],
      published_year: 2011,
      isbn: "978-0141033570",
      readTime: 22
    },
    {
      id: "book-4",
      title: "Sapiens",
      author_name: "Yuval Noah Harari",
      description: "A Brief History of Humankind",
      cover_image_url: "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
      category_ids: ["6"],
      published_year: 2014,
      isbn: "978-0099590088",
      readTime: 25
    }
  ]
};

export const categories = {
  getAllCategories: async () => {
    try {
      // In a real implementation, this would call your backend API
      // For now, return mock data
      return {
        categories: [
          { id: "1", name: "Fiction" },
          { id: "2", name: "Non-Fiction" },
          { id: "3", name: "Self-Help" },
          { id: "4", name: "Business" },
          { id: "5", name: "Science" },
          { id: "6", name: "History" },
          { id: "7", name: "Biography" },
          { id: "8", name: "Technology" }
        ],
        error: null
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        categories: [],
        error: "Failed to fetch categories"
      };
    }
  }
};

export const admin = {
  createBook: async (bookData: {
    title: string;
    description?: string;
    cover_image?: File;
    author_name?: string;
    published_year?: number;
    isbn?: string;
    category_ids?: string[];
  }) => {
    try {
      console.log("API: Creating book with data:", bookData);
      
      // Create a new book entry
      const newBook = {
        id: `book-${Date.now()}`,
        title: bookData.title,
        author_name: bookData.author_name || "Unknown Author",
        description: bookData.description || "",
        cover_image_url: bookData.cover_image ? URL.createObjectURL(bookData.cover_image) : "/placeholder.svg",
        category_ids: bookData.category_ids || [],
        published_year: bookData.published_year || new Date().getFullYear(),
        isbn: bookData.isbn || `ISBN-${Date.now()}`,
        readTime: Math.floor(Math.random() * 30) + 5 // Random read time between 5-35 mins
      };
      
      // Add the new book to our mock database
      mockDatabase.books.push(newBook);
      
      console.log("New book added to database:", newBook);
      console.log("Current books in database:", mockDatabase.books.length);
      
      return {
        book: newBook,
        error: null
      };
    } catch (error) {
      console.error("API error creating book:", error);
      return {
        book: null,
        error: "Failed to create book"
      };
    }
  }
};

// Add other API functions as needed
export const books = {
  getBooks: async () => {
    try {
      console.log("API: Fetching all books");
      console.log("Total books available:", mockDatabase.books.length);
      
      return {
        books: mockDatabase.books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author_name,
          coverImage: book.cover_image_url,
          category: "Book", // This would ideally come from category lookup
          readTime: book.readTime
        })),
        error: null
      };
    } catch (error) {
      console.error("Error fetching books:", error);
      return {
        books: [],
        error: "Failed to fetch books"
      };
    }
  },
  
  getBookById: async (id: string) => {
    try {
      console.log("API: Fetching book by ID:", id);
      const book = mockDatabase.books.find(book => book.id === id);
      
      if (!book) {
        return {
          book: null,
          error: "Book not found"
        };
      }
      
      return {
        book: {
          id: book.id,
          title: book.title,
          author: book.author_name,
          description: book.description,
          coverImage: book.cover_image_url,
          publishedYear: book.published_year,
          isbn: book.isbn,
          readTime: book.readTime
        },
        error: null
      };
    } catch (error) {
      console.error("Error fetching book:", error);
      return {
        book: null,
        error: "Failed to fetch book"
      };
    }
  }
};

export const users = {
  getCurrentUser: async () => {
    // Implementation for getting current user
    return {
      user: null,
      error: null
    };
  },
  updateProfile: async (userData: any) => {
    // Implementation for updating user profile
    return {
      profile: null,
      error: null
    };
  }
};

// Update summaries API to use books from our mock database
export const summaries = {
  getAllSummaries: async (page = 1, limit = 10, filter?: any) => {
    try {
      console.log("API: Fetching summaries, page:", page, "limit:", limit, "filter:", filter);
      
      // Use books from our mock database as summaries
      let filteredBooks = [...mockDatabase.books];
      
      // Apply category filter if provided
      if (filter && filter.category) {
        filteredBooks = filteredBooks.filter(book => 
          book.category_ids && book.category_ids.includes(filter.category)
        );
      }
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
      
      const summaries = paginatedBooks.map(book => ({
        id: book.id,
        title: book.title,
        reading_time: book.readTime,
        books: {
          title: book.title,
          cover_image_url: book.cover_image_url,
          authors: {
            name: book.author_name
          }
        }
      }));
      
      return {
        summaries,
        error: null
      };
    } catch (error) {
      console.error("Error fetching summaries:", error);
      return {
        summaries: [],
        error: "Failed to fetch summaries"
      };
    }
  },
  
  getSummaryById: async (id: string) => {
    try {
      console.log("API: Fetching summary by ID:", id);
      
      const book = mockDatabase.books.find(book => book.id === id);
      
      if (!book) {
        return {
          summary: null,
          error: "Summary not found"
        };
      }
      
      return {
        summary: {
          id: book.id,
          title: book.title,
          content: `This is a summary of ${book.title}...`,
          reading_time: book.readTime,
          audio_url: `/audio/${book.id}.mp3`,
          books: {
            title: book.title,
            cover_image_url: book.cover_image_url,
            authors: {
              name: book.author_name
            }
          }
        },
        error: null
      };
    } catch (error) {
      console.error("Error fetching summary:", error);
      return {
        summary: null,
        error: "Failed to fetch summary"
      };
    }
  },
  
  // Add these methods to fix the BookSummary.tsx errors
  getSummary: async (id: string) => {
    return summaries.getSummaryById(id);
  },
  
  toggleBookmark: async (summaryId: string) => {
    console.log("API: Toggling bookmark for summary:", summaryId);
    return {
      success: true,
      error: null
    };
  },
  
  updateReadingProgress: async (summaryId: string, progress: number) => {
    console.log("API: Updating reading progress for summary:", summaryId, "progress:", progress);
    return {
      success: true,
      error: null
    };
  }
};

export const dashboard = {
  getUserDashboardData: async () => {
    try {
      console.log("API: Fetching user dashboard data");
      // Mock implementation
      return {
        dashboardData: {
          readingStreak: 5,
          booksRead: mockDatabase.books.length,
          readingTime: 240, // minutes
          yearlyGoal: {
            current: mockDatabase.books.length,
            target: 50
          }
        },
        error: null
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        dashboardData: null,
        error: "Failed to fetch dashboard data"
      };
    }
  }
};

export const profiles = {
  getProfile: async (userId: string) => {
    try {
      console.log("API: Fetching profile for user:", userId);
      // Mock implementation
      return {
        profile: {
          id: userId,
          username: "bookworm",
          full_name: "John Reader",
          bio: "Avid reader and book lover",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bookworm"
        },
        error: null
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        profile: null,
        error: "Failed to fetch profile"
      };
    }
  },
  
  updateProfile: async (userId: string, profileData: any) => {
    try {
      console.log("API: Updating profile for user:", userId, "with data:", profileData);
      // Mock implementation
      return {
        profile: {
          id: userId,
          ...profileData
        },
        error: null
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        profile: null,
        error: "Failed to update profile"
      };
    }
  },
  
  uploadAvatar: async (userId: string, file: File) => {
    try {
      console.log("API: Uploading avatar for user:", userId, "filename:", file.name);
      // Mock implementation
      return {
        url: URL.createObjectURL(file),
        error: null
      };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return {
        url: null,
        error: "Failed to upload avatar"
      };
    }
  }
};

export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      console.log("API: Signing in with email:", email);
      // Mock implementation
      return {
        data: {
          user: {
            id: "user_123",
            email: email,
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: "mock_token",
            expires_at: Date.now() + 3600000,
          }
        },
        error: null
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        data: null,
        error: new Error("Failed to sign in")
      };
    }
  },
  
  signUp: async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    try {
      console.log("API: Creating account for email:", email, "with metadata:", metadata);
      // Mock implementation
      return {
        data: {
          user: {
            id: `user_${Date.now()}`,
            email: email,
            user_metadata: metadata,
            created_at: new Date().toISOString()
          },
          session: null
        },
        error: null
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        data: null,
        error: new Error("Failed to sign up")
      };
    }
  },
  
  signOut: async () => {
    try {
      console.log("API: Signing out");
      // Mock implementation
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: new Error("Failed to sign out") };
    }
  },
  
  signInWithOAuth: async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      console.log(`API: Signing in with ${provider}`);
      // Mock implementation
      return {
        data: {
          provider: provider,
          url: "#" // In a real app, this would redirect to OAuth provider
        },
        error: null
      };
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      return {
        data: null,
        error: new Error(`Failed to sign in with ${provider}`)
      };
    }
  }
};
