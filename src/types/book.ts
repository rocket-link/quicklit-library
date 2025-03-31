
export interface Book {
  id: string;
  title: string;
  author: string; // This will be populated from the related authors table
  description?: string;
  coverImage: string; // This corresponds to cover_image_url in the database
  category: string; // This will be populated from the related categories
  readTime: number; // This is calculated based on content or comes from summaries
  publishedYear?: number;
  isbn?: string;
  language?: string;
  pageCount?: number;
}
