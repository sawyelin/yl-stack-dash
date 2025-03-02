import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getStorageType, toggleStorageType } from "@/lib/storage";
import {
  Menu,
  Search,
  Home,
  Link,
  FileText,
  Shield,
  Tag,
  Settings,
  Moon,
  Sun,
  Sparkles,
  X,
  Database,
} from "lucide-react";

interface MobileNavbarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const MobileNavbar = ({
  activeFilter = "all",
  onFilterChange = () => {},
  onSearch = () => {},
  isDarkMode = false,
  onThemeToggle = () => {},
}: MobileNavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-between px-2 py-2">
        <NavButton
          icon={<Home className="h-5 w-5" />}
          label="All"
          isActive={activeFilter === "all"}
          onClick={() => onFilterChange("all")}
        />
        <NavButton
          icon={<Link className="h-5 w-5" />}
          label="Links"
          isActive={activeFilter === "links"}
          onClick={() => onFilterChange("links")}
        />
        <NavButton
          icon={<FileText className="h-5 w-5" />}
          label="Notes"
          isActive={activeFilter === "notes"}
          onClick={() => onFilterChange("notes")}
        />
        <NavButton
          icon={<Shield className="h-5 w-5" />}
          label="Creds"
          isActive={activeFilter === "credentials"}
          onClick={() => onFilterChange("credentials")}
        />
        <NavButton
          icon={<Tag className="h-5 w-5" />}
          label="Tags"
          isActive={activeFilter === "tags"}
          onClick={() => onFilterChange("tags")}
        />
      </div>

      {/* Fixed Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <MobileSidebar
                  activeFilter={activeFilter}
                  onFilterChange={onFilterChange}
                  isDarkMode={isDarkMode}
                  onThemeToggle={onThemeToggle}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SecureVault
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="relative"
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onThemeToggle}>
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar (conditionally rendered) */}
        {isSearchOpen && (
          <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavButton = ({
  icon,
  label,
  isActive = false,
  onClick,
}: NavButtonProps) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center p-1 rounded-md w-16",
        isActive
          ? "text-primary bg-primary/10 dark:bg-primary/20"
          : "text-gray-500 dark:text-gray-400",
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

interface MobileSidebarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const MobileSidebar = ({
  activeFilter = "all",
  onFilterChange = () => {},
  isDarkMode = false,
  onThemeToggle = () => {},
}: MobileSidebarProps) => {
  const [storageType, setStorageType] = useState(getStorageType());

  // Update storage type display when it changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentType = getStorageType();
      if (currentType !== storageType) {
        setStorageType(currentType);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [storageType]);

  const handleToggleStorage = () => {
    toggleStorageType();
    setStorageType(getStorageType());
  };

  const recentTags = [
    { name: "personal", count: 4 },
    { name: "work", count: 7 },
    { name: "important", count: 3 },
    { name: "archive", count: 2 },
    { name: "finance", count: 5 },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center">
        <div className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm mr-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SecureVault
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-1 mb-6">
          <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            Navigation
          </h3>
          <NavItem
            icon={<Home className="h-4 w-4" />}
            label="All Items"
            isActive={activeFilter === "all"}
            onClick={() => onFilterChange("all")}
          />
          <NavItem
            icon={<Link className="h-4 w-4" />}
            label="Links"
            isActive={activeFilter === "links"}
            onClick={() => onFilterChange("links")}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="Notes"
            isActive={activeFilter === "notes"}
            onClick={() => onFilterChange("notes")}
          />
          <NavItem
            icon={<Shield className="h-4 w-4" />}
            label="Credentials"
            isActive={activeFilter === "credentials"}
            onClick={() => onFilterChange("credentials")}
          />
          <NavItem
            icon={<Tag className="h-4 w-4" />}
            label="Tags"
            isActive={activeFilter === "tags"}
            onClick={() => onFilterChange("tags")}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            Recent Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentTags.map((tag) => (
              <button
                key={tag.name}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border",
                  activeFilter === `tag:${tag.name}`
                    ? "bg-primary/10 border-primary/50 text-primary dark:bg-primary/20 dark:border-primary/40 dark:text-primary-foreground"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                )}
                onClick={() => onFilterChange(`tag:${tag.name}`)}
              >
                {tag.name}{" "}
                <span className="ml-1 opacity-70">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">Dark Mode</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="h-8 w-8"
          >
            {isDarkMode ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">{storageType}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStorage}
            className="h-7 text-xs border-primary/50 bg-primary/5 dark:bg-primary/10"
          >
            Toggle
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, isActive = false, onClick }: NavItemProps) => {
  return (
    <button
      className={cn(
        "flex items-center w-full px-3 py-2 rounded-md text-sm",
        isActive
          ? "bg-gradient-to-r from-primary/80 to-primary/60 text-white dark:from-primary/90 dark:to-primary/70"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      )}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
};

export default MobileNavbar;
