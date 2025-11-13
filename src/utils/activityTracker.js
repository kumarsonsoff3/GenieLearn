/**
 * Activity Tracker Utility
 * Tracks user activities in localStorage and provides methods to retrieve them
 */

import { escapeHtml } from "./sanitize";

const ACTIVITY_STORAGE_KEY = "genielearn_user_activities";
const MAX_ACTIVITIES = 50; // Keep last 50 activities

/**
 * Get all activities from localStorage
 */
export const getActivities = () => {
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading activities:", error);
    return [];
  }
};

/**
 * Add a new activity
 */
export const addActivity = (type, message, detail, metadata = {}) => {
  try {
    const activities = getActivities();
    const newActivity = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message: escapeHtml(message),
      detail: escapeHtml(detail),
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    activities.unshift(newActivity);

    // Keep only the most recent activities
    const trimmedActivities = activities.slice(0, MAX_ACTIVITIES);
    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(trimmedActivities)
    );

    return newActivity;
  } catch (error) {
    console.error("Error adding activity:", error);
    return null;
  }
};

/**
 * Get recent activities (default: last 10)
 * Sanitizes the data as a defense-in-depth measure
 */
export const getRecentActivities = (limit = 10) => {
  const activities = getActivities();
  return activities.slice(0, limit).map(activity => ({
    ...activity,
    message:
      typeof activity.message === "string"
        ? escapeHtml(activity.message)
        : activity.message,
    detail:
      typeof activity.detail === "string"
        ? escapeHtml(activity.detail)
        : activity.detail,
  }));
};

/**
 * Clear all activities
 */
export const clearActivities = () => {
  try {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing activities:", error);
  }
};

/**
 * Track focus session completion
 */
export const trackFocusSession = minutes => {
  return addActivity(
    "focus",
    `Completed focus session`,
    `${minutes} minutes of focused study`,
    { minutes }
  );
};

/**
 * Track joining a group
 */
export const trackGroupJoin = (groupId, groupName, memberCount) => {
  return addActivity(
    "group_join",
    `Joined ${groupName}`,
    `${memberCount} members`,
    { groupId, groupName: escapeHtml(groupName) }
  );
};

/**
 * Track sending a message
 */
export const trackMessage = (groupId, groupName) => {
  return addActivity(
    "message",
    `Sent a message in ${groupName}`,
    "Group chat activity",
    { groupId, groupName: escapeHtml(groupName) }
  );
};

/**
 * Track file upload
 */
export const trackFileUpload = (groupId, groupName, fileName) => {
  return addActivity("file_upload", `Uploaded file in ${groupName}`, fileName, {
    groupId,
    groupName: escapeHtml(groupName),
    fileName: escapeHtml(fileName),
  });
};

/**
 * Track profile update
 */
export const trackProfileUpdate = (updateType, detail) => {
  return addActivity(
    "profile_update",
    `Updated profile ${updateType}`,
    detail,
    { updateType }
  );
};

/**
 * Track group creation
 */
export const trackGroupCreate = (groupId, groupName) => {
  return addActivity(
    "group_create",
    `Created group ${groupName}`,
    "New study group",
    { groupId, groupName: escapeHtml(groupName) }
  );
};
