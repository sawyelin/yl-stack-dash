import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, FileText, Key, Tag, Plus, X } from "lucide-react";

type WidgetType = "link" | "note" | "credential" | "tagged";

interface ItemModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit" | "view";
  item?: {
    id: string;
    title: string;
    content: string;
    type: WidgetType;
    tags: string[];
    url?: string;
    isProtected?: boolean;
  };
  onSave?: (item: any) => void;
  onDelete?: (id: string) => void;
}

const ItemModal = ({
  open = true,
  onOpenChange = () => {},
  mode = "add",
  item = {
    id: "",
    title: "",
    content: "",
    type: "note" as WidgetType,
    tags: [],
    url: "",
    isProtected: false,
  },
  onSave = () => {},
  onDelete = () => {},
}: ItemModalProps) => {
  const [formData, setFormData] = useState({ ...item });

  // Only set default content when adding a new item and the type changes
  useEffect(() => {
    if (mode === "add" && !formData.content) {
      let defaultContent = "";
      if (formData.type === "link") {
        defaultContent = "A useful link to bookmark for future reference.";
      } else if (formData.type === "note") {
        defaultContent =
          "Write your notes here. This can include important information, reminders, or any text you want to save.";
      } else if (formData.type === "credential") {
        defaultContent =
          "Username: your_username\nPassword: your_password\nWebsite: example.com\nNotes: Add any additional information here.";
      } else if (formData.type === "tagged") {
        defaultContent =
          "This is a tagged item that can be organized with multiple tags for easy filtering and searching.";
      }
      setFormData((prev) => ({ ...prev, content: defaultContent }));
    }
  }, [formData.type, mode]);

  const [newTag, setNewTag] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: WidgetType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleProtectedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isProtected: checked }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (mode === "add") {
      // Reset form after adding
      setFormData({
        id: "",
        title: "",
        content: "",
        type: "note",
        tags: [],
        url: "",
        isProtected: false,
      });
    }
    onOpenChange(false);
  };

  const getTypeIcon = (type: WidgetType) => {
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

  const getModalTitle = () => {
    switch (mode) {
      case "add":
        return "Add New Item";
      case "edit":
        return "Edit Item";
      case "view":
        return "View Item";
      default:
        return "Item Details";
    }
  };

  const isViewMode = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.type && getTypeIcon(formData.type)}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new item for your dashboard."
              : mode === "edit"
                ? "Make changes to your item."
                : "View details of your item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {mode === "add" && (
            <div className="mb-6">
              <Label htmlFor="type">Item Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as WidgetType)}
                disabled={isViewMode}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-500" />
                      <span>Link</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>Note</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="credential">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-500" />
                      <span>Credential</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tagged">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-500" />
                      <span>Tagged Item</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Tabs
            defaultValue={formData.type}
            value={formData.type}
            className="w-full"
            onValueChange={(value) => handleTypeChange(value as WidgetType)}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger
                value="link"
                disabled={
                  isViewMode || (mode === "edit" && formData.type !== "link")
                }
              >
                Link
              </TabsTrigger>
              <TabsTrigger
                value="note"
                disabled={
                  isViewMode || (mode === "edit" && formData.type !== "note")
                }
              >
                Note
              </TabsTrigger>
              <TabsTrigger
                value="credential"
                disabled={
                  isViewMode ||
                  (mode === "edit" && formData.type !== "credential")
                }
              >
                Credential
              </TabsTrigger>
              <TabsTrigger
                value="tagged"
                disabled={
                  isViewMode || (mode === "edit" && formData.type !== "tagged")
                }
              >
                Tagged
              </TabsTrigger>
            </TabsList>

            {/* Common fields for all types */}
            <div className="space-y-4 mb-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className="mt-1"
                  disabled={isViewMode}
                  required
                />
              </div>

              {/* Type-specific content fields */}
              <TabsContent value="link" className="mt-0">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="mt-1"
                    disabled={isViewMode}
                    required={formData.type === "link"}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter a description"
                    className="mt-1"
                    disabled={isViewMode}
                  />
                </div>
              </TabsContent>

              <TabsContent value="note" className="mt-0">
                <div>
                  <Label htmlFor="content">Note Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter your note"
                    className="mt-1 min-h-[150px]"
                    disabled={isViewMode}
                    required={formData.type === "note"}
                  />
                </div>
              </TabsContent>

              <TabsContent value="credential" className="mt-0">
                <div>
                  <Label htmlFor="content">Credential</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter credential information"
                    className="mt-1"
                    disabled={isViewMode}
                    required={formData.type === "credential"}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="isProtected"
                    checked={formData.isProtected}
                    onCheckedChange={handleProtectedChange}
                    disabled={isViewMode}
                  />
                  <Label htmlFor="isProtected">Password Protected</Label>
                </div>
              </TabsContent>

              <TabsContent value="tagged" className="mt-0">
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter content"
                    className="mt-1"
                    disabled={isViewMode}
                    required={formData.type === "tagged"}
                  />
                </div>
              </TabsContent>

              {/* Tags section for all types */}
              <div>
                <Label>Tags</Label>
                <div className="flex mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="rounded-r-none"
                    disabled={isViewMode}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-l-none"
                    disabled={isViewMode}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tabs>

          <DialogFooter className="mt-6">
            {mode === "view" ? (
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {mode === "add" ? "Add Item" : "Save Changes"}
                </Button>
              </>
            )}
            {(mode === "edit" || mode === "view") && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(formData.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemModal;
