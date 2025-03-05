import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStorageType, toggleStorageType } from "@/lib/storage";
import {
  Search,
  Home,
  Link,
  FileText,
  Key,
  Tag,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Palette,
  Shield,
  Bookmark,
  Sparkles,
  Database,
  FolderPlus,
  Edit,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Folder } from "@/services/folderService";

interface SidebarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onColorThemeChange?: (theme: string) => void;
  recentTags?: Array<{ name: string; count: number }>;
}

const Sidebar = ({
  activeFilter = "all",
  onFilterChange = () => {},
  onSearch = () => {},
  isDarkMode = false,
  onThemeToggle = () => {},
  onColorThemeChange = () => {},
  recentTags = [],
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const colorThemes = [
    { name: "Default", value: "default", color: "bg-primary" },
    { name: "Ocean", value: "blue", color: "bg-blue-500" },
    { name: "Forest", value: "green", color: "bg-emerald-500" },
    { name: "Royal", value: "purple", color: "bg-violet-500" },
    { name: "Sunset", value: "orange", color: "bg-orange-500" },
  ];

  return (
    <div className="w-[280px] h-full bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
        <h1 className="text-xl font-bold mb-4 flex items-center">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm mr-2 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            SecureVault
          </span>
        </h1>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 
              focus-visible:bg-white dark:focus-visible:bg-gray-800 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/20 
              hover:bg-white/90 dark:hover:bg-gray-800/90"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <ScrollArea className="flex-grow px-4">
        <div className="space-y-1.5 py-4">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              activeFilter === "all"
                ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
            )}
            onClick={() => onFilterChange("all")}
          >
            <Home className="mr-2 h-4 w-4" />
            All Items
          </Button>

          <Button
            variant={activeFilter === "links" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              activeFilter === "links"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm text-blue-600 dark:text-blue-400"
            )}
            onClick={() => onFilterChange("links")}
          >
            <Link className="mr-2 h-4 w-4" />
            Links
          </Button>

          <Button
            variant={activeFilter === "notes" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              activeFilter === "notes"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm text-emerald-600 dark:text-emerald-400"
            )}
            onClick={() => onFilterChange("notes")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Notes
          </Button>

          <Button
            variant={activeFilter === "credentials" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              activeFilter === "credentials"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm text-amber-600 dark:text-amber-400"
            )}
            onClick={() => onFilterChange("credentials")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Credentials
          </Button>

          <Button
            variant={activeFilter === "tags" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              activeFilter === "tags"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm text-purple-600 dark:text-purple-400"
            )}
            onClick={() => onFilterChange("tags")}
          >
            <Tag className="mr-2 h-4 w-4" />
            Tags
          </Button>
        </div>

        <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

        {/* Recent Tags Section */}
        {recentTags.length > 0 && (
          <div className="py-2">
            <h3 className="text-sm font-medium px-2 mb-2">Recent Tags</h3>
            <div className="flex flex-wrap gap-1 px-2">
              {recentTags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => onFilterChange(`tag:${tag.name}`)}
                >
                  {tag.name} ({tag.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Collapsible
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
                <Label htmlFor="theme-mode" className="cursor-pointer">
                  {isDarkMode ? "Dark" : "Light"} Mode
                </Label>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={onThemeToggle}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-primary" />
                <Label className="cursor-pointer">Storage: {storageType}</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStorage}
                className="h-7 text-xs border-primary/50 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Toggle
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Palette className="h-4 w-4 mr-2" />
                Color Theme
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {colorThemes.map((theme) => (
                  <Button
                    key={theme.value}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start border transition-all duration-200",
                      theme.value === "default"
                        ? "border-primary/50 dark:border-primary/50 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20"
                        : "border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                    onClick={() => onColorThemeChange(theme.value)}
                  >
                    <div
                      className={cn("w-3 h-3 rounded-full mr-2", theme.color)}
                    />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Sidebar;
