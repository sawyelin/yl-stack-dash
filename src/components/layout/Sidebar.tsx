import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const colorThemes = [
    { name: "Default", value: "default" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Purple", value: "purple" },
    { name: "Orange", value: "orange" },
  ];

  return (
    <div className="w-[280px] h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 flex items-center">
          <Home className="mr-2 h-5 w-5" />
          Dashboard
        </h1>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-white dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <ScrollArea className="flex-grow px-4">
        <div className="space-y-1">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange("all")}
          >
            <Home className="mr-2 h-4 w-4" />
            All Items
          </Button>

          <Button
            variant={activeFilter === "links" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange("links")}
          >
            <Link className="mr-2 h-4 w-4" />
            Links
          </Button>

          <Button
            variant={activeFilter === "notes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange("notes")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Notes
          </Button>

          <Button
            variant={activeFilter === "credentials" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange("credentials")}
          >
            <Key className="mr-2 h-4 w-4" />
            Credentials
          </Button>

          <Button
            variant={activeFilter === "tags" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange("tags")}
          >
            <Tag className="mr-2 h-4 w-4" />
            Tags
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            Recent Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {["personal", "work", "important", "archive"].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onFilterChange(`tag:${tag}`)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Collapsible
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <Label htmlFor="theme-mode">Dark Mode</Label>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={onThemeToggle}
              />
            </div>

            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorThemes.map((theme) => (
                  <Button
                    key={theme.value}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => onColorThemeChange(theme.value)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mr-2 bg-${theme.value === "default" ? "primary" : theme.value}-500`}
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
