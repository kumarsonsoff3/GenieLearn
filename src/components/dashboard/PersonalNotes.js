"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import {
  BookOpen,
  Search,
  FileText,
  Youtube,
  Edit3,
  Trash2,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Filter,
  Plus,
  Eye,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import FilePreviewModal from "../groups/FilePreviewModal";
import { trackNoteDelete } from "../../utils/activityTracker";

const PersonalNotes = ({ limit, showCreateButton = true }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterType !== "all") {
        params.append("source_type", filterType);
      }
      if (limit) {
        params.append("limit", limit);
      }

      const response = await fetch(`/api/notes?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterType, limit]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes?noteId=${noteToDelete.$id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      // Track activity
      trackNoteDelete(noteToDelete.$id, noteToDelete.title);

      // Remove note from state
      setNotes(notes.filter(note => note.$id !== noteToDelete.$id));
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);

      // Close view modal if the deleted note was being viewed
      if (selectedNote?.$id === noteToDelete.$id) {
        setViewModalOpen(false);
        setSelectedNote(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteConfirm = note => {
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const openViewModal = note => {
    setSelectedNote(note);
    setViewModalOpen(true);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query) ||
      note.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const getSourceIcon = sourceType => {
    switch (sourceType) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-600" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSourceLabel = sourceType => {
    switch (sourceType) {
      case "youtube":
        return "YouTube";
      case "pdf":
        return "PDF";
      case "manual":
        return "Manual";
      default:
        return sourceType;
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get preview of content (first 150 characters)
  const getContentPreview = content => {
    if (!content) return "";
    const plainText = content
      .replace(/#{1,6}\s/g, "")
      .replace(/[*_~`]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Notes
            </CardTitle>
            {showCreateButton && (
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filterType} onValueChange={setFilterType}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No notes found matching your search"
                  : "No notes yet. Start by summarizing a PDF or YouTube video!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <Card
                  key={note.$id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openViewModal(note)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                        {note.title}
                      </h3>
                      {getSourceIcon(note.source_type)}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3">
                      {getContentPreview(note.content)}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getSourceLabel(note.source_type)}
                        </Badge>
                        {note.tags?.slice(0, 1).map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.created_at)}
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openDeleteConfirm(note);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Note Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNote && getSourceIcon(selectedNote.source_type)}
              {selectedNote?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {getSourceLabel(selectedNote.source_type)}
                </Badge>
                {selectedNote.tags?.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                {selectedNote.source_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(selectedNote.source_url, "_blank")
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Video
                  </Button>
                )}
                {selectedNote.file_id && selectedNote.source_type === "pdf" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewFile({
                        file_id: selectedNote.file_id,
                        filename: selectedNote.title,
                        file_type: "application/pdf",
                      });
                      setFilePreviewOpen(true);
                      setViewModalOpen(false);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View PDF
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-4">
                <span>Created: {formatDate(selectedNote.created_at)}</span>
                {selectedNote.updated_at !== selectedNote.created_at && (
                  <span>Updated: {formatDate(selectedNote.updated_at)}</span>
                )}
              </div>

              <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete &quot;{noteToDelete?.title}&quot;?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={filePreviewOpen}
        onClose={() => {
          setFilePreviewOpen(false);
          setPreviewFile(null);
        }}
      />
    </div>
  );
};

export default PersonalNotes;
