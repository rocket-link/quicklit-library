
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Users,
  Settings,
  BarChart,
  Home,
  LogOut,
  Plus,
  Library
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <BarChart className="w-5 h-5" />,
      path: "/admin"
    },
    {
      title: "Books",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/admin/books"
    },
    {
      title: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/users"
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/admin/settings"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 h-screen border-r bg-sidebar">
      <div className="flex flex-col h-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md group ${
                isActive(item.path)
                  ? "bg-quicklit-purple text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 mb-6 border rounded-lg shadow-sm bg-background">
          <h4 className="mb-2 text-sm font-medium">Quick Actions</h4>
          <div className="space-y-2">
            <button className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100">
              <Plus className="w-4 h-4 mr-2" />
              <span>Add New Book</span>
            </button>
            <button className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100">
              <Library className="w-4 h-4 mr-2" />
              <span>View Library</span>
            </button>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-auto space-y-1">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Back to Site</span>
          </Link>
          <Link
            to="/auth"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
