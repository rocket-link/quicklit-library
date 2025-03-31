
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/book/${book.id}`}>
      <div className="overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md hover:shadow-xl book-card-shadow hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-quicklit-purple text-white">
              {book.category}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-bold line-clamp-1">{book.title}</h3>
          <p className="mb-3 text-sm text-gray-500">{book.author}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{book.readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
