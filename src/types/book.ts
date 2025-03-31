
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  category: string;
  readTime: number;
  description?: string;
  publishedYear?: number;
  isbn?: string;
}
