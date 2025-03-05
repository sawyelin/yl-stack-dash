import React, { useState, useEffect } from 'react';
import { Folder } from '@/services/widgetService';
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/services/widgetService';
import { ChevronRight, ChevronDown, FolderPlus, Folder as FolderIcon, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription } from './ui/alert';

interface FolderTreeProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId?: string | null;
}

interface FolderNodeProps {
  folder: Folder;
  level: number;
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  onUpdate: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onRefresh: () => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({ 
  folder, 
  level, 
  selectedFolderId, 
  onSelect, 
  onUpdate, 
  onDelete,
  onRefresh 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subFolders, setSubFolders] = useState<Folder[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [editDescription, setEditDescription] = useState(folder.description || '');
  const [editType, setEditType] = useState(folder.type);
  const { toast } = useToast();

  useEffect(() => {
    if (isExpanded) {
      loadSubFolders();
    }
  }, [isExpanded, folder.id]);

  const loadSubFolders = async () => {
    try {
      const folders = await getFolders(folder.id);
      setSubFolders(folders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subfolders",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      const updatedFolder: Folder = {
        ...folder,
        name: editName,
        description: editDescription,
        type: editType,
        updatedAt: new Date().toISOString()
      };
      
      await updateFolder(folder.id, {
        name: editName,
        description: editDescription,
        type: editType
      });
      
      onUpdate(updatedFolder);
      setIsEditing(false);
      onRefresh();
      
      toast({
        title: "Success",
        description: "Folder updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div
        className={`flex items-center p-2 hover:bg-accent rounded-md transition-colors ${
          selectedFolderId === folder.id ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <button
          className="p-1 hover:bg-accent-foreground/10 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 w-40"
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              className="h-8 flex-1"
            />
            <Select
              value={editType}
              onValueChange={(value: any) => setEditType(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="link">Links</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="credential">Credentials</SelectItem>
                <SelectItem value="tagged">Tagged</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div 
              className="flex-1 flex items-center gap-2 cursor-pointer" 
              onClick={() => onSelect(folder.id)}
            >
              <FolderIcon size={16} className="mx-2" />
              <span className="font-medium">{folder.name}</span>
              {folder.description && (
                <span className="text-sm text-muted-foreground">
                  ({folder.description})
                </span>
              )}
              <span className="text-xs px-2 py-1 bg-accent rounded-full">
                {folder.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={async () => {
                  try {
                    await onDelete(folder.id);
                    onRefresh();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete folder",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
      
      {isExpanded && (
        <div>
          {subFolders.map((subFolder) => (
            <FolderNode
              key={subFolder.id}
              folder={subFolder}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ onSelectFolder, selectedFolderId: propSelectedFolderId }) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(propSelectedFolderId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    description: '',
    parentId: null as string | null,
    type: 'general' as 'general' | 'link' | 'note' | 'credential' | 'tagged'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (propSelectedFolderId !== undefined) {
      setSelectedFolderId(propSelectedFolderId);
    }
  }, [propSelectedFolderId]);

  const loadFolders = async () => {
    try {
      setError(null);
      const loadedFolders = await getFolders();
      setFolders(loadedFolders);
    } catch (error) {
      setError("Failed to load folders. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive"
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderData.name.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setError(null);
      await createFolder(
        newFolderData.name,
        newFolderData.description,
        newFolderData.parentId,
        newFolderData.type
      );
      
      await loadFolders();
      setNewFolderData({
        name: '',
        description: '',
        parentId: null,
        type: 'general'
      });
      setIsCreating(false);
      
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      setError("Failed to create folder. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFolder = async (updatedFolder: Folder) => {
    try {
      setError(null);
      await updateFolder(updatedFolder.id, {
        name: updatedFolder.name,
        description: updatedFolder.description,
        type: updatedFolder.type
      });
      await loadFolders();
    } catch (error) {
      setError("Failed to update folder. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      setError(null);
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
        onSelectFolder(null);
      }
      await loadFolders();
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      });
    } catch (error) {
      setError("Failed to delete folder. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  const handleSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    onSelectFolder(folderId);
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Folders</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <FolderPlus size={16} />
          New Folder
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newFolderData.name}
                onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Folder name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newFolderData.description}
                onChange={(e) => setNewFolderData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={newFolderData.type}
                onValueChange={(value: any) => 
                  setNewFolderData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="credential">Credentials</SelectItem>
                  <SelectItem value="tagged">Tagged Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Parent Folder</Label>
              <Select
                value={newFolderData.parentId || ''}
                onValueChange={(value) => 
                  setNewFolderData(prev => ({ ...prev, parentId: value || null }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Parent</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        <div
          className={`flex items-center p-2 cursor-pointer hover:bg-accent rounded-md transition-colors ${
            selectedFolderId === null ? 'bg-accent' : ''
          }`}
          onClick={() => {
            setSelectedFolderId(null);
            onSelectFolder(null);
          }}
        >
          <FolderIcon size={16} className="mx-2" />
          <span className="font-medium">All Items</span>
        </div>
        
        {folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            level={1}
            selectedFolderId={selectedFolderId}
            onSelect={handleSelect}
            onUpdate={handleUpdateFolder}
            onDelete={handleDeleteFolder}
            onRefresh={loadFolders}
          />
        ))}
      </div>
    </div>
  );
}; 