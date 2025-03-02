import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Link,
  FileText,
  Key,
  Tag,
  ExternalLink,
  Edit,
  Trash,
  Lock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WidgetType = "link" | "note" | "credential" | "tagged";

interface WidgetCardProps {
  id?: string;
  title?: string;
  content?: string;
  type?: WidgetType;
  tags?: string[];
  url?: string;
  isProtected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const WidgetCard = ({
  id = "widget-1",
  title = "Widget Title",
  content = "This is a sample widget content. Click to view more details.",
  type = "note",
  tags = ["personal", "important"],
  url = "https://example.com",
  isProtected = false,
  createdAt,
  updatedAt,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
}: WidgetCardProps) => {
  const getIcon = () => {
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
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleCardClick = () => {
    onView(id);
  };

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get card style based on type
  const getCardStyle = () => {
    switch (type) {
      case "link":
        return "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-800/90 border-blue-200 dark:border-blue-800/50";
      case "note":
        return "bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-800/90 border-green-200 dark:border-green-800/50";
      case "credential":
        return "credential-card";
      case "tagged":
        return "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-800/90 border-purple-200 dark:border-purple-800/50";
      default:
        return "bg-white dark:bg-gray-800";
    }
  };

  return (
    <Card
      className={cn(
        "w-full h-full hover:shadow-lg transition-all duration-300 cursor-pointer border overflow-hidden",
        getCardStyle(),
        isProtected && "ring-2 ring-amber-300 dark:ring-amber-500/50",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2 relative">
        <div className="flex items-center gap-2 z-10">
          <div
            className={cn(
              "p-1.5 rounded-full",
              type === "link"
                ? "bg-blue-100 dark:bg-blue-900/50"
                : type === "note"
                  ? "bg-green-100 dark:bg-green-900/50"
                  : type === "credential"
                    ? "bg-amber-100 dark:bg-amber-900/50"
                    : "bg-purple-100 dark:bg-purple-900/50",
            )}
          >
            {getIcon()}
          </div>
          <CardTitle className="text-lg font-medium truncate">
            {title}
          </CardTitle>
        </div>
        {isProtected && (
          <div className="absolute top-2 right-10 z-10">
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-2 relative z-10" onClick={handleCardClick}>
        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {content}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-2 relative z-10">
        <div className="flex flex-wrap gap-1 w-full">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                type === "link"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  : type === "note"
                    ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                    : type === "credential"
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200"
                      : "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center w-full">
          {updatedAt && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(updatedAt)}
            </div>
          )}
          {type === "link" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                window.open(url, "_blank");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WidgetCard;
