import { Spinner } from "@/popup/components/ui/spinner";

export function LoadingSpinner({
  className,
}: {
  className?: string;
}) {
  return <Spinner className={className} />;
}
