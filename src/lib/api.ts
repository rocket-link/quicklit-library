// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// File: src/lib/api.ts
import { supabase } from './supabase';

// Types
export interface Summary {
  id: string;
  title: string;
  subtitle?: string;
  text_content: string;
  reading_time: number;
  audio_url?: string;
  audio_duration?: number;
  is_premium: boolean;
  book: {
    title: string;
    cover_image_url?: string;
    author: {
      name: string;
    };
  };
  key_insights: {
    id: string;
    title: string;
    content: string;
    order_index: number;
  }[];
}

export interface BookPreview {
  id: string;
  title: string;
  cover_image_url?: string;
  author: string;
  categories: string[];
  summary_available: boolean;
  is_premium: boolean;
}

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences: Record<string, any>;
}

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  plan_name?: string;
  days_remaining?: number;
}

// API Functions

// Authentication
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider: 'google' | 'facebook' | 'twitter') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  }
};

// User Profiles
export const profiles = {
  // Get user profile
  getProfile: async (userId: string): Promise<{ profile?: UserProfile; error?: Error }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { profile: data as UserProfile, error: error as Error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { profile: data as UserProfile, error };
  },

  // Upload avatar
  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError };
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    return { publicUrl: data.publicUrl, error: updateError };
  }
};

// Summaries
export const summaries = {
  // Get all summaries (with pagination)
  getAllSummaries: async (page = 1, limit = 10, filter?: { category?: string; is_premium?: boolean }) => {
    let query = supabase
      .from('summaries')
      .select(`
        id,
        title,
        subtitle,
        reading_time,
        audio_url,
        is_premium,
        is_published,
        books:book_id (
          title, 
          cover_image_url,
          authors:original_author_id (
            name
          )
        )
      `)
      .eq('is_published', true)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filter?.category) {
      query = query.eq('books.book_categories.category_id.slug', filter.category);
    }

    if (filter?.is_premium !== undefined) {
      query = query.eq('is_premium', filter.is_premium);
    }

    const { data, error, count } = await query;

    return { 
      summaries: data as any[], 
      error,
      count,
      page,
      limit,
      hasMore: (page * limit) < (count || 0)
    };
  },

  // Get single summary
  getSummary: async (summaryId: string): Promise<{ summary?: Summary; error?: Error }> => {
    const { data, error } = await supabase
      .from('summaries')
      .select(`
        id,
        title,
        subtitle,
        text_content,
        reading_time,
        audio_url,
        audio_duration,
        is_premium,
        books:book_id (
          title,
          cover_image_url,
          authors:original_author_id (
            name
          )
        ),
        key_insights:key_insights (
          id,
          title,
          content,
          order_index
        )
      `)
      .eq('id', summaryId)
      .single();

    // Check if premium content is being accessed by a subscribed user
    if (data?.is_premium) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: subscriptionData } = await supabase.rpc(
          'get_user_subscription_status', 
          { user_uuid: user.id }
        );
        
        const hasSubscription = subscriptionData?.[0]?.has_active_subscription;
        
        if (!hasSubscription) {
          return { 
            error: new Error('This is premium content. Please subscribe to access.') 
          };
        }
      } else {
        return { 
          error: new Error('You must be logged in to access premium content.') 
        };
      }
    }

    // Mark as read if user is logged in
    if (data) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.rpc(
          'update_reading_progress', 
          { 
            user_uuid: user.id, 
            summary_uuid: data.id, 
            progress_value: 0 
          }
        );
      }
    }

    return { 
      summary: data as Summary, 
      error: error as Error 
    };
  },

  // Update reading progress
  updateReadingProgress: async (summaryId: string, progress: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase.rpc(
      'update_reading_progress', 
      { 
        user_uuid: user.id, 
        summary_uuid: summaryId, 
        progress_value: progress 
      }
    );

    return { data, error };
  },

  // Toggle bookmark
  toggleBookmark: async (summaryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('summary_id', summaryId)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
      
      return { data: { bookmarked: false }, error };
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          summary_id: summaryId
        });
      
      return { data: { bookmarked: true }, error };
    }
  },

  // Submit review
  submitReview: async (summaryId: string, rating: number, reviewText?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Check if review exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('summary_id', summaryId)
      .single();

    if (existingReview) {
      // Update review
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      
      return { review: data, error };
    } else {
      // Add review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          summary_id: summaryId,
          rating,
          review_text: reviewText
        })
        .select()
        .single();
      
      return { review: data, error };
    }
  },

  // Search summaries
  searchSummaries: async (query: string, limit = 10) => {
    // This assumes you have full text search configured in Supabase
    const { data, error } = await supabase
      .from('summaries')
      .select(`
        id,
        title,
        reading_time,
        is_premium,
        books:book_id (
          title, 
          cover_image_url,
          authors:original_author_id (
            name
          )
        )
      `)
      .or(`title.ilike.%${query}%, books.title.ilike.%${query}%, books.authors.name.ilike.%${query}%`)
      .eq('is_published', true)
      .limit(limit);

    return { results: data, error };
  }
};

