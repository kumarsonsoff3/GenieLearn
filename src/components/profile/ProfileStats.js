import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3 } from "lucide-react";
import { formatStudyTime } from "../../lib/utils";

const ProfileStats = ({ stats, formData, onRefreshStats }) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-gray-600" />
          <span>Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Groups Joined */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Groups</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.groupsJoined}
            </span>
          </div>

          {/* Messages Sent */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Messages</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.messagesSent}
            </span>
          </div>

          {/* Subjects */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Interests</span>
            <span className="text-lg font-semibold text-gray-900">
              {formData.subjects_of_interest.length}
            </span>
          </div>

          {/* Study Hours */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Study Time</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatStudyTime(stats.totalStudyMinutes)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
