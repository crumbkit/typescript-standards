import { RotateCw } from "lucide-react";
import { describeFailure } from "@/api/failure";
import { Button } from "@/components/ui/button";

type Props = { error: unknown; notFound: string; onRetry: () => void };

/** The one way a screen shows a failed request (APP-13). */
export function Failure({ error, notFound, onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3">
      <p>{describeFailure(error, notFound)}</p>
      <Button variant="outline" onClick={onRetry}>
        <RotateCw aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
