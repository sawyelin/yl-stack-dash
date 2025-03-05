import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, FileText, Key, Tag, MoreVertical, Lock, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type WidgetType = "link" | "note" | "credential" | "tagged";

interface WidgetCardProps {
  id: string;
  title: string;
  content: string;
  type: WidgetType;
  tags: string[];
  url?: string;
  isProtected?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const WidgetCard = ({
  id,
  title,
  content,
  type,
  tags,
  url,
  isProtected,
  onEdit,
  onDelete,
  onView,
}: WidgetCardProps) => {
  const getTypeIcon = () => {
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
        return <FileText className="h-5 w-5" />;
    }
  };

  const getContentPreview = () => {
    if (isProtected) {
      return (
        <div className="flex items-center text-amber-600 dark:text-amber-400">
          <Lock className="h-4 w-4 mr-2" />
          Protected content
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
      className={cn(
        "group cursor-pointer transition-all duration-300 relative",
        "before:pointer-events-none after:pointer-events-none",
        type === "link" && [
          "bg-gradient-to-br from-blue-50 via-white to-blue-50/50",
          "dark:from-blue-900/40 dark:via-gray-800 dark:to-blue-800/20",
          "hover:shadow-lg hover:shadow-blue-500/10",
          "dark:shadow-lg dark:shadow-blue-400/10",
          "border border-blue-200/50 dark:border-blue-700/30",
          "hover:border-blue-500/20 dark:hover:border-blue-400/20",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-blue-500/5 after:to-transparent after:opacity-0 after:transition-opacity",
          "hover:after:opacity-100"
        ],
        type === "note" && [
          "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50",
          "dark:from-emerald-900/40 dark:via-gray-800 dark:to-emerald-800/20",
          "hover:shadow-lg hover:shadow-emerald-500/10",
          "dark:shadow-lg dark:shadow-emerald-400/10",
          "border border-emerald-200/50 dark:border-emerald-700/30",
          "hover:border-emerald-500/20 dark:hover:border-emerald-400/20",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-emerald-500/5 after:to-transparent after:opacity-0 after:transition-opacity",
          "hover:after:opacity-100"
        ],
        type === "credential" && [
          "bg-gradient-to-br from-amber-50 via-white to-amber-50/50",
          "dark:from-amber-900/40 dark:via-gray-800 dark:to-amber-800/20",
          "hover:shadow-lg hover:shadow-amber-500/10",
          "dark:shadow-lg dark:shadow-amber-400/10",
          "border border-amber-200/50 dark:border-amber-700/30",
          "hover:border-amber-500/20 dark:hover:border-amber-400/20",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-500/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-amber-500/5 after:to-transparent after:opacity-0 after:transition-opacity",
          "hover:after:opacity-100"
        ],
        type === "tagged" && [
          "bg-gradient-to-br from-purple-50 via-white to-purple-50/50",
          "dark:from-purple-900/40 dark:via-gray-800 dark:to-purple-800/20",
          "hover:shadow-lg hover:shadow-purple-500/10",
          "dark:shadow-lg dark:shadow-purple-400/10",
          "border border-purple-200/50 dark:border-purple-700/30",
          "hover:border-purple-500/20 dark:hover:border-purple-400/20",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity",
          "hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-purple-500/5 after:to-transparent after:opacity-0 after:transition-opacity",
          "hover:after:opacity-100"
        ]
      )}
      onClick={onView}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 relative z-20">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <h3 className="font-medium truncate">{title}</h3>
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
              onEdit();
            }}>
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 relative z-20">
        {getContentPreview()}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full transition-colors duration-200",
                  type === "link" && "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
                  type === "note" && "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
                  type === "credential" && "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50",
                  type === "tagged" && "bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetCard; 