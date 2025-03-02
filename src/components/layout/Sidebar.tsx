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
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onColorThemeChange?: (theme: string) => void;
}

const Sidebar = ({
  activeFilter = "all",
  onFilterChange = () => {},
  onSearch = () => {},
  isDarkMode = false,
  onThemeToggle = () => {},
  onColorThemeChange = () => {},
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

  const recentTags = [
    { name: "personal", count: 4 },
    { name: "work", count: 7 },
    { name: "important", count: 3 },
    { name: "archive", count: 2 },
    { name: "finance", count: 5 },
  ];

  return (
    <div className="w-[280px] h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
        <h1 className="text-xl font-bold mb-4 flex items-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          <div className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm mr-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          SecureVault
        </h1>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <ScrollArea className="flex-grow px-4">
        <div className="space-y-1 py-2">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeFilter === "all" &&
                "bg-gradient-to-r from-primary to-primary/80",
            )}
            onClick={() => onFilterChange("all")}
          >
            <Home className="mr-2 h-4 w-4" />
            All Items
          </Button>

          <Button
            variant={activeFilter === "links" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeFilter === "links" &&
                "bg-gradient-to-r from-blue-500 to-blue-600",
            )}
            onClick={() => onFilterChange("links")}
          >
            <Link className="mr-2 h-4 w-4" />
            Links
          </Button>

          <Button
            variant={activeFilter === "notes" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeFilter === "notes" &&
                "bg-gradient-to-r from-green-500 to-green-600",
            )}
            onClick={() => onFilterChange("notes")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Notes
          </Button>

          <Button
            variant={activeFilter === "credentials" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeFilter === "credentials" &&
                "bg-gradient-to-r from-amber-500 to-amber-600",
            )}
            onClick={() => onFilterChange("credentials")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Credentials
          </Button>

          <Button
            variant={activeFilter === "tags" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeFilter === "tags" &&
                "bg-gradient-to-r from-purple-500 to-purple-600",
            )}
            onClick={() => onFilterChange("tags")}
          >
            <Tag className="mr-2 h-4 w-4" />
            Tags
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400 flex items-center">
            <Bookmark className="h-4 w-4 mr-2" />
            Recent Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentTags.map((tag) => (
              <Button
                key={tag.name}
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                  activeFilter === `tag:${tag.name}` &&
                    "border-primary dark:border-primary bg-primary/10 dark:bg-primary/20",
                )}
                onClick={() => onFilterChange(`tag:${tag.name}`)}
              >
                {tag.name}
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 px-1 text-[10px]"
                >
                  {tag.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <Collapsible
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-4">
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800">
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

            <div className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-primary" />
                <Label className="cursor-pointer">Storage: {storageType}</Label>
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
                      "justify-start border bg-white dark:bg-gray-800",
                      theme.value === "default" &&
                        "border-primary/50 dark:border-primary/50 bg-primary/5 dark:bg-primary/10",
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
