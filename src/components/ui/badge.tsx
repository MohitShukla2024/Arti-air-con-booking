import * as React from "react";
import { cn } from "@/lib/utils";
import { BookingStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: BookingStatus | "UPCOMING" | string;
}

export function Badge({ className, status = "PENDING", children, ...props }: BadgeProps) {
  const getBadgeStyle = (statusKey: string) => {
    switch (statusKey) {
      case "UPCOMING":
        return "bg-[#dae1ff] text-[#001849] border border-[#0066ff]/20";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "ACCEPTED":
      case "EN_ROUTE":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-[#eceef0] text-[#424656]";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        getBadgeStyle(status),
        className
      )}
      {...props}
    >
      {status === "PENDING" && (
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
      )}
      {status === "ACCEPTED" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
      )}
      {children || status}
    </div>
  );
}
