import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkTableProps {
  widgets: any[];
  onWidgetEdit?: (widget: any) => void;
  onWidgetDelete?: (widget: any) => void;
}

const LinkTable = ({
  widgets = [],
  onWidgetEdit = () => {},
  onWidgetDelete = () => {},
}: LinkTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLinks, setFilteredLinks] = useState(widgets);

  // Update filtered links when widgets or search query changes
  useEffect(() => {
    const filtered = widgets.filter((widget) =>
      widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLinks(filtered);
  }, [widgets, searchQuery]);

  // Function to get favicon URL
  const getFaviconUrl = (url: string) => {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search links by title, URL, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Added</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLinks.map((widget) => (
            <TableRow 
              key={widget.id}
              className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                    {getFaviconUrl(widget.url) ? (
                      <img
                        src={getFaviconUrl(widget.url)}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.parentElement?.classList.add("fallback-icon");
                        }}
                      />
                    ) : (
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <span className="font-medium">{widget.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <a
                  href={widget.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1.5 w-fit"
                >
                  <span className="truncate max-w-[300px]">{widget.url}</span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              </TableCell>
              <TableCell>
                <span className="truncate block max-w-[300px] text-gray-600 dark:text-gray-300">
                  {widget.content}
                </span>
              </TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                {widget.createdAt ? new Date(widget.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onWidgetEdit(widget)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onWidgetDelete(widget)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filteredLinks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-[300px] text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mb-4 opacity-50" />
                  <p className="font-medium">No links found</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">
                      Try adjusting your search query
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LinkTable;