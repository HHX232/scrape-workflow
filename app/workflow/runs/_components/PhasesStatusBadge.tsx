import { ExecutionStatus } from "@/types/workflow";
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon, Loader2Icon } from "lucide-react";
export default function PhaseStatusBadge({
  status,
}: {
  status: ExecutionStatus;
}) {
  switch (status) {
    case ExecutionStatus.PENDING:
      return <CircleDashedIcon size={20} className="stroke-muted-foreground" />;
    case ExecutionStatus.RUNNING:
      return (
        <Loader2Icon size={20} className="animate-spin stroke-yellow-500" />
      );
    case ExecutionStatus.FAILED:
      return <CircleXIcon size={20} className="stroke-destructive" />;
    case ExecutionStatus.COMPLETED:
      return <CircleCheckIcon size={20} className="stroke-green-500" />;
    default:
      return <div className="rounded-full">{status}</div>;
  }
}