// Categories
export const categories = {
  // Get all categories
  getAllCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    return { categories: data, error };
  },

  // Get summaries by category
  getSummariesByCategory: async (categorySlug: string, page = 1, limit = 10) => {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (!category) {
      return { error: new Error('Category not found') };
    }

    const { data, error, count } = await supabase
      .from('book_categories')
      .select(`
        books:book_id (
          summaries:summaries (
            id,
            title,
            reading_time,
            is_premium,
            books:book_id (
              title,
              cover_image_url,
              authors:original_author_id (
                name
              )
            )
          )
        )
      `)
      .eq('category_id', category.id)
      .eq('books.summaries.is_published', true)
      .range((page - 1) * limit, page * limit - 1);

    // Transform data to get flat list of summaries
    const summaries = data?.flatMap(item => 
      item.books?.summaries?.map(summary => ({
        ...summary,
        book: {
          title: summary.books.title,
          cover_image_url: summary.books.cover_image_url,
          author: summary.books.authors?.name
        }
      })) || []
    ) || [];

    return { 
      summaries, 
      error,
      count,
      page,
      limit,
      hasMore: (page * limit) < (count || 0)
    };
  }
};

// User Collections
export const collections = {
  // Get user collections
  getUserCollections: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        description,
        is_public,
        created_at,
        items:collection_items (
          summary_id,
          summaries:summary_id (
            id,
            title,
            reading_time,
            books:book_id (
              title,
              cover_image_url,
              authors:original_author_id (
                name
              )
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { collections: data, error };
  },

  // Create collection
  createCollection: async (name: string, description?: string, isPublic = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        description,
        is_public: isPublic
      })
      .select()
      .single();

    return { collection: data, error };
  },

  // Update collection
  updateCollection: async (collectionId: string, updates: { name?: string; description?: string; is_public?: boolean }) => {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single();

    return { collection: data, error };
  },

  // Delete collection
  deleteCollection: async (collectionId: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    return { error };
  },

  // Add summary to collection
  addToCollection: async (collectionId: string, summaryId: string) => {
    const { error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        summary_id: summaryId
      });

    return { error };
  },

  // Remove summary from collection
  removeFromCollection: async (collectionId: string, summaryId: string) => {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('summary_id', summaryId);

    return { error };
  }
};

// Subscriptions
export const subscriptions = {
  // Get user subscription status
  getUserSubscription: async (): Promise<{ subscription?: SubscriptionStatus; error?: Error }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase.rpc(
      'get_user_subscription_status',
      { user_uuid: user.id }
    );

    return { 
      subscription: data?.[0] as SubscriptionStatus, 
      error: error as Error 
    };
  },

  // Get available plans
  getAvailablePlans: async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    return { plans: data, error };
  },

  // Create checkout session (for Stripe)
  createCheckoutSession: async (planId: string, isYearly = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId,
        userId: user.id,
        isYearly
      }
    });

    return { checkoutUrl: data?.url, error };
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId: user.id }
    });

    return { success: data?.success, error };
  }
};

