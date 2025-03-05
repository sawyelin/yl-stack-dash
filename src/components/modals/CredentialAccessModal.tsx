import React, { useState, useEffect } from "react";
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
import {
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Shield,
  Copy,
  Lock,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CredentialAccessModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  credentialId?: string;
  credentialTitle?: string;
  onPasswordSubmit?: (pin: string, credentialId: string) => Promise<boolean>;
  credentialContent?: string;
}

const CredentialAccessModal = ({
  isOpen = true,
  onClose = () => {},
  credentialId = "credential-1",
  credentialTitle = "Protected Credential",
  onPasswordSubmit = async () => true,
  credentialContent = "",
}: CredentialAccessModalProps) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    // Check if a PIN is already set for this credential
    const storedPin = localStorage.getItem(`credential_pin_${credentialId}`);
    setIsSettingPin(!storedPin);
  }, [credentialId]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    if (isSettingPin) {
      setPin(value);
    } else {
      setPin(value);
    }
    if (error) setError(null);
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setConfirmPin(value);
    if (error) setError(null);
  };

  const toggleShowPin = () => {
    setShowPin(!showPin);
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    // Store the PIN for this credential
    localStorage.setItem(`credential_pin_${credentialId}`, pin);
    setIsSettingPin(false);
    setPin("");
    setConfirmPin("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    const storedPin = localStorage.getItem(`credential_pin_${credentialId}`);
    if (pin !== storedPin) {
      setError("Incorrect PIN");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onPasswordSubmit(pin, credentialId);

      if (success) {
        setIsSuccess(true);
        setDecryptedContent(credentialContent);
      } else {
        setError("Failed to decrypt credential. Please try again.");
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPin("");
    setConfirmPin("");
    setShowPin(false);
    setError(null);
    setIsSuccess(false);
    setDecryptedContent(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t-4 border-t-amber-500 dark:border-t-amber-400 rounded-t-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span>{isSettingPin ? "Set PIN Code" : credentialTitle}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span>
              {isSettingPin
                ? "Set a 4-digit PIN code to protect this credential"
                : "Enter your 4-digit PIN code to view the content"}
            </span>
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={isSettingPin ? handleSetPin : handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-amber-500">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={handlePinChange}
                  className="pl-10 pr-10 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 focus-visible:ring-amber-500 text-center text-2xl tracking-widest"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-amber-600"
                  onClick={toggleShowPin}
                  disabled={isSubmitting}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPin ? "Hide PIN" : "Show PIN"}
                  </span>
                </Button>
              </div>

              {isSettingPin && (
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-amber-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type={showPin ? "text" : "password"}
                    placeholder="Confirm 4-digit PIN"
                    value={confirmPin}
                    onChange={handleConfirmPinChange}
                    className="pl-10 pr-10 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 focus-visible:ring-amber-500 text-center text-2xl tracking-widest"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting || (isSettingPin ? pin.length !== 4 || confirmPin.length !== 4 : pin.length !== 4)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </>
                ) : isSettingPin ? (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Set PIN Code
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Unlock Credential
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 border border-amber-200 dark:border-amber-700">
              <div className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                Decrypted Credential
              </div>
              <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border border-amber-200 dark:border-amber-700 overflow-auto max-h-60">
                {decryptedContent}
              </pre>
            </div>
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-amber-200 dark:border-amber-700"
              >
                Close
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                className={cn(
                  "bg-amber-600 hover:bg-amber-700 text-white transition-all",
                  copied && "bg-green-600 hover:bg-green-700",
                )}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CredentialAccessModal;
