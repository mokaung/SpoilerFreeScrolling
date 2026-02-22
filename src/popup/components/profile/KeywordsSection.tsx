import { useState } from "react";
import { Button } from "@/popup/components/ui/button";
import { WarningModal } from "@/popup/components/shared/WarningModal";
import type { KeyWordRule } from "@/shared/types";

function riskColorClass(riskLevel: number): string {
  if (riskLevel <= 3) return "text-green-600";
  if (riskLevel <= 6) return "text-yellow-600";
  return "text-red-600";
}

export interface KeywordsSectionProps {
  keywords: KeyWordRule[];
  onRegenerate?: () => void;
}

export function KeywordsSection({ keywords, onRegenerate }: KeywordsSectionProps) {
  const [revealed, setRevealed] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const handleViewClick = () => {
    setWarningOpen(true);
  };

  const handleWarningConfirm = () => {
    setRevealed(true);
    setWarningOpen(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Viewing the list below may reveal spoilers.
      </p>
      {!revealed ? (
        <Button variant="outline" size="sm" onClick={handleViewClick}>
          View keywords
        </Button>
      ) : (
        <div className="space-y-2">
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No keywords yet. Use Regenerate to generate.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {keywords.map((kw, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>{kw.term}</span>
                  <span className={riskColorClass(kw.riskLevel)}>
                    {kw.riskLevel}/10
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <WarningModal
        open={warningOpen}
        onOpenChange={setWarningOpen}
        onConfirm={handleWarningConfirm}
      />
    </div>
  );
}