// User Dashboard
export const dashboard = {
  // Get user dashboard data
  getUserDashboardData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase.functions.invoke('user-dashboard', {
      body: { userId: user.id }
    });

    return { dashboardData: data, error };
  }
};

// Admin-specific functions
export const admin = {
  // Check if user is admin
  isAdmin: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data } = await supabase.auth.getUser();
    return data?.user?.user_metadata?.role === 'admin';
  },

  // Create new book
  createBook: async (bookData: {
    title: string;
    description?: string;
    cover_image?: File;
    author_id?: string;
    author_name?: string;
    published_year?: number;
    isbn?: string;
    language?: string;
    page_count?: number;
    category_ids?: string[];
  }) => {
    // Create author if not exists
    let authorId = bookData.author_id;
    
    if (!authorId && bookData.author_name) {
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('name', bookData.author_name)
        .single();
      
      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const { data: newAuthor } = await supabase
          .from('authors')
          .insert({ name: bookData.author_name })
          .select()
          .single();
        
        if (newAuthor) {
          authorId = newAuthor.id;
        }
      }
    }
    
    // Upload cover image if provided
    let coverImageUrl = undefined;
    
    if (bookData.cover_image) {
      const fileExt = bookData.cover_image.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('book-covers')
        .upload(fileName, bookData.cover_image);

      if (!uploadError && uploadData) {
        const { data } = supabase.storage
          .from('book-covers')
          .getPublicUrl(fileName);
        
        coverImageUrl = data.publicUrl;
      }
    }
    
    // Create the book
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        title: bookData.title,
        description: bookData.description,
        cover_image_url: coverImageUrl,
        original_author_id: authorId,
        published_year: bookData.published_year,
        isbn: bookData.isbn,
        language: bookData.language || 'en',
        page_count: bookData.page_count
      })
      .select()
      .single();
    
    if (error || !book) {
      return { error: error || new Error('Failed to create book') };
    }
    
    // Add categories if provided
    if (bookData.category_ids?.length) {
      const categoryEntries = bookData.category_ids.map(categoryId => ({
        book_id: book.id,
        category_id: categoryId
      }));
      
      await supabase
        .from('book_categories')
        .insert(categoryEntries);
    }
    
    return { book, error: null };
  },

  // Generate summary from book
  generateSummary: async (bookId: string, settings: { readingTime: number }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }
    
    // Create a generation request
    const { data: request, error: requestError } = await supabase
      .from('generation_requests')
      .insert({
        book_id: bookId,
        requested_by: user.id,
        status: 'pending',
        settings: {
          readingTime: settings.readingTime
        }
      })
      .select()
      .single();
    
    if (requestError || !request) {
      return { error: requestError || new Error('Failed to create request') };
    }
    
    // Trigger the generation process
    const { data, error } = await supabase.functions.invoke('generate-summary', {
      body: {
        bookId,
        settings
      }
    });
    
    return { data, error };
  },

  // Get pending generation requests
  getPendingGenerationRequests: async () => {
    const { data, error } = await supabase
      .from('generation_requests')
      .select(`
        id,
        status,
        created_at,
        books:book_id (
          title,
          authors:original_author_id (
            name
          )
        ),
        profiles:requested_by (
          username,
          full_name
        )
      `)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });
    
    return { requests: data, error };
  },

  // Get all users (paginated)
  getUsers: async (page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });
    
    return { 
      users: data, 
      error,
      count,
      page,
      limit,
      hasMore: (page * limit) < (count || 0)
    };
  }
};

// Export default API object
export default {
  auth,
  profiles,
  summaries,
  categories,
  collections,
  subscriptions,
  dashboard,
  admin
};
