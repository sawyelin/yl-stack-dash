import React from "react";
import { Loader2, AlertCircle, RefreshCw, Plus, Sparkles, ChevronLeft, FolderPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FolderCard from "../FolderCard";
import WidgetCard from "../WidgetCard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  // Filter widgets based on selected folder and active filter
  const getFilteredWidgets = () => {
    if (!widgets || !Array.isArray(widgets)) return [];
    let filtered = widgets;
    
    // First filter by folder
    if (selectedFolderId && Array.isArray(folders)) {
      // Get all descendant folder IDs recursively
      const getDescendantFolderIds = (folderId: string): string[] => {
        const directChildren = folders
          .filter(f => f.parent_id === folderId)
          .map(f => f.id);
        
        const allDescendants = [...directChildren];
        directChildren.forEach(childId => {
          allDescendants.push(...getDescendantFolderIds(childId));
        });
        
        return allDescendants;
      };

      // Get all valid folder IDs (current folder and all its descendants)
      const validFolderIds = [selectedFolderId, ...getDescendantFolderIds(selectedFolderId)];
      
      // Filter items that belong to any of these folders
      filtered = filtered.filter(widget => 
        validFolderIds.includes(widget.folder_id || "")
      );
    } else {
      // When in root, ONLY show items that have no folder
      filtered = filtered.filter(widget => !widget.folder_id);
    }

    // Then filter by type
    if (activeFilter !== "all") {
      const typeMap: { [key: string]: string } = {
        "links": "link",
        "notes": "note",
        "credentials": "credential",
        "tags": "tagged"
      };
      filtered = filtered.filter(widget => widget.type === typeMap[activeFilter]);
    }

    return filtered;
  };

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

  const filteredFolders = getFilteredFolders();
  const filteredWidgets = getFilteredWidgets();
  const currentFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading items...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no items and no folders
  if (!isLoading && filteredWidgets.length === 0 && filteredFolders.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No items found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedFolderId 
                ? "This folder is empty. Add some items to get started."
                : "No items found. Add some items or create folders to get started."}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={onAddItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
              {!selectedFolderId && (
                <Button onClick={onAddFolder} variant="outline" className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header with Action Buttons */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFolderId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onFolderSelect(null)}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              {selectedFolderId 
                ? currentFolder?.name
                : activeFilter === "all" 
                  ? "All Items" 
                  : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
            </h2>
          </div>
          <div className="flex gap-2">
            {!selectedFolderId && (
              <Button onClick={onAddFolder} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            )}
            <Button onClick={onAddItem} variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Show Folders if not inside a folder */}
          {!selectedFolderId && filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              id={folder.id}
              name={folder.name}
              type={folder.type}
              itemCount={getFolderItemCount(folder.id)}
              isSelected={selectedFolderId === folder.id}
              onSelect={onFolderSelect}
              onEdit={() => onFolderEdit(folder)}
              onDelete={() => onFolderDelete(folder.id)}
            />
          ))}

          {/* Show Items */}
          <DragDropContext onDragEnd={onWidgetMove}>
            <Droppable droppableId="dashboard" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="contents"
                >
                  {filteredWidgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <WidgetCard
                            id={widget.id}
                            title={widget.title}
                            content={widget.content}
                            type={widget.type}
                            tags={widget.tags}
                            url={widget.url}
                            isProtected={widget.isProtected}
                            onEdit={() => onWidgetEdit(widget)}
                            onDelete={() => onWidgetDelete(widget)}
                            onView={() => onWidgetView(widget)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
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
