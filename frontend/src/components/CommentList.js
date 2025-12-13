import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Edit2, Trash2, Heart, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { createComment, updateComment, deleteComment } from '../services/api';
import toast from 'react-hot-toast';

const CommentList = ({ comments, postId, onCommentsUpdate }) => {
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await createComment(postId, { content: newComment.trim() });
      onCommentsUpdate([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await updateComment(commentId, { content: editContent.trim() });
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? response.data.comment : comment
      );
      onCommentsUpdate(updatedComments);
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      onCommentsUpdate(updatedComments);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const canModify = (comment) => {
    return user && (user.id === comment.author.id || user.role === 'ADMIN');
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add a comment
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="flex items-start space-x-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User size={18} className="text-blue-600 dark:text-blue-300" />
                </div>
              )}
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="textarea w-full"
                  rows="3"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newComment.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
          <MessageCircle size={24} className="mx-auto text-blue-500 mb-2" />
          <p className="text-gray-700 dark:text-gray-300">
            Please{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium">
              login
            </Link>{' '}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments Count */}
      <div className="flex items-center space-x-2">
        <MessageCircle size={20} className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              {editingComment === comment.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="textarea w-full"
                    rows="3"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="btn btn-secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim() || isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Link to={`/users/${comment.author.id}`}>
                        {comment.author.avatar ? (
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <User size={18} className="text-blue-600 dark:text-blue-300" />
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link
                          to={`/users/${comment.author.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {comment.author.username}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {canModify(comment) && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="Edit comment"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                      <Heart size={16} />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;