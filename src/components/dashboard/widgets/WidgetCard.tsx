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
} from "lucide-react";

type WidgetType = "link" | "note" | "credential" | "tagged";

interface WidgetCardProps {
  id?: string;
  title?: string;
  content?: string;
  type?: WidgetType;
  tags?: string[];
  url?: string;
  isProtected?: boolean;
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

  return (
    <Card className="w-full h-full bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-lg font-medium truncate">
            {title}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
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
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-2" onClick={handleCardClick}>
        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {content}
        </div>
        {type === "credential" && isProtected && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Key className="h-3 w-3" />
            <span>Password protected</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        {type === "link" && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6"
            onClick={(e) => {
              e.stopPropagation();
              window.open(url, "_blank");
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WidgetCard;
