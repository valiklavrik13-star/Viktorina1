import React, { useState, useMemo } from 'react';
import { Quiz, Comment, User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UserAvatar } from './UserAvatar';
import { HandThumbUpIcon } from './icons/HandThumbUpIcon';
import { HandThumbDownIcon } from './icons/HandThumbDownIcon';

// CommentForm Component
interface CommentFormProps {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  placeholder: string;
  submitLabel: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, onCancel, placeholder, submitLabel }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
        rows={3}
        required
      />
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
            {t('discussion.cancel')}
          </button>
        )}
        <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50" disabled={!text.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// Props for the recursive CommentNode component
interface CommentNodeProps {
  comment: Comment;
  allComments: Comment[];
  user: User | null;
  isAuthenticated: boolean;
  quizId: string;
  onAddComment: (quizId: string, text: string, parentId: string | null) => void;
  onToggleLike: (commentId: string) => void;
  onToggleDislike: (commentId: string) => void;
  depth?: number;
}

const MAX_REPLY_DEPTH = 4; // Max indentation level to prevent overflow on mobile

// Recursive CommentNode Component
const CommentNode: React.FC<CommentNodeProps> = (props) => {
    const { comment, allComments, user, isAuthenticated, quizId, onAddComment, onToggleLike, onToggleDislike, depth = 0 } = props;
    const { t } = useTranslation();
    const [isReplying, setIsReplying] = useState(false);

    const replies = useMemo(() => {
        return allComments.filter(c => c.parentId === comment.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [allComments, comment.id]);

    const hasLiked = user && comment.likes.includes(user.id);
    const hasDisliked = user && comment.dislikes.includes(user.id);

    const handleReplySubmit = (text: string) => {
        onAddComment(quizId, text, comment.id);
        setIsReplying(false);
    };

    const commentBody = (
      <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 pt-1">
              <UserAvatar userId={comment.authorId} className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 dark:text-white">{`Player-${comment.authorId.substring(0, 6)}`}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 my-1 whitespace-pre-wrap break-words">{comment.text}</p>
              <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <button onClick={() => isAuthenticated && onToggleLike(comment.id)} disabled={!isAuthenticated} className={`flex items-center gap-1 transition-colors ${hasLiked ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-gray-800 dark:hover:text-white'}`}>
                      <HandThumbUpIcon className="w-4 h-4" />
                      <span>{comment.likes.length}</span>
                  </button>
                  <button onClick={() => isAuthenticated && onToggleDislike(comment.id)} disabled={!isAuthenticated} className={`flex items-center gap-1 transition-colors ${hasDisliked ? 'text-red-600 dark:text-red-400' : 'hover:text-gray-800 dark:hover:text-white'}`}>
                      <HandThumbDownIcon className="w-4 h-4" />
                      <span>{comment.dislikes.length}</span>
                  </button>
                  <button onClick={() => isAuthenticated && setIsReplying(prev => !prev)} disabled={!isAuthenticated} className="font-semibold hover:text-gray-800 dark:hover:text-white transition-colors">
                      {t('discussion.reply')}
                  </button>
              </div>

              {isReplying && (
                  <CommentForm
                      onSubmit={handleReplySubmit}
                      onCancel={() => setIsReplying(false)}
                      placeholder={`${t('discussion.reply')}...`}
                      submitLabel={t('discussion.post')}
                  />
              )}
          </div>
      </div>
    );
    
    const renderReplies = () => {
      if (!replies.length) return null;

      if (depth < MAX_REPLY_DEPTH) {
        // Indented style for normal depth
        return (
            <div className="pt-3 mt-3 ml-2 pl-3 sm:ml-4 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                {replies.map(reply => (
                    <CommentNode 
                        key={reply.id} 
                        {...props} 
                        comment={reply} 
                        depth={depth + 1} 
                    />
                ))}
            </div>
        );
      } else {
        // Flattened style for deep threads to prevent overflow
        return (
            <div className="pt-3 mt-3 border-t-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
                {replies.map(reply => (
                    <CommentNode 
                        key={reply.id} 
                        {...props} 
                        comment={reply} 
                        depth={depth + 1} 
                    />
                ))}
            </div>
        );
      }
    };

    return (
      <div>
        {commentBody}
        {renderReplies()}
      </div>
    );
}

// Main DiscussionView Component
interface DiscussionViewProps {
  quiz: Quiz;
  comments: Comment[];
  user: User | null;
  isAuthenticated: boolean;
  onAddComment: (quizId: string, text: string, parentId: string | null) => void;
  onToggleLike: (commentId: string) => void;
  onToggleDislike: (commentId: string) => void;
  onBack: () => void;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({ quiz, comments, user, isAuthenticated, onAddComment, onToggleLike, onToggleDislike, onBack }) => {
  const { t } = useTranslation();

  const quizComments = useMemo(() => {
    return comments.filter(c => c.quizId === quiz.id);
  }, [comments, quiz.id]);

  const topLevelComments = useMemo(() => {
    return quizComments
      .filter(c => c.parentId === null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quizComments]);

  const handleAddTopLevelComment = (text: string) => {
    onAddComment(quiz.id, text, null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-start gap-2 sm:gap-4 mb-8">
        <button onClick={onBack} className="flex-shrink-0 mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors self-start">
          <ArrowLeftIcon className="w-5 h-5"/>
          <span className="hidden sm:inline">{t('createQuiz.back')}</span>
        </button>
        <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight break-words">
            {t('discussion.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 break-words">{quiz.title}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('discussion.comments')} ({quizComments.length})</h2>
        
        {isAuthenticated ? (
            <CommentForm
                onSubmit={handleAddTopLevelComment}
                placeholder={t('discussion.placeholder')}
                submitLabel={t('discussion.post')}
            />
        ) : (
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-gray-600 dark:text-gray-300">{t('discussion.loginToComment')}</p>
            </div>
        )}

        <div className="mt-6 space-y-6">
            {topLevelComments.length > 0 ? (
                topLevelComments.map((comment) => (
                    <CommentNode
                        key={comment.id}
                        comment={comment}
                        allComments={quizComments}
                        user={user}
                        isAuthenticated={isAuthenticated}
                        quizId={quiz.id}
                        onAddComment={onAddComment}
                        onToggleLike={onToggleLike}
                        onToggleDislike={onToggleDislike}
                        depth={0}
                    />
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('discussion.noComments')}</p>
            )}
        </div>
      </div>
    </div>
  );
};