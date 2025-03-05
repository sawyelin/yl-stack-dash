import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import MobileNavbar from "./layout/MobileNavbar";
import DashboardGrid, { Widget, WidgetType } from "./dashboard/DashboardGrid";
import ItemModal from "./modals/ItemModal";
import FolderModal from "./modals/FolderModal";
import CredentialAccessModal from "./modals/CredentialAccessModal";
import LoginForm from "./auth/LoginForm";
import { useToast } from "@/components/ui/use-toast";
import { getStorageType } from "@/lib/storage";
import { Folder } from "@/services/folderService";

const Home = () => {
  const { filter, folderId } = useParams();
  const navigate = useNavigate();

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
  const [recentTags, setRecentTags] = useState<Array<{ name: string; count: number }>>([]);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'default';
  });

  // Modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<"add" | "edit" | "view">(
    "add",
  );
  const [currentItem, setCurrentItem] = useState<Widget | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [currentCredentialId, setCurrentCredentialId] = useState("");
  const [currentCredentialTitle, setCurrentCredentialTitle] = useState("");

  // Storage type state
  const [storageType, setStorageType] = useState(getStorageType());

  // Folder state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<"add" | "edit">("add");
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Update URL when filter changes
  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
    // Reset folder selection when changing filters
    setActiveFolderId(null);
    navigate(`/${newFilter}`);
  };

  // Update URL when folder changes
  const handleFolderSelect = (id: string | null) => {
    setActiveFolderId(id);
    if (id) {
      navigate(`/${activeFilter}/folder/${id}`);
    } else {
      navigate(`/${activeFilter}`);
    }
  };

  // Sync with URL parameters
  useEffect(() => {
    if (filter) {
      setActiveFilter(filter);
    }
    if (folderId) {
      setActiveFolderId(folderId);
    } else {
      // Reset folder selection if no folder in URL
      setActiveFolderId(null);
    }
  }, [filter, folderId]);

  // Initialize database on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const { initFolders } = await import("@/services/folderService");
        await initFolders();
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast({
          title: "Error",
          description: "Failed to initialize database. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeDatabase();
  }, []);

  // Load dashboard data on component mount or when storage type changes
  useEffect(() => {
    loadDashboardData();
    loadRecentTags();
    loadFolders();

    // Set up interval to check for storage type changes
    const intervalId = setInterval(() => {
      const currentType = getStorageType();
      if (currentType !== storageType) {
        setStorageType(currentType);
        loadDashboardData(); // Reload data when storage type changes
        loadRecentTags(); // Reload tags when storage type changes
        loadFolders(); // Reload folders when storage type changes
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [storageType]);

  // Apply dark mode class to document and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Save color theme preference
  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

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

  // Load recent tags
  const loadRecentTags = async () => {
    try {
      const { getTagCounts } = await import("@/services/widgetService");
      const tagCounts = await getTagCounts();
      // Get top 5 most used tags
      setRecentTags(tagCounts.slice(0, 5));
    } catch (error) {
      console.error("Error loading recent tags:", error);
    }
  };

  // Load folders
  const loadFolders = async () => {
    try {
      const { getFolderHierarchy } = await import("@/services/folderService");
      const folderList = await getFolderHierarchy();
      setFolders(folderList);
    } catch (error) {
      console.error("Error loading folders:", error);
      toast({
        title: "Error",
        description: "Failed to load folders. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter widgets based on active folder
  const filteredWidgets = React.useMemo(() => {
    let filtered = widgets;

    // First apply type/tag filter
    if (activeFilter.startsWith("tag:")) {
      const tag = activeFilter.substring(4);
      filtered = filtered.filter((widget) => widget.tags.includes(tag));
    } else if (activeFilter !== "all") {
      filtered = filtered.filter((widget) => {
        switch (activeFilter) {
          case "links":
            return widget.type === "link";
          case "notes":
            return widget.type === "note";
          case "credentials":
            return widget.type === "credential";
          case "tags":
            return widget.type === "tagged";
          default:
            return true;
        }
      });
    }

    // Then apply folder filter if active
    if (activeFolderId) {
      filtered = filtered.filter((widget) => widget.folder_id === activeFolderId);
    }

    // Then apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (widget) =>
          widget.title.toLowerCase().includes(query) ||
          widget.content.toLowerCase().includes(query) ||
          widget.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [widgets, activeFilter, activeFolderId, searchQuery]);

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

  // Get the active type based on the current filter
  const getActiveType = (): WidgetType => {
    switch (activeFilter) {
      case "links":
        return "link";
      case "notes":
        return "note";
      case "credentials":
        return "credential";
      case "tags":
        return "tagged";
      case "all":
      default:
        return "link"; // Default to link type
    }
  };

  const handleEditItem = (widget: Widget) => {
    setCurrentItem(widget);
    setItemModalMode("edit");
    setItemModalOpen(true);
  };

  const handleViewItem = (widget: Widget) => {
    if (widget.type === "credential" && widget.isProtected) {
      // Open credential access modal for protected credentials
      setCurrentCredentialId(widget.id);
      setCurrentCredentialTitle(widget.title);
      setCurrentItem(widget); // Store the current widget for content
      setCredentialModalOpen(true);
    } else {
      // Open regular view modal for other items
      setCurrentItem(widget);
      setItemModalMode("view");
      setItemModalOpen(true);
    }
  };

  const handleDeleteItem = async (widget: Widget) => {
    try {
      const { deleteWidget } = await import("@/services/widgetService");
      await deleteWidget(widget.id);
      loadDashboardData();
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleSaveItem = async (item: Widget) => {
    try {
      if (itemModalMode === "add") {
        // Create new item in database
        const { createWidget } = await import("@/services/widgetService");
        const { id, title, content, type, tags, url, isProtected, folder_id } = item;

        const newItem = await createWidget({
          title,
          content,
          type,
          tags,
          url,
          isProtected,
          folder_id,
        });

        setWidgets([...widgets, newItem]);
        loadRecentTags(); // Refresh tags after adding item
        toast({
          title: "Item added",
          description: "New item has been added to your dashboard",
        });
      } else {
        // Update existing item in database
        const { updateWidget } = await import("@/services/widgetService");
        const updatedItem = await updateWidget({
          ...item,
          folder_id: item.folder_id
        });

        setWidgets(
          widgets.map((widget) =>
            widget.id === updatedItem.id ? updatedItem : widget,
          ),
        );
        loadRecentTags(); // Refresh tags after updating item

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

  const handleReorderItems = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  // Credential access handler
  const handlePasswordSubmit = async (
    pin: string,
    credentialId: string,
  ): Promise<boolean> => {
    try {
      // Get the stored PIN for this credential
      const storedPin = localStorage.getItem(`credential_pin_${credentialId}`);
      
      // If no PIN is set, this is the first time setting it
      if (!storedPin) {
        localStorage.setItem(`credential_pin_${credentialId}`, pin);
        return true;
      }
      
      // Verify the PIN matches
      return pin === storedPin;
    } catch (error) {
      console.error("Error verifying PIN:", error);
      return false;
    }
  };

  // Refresh dashboard data
  const handleRefreshData = () => {
    loadDashboardData();
    toast({
      title: "Refreshing data",
      description: "Updating your dashboard with the latest information",
    });
  };

  // Handle folder operations
  const handleAddFolder = () => {
    const defaultType = getActiveType();
    setCurrentFolder({
      id: "",
      name: "",
      type: defaultType,
      parent_id: activeFolderId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setFolderModalMode("add");
    setFolderModalOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setFolderModalMode("edit");
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (folder: Folder) => {
    try {
      const { createFolder, updateFolder } = await import("@/services/folderService");
      
      if (folderModalMode === "add") {
        await createFolder(folder);
        toast({
          title: "Folder created",
          description: "New folder has been created successfully",
        });
      } else {
        await updateFolder(folder);
        toast({
          title: "Folder updated",
          description: "Folder has been updated successfully",
        });
      }
      
      loadFolders();
    } catch (error) {
      console.error("Error saving folder:", error);
      toast({
        title: "Error",
        description: "Failed to save folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const { deleteFolder } = await import("@/services/folderService");
      await deleteFolder(id);
      loadFolders();
      toast({
        title: "Folder deleted",
        description: "The folder has been removed",
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
    }
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
          recentTags={recentTags}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavbar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        recentTags={recentTags}
      />

      {/* Main Dashboard */}
      <div className="flex-1 overflow-hidden pt-[60px] lg:pt-0 pb-[60px] lg:pb-0">
        <DashboardGrid
          widgets={filteredWidgets}
          folders={folders}
          activeFilter={activeFilter}
          onWidgetMove={handleReorderItems}
          onWidgetEdit={handleEditItem}
          onWidgetDelete={handleDeleteItem}
          onWidgetView={handleViewItem}
          onFolderEdit={handleEditFolder}
          onFolderDelete={handleDeleteFolder}
          onFolderSelect={handleFolderSelect}
          onAddFolder={handleAddFolder}
          selectedFolderId={activeFolderId}
          isLoading={isLoading}
          onAddItem={handleAddItem}
        />
      </div>

      {/* Modals */}
      <ItemModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        mode={itemModalMode}
        activeType={getActiveType()}
        item={currentItem || undefined}
        folders={folders}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        defaultFolderId={activeFolderId}
      />

      <FolderModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        mode={folderModalMode}
        activeType={activeFilter === "all" ? undefined : getActiveType()}
        folder={currentFolder || undefined}
        parentFolders={folders}
        onSave={handleSaveFolder}
        onDelete={handleDeleteFolder}
      />

      <CredentialAccessModal
        isOpen={credentialModalOpen}
        onClose={() => {
          setCredentialModalOpen(false);
          setCurrentItem(null);
        }}
        credentialId={currentCredentialId}
        credentialTitle={currentCredentialTitle}
        onPasswordSubmit={handlePasswordSubmit}
        credentialContent={currentItem?.content || ""}
      />
    </div>
  );
};

export default Home;
