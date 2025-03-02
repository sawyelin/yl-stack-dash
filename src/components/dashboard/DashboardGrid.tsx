import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import WidgetCard from "./widgets/WidgetCard";
import AddItemButton from "./AddItemButton";
import { Loader2, AlertCircle, RefreshCw, Plus, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WidgetType = "link" | "note" | "credential" | "tagged";

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
}

interface DashboardGridProps {
  widgets?: Widget[];
  onAddItem?: () => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onViewItem?: (id: string) => void;
  onReorderItems?: (items: Widget[]) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const DashboardGrid = ({
  widgets = [],
  onAddItem = () => {},
  onEditItem = () => {},
  onDeleteItem = () => {},
  onViewItem = () => {},
  onReorderItems = () => {},
  isLoading = false,
  error = null,
  onRefresh = () => {},
}: DashboardGridProps) => {
  const [items, setItems] = useState<Widget[]>(widgets);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Update items when widgets prop changes
  useEffect(() => {
    setItems(widgets);
  }, [widgets]);

  // Configure sensors for better touch/mouse handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorderItems(newItems);
    }
  };

  // Empty state when no widgets
  if (!isLoading && items.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 rounded-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Vault is Empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by adding your first item to your secure dashboard.
          </p>
          <Button
            onClick={onAddItem}
            className="mx-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Item
          </Button>
        </div>
        <AddItemButton onClick={onAddItem} position="bottom-right" />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Loading your secure dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col items-center justify-center gap-4">
        <Alert
          variant="destructive"
          className="max-w-md bg-destructive/10 border-destructive/30"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-2 mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <AddItemButton onClick={onAddItem} position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 overflow-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {items.map((widget) => (
              <SortableItem
                key={widget.id}
                id={widget.id}
                isActive={activeId === widget.id}
              >
                <WidgetCard
                  id={widget.id}
                  title={widget.title}
                  content={widget.content}
                  type={widget.type}
                  tags={widget.tags}
                  url={widget.url}
                  isProtected={widget.isProtected}
                  createdAt={widget.createdAt}
                  updatedAt={widget.updatedAt}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onView={onViewItem}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddItemButton onClick={onAddItem} />
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
