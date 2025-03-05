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
    const baseStyle = "relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg";
    const patternStyle = "before:absolute before:inset-0 before:opacity-5 dark:before:opacity-10 before:pointer-events-none";
    const glowStyle = "after:absolute after:inset-0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300";

    switch (type) {
      case "link":
        return cn(
          baseStyle,
          patternStyle,
          glowStyle,
          "bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-900/40 dark:via-gray-800 dark:to-blue-800/20",
          "border border-blue-200/50 dark:border-blue-700/30",
          "before:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_1px,transparent_1px)] before:bg-[length:10px_10px]",
          "after:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2)_1px,transparent_50%)]",
          "shadow-sm shadow-blue-500/5 dark:shadow-blue-400/10",
          "hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20"
        );
      case "note":
        return cn(
          baseStyle,
          patternStyle,
          glowStyle,
          "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/40 dark:via-gray-800 dark:to-emerald-800/20",
          "border border-emerald-200/50 dark:border-emerald-700/30",
          "before:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_1px,transparent_1px)] before:bg-[length:10px_10px]",
          "after:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2)_1px,transparent_50%)]",
          "shadow-sm shadow-emerald-500/5 dark:shadow-emerald-400/10",
          "hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20"
        );
      case "credential":
        return cn(
          baseStyle,
          patternStyle,
          glowStyle,
          "bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-amber-900/40 dark:via-gray-800 dark:to-amber-800/20",
          "border border-amber-200/50 dark:border-amber-700/30",
          "before:bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1)_1px,transparent_1px)] before:bg-[length:10px_10px]",
          "after:bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.2)_1px,transparent_50%)]",
          "shadow-sm shadow-amber-500/5 dark:shadow-amber-400/10",
          "hover:shadow-amber-500/10 dark:hover:shadow-amber-400/20"
        );
      default:
        return cn(
          baseStyle,
          patternStyle,
          glowStyle,
          "bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-900/40 dark:via-gray-800 dark:to-purple-800/20",
          "border border-purple-200/50 dark:border-purple-700/30",
          "before:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1)_1px,transparent_1px)] before:bg-[length:10px_10px]",
          "after:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.2)_1px,transparent_50%)]",
          "shadow-sm shadow-purple-500/5 dark:shadow-purple-400/10",
          "hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20"
        );
    }
  };

  const getContentPreview = () => {
    if (isProtected) {
      return (
        <span className="flex items-center text-amber-600 dark:text-amber-400">
          <Lock className="h-4 w-4 mr-2" />
          Protected content
        </span>
      );
    }

    if (type === "credential") {
      // Parse the content to get individual fields
      const lines = content.split('\n');
      return (
        <div className="space-y-1">
          {lines.map((line, index) => {
            if (!line.trim()) return null;
            const [label, value] = line.split(':').map(s => s.trim());
            if (!value) return <p key={index} className="text-sm">{line}</p>;
            
            // Mask the value part with asterisks, keeping first 2 and last 2 chars visible
            const maskedValue = value.length > 4 
              ? `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`
              : '*'.repeat(value.length);
            
            return (
              <p key={index} className="text-sm flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{label}:</span>
                <span className="font-mono">{maskedValue}</span>
              </p>
            );
          })}
        </div>
      );
    }

    if (type === "link") {
      return (
        <div className="flex items-center justify-between">
          <span className="text-blue-500 truncate">{url}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(url, "_blank");
            }}
            className="ml-2"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return <p className="line-clamp-3 text-gray-600 dark:text-gray-300">{content}</p>;
  };

  return (
    <Card
      className={getCardStyle()}
      onClick={handleCardClick}
    >
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {getContentPreview()}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 pt-2 relative z-10">
        <div className="flex flex-wrap gap-1.5 w-full">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-0.5 text-xs rounded-full transition-colors duration-200",
                type === "link"
                  ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  : type === "note"
                    ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                    : type === "credential"
                      ? "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                      : "bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default WidgetCard;
