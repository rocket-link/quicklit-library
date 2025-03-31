
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container px-4 py-12 mx-auto md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-quicklit-purple" />
              <span className="text-lg font-bold">QuickLit</span>
            </Link>
            <p className="text-sm text-gray-500">
              Get the essence of great books in just 15 minutes. Read or listen to key ideas from bestselling nonfiction books.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Home</Link>
              </li>
              <li>
                <Link to="/library" className="text-sm text-gray-600 hover:text-quicklit-purple">Library</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-quicklit-purple">Dashboard</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Business</Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Self-Development</Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Psychology</Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Philosophy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Terms of Service</Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-quicklit-purple">Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-center text-gray-500">
            © {currentYear} QuickLit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
