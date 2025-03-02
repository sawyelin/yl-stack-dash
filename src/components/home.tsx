import React, { useState, useEffect } from "react";
import Sidebar from "./layout/Sidebar";
import MobileNavbar from "./layout/MobileNavbar";
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

  // Load dashboard data from Cloudflare D1
  const loadDashboardData = async () => {
    setIsLoading(true);
    setDashboardError(null);

    try {
      // Import dynamically to avoid issues with SSR
      const { getAllWidgets } = await import("@/services/widgetService");
      const data = await getAllWidgets();
      setWidgets(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // State for filtered widgets
  const [filteredWidgets, setFilteredWidgets] = useState<Widget[]>([]);

  // Effect to handle filtering
  useEffect(() => {
    const filterWidgets = async () => {
      setIsLoading(true);
      try {
        // If there's a search query, use the search API
        if (searchQuery) {
          const { searchWidgets } = await import("@/services/widgetService");
          const results = await searchWidgets(searchQuery);
          setFilteredWidgets(results);
          return;
        }

        // Filter by type using the API
        if (
          activeFilter === "links" ||
          activeFilter === "notes" ||
          activeFilter === "credentials" ||
          activeFilter === "tags"
        ) {
          const { getWidgetsByType } = await import("@/services/widgetService");
          const type =
            activeFilter === "links"
              ? "link"
              : activeFilter === "notes"
                ? "note"
                : activeFilter === "credentials"
                  ? "credential"
                  : "tagged";
          const results = await getWidgetsByType(type);
          setFilteredWidgets(results);
          return;
        }

        // Filter by tag
        if (activeFilter.startsWith("tag:")) {
          const { getWidgetsByTag } = await import("@/services/widgetService");
          const tagFilter = activeFilter.replace("tag:", "");
          const results = await getWidgetsByTag(tagFilter);
          setFilteredWidgets(results);
          return;
        }

        // Default: show all widgets
        setFilteredWidgets(widgets);
      } catch (error) {
        console.error("Error filtering widgets:", error);
        // Fall back to client-side filtering if API fails
        const filtered = widgets.filter((widget) => {
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
              widget.content
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              widget.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            )
          ) {
            return false;
          }

          return true;
        });
        setFilteredWidgets(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    filterWidgets();
  }, [widgets, activeFilter, searchQuery]);

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

  const handleDeleteItem = async (id: string) => {
    try {
      const { deleteWidget } = await import("@/services/widgetService");
      const success = await deleteWidget(id);

      if (success) {
        setWidgets(widgets.filter((widget) => widget.id !== id));
        toast({
          title: "Item deleted",
          description: "The item has been removed from your dashboard",
        });
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveItem = async (item: Widget) => {
    try {
      if (itemModalMode === "add") {
        // Create new item in database
        const { createWidget } = await import("@/services/widgetService");
        const { id, title, content, type, tags, url, isProtected } = item;

        const newItem = await createWidget({
          title,
          content,
          type,
          tags,
          url,
          isProtected,
        });

        setWidgets([...widgets, newItem]);
        toast({
          title: "Item added",
          description: "New item has been added to your dashboard",
        });
      } else {
        // Update existing item in database
        const { updateWidget } = await import("@/services/widgetService");
        const updatedItem = await updateWidget(item);

        setWidgets(
          widgets.map((widget) =>
            widget.id === updatedItem.id ? updatedItem : widget,
          ),
        );

        toast({
          title: "Item updated",
          description: "Your changes have been saved",
        });
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save item. Please try again.",
        variant: "destructive",
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
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          onColorThemeChange={handleColorThemeChange}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavbar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Dashboard */}
      <div className="flex-1 overflow-hidden pt-[60px] lg:pt-0 pb-[60px] lg:pb-0">
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
