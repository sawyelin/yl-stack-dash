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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, Link, FileText, Key, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type FolderType = "link" | "note" | "credential" | "tagged" | "all";

interface FolderModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "add" | "edit";
  activeType?: FolderType;
  folder?: {
    id: string;
    name: string;
    type: FolderType;
    parent_id: string | null;
  };
  parentFolders?: Array<{
    id: string;
    name: string;
    type: FolderType;
  }>;
  onSave?: (folder: any) => void;
  onDelete?: (id: string) => void;
}

const FolderModal = ({
  open = false,
  onOpenChange = () => {},
  mode = "add",
  activeType = "all",
  folder,
  parentFolders = [],
  onSave = () => {},
  onDelete = () => {},
}: FolderModalProps) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: activeType,
    parent_id: null as string | null,
  });

  useEffect(() => {
    if (mode === "add") {
      setFormData({
        id: "",
        name: "",
        type: activeType,
        parent_id: null,
      });
    } else if (folder) {
      setFormData({
        id: folder.id,
        name: folder.name,
        type: folder.type,
        parent_id: folder.parent_id,
      });
    }
  }, [mode, folder, activeType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: FolderType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleParentChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      parent_id: value === "root" ? null : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (mode === "add") {
      setFormData({
        id: "",
        name: "",
        type: activeType,
        parent_id: null,
      });
    }
    onOpenChange(false);
  };

  const getTypeIcon = (type: FolderType) => {
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
        return <Folder className="h-5 w-5 text-gray-500" />;
    }
  };

  const getModalTitle = () => {
    return mode === "add" ? "Create New Folder" : "Edit Folder";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(formData.type)}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new folder to organize your items."
              : "Make changes to your folder."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter folder name"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Folder Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleTypeChange(value as FolderType)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select folder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span>All Types</span>
                  </div>
                </SelectItem>
                <SelectItem value="link">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-500" />
                    <span>Links</span>
                  </div>
                </SelectItem>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>Notes</span>
                  </div>
                </SelectItem>
                <SelectItem value="credential">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-amber-500" />
                    <span>Credentials</span>
                  </div>
                </SelectItem>
                <SelectItem value="tagged">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <span>Tagged Items</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {parentFolders.length > 0 && (
            <div>
              <Label htmlFor="parent">Parent Folder (Optional)</Label>
              <Select
                value={formData.parent_id === null ? "root" : formData.parent_id}
                onValueChange={(value) => handleParentChange(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <span>No Parent (Root)</span>
                  </SelectItem>
                  {parentFolders.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(parent.type)}
                        <span>{parent.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(formData.id);
                  onOpenChange(false);
                }}
              >
                Delete Folder
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "add" ? "Create Folder" : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderModal; 