import React from "react";

const LoadingSpinner = ({ size = "md", className = "", children }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      ></div>
      {children && <span className="text-sm text-gray-600">{children}</span>}
    </div>
  );
};

export { LoadingSpinner };
