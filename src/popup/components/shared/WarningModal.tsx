import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/popup/components/ui/dialog";
import { Button } from "@/popup/components/ui/button";

export interface WarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * Spoiler warning modal shown before revealing keywords. Confirm proceeds; Cancel closes.
 */
export function WarningModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Spoiler warning",
  description = "Viewing keywords may reveal spoilers. View anyway?",
  confirmLabel = "View anyway",
}: WarningModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] max-w-sm p-4"
      >
        <DialogTitle className="text-base font-semibold">
          {title}
        </DialogTitle>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="accent" size="sm" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
