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
import { Link, FileText, Key, Tag, Plus, X, Lock, ExternalLink, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Folder } from "@/services/folderService";

type WidgetType = "link" | "note" | "credential" | "tagged";

interface Widget {
  id: string;
  title: string;
  content: string;
  type: WidgetType;
  tags: string[];
  url?: string;
  isProtected?: boolean;
  folder_id?: string | null;
}

interface ItemModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit" | "view";
  activeType?: WidgetType;
  item?: Widget;
  folders?: Folder[];
  folder_id?: string | null;
  defaultFolderId?: string | null;
  onSave?: (item: Widget) => void;
  onDelete?: (widget: Widget) => void;
}

const ItemModal = ({
  open = false,
  onOpenChange = () => {},
  mode = "add",
  activeType = "note",
  item,
  folders = [],
  folder_id = null,
  defaultFolderId = null,
  onSave = () => {},
  onDelete = () => {},
}: ItemModalProps) => {
  const [formData, setFormData] = useState<Widget>({
    id: item?.id || "",
    title: item?.title || "",
    content: item?.content || "",
    type: item?.type || activeType,
    tags: item?.tags || [],
    url: item?.url || "",
    isProtected: item?.isProtected || false,
    folder_id: item?.folder_id || folder_id || defaultFolderId,
  });
  const [newTag, setNewTag] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "add") {
      setFormData({
        id: "",
        title: "",
        content: "",
        type: activeType,
        tags: [],
        url: "",
        isProtected: false,
        folder_id: folder_id || defaultFolderId,
      });
    } else if (item) {
      setFormData({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type,
        tags: item.tags || [],
        url: item.url || "",
        isProtected: item.isProtected || false,
        folder_id: item.folder_id || folder_id || defaultFolderId,
      });
    }
  }, [mode, item, activeType, folder_id, defaultFolderId]);

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
    if (checked) {
      setShowPinModal(true);
    } else {
      setFormData(prev => ({ ...prev, isProtected: false }));
      // Remove PIN when disabling protection
      if (formData.id) {
        localStorage.removeItem(`credential_pin_${formData.id}`);
      }
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setPinError("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    // Store the PIN and update form data
    if (formData.id) {
      localStorage.setItem(`credential_pin_${formData.id}`, pin);
    }
    setFormData(prev => ({ ...prev, isProtected: true }));
    setShowPinModal(false);
    setPin("");
    setConfirmPin("");
    setPinError(null);
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
      // Reset form after adding but keep the current folder_id
      const currentFolderId = formData.folder_id;
      setFormData({
        id: "",
        title: "",
        content: "",
        type: activeType,
        tags: [],
        url: "",
        isProtected: false,
        folder_id: currentFolderId, // Keep the current folder_id
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
  const isEditMode = mode === "edit";

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common fields for all types */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center gap-2">
                Title
                {isViewMode && formData.isProtected && (
                  <Lock className="h-4 w-4 text-amber-500" />
                )}
              </Label>
              <div className={cn(
                "mt-1",
                isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
              )}>
                {isViewMode ? formData.title : (
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter title"
                    disabled={isViewMode}
                    required
                  />
                )}
              </div>
            </div>

            {/* Type-specific content fields */}
            {formData.type === "link" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <div className={cn(
                    "mt-1",
                    isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
                  )}>
                    {isViewMode ? (
                      <>
                        <span className="text-blue-500">{formData.url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(formData.url, "_blank")}
                          className="ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Input
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        disabled={isViewMode}
                        required
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Description</Label>
                  <div className={cn(
                    "mt-1",
                    isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                  )}>
                    {isViewMode ? formData.content : (
                      <Textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Enter a description"
                        disabled={isViewMode}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {formData.type === "note" && (
              <div>
                <Label htmlFor="content">Note Content</Label>
                <div className={cn(
                  "mt-1",
                  isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 whitespace-pre-wrap"
                )}>
                  {isViewMode ? formData.content : (
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter your note"
                      className="min-h-[150px]"
                      disabled={isViewMode}
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {formData.type === "credential" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Credential</Label>
                  <div className={cn(
                    "mt-1",
                    isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                  )}>
                    {isViewMode && formData.isProtected ? (
                      <div className="flex items-center text-amber-600 dark:text-amber-400">
                        <Lock className="h-4 w-4 mr-2" />
                        Protected content
                      </div>
                    ) : (
                      isViewMode ? (
                        <div className="whitespace-pre-wrap">{formData.content}</div>
                      ) : (
                        <Textarea
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          placeholder="Enter credential information"
                          disabled={isViewMode}
                          required
                        />
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isProtected"
                    checked={formData.isProtected}
                    onCheckedChange={handleProtectedChange}
                    disabled={isViewMode}
                  />
                  <Label htmlFor="isProtected">Password Protected</Label>
                </div>
              </div>
            )}

            {formData.type === "tagged" && (
              <div>
                <Label htmlFor="content">Content</Label>
                <div className={cn(
                  "mt-1",
                  isViewMode && "p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 whitespace-pre-wrap"
                )}>
                  {isViewMode ? formData.content : (
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter content"
                      disabled={isViewMode}
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {/* Tags section */}
            <div>
              <Label className="mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className={cn(
                      "px-2 py-1 rounded-full text-sm flex items-center gap-1",
                      isViewMode ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" :
                      "bg-primary/10 text-primary dark:bg-primary/20"
                    )}
                  >
                    {tag}
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-primary/20"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isViewMode && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Folder selection */}
            {!isViewMode && folders.length > 0 && (
              <div>
                <Label htmlFor="folder">Folder (Optional)</Label>
                <Select
                  value={formData.folder_id || "root"}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    folder_id: value === "root" ? null : value 
                  }))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">
                      <span>No Folder</span>
                    </SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <FolderIcon className="h-4 w-4" />
                          <span>{folder.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            {isViewMode ? (
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {mode === "add" ? "Add Item" : "Save Changes"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>

        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90vw] max-w-md space-y-4">
              <h3 className="text-lg font-semibold">Set PIN Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter a 4-digit PIN to protect this credential
              </p>
              <div className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setPin(value);
                      setPinError(null);
                    }}
                    className="text-center text-2xl tracking-widest"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm 4-digit PIN"
                    value={confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setConfirmPin(value);
                      setPinError(null);
                    }}
                    className="text-center text-2xl tracking-widest"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
                {pinError && (
                  <div className="text-sm text-red-500">{pinError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPinModal(false);
                      setPin("");
                      setConfirmPin("");
                      setPinError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4 || confirmPin.length !== 4}
                  >
                    Set PIN
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ItemModal;
