import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Star } from "lucide-react";
import { formatStudyTime } from "../../lib/utils";

const ProfileStats = ({ stats, formData, onRefreshStats }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-600" />
          <span>Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Groups Joined */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Groups Joined</span>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {stats.groupsJoined}
            </span>
          </div>

          {/* Messages Sent */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Messages Sent</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              {stats.messagesSent}
            </span>
          </div>

          {/* Subjects */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Subjects</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {formData.subjects_of_interest.length}
            </span>
          </div>

          {/* Study Hours */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Study Time</span>
            </div>
            <span className="text-xl font-bold text-orange-600">
              {formatStudyTime(stats.totalStudyMinutes)}
            </span>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Statistics update as you engage with the platform
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshStats}
            className="mt-2 text-xs"
          >
            Refresh Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
