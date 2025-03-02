import React, { useState, useEffect } from "react";
import Sidebar from "./layout/Sidebar";
import DashboardGrid, { Widget } from "./dashboard/DashboardGrid";
import ItemModal from "./modals/ItemModal";
import CredentialAccessModal from "./modals/CredentialAccessModal";
import LoginForm from "./auth/LoginForm";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  // Toast notifications
  const { toast } = useToast();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for UI scaffolding
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Dashboard state
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");

  // Modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<"add" | "edit" | "view">(
    "add",
  );
  const [currentItem, setCurrentItem] = useState<Widget | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [currentCredentialId, setCurrentCredentialId] = useState("");
  const [currentCredentialTitle, setCurrentCredentialTitle] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Simulate loading dashboard data from an API
  const loadDashboardData = async () => {
    setIsLoading(true);
    setDashboardError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Sample data
      const sampleData: Widget[] = [
        {
          id: "widget-1",
          title: "Important Links",
          content: "Collection of frequently used websites and resources",
          type: "link",
          tags: ["work", "resources"],
          url: "https://example.com",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          id: "widget-2",
          title: "Project Notes",
          content:
            "Notes for the current dashboard project including requirements and deadlines",
          type: "note",
          tags: ["project", "work"],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: "widget-3",
          title: "Server Credentials",
          content: "Login information for the development server",
          type: "credential",
          tags: ["server", "security"],
          isProtected: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
        {
          id: "widget-4",
          title: "Personal Tasks",
          content: "List of personal tasks and reminders",
          type: "tagged",
          tags: ["personal", "tasks"],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: "widget-5",
          title: "Documentation",
          content: "Links to project documentation and API references",
          type: "link",
          tags: ["docs", "reference"],
          url: "https://docs.example.com",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        },
        {
          id: "widget-6",
          title: "Meeting Notes",
          content: "Notes from the last team meeting including action items",
          type: "note",
          tags: ["meetings", "team"],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      ];

      setWidgets(sampleData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setDashboardError(
        "Failed to load dashboard data. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter widgets based on active filter and search query
  const filteredWidgets = widgets.filter((widget) => {
    // Filter by type
    if (activeFilter === "links" && widget.type !== "link") return false;
    if (activeFilter === "notes" && widget.type !== "note") return false;
    if (activeFilter === "credentials" && widget.type !== "credential")
      return false;
    if (activeFilter === "tags" && widget.type !== "tagged") return false;

    // Filter by tag
    if (activeFilter.startsWith("tag:")) {
      const tagFilter = activeFilter.replace("tag:", "");
      if (!widget.tags.includes(tagFilter)) return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !(
        widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      )
    ) {
      return false;
    }

    return true;
  });

  // Authentication handlers
  const handleLogin = (values: { email: string; password: string }) => {
    setIsAuthLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome to your personal dashboard",
      });
    }, 1000);
  };

  const handleForgotPassword = () => {
    // Placeholder for forgot password functionality
    toast({
      title: "Password reset",
      description:
        "If your email is registered, you'll receive reset instructions",
    });
  };

  // Dashboard handlers
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `${isDarkMode ? "Light" : "Dark"} mode activated`,
      description: `Switched to ${isDarkMode ? "light" : "dark"} theme`,
    });
  };

  const handleColorThemeChange = (theme: string) => {
    setColorTheme(theme);
    toast({
      title: "Theme updated",
      description: `Applied ${theme} color theme`,
    });
  };

  // Widget handlers
  const handleAddItem = () => {
    setCurrentItem(null);
    setItemModalMode("add");
    setItemModalOpen(true);
  };

  const handleEditItem = (id: string) => {
    const item = widgets.find((widget) => widget.id === id);
    if (item) {
      setCurrentItem(item);
      setItemModalMode("edit");
      setItemModalOpen(true);
    }
  };

  const handleViewItem = (id: string) => {
    const item = widgets.find((widget) => widget.id === id);
    if (item) {
      if (item.type === "credential" && item.isProtected) {
        // Open credential access modal for protected credentials
        setCurrentCredentialId(item.id);
        setCurrentCredentialTitle(item.title);
        setCredentialModalOpen(true);
      } else {
        // Open regular view modal for other items
        setCurrentItem(item);
        setItemModalMode("view");
        setItemModalOpen(true);
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
    toast({
      title: "Item deleted",
      description: "The item has been removed from your dashboard",
    });
  };

  const handleSaveItem = (item: Widget) => {
    if (itemModalMode === "add") {
      // Add new item with a unique ID and timestamps
      const newItem = {
        ...item,
        id: `widget-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setWidgets([...widgets, newItem]);
      toast({
        title: "Item added",
        description: "New item has been added to your dashboard",
      });
    } else {
      // Update existing item with new timestamp
      setWidgets(
        widgets.map((widget) =>
          widget.id === item.id ? { ...item, updatedAt: new Date() } : widget,
        ),
      );
      toast({
        title: "Item updated",
        description: "Your changes have been saved",
      });
    }
  };

  const handleReorderItems = (reorderedItems: Widget[]) => {
    setWidgets(reorderedItems);
    toast({
      title: "Layout updated",
      description: "Your dashboard layout has been saved",
    });
  };

  // Credential access handler
  const handlePasswordSubmit = async (
    password: string,
    credentialId: string,
  ): Promise<boolean> => {
    // Simulate password verification
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, any password works
        resolve(true);
        toast({
          title: "Credential unlocked",
          description: "You now have access to the protected content",
        });
      }, 1000);
    });
  };

  // Refresh dashboard data
  const handleRefreshData = () => {
    loadDashboardData();
    toast({
      title: "Refreshing data",
      description: "Updating your dashboard with the latest information",
    });
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        isLoading={isAuthLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onColorThemeChange={handleColorThemeChange}
      />

      {/* Main Dashboard */}
      <div className="flex-1 overflow-hidden">
        <DashboardGrid
          widgets={filteredWidgets}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onViewItem={handleViewItem}
          onReorderItems={handleReorderItems}
          isLoading={isLoading}
          error={dashboardError}
          onRefresh={handleRefreshData}
        />
      </div>

      {/* Modals */}
      <ItemModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        mode={itemModalMode}
        item={currentItem || undefined}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      <CredentialAccessModal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        credentialId={currentCredentialId}
        credentialTitle={currentCredentialTitle}
        onPasswordSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

export default Home;
