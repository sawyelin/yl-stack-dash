import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, AlertCircle, Check } from "lucide-react";

interface CredentialAccessModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  credentialId?: string;
  credentialTitle?: string;
  onPasswordSubmit?: (
    password: string,
    credentialId: string,
  ) => Promise<boolean>;
}

const CredentialAccessModal = ({
  isOpen = true,
  onClose = () => {},
  credentialId = "credential-1",
  credentialTitle = "Protected Credential",
  onPasswordSubmit = async () => true,
}: CredentialAccessModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onPasswordSubmit(password, credentialId);

      if (success) {
        setIsSuccess(true);
        setDecryptedContent(
          "Example username: user123\nExample password: secureP@ssw0rd",
        );
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (decryptedContent) {
      navigator.clipboard.writeText(decryptedContent);
      // You could add a toast notification here
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setPassword("");
    setShowPassword(false);
    setError(null);
    setIsSuccess(false);
    setDecryptedContent(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-500" />
            {credentialTitle}
          </DialogTitle>
          <DialogDescription>
            This credential is password protected. Enter the password to view
            the content.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pr-10"
                  autoFocus
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={toggleShowPassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Unlock"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-gray-100 dark:bg-gray-700 p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {decryptedContent}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleCopyToClipboard}>
                <Check className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CredentialAccessModal;
