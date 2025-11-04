import React, { useState, useMemo, useEffect } from 'react';
import { Quiz, QuizCategory, MovieGenre, Leaderboards, QuizDataForCreation } from '../types';
import { StarRating } from './StarRating';
import { PlusIcon } from './icons/PlusIcon';
import { FilmIcon } from './icons/FilmIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ShareIcon } from './icons/ShareIcon';
import { useTranslation } from '../hooks/useTranslation';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserIcon } from './icons/UserIcon';
import { PencilIcon } from './icons/PencilIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { FlagIcon } from './icons/FlagIcon';
import { LeaderboardView } from './LeaderboardView';
import { TvIcon } from './icons/TvIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';

interface QuizListProps {
  quizzes: Quiz[];
  draft: (Quiz | QuizDataForCreation) | null;
  onStartQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onEditDraft: () => void;
  onDeleteDraft: () => void;
  onStartMovieQuiz: (genre: MovieGenre) => void;
  onStartSeriesQuiz: (genre: MovieGenre) => void;
  onStartMovieRatingGame: (genre: MovieGenre) => void;
  onStartSeriesSeasonRatingGame: (genre: MovieGenre) => void;
  onStartDirectorQuiz: (genre: MovieGenre) => void;
  onStartYearQuiz: (genre: MovieGenre) => void;
  onStartActorQuiz: (genre: MovieGenre) => void;
  onStartDescriptionQuiz: (genre: MovieGenre) => void;
  onStartSeriesSortingGame: (genre: MovieGenre) => void;
  onStartSeriesActorQuiz: (genre: MovieGenre) => void;
  onStartSeriesDescriptionQuiz: (genre: MovieGenre) => void;
  onViewStats: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onReportQuiz: (quiz: Quiz) => void;
  onShowNotification: (message: string) => void;
  onOpenDiscussion: (quiz: Quiz) => void;
  isMyQuiz: (quiz: Quiz) => boolean;
  userId: string | null;
  leaderboards: Leaderboards;
  isAuthenticated: boolean;
}

