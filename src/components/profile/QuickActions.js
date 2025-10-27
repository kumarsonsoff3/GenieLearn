import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { BookOpen, User, Plus } from "lucide-react";
import { CreateGroupModal } from "../shared";

const QuickActions = ({ navigate, onGroupCreated }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {/* Browse Groups */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
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
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          }
          onGroupCreated={onGroupCreated}
          buttonClassName="w-full justify-start"
        />

        {/* Find Friends */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => navigate.push("/groups")}
        >
          <User className="h-4 w-4 mr-2" />
          Find Friends
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
