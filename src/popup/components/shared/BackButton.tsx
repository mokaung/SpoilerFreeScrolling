import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/popup/components/ui/button";

export interface BackButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export function BackButton({ onClick, children = "Back" }: BackButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="self-start -ml-1 text-gray-600 hover:text-gray-900"
    >
      <ChevronLeft className="h-4 w-4 shrink-0" />
      {children}
    </Button>
  );
}
