import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Folder, MoreVertical, Link, FileText, Key, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FolderType = "link" | "note" | "credential" | "tagged" | "all";

interface FolderCardProps {
  id: string;
  name: string;
  type: FolderType;
  itemCount: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const FolderCard = ({
  id,
  name,
  type,
  itemCount,
  isSelected = false,
  onSelect = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: FolderCardProps) => {
  const getTypeIcon = (type: FolderType) => {
    switch (type) {
      case "link":
        return <Link className="h-5 w-5 text-blue-500" />;
      case "note":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "credential":
        return <Key className="h-5 w-5 text-amber-500" />;
      case "tagged":
        return <Tag className="h-5 w-5 text-purple-500" />;
      default:
        return <Folder className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 relative",
        "before:pointer-events-none after:pointer-events-none",
        "bg-gradient-to-br from-gray-50 via-white to-gray-50/50",
        "dark:from-gray-800/40 dark:via-gray-800 dark:to-gray-800/20",
        "hover:shadow-lg hover:shadow-primary/10",
        "dark:shadow-lg dark:shadow-primary/10",
        "border border-gray-200/50 dark:border-gray-700/30",
        "hover:border-primary/20 dark:hover:border-primary/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity",
        "hover:before:opacity-100",
        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-primary/5 after:to-transparent after:opacity-0 after:transition-opacity",
        "hover:after:opacity-100",
        isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
      )}
      onClick={() => onSelect(id)}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 relative z-20">
        <div className="flex items-center gap-2">
          {getTypeIcon(type)}
          <h3 className="font-medium">{name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 relative z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}>
              Edit Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 relative z-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </CardContent>
    </Card>
  );
};

export default FolderCard; 