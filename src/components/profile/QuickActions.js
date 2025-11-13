import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { BookOpen, Plus, Zap } from "lucide-react";
import { CreateGroupModal } from "../shared";

const QuickActions = ({ navigate, onGroupCreated }) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center space-x-2">
          <Zap className="h-4 w-4 text-gray-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {/* Browse Groups */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-gray-300 hover:bg-gray-50"
          onClick={() => navigate.push("/groups")}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Groups
        </Button>

        {/* Create Group Modal */}
        <CreateGroupModal
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-gray-300 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          }
          onGroupCreated={onGroupCreated}
          buttonClassName="w-full justify-start"
        />
      </CardContent>
    </Card>
  );
};

export default QuickActions;
