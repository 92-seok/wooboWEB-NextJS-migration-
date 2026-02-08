import React from "react";
import { Badge } from "./badge";
import { RotateCw, Clock } from "lucide-react";

interface DataSyncIndicatorProps {
  loading: boolean;
  lastUpdated: Date | null;
  variant?: "indigo" | "red" | "green" | "blue";
}

export const DataSyncIndicator: React.FC<DataSyncIndicatorProps> = ({
  loading,
  lastUpdated,
  variant = "indigo",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "red":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      case "green":
        return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "indigo":
      default:
        return "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <Badge
        variant="outline"
        className={`${getVariantClasses()} font-bold rounded-lg px-2 gap-1.5 animate-pulse`}
      >
        <RotateCw className="h-3 w-3 animate-spin" />
        <span className="text-[10px]">동기화 중...</span>
      </Badge>
    );
  }

  if (lastUpdated) {
    return (
      <Badge
        variant="outline"
        className={`${getVariantClasses()} font-bold rounded-lg px-2 gap-1.5`}
      >
        <Clock className="h-3 w-3" />
        <span className="text-[10px] font-mono">{formatTime(lastUpdated)}</span>
      </Badge>
    );
  }

  return null;
};