const CategoryIcon = ({ category, className }: { category: QuizCategory, className?: string }) => {
    const iconClass = className || "w-6 h-6 mr-2 text-gray-500 dark:text-gray-400";
    if (category === QuizCategory.GAMES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path fillRule="evenodd" d="M21.59 10.05C20.14 8.6 18.18 8 16.5 8h-9C5.82 8 3.86 8.6 2.41 10.05 1.42 11.04 1 12.2 1 13.5v1c0 1.3.42 2.46 1.41 3.45c1.45 1.45 3.41 2.05 5.09 2.05h9c1.68 0 3.64-.6 5.09-2.05C22.58 16.96 23 15.8 23 14.5v-1c0-1.3-.42-2.46-1.41-3.45zM10.5 15.5h-2V13H6V11h2.5V8.5h2V11H13v2H10.5v2.5zm5-2a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 11-2 0 1 1 0 012 0zm2 2a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>;
    if (category === QuizCategory.MOVIES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M4 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" /><path d="M16 12l5-2.5v5L16 12z" /><circle cx="7" cy="5" r="2" /><circle cx="13" cy="5" r="2" /></svg>;
    if (category === QuizCategory.SERIES) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M5.25 5A2.25 2.25 0 0 0 3 7.25v9.5A2.25 2.25 0 0 0 5.25 19h13.5A2.25 2.25 0 0 0 21 16.75v-9.5A2.25 2.25 0 0 0 18.75 5H5.25zM19.5 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm-.75 2.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM7.604 4.303l-1.415-1.415a.75.75 0 1 0-1.06 1.06L6.553 5.36a.75.75 0 0 0 1.05-1.057zm8.792 0a.75.75 0 1 0-1.06-1.06l-1.414 1.414a.75.75 0 0 0 1.06 1.06l1.414-1.414zM8.03 19l-1.442 2.163a.75.75 0 1 0 1.264.842L9 20.25h6l1.148 1.75a.75.75 0 1 0 1.264-.842L15.97 19H8.03z" /></svg>;
    if (category === QuizCategory.BOOKS) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>;
    if (category === QuizCategory.MUSIC) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>;
    if (category === QuizCategory.OTHER) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}><path fillRule="evenodd" d="M3 3.75A.75.75 0 013.75 3h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6A.75.75 0 013 9.75v-6zm10.5 0A.75.75 0 0114.25 3h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6zm-10.5 10.5A.75.75 0 013.75 13.5h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6zm10.5 0a.75.75 0 01.75-.75h6a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-6z" clipRule="evenodd" /></svg>;
    return null;
}

interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quiz: Quiz) => void;
  onViewStats: (quiz: Quiz) => void;
  onShareQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onReportQuiz: (quiz: Quiz) => void;
  onOpenDiscussion: (quiz: Quiz) => void;
  isMyQuiz: boolean;
  onTagClick: (tag: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStartQuiz, onViewStats, onShareQuiz, onDeleteQuiz, onEditQuiz, onReportQuiz, onOpenDiscussion, isMyQuiz, onTagClick }) => {
    const { t } = useTranslation();

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            {quiz.isPrivate && isMyQuiz && (
                <div title={t('quizCard.private')} className="absolute top-3 left-3 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <LockClosedIcon className="w-5 h-5" />
                </div>
            )}
            <button
                onClick={() => onReportQuiz(quiz)}
                title={t('quizCard.report')}
                aria-label={t('quizCard.report')}
                className="absolute top-3 right-3 z-10 p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
                <FlagIcon className="w-5 h-5" />
            </button>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <CategoryIcon category={quiz.category} className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-teal-500 dark:text-teal-400 uppercase tracking-wider">{t(`category.${quiz.category}`)}</span>
                </div>
                <div className="h-24 mb-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-3" title={quiz.title}>{quiz.title}</h3>
                </div>
                 {quiz.tags && quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                        {quiz.tags.slice(0, 3).map(tag => (
                            <button
                                key={tag}
                                onClick={() => onTagClick(tag)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-2">{t('quizCard.id')}: {quiz.id}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{quiz.questions.length} {t('quizCard.questions')}</p>
                <div className="flex items-center">
                    <StarRating value={quiz.averageRating} isEditable={false} size={20} />
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between w-full gap-2">
                    {/* Left side: Icon buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onShareQuiz(quiz)}
                            title={t('quizCard.share')}
                            className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onOpenDiscussion(quiz)}
                            title={t('quizCard.discuss')}
                            className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        {isMyQuiz && (
                            <>
                                <button
                                    onClick={() => onEditQuiz(quiz)}
                                    title={t('quizCard.edit')}
                                    className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onViewStats(quiz)}
                                    title={t('quizCard.stats')}
                                    className="p-2.5 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <ChartBarIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDeleteQuiz(quiz.id)}
                                    title={t('quizCard.delete')}
                                    className="p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
            
                    {/* Right side: Play button */}
                    <button
                        onClick={() => onStartQuiz(quiz)}
                        className="flex-shrink-0 text-center bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-300"
                    >
                        {t('quizCard.play')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AutoGameGroup: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onSelectGenre: (genre: MovieGenre) => void;
    gradient: string;
    borderColor: string;
    buttonTextColor: string;
}> = ({ title, description, icon, onSelectGenre, gradient, borderColor, buttonTextColor }) => {
    const { t } = useTranslation();
    const buttonBaseClasses = `w-full text-center py-3 px-4 rounded-lg text-lg font-bold transition-transform duration-200 transform hover:scale-105`;
    const buttonBgClasses = `bg-white/20 hover:bg-white/30 backdrop-blur-sm`;
    
    return (
        <div className={`sm:col-span-2 lg:col-span-3 ${gradient} rounded-xl shadow-lg p-6 border ${borderColor} flex flex-col md:flex-row md:items-center md:gap-8`}>
            <div className="flex-1 mb-6 md:mb-0">
                <div className="flex items-center mb-2">
                    {icon}
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-white/80 text-base">{description}</p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:max-w-md">
                <button onClick={() => onSelectGenre(MovieGenre.ALL)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.all')}</button>
                <button onClick={() => onSelectGenre(MovieGenre.HORROR)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.horror')}</button>
                <button onClick={() => onSelectGenre(MovieGenre.COMEDY)} className={`${buttonBaseClasses} ${buttonBgClasses} ${buttonTextColor}`}>{t('movieGames.comedy')}</button>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ type: 'community' | 'my', searchTerm: string }> = ({ type, searchTerm }) => {
    const { t } = useTranslation();
    const messages = {
        community: { title: t('quizList.noQuizzes'), subtitle: '' },
        my: { title: t('quizList.noMyQuizzes'), subtitle: t('quizList.createOne') },
        search: { title: t('quizList.noResults'), subtitle: '' },
    };
    const content = searchTerm ? messages.search : messages[type];

    return (
        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12 mt-10">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{content.title}</h2>
            {content.subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2">{content.subtitle}</p>}
        </div>
    );
};

const DraftCard: React.FC<{ draft: Quiz | QuizDataForCreation, onEdit: () => void, onDelete: () => void }> = ({ draft, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const title = draft.title || t('draft.untitled');
    const lastModified = draft.lastModified ? new Date(draft.lastModified).toLocaleString() : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-dashed border-indigo-400 dark:border-indigo-500 mb-8">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <CategoryIcon category={draft.category} className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">{t('draft.cardTitle')}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white truncate" title={title}>{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-4">{draft.questions.length} {t('quizCard.questions')}</p>
                {lastModified && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-2">
                        {t('draft.lastSaved', { date: lastModified })}
                    </p>
                )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between w-full gap-2">
                    <button
                        onClick={onDelete}
                        title={t('draft.delete')}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                        <span className="font-semibold">{t('quizCard.delete')}</span>
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex-shrink-0 text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        <span>{t('draft.continueEditing')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};



export const QuizList: React.FC<QuizListProps> = ({ quizzes, draft, userId, isMyQuiz, leaderboards, onStartQuiz, onCreateQuiz, onEditQuiz, onEditDraft, onDeleteDraft, onStartMovieQuiz, onStartSeriesQuiz, onStartMovieRatingGame, onStartSeriesSeasonRatingGame, onStartDirectorQuiz, onStartYearQuiz, onStartActorQuiz, onStartDescriptionQuiz, onStartSeriesSortingGame, onStartSeriesActorQuiz, onStartSeriesDescriptionQuiz, onViewStats, onDeleteQuiz, onReportQuiz, onShowNotification, onOpenDiscussion, isAuthenticated }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<QuizCategory>(QuizCategory.MOVIES);
  const [activeContentTab, setActiveContentTab] = useState<'auto' | 'community' | 'my' | 'leaderboard'>('auto');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'date_desc' | 'date_asc'>('popularity');
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);

  const categoryTabs: QuizCategory[] = Object.values(QuizCategory);

  const handleCategoryClick = (category: QuizCategory) => {
    setActiveCategory(category);
    setSearchTerm('');
    setActiveContentTab('auto');
  };

  const handleShareQuiz = (quiz: Quiz) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?quiz=${quiz.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        onShowNotification(t('notification.linkCopied'));
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };
  
  const availableTabs = useMemo(() => {
    const tabs: ('auto' | 'community' | 'my' | 'leaderboard')[] = ['auto', 'community'];
    if (isAuthenticated) {
        tabs.push('my');
    }
    tabs.push('leaderboard');
    return tabs;
  }, [isAuthenticated]);

  useEffect(() => {
    // If user logs out while on 'my' tab, switch to a valid one
    if (!availableTabs.includes(activeContentTab)) {
        setActiveContentTab('auto');
    }
  }, [availableTabs, activeContentTab]);


  const activeTabIndex = availableTabs.indexOf(activeContentTab);
  
  const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchMoveX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStartX !== null) {
          setTouchMoveX(e.targetTouches[0].clientX);
      }
  };

  const handleTouchEnd = () => {
      if (touchStartX !== null && touchMoveX !== null) {
          const diff = touchStartX - touchMoveX;
          const swipeThreshold = 50; // Minimum distance for a swipe

          if (diff > swipeThreshold) { // Swiped left (next tab)
              const nextIndex = (activeTabIndex + 1) % availableTabs.length;
              setActiveContentTab(availableTabs[nextIndex]);
          } else if (diff < -swipeThreshold) { // Swiped right (previous tab)
              const prevIndex = (activeTabIndex - 1 + availableTabs.length) % availableTabs.length;
              setActiveContentTab(availableTabs[prevIndex]);
          }
      }
      setTouchStartX(null);
      setTouchMoveX(null);
  };

  const communityQuizzes = useMemo(() => {
    let list = quizzes.filter(q => q.category === activeCategory && !q.isPrivate);
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      list = list.filter(quiz =>
        quiz.title.toLowerCase().includes(lowercasedSearchTerm) ||
        quiz.id.toLowerCase().includes(lowercasedSearchTerm) ||
        (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)))
      );
    }
    switch (sortBy) {
      case 'date_desc':
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'date_asc':
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'popularity':
      default:
        list.sort((a, b) => b.averageRating - a.averageRating);
        break;
    }
    return list;
  }, [quizzes, activeCategory, searchTerm, sortBy]);
  
  const myQuizzes = useMemo(() => {
      let list = quizzes.filter(q => q.category === activeCategory && isMyQuiz(q));
      if (searchTerm.trim()) {
          const lowercasedSearchTerm = searchTerm.toLowerCase();
          list = list.filter(quiz =>
              quiz.title.toLowerCase().includes(lowercasedSearchTerm) ||
              quiz.id.toLowerCase().includes(lowercasedSearchTerm) ||
              (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)))
          );
      }
      switch (sortBy) {
        case 'date_desc':
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
        case 'date_asc':
          list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
          break;
        case 'popularity':
        default:
          list.sort((a, b) => b.averageRating - a.averageRating);
          break;
      }
      return list;
  }, [quizzes, activeCategory, searchTerm, isMyQuiz, sortBy]);


  const movieGameCards = [
      <AutoGameGroup
          key="movie-quiz"
          title={t('movieQuiz.title')}
          description={t('movieQuiz.description')}
          icon={<FilmIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartMovieQuiz}
          gradient="from-purple-600 to-indigo-700 bg-gradient-to-br"
          borderColor="border-purple-500"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="movie-rating-game"
          title={t('movieRatingGame.title')}
          description={t('movieRatingGame.description')}
          icon={<TrendingUpIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartMovieRatingGame}
          gradient="from-cyan-500 to-sky-600 bg-gradient-to-br"
          borderColor="border-cyan-400"
          buttonTextColor="text-white"
      />,
       <AutoGameGroup
          key="director-quiz"
          title={t('directorQuiz.title')}
          description={t('directorQuiz.description')}
          icon={<VideoCameraIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartDirectorQuiz}
          gradient="from-rose-500 to-red-600 bg-gradient-to-br"
          borderColor="border-rose-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="year-quiz"
          title={t('yearQuiz.title')}
          description={t('yearQuiz.description')}
          icon={<CalendarIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartYearQuiz}
          gradient="from-amber-500 to-orange-600 bg-gradient-to-br"
          borderColor="border-amber-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="actor-quiz"
          title={t('actorQuiz.title')}
          description={t('actorQuiz.description')}
          icon={<UserIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartActorQuiz}
          gradient="from-emerald-500 to-green-600 bg-gradient-to-br"
          borderColor="border-emerald-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="description-quiz"
          title={t('descriptionQuiz.title')}
          description={t('descriptionQuiz.description')}
          icon={<DocumentTextIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartDescriptionQuiz}
          gradient="from-teal-500 to-cyan-600 bg-gradient-to-br"
          borderColor="border-teal-400"
          buttonTextColor="text-white"
      />
  ];

  const seriesGameCards = [
      <AutoGameGroup
        key="series-quiz"
        title={t('seriesQuiz.title')}
        description={t('seriesQuiz.description')}
        icon={<TvIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesQuiz}
        gradient="from-blue-600 to-violet-700 bg-gradient-to-br"
        borderColor="border-blue-500"
        buttonTextColor="text-white"
      />,
      <AutoGameGroup
        key="series-season-rating-game"
        title={t('seriesSeasonRatingGame.title')}
        description={t('seriesSeasonRatingGame.description')}
        icon={<TrendingUpIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesSeasonRatingGame}
        gradient="from-pink-500 to-rose-600 bg-gradient-to-br"
        borderColor="border-pink-400"
        buttonTextColor="text-white"
      />,
      <AutoGameGroup
        key="series-sorting-game"
        title={t('seriesSortingGame.title')}
        description={t('seriesSortingGame.description')}
        icon={<ListBulletIcon className="w-8 h-8 mr-3 text-white/80" />}
        onSelectGenre={onStartSeriesSortingGame}
        gradient="from-slate-500 to-slate-700 bg-gradient-to-br"
        borderColor="border-slate-400"
        buttonTextColor="text-white"
      />,
       <AutoGameGroup
          key="series-actor-quiz"
          title={t('seriesActorQuiz.title')}
          description={t('seriesActorQuiz.description')}
          icon={<UserIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartSeriesActorQuiz}
          gradient="from-fuchsia-500 to-purple-600 bg-gradient-to-br"
          borderColor="border-fuchsia-400"
          buttonTextColor="text-white"
      />,
      <AutoGameGroup
          key="series-description-quiz"
          title={t('seriesDescriptionQuiz.title')}
          description={t('seriesDescriptionQuiz.description')}
          icon={<DocumentTextIcon className="w-8 h-8 mr-3 text-white/80" />}
          onSelectGenre={onStartSeriesDescriptionQuiz}
          gradient="from-lime-500 to-emerald-600 bg-gradient-to-br"
          borderColor="border-lime-400"
          buttonTextColor="text-white"
      />
  ];

  const searchAndCreateControls = (
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-grow flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-grow w-full">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('quizList.searchPlaceholder')}
                    className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white dark:placeholder-gray-400"
                  />
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popularity' | 'date_desc' | 'date_asc')}
                  className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-lg h-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  aria-label={t('quizList.sortBy.label')}
                >
                    <option value="popularity">{t('quizList.sortBy.popularity')}</option>
                    <option value="date_desc">{t('quizList.sortBy.date_desc')}</option>
                    <option value="date_asc">{t('quizList.sortBy.date_asc')}</option>
                </select>
              </div>
          </div>
          <button
              onClick={onCreateQuiz}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg"
          >
              <PlusIcon className="w-5 h-5" />
              {t('quizList.createQuiz')}
          </button>
      </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8 mt-4">
            <nav className="flex justify-center items-center gap-4 sm:gap-6" aria-label="Categories">
                {categoryTabs.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        title={t(`category.${cat}`)}
                        aria-label={t(`category.${cat}`)}
                        className={`p-3 rounded-full transition-colors duration-200 ${activeCategory === cat ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <CategoryIcon 
                            category={cat} 
                            className={`w-7 h-7 sm:w-8 sm:h-8 ${activeCategory === cat ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} 
                        />
                    </button>
                ))}
            </nav>
        </div>
      
      <section>
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                {availableTabs.map(tab => {
                    const tabLabels: { [key in typeof tab]: string } = {
                        auto: 'quizList.autoQuizzesTab',
                        community: 'quizList.communityQuizzesTab',
                        my: 'quizList.myQuizzesTab',
                        leaderboard: 'quizList.leaderboardTab'
                    };
                    return (
                        <button 
                            key={tab}
                            onClick={() => setActiveContentTab(tab)} 
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${activeContentTab === tab ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {t(tabLabels[tab])}
                        </button>
                    )
                })}
            </div>
        </div>
        
        <div 
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeTabIndex * 100}%)` }}
            >
                <div className="w-full flex-shrink-0 px-2">
                    {(activeCategory === QuizCategory.MOVIES || activeCategory === QuizCategory.SERIES) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {activeCategory === QuizCategory.MOVIES && movieGameCards}
                            {activeCategory === QuizCategory.SERIES && seriesGameCards}
                        </div>
                     ) : (
                        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-12 mt-10">
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('quizList.noAutoQuizzes')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('quizList.checkOtherCategories')}</p>
                        </div>
                    )}
                </div>
                
                <div className="w-full flex-shrink-0 px-2">
                    {searchAndCreateControls}
                    {communityQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {communityQuizzes.map((quiz) => (
                                <QuizCard 
                                    key={quiz.id} 
                                    quiz={quiz} 
                                    onStartQuiz={onStartQuiz} 
                                    onViewStats={onViewStats}
                                    onShareQuiz={handleShareQuiz}
                                    onDeleteQuiz={onDeleteQuiz}
                                    onEditQuiz={onEditQuiz}
                                    onReportQuiz={onReportQuiz}
                                    onOpenDiscussion={onOpenDiscussion}
                                    isMyQuiz={isMyQuiz(quiz)}
                                    onTagClick={handleTagClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="community" searchTerm={searchTerm} />
                    )}
                </div>

                {isAuthenticated && (
                  <div className="w-full flex-shrink-0 px-2">
                      {searchAndCreateControls}
                      {draft && <DraftCard draft={draft} onEdit={onEditDraft} onDelete={onDeleteDraft} />}
                      {myQuizzes.length > 0 ? (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${draft ? 'mt-8' : ''}`}>
                              {myQuizzes.map((quiz) => (
                                  <QuizCard 
                                      key={quiz.id} 
                                      quiz={quiz} 
                                      onStartQuiz={onStartQuiz} 
                                      onViewStats={onViewStats}
                                      onShareQuiz={handleShareQuiz}
                                      onDeleteQuiz={onDeleteQuiz}
                                      onEditQuiz={onEditQuiz}
                                      onReportQuiz={onReportQuiz}
                                      onOpenDiscussion={onOpenDiscussion}
                                      isMyQuiz={isMyQuiz(quiz)}
                                      onTagClick={handleTagClick}
                                  />
                              ))}
                          </div>
                      ) : (
                          !draft && <EmptyState type="my" searchTerm={searchTerm} />
                      )}
                  </div>
                )}

                <div className="w-full flex-shrink-0">
                    <LeaderboardView leaderboards={leaderboards} currentUserId={userId} activeCategory={activeCategory} />
                </div>
            </div>
        </div>
      </section>

    </main>
  );
};