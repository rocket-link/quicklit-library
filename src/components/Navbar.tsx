
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Mock auth state - would be replaced with actual auth
  const isAuthenticated = false;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: "/", label: "Home", requiresAuth: false },
    { to: "/dashboard", label: "Dashboard", requiresAuth: true },
    { to: "/library", label: "My Library", requiresAuth: true },
  ];

  // Filter links based on auth state
  const filteredLinks = navLinks.filter(
    (link) => !link.requiresAuth || (link.requiresAuth && isAuthenticated)
  );

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-quicklit-purple" />
          <span className="text-xl font-bold">QuickLit</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center space-x-6">
            {filteredLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-quicklit-purple ${
                  location.pathname === link.to ? "text-quicklit-purple" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Auth Buttons or User Menu */}
        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <>
              {!isMobile && (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
              )}
              <Link to="/auth?signup=true">
                <Button size="sm" className="bg-quicklit-purple hover:bg-quicklit-dark-purple">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <Button variant="ghost" size="icon">
              {/* Avatar would go here */}
            </Button>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="ml-2"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background border-t">
          <div className="flex flex-col p-4 space-y-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-medium p-2 ${
                  location.pathname === link.to ? "text-quicklit-purple" : "text-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="text-lg font-medium p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
