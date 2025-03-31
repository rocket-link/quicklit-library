import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book } from "@/types/book";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BookForm from "@/components/admin/BookForm";
import { admin } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const analyticsData = [
  { name: 'Jan', users: 4000, readings: 2400 },
  { name: 'Feb', users: 3000, readings: 1398 },
  { name: 'Mar', users: 2000, readings: 9800 },
  { name: 'Apr', users: 2780, readings: 3908 },
  { name: 'May', users: 1890, readings: 4800 },
  { name: 'Jun', users: 2390, readings: 3800 },
];

const mockBooks: Book[] = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg",
    category: "Self-Improvement",
    readTime: 15
  },
  {
    id: "2",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41wI53OEpCL._SX322_BO1,204,203,200_.jpg",
    category: "Psychology",
    readTime: 16
  },
  {
    id: "3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
    category: "History",
    readTime: 17
  },
  {
    id: "4",
    title: "Deep Work",
    author: "Cal Newport",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51vmivI5KvL._SX329_BO1,204,203,200_.jpg",
    category: "Productivity",
    readTime: 14
  },
];

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", plan: "Annual", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", plan: "Monthly", status: "Active" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", plan: "Lifetime", status: "Active" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", plan: "Annual", status: "Inactive" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchBooks, setSearchBooks] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const storedTab = sessionStorage.getItem('adminActiveTab');
    const openAddBookDialog = sessionStorage.getItem('openAddBookDialog');
    
    if (storedTab) {
      setActiveTab(storedTab);
      sessionStorage.removeItem('adminActiveTab');
    }
    
    if (openAddBookDialog === 'true') {
      setIsAddBookDialogOpen(true);
      sessionStorage.removeItem('openAddBookDialog');
    }
  }, []);

  const { data: booksData, refetch: refetchBooks, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      try {
        console.log("Fetching books data");
        return mockBooks;
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "Error",
          description: "Failed to load books",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  const filteredBooks = booksData?.filter(book => 
    book.title.toLowerCase().includes(searchBooks.toLowerCase()) ||
    book.author.toLowerCase().includes(searchBooks.toLowerCase())
  ) || [];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const handleAddBook = async (bookData: any) => {
    setIsSubmitting(true);
    try {
      console.log("Adding new book with data:", bookData);
      
      const { data, error } = await admin.createBook(bookData);
      
      if (error) {
        console.error("API returned error:", error);
        throw new Error(error.message || "Failed to create book");
      }
      
      console.log("Book created successfully:", data);
      toast({
        title: "Success",
        description: `Book "${bookData.title}" created successfully!`
      });
      
      setIsAddBookDialogOpen(false);
      
      await queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      await refetchBooks();
    } catch (error: any) {
      console.error("Failed to create book:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create book. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <CardDescription>All time registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,248</div>
                <p className="text-xs text-green-500">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CardDescription>Current active paid users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">842</div>
                <p className="text-xs text-green-500">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <CardDescription>Book summaries in library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">256</div>
                <p className="text-xs text-green-500">+24 new this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth & Activity</CardTitle>
              <CardDescription>User registrations and total readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8B5CF6" name="Users" />
                    <Bar dataKey="readings" fill="#7E69AB" name="Readings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">New User Registration</p>
                  <p className="text-sm text-gray-500">User Sarah Johnson registered 2 hours ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">New Book Summary Added</p>
                  <p className="text-sm text-gray-500">The Psychology of Money added 5 hours ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Subscription Upgraded</p>
                  <p className="text-sm text-gray-500">User Mark Wilson upgraded to annual plan 8 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Book Library Management</h3>
            <Button 
              className="bg-quicklit-purple hover:bg-quicklit-dark-purple"
              onClick={() => setIsAddBookDialogOpen(true)}
            >
              Add New Book
            </Button>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Search books by title or author..."
              value={searchBooks}
              onChange={(e) => setSearchBooks(e.target.value)}
            />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Read Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBooks ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading books...</TableCell>
                  </TableRow>
                ) : filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No books found</TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>{book.readTime} min</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">User Management</h3>
            <Button className="bg-quicklit-purple hover:bg-quicklit-dark-purple">
              Add New User
            </Button>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
            />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.plan}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Manage your platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-3 text-lg font-medium">General</h4>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="site-name">Platform Name</Label>
                    <Input id="site-name" defaultValue="QuickLit" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Input 
                      id="site-description" 
                      defaultValue="AI-powered book summaries platform" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-medium">Subscription Plans</h4>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="monthly-price">Monthly Plan Price</Label>
                    <Input id="monthly-price" type="number" defaultValue="14.99" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="annual-price">Annual Plan Price</Label>
                    <Input id="annual-price" type="number" defaultValue="119.88" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lifetime-price">Lifetime Plan Price</Label>
                    <Input id="lifetime-price" type="number" defaultValue="299" />
                  </div>
                </div>
              </div>

              <Button className="bg-quicklit-purple hover:bg-quicklit-dark-purple">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI settings for summary generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input id="openai-key" type="password" value="sk-*****************" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model-selection">AI Model</Label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-quicklit-purple hover:bg-quicklit-dark-purple">
                Update AI Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Fill in the book details below to add a new book to the library.
            </DialogDescription>
          </DialogHeader>
          <BookForm onSubmit={handleAddBook} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
};

export default AdminDashboard;
