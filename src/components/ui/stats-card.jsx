import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend = null,
  trendValue = null,
  description,
  color = "blue",
  className,
  onClick,
  isClickable = false,
  loading = false,
}) => {
  const colorVariants = {
    blue: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      border: "border-blue-200 dark:border-blue-700",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-700 dark:text-blue-300",
      value: "text-blue-800 dark:text-blue-200",
    },
    green: {
      bg: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      border: "border-green-200 dark:border-green-700",
      icon: "text-green-600 dark:text-green-400",
      text: "text-green-700 dark:text-green-300",
      value: "text-green-800 dark:text-green-200",
    },
    orange: {
      bg: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
      border: "border-orange-200 dark:border-orange-700",
      icon: "text-orange-600 dark:text-orange-400",
      text: "text-orange-700 dark:text-orange-300",
      value: "text-orange-800 dark:text-orange-200",
    },
    purple: {
      bg: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      border: "border-purple-200 dark:border-purple-700",
      icon: "text-purple-600 dark:text-purple-400",
      text: "text-purple-700 dark:text-purple-300",
      value: "text-purple-800 dark:text-purple-200",
    },
  };

  const colorScheme = colorVariants[color] || colorVariants.blue;

  const getTrendIcon = () => {
    if (!trend || trend === "neutral") return <Minus className="h-3 w-3" />;
    return trend === "up" ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-gray-500";
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  return (
    <Card
      className={cn(
        "bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 group",
        colorScheme.bg,
        colorScheme.border,
        isClickable && "cursor-pointer hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-sm font-medium", colorScheme.text)}>
                {title}
              </p>
              {Icon && <Icon className={cn("h-6 w-6", colorScheme.icon)} />}
            </div>

            <div className="flex items-end gap-2 mb-2">
              <p className={cn("text-3xl font-bold", colorScheme.value)}>
                {value}
              </p>
              {trend && trendValue && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    getTrendColor()
                  )}
                >
                  {getTrendIcon()}
                  <span className="ml-1">{trendValue}</span>
                </div>
              )}
            </div>

            {description && (
              <p className={cn("text-xs", colorScheme.text)}>{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { StatsCard };
