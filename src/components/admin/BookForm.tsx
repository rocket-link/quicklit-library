
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { BookPlus } from "lucide-react";

interface BookFormProps {
  onSubmit: (bookData: {
    title: string;
    description?: string;
    cover_image?: File;
    author_name?: string;
    published_year?: number;
    isbn?: string;
    category_ids?: string[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function BookForm({ onSubmit, isSubmitting }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | undefined>();
  const [isbn, setIsbn] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { categories: data, error } = await categories.getAllCategories();
      if (error) throw error;
      return data;
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    try {
      await onSubmit({
        title,
        description: description || undefined,
        author_name: authorName || undefined,
        published_year: publishedYear,
        isbn: isbn || undefined,
        cover_image: coverImage || undefined,
        category_ids: selectedCategories.length > 0 ? selectedCategories : undefined
      });

      // Reset form
      setTitle("");
      setDescription("");
      setAuthorName("");
      setPublishedYear(undefined);
      setIsbn("");
      setCoverImage(null);
      setSelectedCategories([]);

      toast.success("Book created successfully!");
    } catch (error) {
      console.error("Failed to create book:", error);
      toast.error("Failed to create book. Please try again.");
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prevSelected => 
      prevSelected.includes(categoryId)
        ? prevSelected.filter(id => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Book Title" 
            required 
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="author">Author</Label>
          <Input 
            id="author" 
            value={authorName} 
            onChange={(e) => setAuthorName(e.target.value)} 
            placeholder="Author Name" 
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Book Description" 
            rows={3} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="year">Published Year</Label>
            <Input 
              id="year" 
              type="number" 
              value={publishedYear || ""} 
              onChange={(e) => setPublishedYear(e.target.value ? parseInt(e.target.value) : undefined)} 
              placeholder="YYYY" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input 
              id="isbn" 
              value={isbn} 
              onChange={(e) => setIsbn(e.target.value)} 
              placeholder="ISBN" 
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cover">Cover Image</Label>
          <Input 
            id="cover" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {coverImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Selected: {coverImage.name}</p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Categories</Label>
          {categoriesLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categoriesData?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !title} 
        className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple"
      >
        {isSubmitting ? "Creating..." : "Create Book"}
        <BookPlus className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
