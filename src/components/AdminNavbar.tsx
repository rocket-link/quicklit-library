
import { Link } from "react-router-dom";
import { BookOpen, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminNavbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/admin" className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-quicklit-purple" />
            <span className="hidden font-bold md:inline-block">QuickLit Admin</span>
          </Link>
          <div className="hidden w-full max-w-sm md:flex">
            <div className="relative w-full">
              <Search className="absolute w-4 h-4 text-muted-foreground top-3 left-3" />
              <Input
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-quicklit-purple rounded-full border-2 border-background"></span>
          </Button>

          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 rounded-full bg-quicklit-purple text-white flex items-center justify-center font-semibold">
              A
            </div>
            <span className="hidden text-sm font-medium md:inline-block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
