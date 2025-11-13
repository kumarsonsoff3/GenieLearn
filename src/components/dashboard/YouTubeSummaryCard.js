"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Youtube,
  Loader2,
  Sparkles,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { trackNoteCreate } from "../../utils/activityTracker";

const YouTubeSummaryCard = ({ compact = false }) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSummarize = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);
    setSaved(false);

    try {
      const response = await fetch("/api/ai/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Pass the full error object if it has suggestions, otherwise just the message
        if (errorData.suggestions || errorData.videoUrl) {
          throw errorData;
        }
        throw new Error(errorData.error || "Failed to summarize video");
      }

      const data = await response.json();
      setSummary(data);
      setModalOpen(true); // Open modal when summary is ready
    } catch (err) {
      // Handle both string errors and structured error objects
      if (typeof err === "string") {
        setError(err);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = async () => {
    if (!summary) return;

    setSaving(true);
    setError(null);

    try {
      // Use video title from API response
      const title = summary.videoTitle || "YouTube Video Summary";

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: summary.summary,
          source_type: "youtube",
          source_url: summary.youtubeUrl,
          tags: ["youtube", "video-summary"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      const data = await response.json();

      // Track activity
      if (data.note) {
        trackNoteCreate(data.note.$id, title, "youtube");
      }

      setSaved(true);

      // Reset saved state after 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter" && !loading) {
      handleSummarize();
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Paste YouTube URL to summarize..."
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 bg-white"
          />
          <Button
            onClick={handleSummarize}
            disabled={loading || !youtubeUrl.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Summarize
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {typeof error === "string"
                    ? error
                    : error.message || "An error occurred"}
                </p>
                {error.suggestions && error.suggestions.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="font-medium mb-1">Try these solutions:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      {error.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Summary Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Video Summary
            </DialogTitle>
          </DialogHeader>

          {saved && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                Summary saved to your notes successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto">
            {summary && (
              <div className="prose prose-sm max-w-none p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.summary}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(summary?.youtubeUrl, "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Watch Video
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveToNotes}
                disabled={saving || saved}
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <BookmarkPlus className="h-3 w-3 mr-1" />
                )}
                {saved ? "Saved!" : "Save to Notes"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default YouTubeSummaryCard;
