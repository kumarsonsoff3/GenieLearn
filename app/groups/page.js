"use client";

import ProtectedRoute from "../../src/components/auth/ProtectedRoute";
import GroupsView from "../../src/components/GroupsView";

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsView />
    </ProtectedRoute>
  );
}
