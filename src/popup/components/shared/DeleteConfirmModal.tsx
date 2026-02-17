import React from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

export interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete this profile?",
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-lg">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleConfirm}
              className="bg-red-600 hover:opacity-90"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
