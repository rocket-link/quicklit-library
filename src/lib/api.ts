
// Import Supabase client
import { supabase } from './supabase';
import type { Book } from '../types/book';

export const categories = {
  getAllCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      
      return {
        categories: data || [],
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
      
      // First, create the book entry
      const bookPayload = {
        title: bookData.title,
        description: bookData.description || null,
        isbn: bookData.isbn || null,
        published_year: bookData.published_year || new Date().getFullYear(),
        language: 'en', // Default value
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Insert the book
      const { data: bookData_, error: bookError } = await supabase
        .from('books')
        .insert(bookPayload)
        .select()
        .single();
      
      if (bookError) throw bookError;
      
      // If we have a book cover, upload it to storage
      let coverImageUrl = null;
      if (bookData.cover_image) {
        const fileExt = bookData.cover_image.name.split('.').pop();
        const fileName = `${bookData_.id}.${fileExt}`;
        const filePath = `book_covers/${fileName}`;
        
        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('book_covers')
          .upload(filePath, bookData.cover_image);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL of the uploaded image
        const { data: urlData } = supabase
          .storage
          .from('book_covers')
          .getPublicUrl(filePath);
        
        coverImageUrl = urlData?.publicUrl;
        
        // Update book with cover image URL
        const { error: updateError } = await supabase
          .from('books')
          .update({ cover_image_url: coverImageUrl })
          .eq('id', bookData_.id);
        
        if (updateError) throw updateError;
      }
      
      // If we have author info, we need to create or find the author
      if (bookData.author_name) {
        // Look for existing author
        const { data: authorData, error: authorFetchError } = await supabase
          .from('authors')
          .select('*')
          .ilike('name', bookData.author_name)
          .limit(1);
        
        let authorId;
        
        if (authorFetchError) throw authorFetchError;
        
        if (authorData && authorData.length > 0) {
          // Use existing author
          authorId = authorData[0].id;
        } else {
          // Create new author
          const { data: newAuthor, error: newAuthorError } = await supabase
            .from('authors')
            .insert({
              name: bookData.author_name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (newAuthorError) throw newAuthorError;
          authorId = newAuthor.id;
        }
        
        // Update book with author ID
        const { error: updateAuthorError } = await supabase
          .from('books')
          .update({ original_author_id: authorId })
          .eq('id', bookData_.id);
        
        if (updateAuthorError) throw updateAuthorError;
      }
      
      // If we have category IDs, link them to the book
      if (bookData.category_ids && bookData.category_ids.length > 0) {
        const categoryLinks = bookData.category_ids.map(categoryId => ({
          book_id: bookData_.id,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('book_categories')
          .insert(categoryLinks);
        
        if (categoryError) throw categoryError;
      }
      
      // Get the complete book data with author info
      const { data: completeBook, error: fetchError } = await supabase
        .from('books')
        .select(`
          *,
          authors:original_author_id (
            name
          )
        `)
        .eq('id', bookData_.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Transform to match expected return format
      const transformedBook = {
        id: completeBook.id,
        title: completeBook.title,
        author: completeBook.authors?.name || "Unknown Author",
        description: completeBook.description,
        coverImage: completeBook.cover_image_url,
        publishedYear: completeBook.published_year,
        isbn: completeBook.isbn,
        readTime: Math.floor(Math.random() * 30) + 5 // Random read time between 5-35 mins
      };
      
      return {
        book: transformedBook,
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

export const books = {
  getBooks: async () => {
    try {
      console.log("API: Fetching all books");
      
      // Get all books with author information
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          authors:original_author_id (
            name
          ),
          book_categories (
            category_id,
            categories:category_id (
              name
            )
          )
        `);
      
      if (error) throw error;
      
      // Transform the data to match the expected Book type
      const transformedBooks: Book[] = (data || []).map(book => {
        // Get first category name if available
        const category = book.book_categories && book.book_categories.length > 0
          ? book.book_categories[0]?.categories?.name || "Uncategorized"
          : "Uncategorized";
        
        return {
          id: book.id,
          title: book.title,
          author: book.authors?.name || "Unknown Author",
          coverImage: book.cover_image_url || "/placeholder.svg",
          category,
          readTime: Math.floor(Math.random() * 30) + 5, // Placeholder for read time
          description: book.description,
          publishedYear: book.published_year,
          isbn: book.isbn
        };
      });
      
      return {
        books: transformedBooks,
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
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          authors:original_author_id (
            name
          ),
          book_categories (
            category_id,
            categories:category_id (
              name
            )
          ),
          summaries (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        return {
          book: null,
          error: "Book not found"
        };
      }
      
      // Calculate read time based on summaries if available, otherwise default
      const readTime = data.summaries && data.summaries.length > 0
        ? data.summaries[0].reading_time
        : Math.floor(Math.random() * 30) + 5;
      
      // Get first category name if available
      const category = data.book_categories && data.book_categories.length > 0
        ? data.book_categories[0]?.categories?.name || "Uncategorized"
        : "Uncategorized";
      
      const transformedBook: Book = {
        id: data.id,
        title: data.title,
        author: data.authors?.name || "Unknown Author",
        description: data.description,
        coverImage: data.cover_image_url || "/placeholder.svg",
        category,
        readTime,
        publishedYear: data.published_year,
        isbn: data.isbn
      };
      
      return {
        book: transformedBook,
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
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!user) {
        return { user: null, error: null };
      }
      
      // Get the user's profile information
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      return {
        user: {
          ...user,
          profile: data || null
        },
        error: null
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return {
        user: null,
        error: "Failed to get user data"
      };
    }
  },
  
  updateProfile: async (userData: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      
      return {
        profile: data ? data[0] : null,
        error: null
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        profile: null,
        error: "Failed to update profile"
      };
    }
  }
};

export const summaries = {
  getAllSummaries: async (page = 1, limit = 10, filter?: any) => {
    try {
      console.log("API: Fetching summaries, page:", page, "limit:", limit, "filter:", filter);
      
      // Start building the query
      let query = supabase
        .from('summaries')
        .select(`
          *,
          books (
            title,
            cover_image_url,
            authors:original_author_id (
              name
            )
          )
        `);
      
      // Apply filters if provided
      if (filter) {
        if (filter.category) {
          query = query.in('books.book_categories.category_id', [filter.category]);
        }
      }
      
      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform the results
      const summaries = (data || []).map(summary => ({
        id: summary.id,
        title: summary.title,
        reading_time: summary.reading_time,
        books: {
          title: summary.books.title,
          cover_image_url: summary.books.cover_image_url || "/placeholder.svg",
          authors: {
            name: summary.books.authors?.name || "Unknown Author"
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
      
      const { data, error } = await supabase
        .from('summaries')
        .select(`
          *,
          books (
            title,
            cover_image_url,
            authors:original_author_id (
              name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        return {
          summary: null,
          error: "Summary not found"
        };
      }
      
      return {
        summary: {
          id: data.id,
          title: data.title,
          content: data.text_content,
          reading_time: data.reading_time,
          audio_url: data.audio_url,
          books: {
            title: data.books.title,
            cover_image_url: data.books.cover_image_url || "/placeholder.svg",
            authors: {
              name: data.books.authors?.name || "Unknown Author"
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
  
  getSummary: async (id: string) => {
    return summaries.getSummaryById(id);
  },
  
  toggleBookmark: async (summaryId: string) => {
    try {
      console.log("API: Toggling bookmark for summary:", summaryId);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");
      
      // Check if bookmark already exists
      const { data: existingBookmarks, error: checkError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_id', summaryId);
      
      if (checkError) throw checkError;
      
      let isBookmarked: boolean;
      
      if (existingBookmarks && existingBookmarks.length > 0) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmarks[0].id);
        
        if (deleteError) throw deleteError;
        
        isBookmarked = false;
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            summary_id: summaryId,
            created_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
        
        isBookmarked = true;
      }
      
      return {
        data: {
          bookmarked: isBookmarked
        },
        error: null
      };
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      return {
        data: {
          bookmarked: false
        },
        error: "Failed to toggle bookmark"
      };
    }
  },
  
  updateReadingProgress: async (summaryId: string, progress: number) => {
    try {
      console.log("API: Updating reading progress for summary:", summaryId, "progress:", progress);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");
      
      // Check if a reading history record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_id', summaryId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      const completed = progress >= 100;
      const now = new Date().toISOString();
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('reading_history')
          .update({
            progress,
            completed,
            last_read_at: now,
            updated_at: now
          })
          .eq('id', existingRecord.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('reading_history')
          .insert({
            user_id: user.id,
            summary_id: summaryId,
            progress,
            completed,
            last_read_at: now,
            created_at: now,
            updated_at: now
          });
        
        if (insertError) throw insertError;
      }
      
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error("Error updating reading progress:", error);
      return {
        success: false,
        error: "Failed to update reading progress"
      };
    }
  }
};

export const dashboard = {
  getUserDashboardData: async () => {
    try {
      console.log("API: Fetching user dashboard data");
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");
      
      // Get reading history
      const { data: readingHistory, error: historyError } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id);
      
      if (historyError) throw historyError;
      
      // Calculate stats
      const booksRead = readingHistory ? readingHistory.filter(item => item.completed).length : 0;
      
      // Calculate total reading time (in minutes)
      let totalReadingTime = 0;
      if (readingHistory && readingHistory.length > 0) {
        const { data: summaries, error: summaryError } = await supabase
          .from('summaries')
          .select('id, reading_time')
          .in('id', readingHistory.map(item => item.summary_id));
        
        if (summaryError) throw summaryError;
        
        if (summaries) {
          const summaryMap = new Map(summaries.map(s => [s.id, s.reading_time]));
          
          // For each reading history item, calculate actual reading time based on progress
          totalReadingTime = readingHistory.reduce((total, item) => {
            const summaryTime = summaryMap.get(item.summary_id) || 0;
            return total + (summaryTime * (item.progress / 100));
          }, 0);
        }
      }
      
      // Calculate reading streak (simplified)
      // In a real implementation, this would be more sophisticated
      const readingStreak = Math.min(5, booksRead); // Placeholder streak calculation
      
      return {
        dashboardData: {
          readingStreak,
          booksRead,
          readingTime: Math.round(totalReadingTime),
          yearlyGoal: {
            current: booksRead,
            target: 50 // Default target
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return {
        profile: data || null,
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
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      
      return {
        profile: data ? data[0] : null,
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the avatar
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData?.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      return {
        url: urlData?.publicUrl || null,
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        data: null,
        error
      };
    }
  },
  
  signUp: async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    try {
      console.log("API: Creating account for email:", email, "with metadata:", metadata);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      // If sign up was successful and we have user data, create a profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: metadata?.username || email.split('@')[0],
          full_name: metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        data: null,
        error
      };
    }
  },
  
  signOut: async () => {
    try {
      console.log("API: Signing out");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    }
  },
  
  signInWithOAuth: async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      console.log(`API: Signing in with ${provider}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      return {
        data: null,
        error
      };
    }
  }
};
