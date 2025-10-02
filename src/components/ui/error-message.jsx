import React from "react";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const ErrorMessage = ({
  type = "error",
  message,
  onRetry,
  className = "",
  showIcon = true,
}) => {
  const typeConfig = {
    error: {
      icon: AlertCircle,
      className: "border-red-200 bg-red-50 text-red-800",
      iconClassName: "text-red-500",
    },
    success: {
      icon: CheckCircle,
      className: "border-green-200 bg-green-50 text-green-800",
      iconClassName: "text-green-500",
    },
    info: {
      icon: Info,
      className: "border-blue-200 bg-blue-50 text-blue-800",
      iconClassName: "text-blue-500",
    },
    warning: {
      icon: AlertTriangle,
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
      iconClassName: "text-yellow-500",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} ${className}`}>
      <div className="flex items-start space-x-2">
        {showIcon && (
          <Icon className={`h-4 w-4 mt-0.5 ${config.iconClassName}`} />
        )}
        <div className="flex-1">
          <AlertDescription className="text-sm">{message}</AlertDescription>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export { ErrorMessage };
