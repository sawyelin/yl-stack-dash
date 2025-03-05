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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface MobileNavbarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  recentTags?: Array<{ name: string; count: number }>;
}

const MobileNavbar = ({
  activeFilter = "all",
  onFilterChange = () => {},
  onSearch = () => {},
  isDarkMode = false,
  onThemeToggle = () => {},
  recentTags = [],
}: MobileNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onThemeToggle}>
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <div className="flex flex-col h-full">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Navigation Links */}
            <ScrollArea className="flex-grow">
              <div className="space-y-1.5 p-4">
                <Button
                  variant={activeFilter === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onFilterChange("all");
                    setIsOpen(false);
                  }}
                >
                  <Home className="mr-2 h-4 w-4" />
                  All Items
                </Button>
                <Button
                  variant={activeFilter === "links" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onFilterChange("links");
                    setIsOpen(false);
                  }}
                >
                  <Link className="mr-2 h-4 w-4" />
                  Links
                </Button>
                <Button
                  variant={activeFilter === "notes" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onFilterChange("notes");
                    setIsOpen(false);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Notes
                </Button>
                <Button
                  variant={activeFilter === "credentials" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onFilterChange("credentials");
                    setIsOpen(false);
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Credentials
                </Button>
                <Button
                  variant={activeFilter === "tags" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onFilterChange("tags");
                    setIsOpen(false);
                  }}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Recent Tags */}
              {recentTags.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">Recent Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {recentTags.map((tag) => (
                      <Badge
                        key={tag.name}
                        variant="secondary"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => {
                          onFilterChange(`tag:${tag.name}`);
                          setIsOpen(false);
                        }}
                      >
                        {tag.name} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNavbar;
