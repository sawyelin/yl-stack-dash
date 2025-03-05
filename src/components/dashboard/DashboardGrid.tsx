import React from "react";
import { Loader2, AlertCircle, RefreshCw, Plus, Sparkles, ChevronLeft, FolderPlus, LinkIcon, FileText, Key } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FolderCard from "../FolderCard";
import WidgetCard from "../WidgetCard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LinkTable from "./widgets/LinkTable";
import { Search } from "lucide-react";

export type WidgetType = "link" | "note" | "credential" | "tagged";
type FolderType = WidgetType | "all";

export interface Widget {
  id: string;
  title: string;
  content: string;
  type: WidgetType;
  tags: string[];
  url?: string;
  isProtected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Custom fields for credentials
  credentialType?: string;
  customFields?: Record<string, string>;
  // Folder support
  folder_id?: string | null;
}

interface Folder {
  id: string;
  name: string;
  type: FolderType;
  parent_id: string | null;
}

interface DashboardGridProps {
  widgets?: Widget[];
  folders?: Folder[];
  activeFilter?: string;
  onWidgetMove?: (result: any) => void;
  onWidgetEdit?: (widget: Widget) => void;
  onWidgetDelete?: (widget: Widget) => void;
  onWidgetView?: (widget: Widget) => void;
  onFolderEdit?: (folder: Folder) => void;
  onFolderDelete?: (id: string) => void;
  onFolderSelect?: (id: string | null) => void;
  onAddFolder?: () => void;
  selectedFolderId?: string | null;
  isLoading?: boolean;
  onAddItem?: () => void;
  onFilterChange?: (filter: string) => void;
}

const DashboardGrid = ({
  widgets = [],
  folders = [],
  activeFilter = "all",
  onWidgetMove = () => {},
  onWidgetEdit = () => {},
  onWidgetDelete = () => {},
  onWidgetView = () => {},
  onFolderEdit = () => {},
  onFolderDelete = () => {},
  onFolderSelect = () => {},
  onAddFolder = () => {},
  selectedFolderId = null,
  isLoading = false,
  onAddItem = () => {},
  onFilterChange = () => {},
}: DashboardGridProps) => {
  // Show folders matching the current filter type when not in a folder
  const getFilteredFolders = () => {
    if (!folders || !Array.isArray(folders)) return [];
    
    // Only show folders when not inside another folder
    if (selectedFolderId) {
      // Show child folders of the selected folder that match the current type
      return folders.filter(folder => 
        folder.parent_id === selectedFolderId && 
        (activeFilter === "all" || folder.type === getTypeFromFilter(activeFilter))
      );
    }

    // When in root, only show root folders (no parent) that match the current type
    return folders.filter(folder => 
      !folder.parent_id && 
      (activeFilter === "all" || folder.type === getTypeFromFilter(activeFilter))
    );
  };

  // Helper function to convert filter to type
  const getTypeFromFilter = (filter: string): FolderType => {
    const typeMap: { [key: string]: FolderType } = {
      "links": "link",
      "notes": "note",
      "credentials": "credential",
      "tags": "tagged",
      "all": "all"
    };
    return typeMap[filter] || "all";
  };

  // Filter widgets based on the current folder and active filter
  const filteredWidgets = widgets.filter((widget) => {
    const folderMatch = selectedFolderId ? widget.folder_id === selectedFolderId : !widget.folder_id;
    const typeMatch = activeFilter === "all" || widget.type === getTypeFromFilter(activeFilter);
    return folderMatch && typeMatch;
  });

  // Separate links from other widgets
  const linkWidgets = filteredWidgets.filter(widget => widget.type === "link");
  const otherWidgets = filteredWidgets.filter(widget => widget.type !== "link");

  const currentFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;

  // Get item count for each folder
  const getFolderItemCount = (folderId: string) => {
    if (!widgets || !Array.isArray(widgets) || !Array.isArray(folders)) return 0;
    // Count items in this folder and all its child folders
    const childFolderIds = folders
      .filter(f => f.parent_id === folderId)
      .map(f => f.id);
    return widgets.filter(widget => 
      widget.folder_id === folderId || 
      childFolderIds.includes(widget.folder_id || "")
    ).length;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-6 py-4">
      <div className="flex-1 max-w-[1400px] w-full mx-auto">
        {/* Header with folder actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {activeFilter === "links" && <LinkIcon className="h-5 w-5 text-blue-500" />}
            {activeFilter === "notes" && <FileText className="h-5 w-5 text-green-500" />}
            {activeFilter === "credentials" && <Key className="h-5 w-5 text-amber-500" />}
            <h2 className="text-lg font-semibold">
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Show Add Item button when inside a folder */}
            {selectedFolderId && (
              <Button onClick={onAddItem} variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add {activeFilter === "links" ? "Link" : 
                     activeFilter === "notes" ? "Note" : 
                     activeFilter === "credentials" ? "Credential" : "Item"}
              </Button>
            )}
            {/* Show New Folder button only when not in a folder */}
            {!selectedFolderId && (
              <Button onClick={onAddFolder} variant="default" size="sm" className="gap-2">
                <FolderPlus className="h-4 w-4" />
                New {activeFilter === "all" ? "" : `${activeFilter.slice(0, -1).charAt(0).toUpperCase() + activeFilter.slice(0, -1).slice(1)} `}Folder
              </Button>
            )}
          </div>
        </div>

        {/* Folders grid if any */}
        {getFilteredFolders().length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {getFilteredFolders().map((folder) => (
              <FolderCard
                key={folder.id}
                id={folder.id}
                name={folder.name}
                type={folder.type}
                itemCount={getFolderItemCount(folder.id)}
                isSelected={folder.id === selectedFolderId}
                onSelect={onFolderSelect}
                onEdit={() => onFolderEdit(folder)}
                onDelete={() => onFolderDelete(folder.id)}
              />
            ))}
          </div>
        )}

        {/* Links view */}
        {activeFilter === "links" && (
          <>
            {selectedFolderId ? (
              // Show table view in folders
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Links</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {linkWidgets.length} {linkWidgets.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <LinkTable
                  widgets={linkWidgets}
                  onWidgetEdit={onWidgetEdit}
                  onWidgetDelete={onWidgetDelete}
                />
              </div>
            ) : (
              // Show grid view in main view
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {linkWidgets.map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    {...widget}
                    onEdit={() => onWidgetEdit(widget)}
                    onDelete={() => onWidgetDelete(widget)}
                    onView={() => onWidgetView(widget)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Other widgets grid */}
        {activeFilter !== "links" && otherWidgets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherWidgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                {...widget}
                onEdit={() => onWidgetEdit(widget)}
                onDelete={() => onWidgetDelete(widget)}
                onView={() => onWidgetView(widget)}
              />
            ))}
          </div>
        )}

        {/* Empty state - only show when no folders and no items */}
        {filteredWidgets.length === 0 && getFilteredFolders().length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Get Started</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Create your first {activeFilter === "all" ? "folder" : `${activeFilter.slice(0, -1)} folder`} to get started
              </p>
              <Button onClick={onAddFolder} variant="default" className="gap-2">
                <FolderPlus className="h-4 w-4" />
                New {activeFilter === "all" ? "" : `${activeFilter.slice(0, -1).charAt(0).toUpperCase() + activeFilter.slice(0, -1).slice(1)} `}Folder
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const SortableItem = ({
  id,
  children,
  isActive = false,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isActive ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-manipulation transition-all duration-300",
        isActive ? "scale-105 shadow-xl rotate-1" : "scale-100",
      )}
    >
      {children}
    </div>
  );
};

export default DashboardGrid;
