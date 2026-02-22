import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/popup/components/ui/dialog";
import { Button } from "@/popup/components/ui/button";

export interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string | string[];
}

/**
 * Shared modal for user-facing messages (import results, errors, success).
 * Single "OK" action to close.
 */
export function MessageModal({
  open,
  onOpenChange,
  title = "Message",
  message,
}: MessageModalProps) {
  const lines = Array.isArray(message) ? message : [message];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] max-w-sm p-4"
      >
        <DialogTitle className="text-base font-semibold">
          {title}
        </DialogTitle>
        <div className="mt-2 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
