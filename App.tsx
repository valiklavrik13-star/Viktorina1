import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Quiz, AppView, UserAnswers, QuestionStats, Question, UserPlayRecord, MovieGenre, GameStats, Leaderboards, LeaderboardEntry, Comment, User, QuizDataForCreation } from './types';
import { QuizList } from './components/QuizList';
import { CreateQuiz } from './components/CreateQuiz';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResult } from './components/QuizResult';
import { MovieQuizPlayer } from './components/MovieQuizPlayer';
import { MovieRatingGamePlayer } from './components/MovieRatingGamePlayer';
import { DirectorQuizPlayer } from './components/DirectorQuizPlayer';
import { YearQuizPlayer } from './components/YearQuizPlayer';
import { QuizStats as QuizStatsComponent } from './components/QuizStats';
import { UserProfile } from './components/UserProfile';
import { Header } from './components/Header';
import { ActorQuizPlayer } from './components/ActorQuizPlayer';
import { useTranslation } from './hooks/useTranslation';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { DescriptionQuizPlayer } from './components/DescriptionQuizPlayer';
import { ReportDialog } from './components/ReportDialog';
import { Notification } from './components/Notification';
import { SeriesQuizPlayer } from './components/SeriesQuizPlayer';
import { SeriesSeasonRatingGamePlayer } from './components/SeriesSeasonRatingGamePlayer';
import { SeriesSortingGamePlayer } from './components/SeriesSortingGamePlayer';
import { SeriesActorQuizPlayer } from './components/SeriesActorQuizPlayer';
import { SeriesDescriptionQuizPlayer } from './components/SeriesDescriptionQuizPlayer';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { DiscussionView } from './components/DiscussionView';
import { useLocalStorage } from './hooks/useLocalStorage';

type GameOverResult = number | { rounds: number; avgPercentage: number };

const App = () => {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
  const [playHistory, setPlayHistory] = useLocalStorage<UserPlayRecord[]>('playHistory', []);
  const [gameStats, setGameStats] = useLocalStorage<GameStats>('gameStats', { movieQuiz: {}, seriesQuiz: {}, movieRatingGame: {}, seriesSeasonRatingGame: {}, directorQuiz: {}, yearQuiz: {}, actorQuiz: {}, seriesActorQuiz: {}, descriptionQuiz: {}, seriesDescriptionQuiz: {} });
  const [leaderboards, setLeaderboards] = useLocalStorage<Leaderboards>('leaderboards', { movieQuiz: {}, seriesQuiz: {}, movieRatingGame: {}, seriesSeasonRatingGame: {}, directorQuiz: {}, yearQuiz: {}, actorQuiz: {}, seriesActorQuiz: {}, descriptionQuiz: {} });
  const [comments, setComments] = useLocalStorage<Comment[]>('comments', []);
  
  const { user, isAuthenticated, logout } = useAuth();
  const [draft, setDraft] = useLocalStorage<(Quiz | QuizDataForCreation) | null>(`quizDraft_${user?.id || 'guest'}`, null);

  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [postLoginRedirect, setPostLoginRedirect] = useState<AppView>(AppView.LIST);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [statsQuiz, setStatsQuiz] = useState<Quiz | null>(null);
  const [discussionQuiz, setDiscussionQuiz] = useState<Quiz | null>(null);
  const [activeMovieGameOptions, setActiveMovieGameOptions] = useState<{ genre: MovieGenre } | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; onCancel?: () => void; isDestructive: boolean; confirmText: string; cancelButtonText?: string; } | null>(null);
  const [reportingQuiz, setReportingQuiz] = useState<Quiz | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationKey, setNotificationKey] = useState(0);
  const [privateQuizIdToPlay, setPrivateQuizIdToPlay] = useState<string | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);


  const [lastAnswers, setLastAnswers] = useState<UserAnswers>({});
  const { t } = useTranslation();


  const saveDraft = useCallback((newDraftData: QuizDataForCreation | Quiz | null) => {
    if (!user) return; 

    if (newDraftData === null) {
        setDraft(null);
        return;
    }
    
    setDraft({ ...newDraftData, lastModified: new Date().toISOString() });
  }, [user, setDraft]);


  const handleStartQuiz = useCallback((quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView(AppView.PLAY);
  }, []);
  
  const requireAuth = useCallback((targetView: AppView) => {
    if (!isAuthenticated) {
        setPostLoginRedirect(targetView);
        setCurrentView(AppView.LOGIN);
        return false;
    }
    setCurrentView(targetView);
    return true;
  }, [isAuthenticated]);


  useEffect(() => {
    if (isAuthenticated && currentView === AppView.LOGIN) {
        if (privateQuizIdToPlay) {
            const quizToStart = quizzes.find(q => q.id === privateQuizIdToPlay);
            if (quizToStart) {
                handleStartQuiz(quizToStart);
                setPrivateQuizIdToPlay(null);
            } else {
                setCurrentView(postLoginRedirect);
            }
        } else {
            setCurrentView(postLoginRedirect);
        }
    }
  }, [isAuthenticated, currentView, postLoginRedirect, privateQuizIdToPlay, quizzes, handleStartQuiz]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    if (quizId) {
        const quizToStart = quizzes.find(q => q.id === quizId);
        if (quizToStart) {
            if (quizToStart.isPrivate) {
                if (isAuthenticated) {
                    handleStartQuiz(quizToStart);
                } else {
                    setPrivateQuizIdToPlay(quizId);
                    requireAuth(AppView.PLAY);
                }
            } else {
                handleStartQuiz(quizToStart);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzes, isAuthenticated]);

  const myQuizzesCount = useMemo(() => {
    if (!isAuthenticated || !user) return 0;
    return quizzes.filter(q => q.creatorId === user.id).length;
  }, [quizzes, user, isAuthenticated]);

  const isMyQuiz = useCallback((quiz: Quiz) => isAuthenticated && user ? quiz.creatorId === user.id : false, [user, isAuthenticated]);

  const handleBackToList = useCallback(() => {
    setActiveQuiz(null);
    setEditingQuiz(null);
    setStatsQuiz(null);
    setDiscussionQuiz(null);
    setLastAnswers({});
    setCurrentView(AppView.LIST);
  }, []);

  const handleCreateQuiz = () => {
    if (!requireAuth(AppView.CREATE)) return;
    setEditingQuiz(null);
    setAutosaveEnabled(draft === null);
    setCurrentView(AppView.CREATE);
  };
  
  const handleViewStats = (quiz: Quiz) => {
    setStatsQuiz(quiz);
    setCurrentView(AppView.STATS);
  };

  const handleOpenDiscussion = (quiz: Quiz) => {
    setDiscussionQuiz(quiz);
    setCurrentView(AppView.DISCUSSION);
  };

  const handleViewProfile = () => requireAuth(AppView.USER_PROFILE);
  
  const handleSaveQuiz = (newQuizData: QuizDataForCreation) => {
    if (!isAuthenticated || !user) return;

    const newQuiz: Quiz = {
      ...newQuizData,
      id: crypto.randomUUID(),
      creatorId: user.id,
      ratings: [],
      averageRating: 0,
      stats: {
        totalPlays: 0,
        totalCorrectAnswers: 0,
        questionStats: newQuizData.questions.reduce((acc, q) => {
          acc[q.id] = { attempts: 0, correct: 0, answers: {} };
          return acc;
        }, {} as { [questionId: string]: QuestionStats })
      },
      playedBy: [],
      createdAt: new Date().toISOString(),
    };
    
    setQuizzes(prevQuizzes => [...prevQuizzes, newQuiz]);
    if (autosaveEnabled) {
      saveDraft(null);
    }
    handleBackToList();
  };
  
  const handleEditQuiz = (quiz: Quiz) => {
    setConfirmation({
        message: t('quizCard.editConfirm'),
        onConfirm: () => {
            setEditingQuiz(quiz);
            setAutosaveEnabled(true);
            setCurrentView(AppView.EDIT);
            setConfirmation(null);
        },
        isDestructive: false,
        confirmText: t('quizCard.edit')
    });
  };

  const handleEditDraft = useCallback(() => {
    if (draft) {
      setEditingQuiz(draft as Quiz);
      setAutosaveEnabled(true);
      setCurrentView(AppView.EDIT);
    }
  }, [draft]);

  const handleDeleteDraft = useCallback(() => {
    setConfirmation({
      message: t('draft.deleteConfirm'),
      onConfirm: () => {
        saveDraft(null);
        setConfirmation(null);
      },
      onCancel: () => setConfirmation(null),
      isDestructive: true,
      confirmText: t('draft.delete'),
    });
  }, [saveDraft, t]);

  const handleUpdateQuiz = (updatedQuizData: Quiz) => {
    const originalQuiz = quizzes.find(q => q.id === updatedQuizData.id);
    if (!originalQuiz) return;

    const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    const getCriticalQuestionParts = (q: Question) => ({
        questionText: q.questionText,
        image: q.image,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        timeLimit: q.timeLimit,
    });
    
    const criticalFieldsChanged =
        originalQuiz.category !== updatedQuizData.category ||
        originalQuiz.timeLimit !== updatedQuizData.timeLimit ||
        originalQuiz.playUntilFirstMistake !== updatedQuizData.playUntilFirstMistake ||
        !deepEqual(
            originalQuiz.questions.map(getCriticalQuestionParts),
            updatedQuizData.questions.map(getCriticalQuestionParts)
        );

    setQuizzes(prevQuizzes => prevQuizzes.map(quiz => {
        if (quiz.id === updatedQuizData.id) {
            const finalQuiz = { ...quiz, ...updatedQuizData };
            if (criticalFieldsChanged) {
                finalQuiz.stats = {
                    totalPlays: 0,
                    totalCorrectAnswers: 0,
                    questionStats: updatedQuizData.questions.reduce((acc, q) => {
                        acc[q.id] = { attempts: 0, correct: 0, answers: {} };
                        return acc;
                    }, {} as { [questionId: string]: QuestionStats })
                };
                finalQuiz.playedBy = [];
            }
            return finalQuiz;
        }
        return quiz;
    }));

    if (autosaveEnabled) {
      saveDraft(null);
    }
    handleBackToList();
};


  const handleDeleteQuiz = (quizId: string) => {
    setConfirmation({
        message: t('quizCard.deleteConfirm'),
        onConfirm: () => {
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
            setConfirmation(null);
        },
        onCancel: () => setConfirmation(null),
        isDestructive: true,
        confirmText: t('quizCard.delete')
    });
  };

  const handleStartMovieQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.MOVIE_QUIZ);
  };

  const handleStartSeriesQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_QUIZ);
  };

  const handleStartMovieRatingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.MOVIE_RATING_GAME);
  };

  const handleStartSeriesSeasonRatingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_SEASON_RATING_GAME);
  };

  const handleStartDirectorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.DIRECTOR_QUIZ);
  };

  const handleStartYearQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.YEAR_QUIZ);
  };

  const handleStartActorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.ACTOR_QUIZ);
  };

  const handleStartDescriptionQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.DESCRIPTION_QUIZ);
  };

  const handleStartSeriesSortingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_SORTING_GAME);
  };

  const handleStartSeriesActorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_ACTOR_QUIZ);
  };

  const handleStartSeriesDescriptionQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_DESCRIPTION_QUIZ);
  };

  const handleFinishQuiz = useCallback((answers: UserAnswers, finishedQuiz: Quiz) => {
    setLastAnswers(answers);
    
    if (isAuthenticated && user) {
        setQuizzes(prevQuizzes => prevQuizzes.map(quiz => {
        if (quiz.id === finishedQuiz.id) {
            if (quiz.playedBy.includes(user.id)) {
            return quiz; 
            }

            const updatedQuiz = JSON.parse(JSON.stringify(quiz));
            
            updatedQuiz.playedBy.push(user.id);
            updatedQuiz.stats.totalPlays += 1;
            let correctAnswersInThisPlay = 0;

            Object.entries(answers).forEach(([questionId, answerValue]) => {
            const question = updatedQuiz.questions.find((q: Question) => q.id === questionId);
            if (question) {
                const qStats = updatedQuiz.stats.questionStats[questionId];
                if (qStats) {
                    qStats.attempts += 1;
                    
                    const answerIndices = Array.isArray(answerValue) ? answerValue : (typeof answerValue === 'number' ? [answerValue] : []);
                    answerIndices.forEach(answerIndex => {
                        qStats.answers[answerIndex] = (qStats.answers[answerIndex] || 0) + 1;
                    });
                    
                    const isCorrect = Array.isArray(answerValue)
                        ? (answerValue.length === question.correctAnswerIndex.length && [...answerValue].sort().toString() === [...question.correctAnswerIndex].sort().toString())
                        : (question.correctAnswerIndex.length === 1 && answerValue === question.correctAnswerIndex[0]);

                    if (isCorrect) {
                        qStats.correct += 1;
                        correctAnswersInThisPlay += 1;
                    }
                }
            }
            });

            updatedQuiz.stats.totalCorrectAnswers += correctAnswersInThisPlay;
            return updatedQuiz;
        }
        return quiz;
        }));

        const score = Object.entries(answers).reduce((acc, [questionId, userAnswer]) => {
        const question = finishedQuiz.questions.find((q) => q.id === questionId);
        if (question) {
            const correctAnswer = question.correctAnswerIndex;
            if (Array.isArray(userAnswer)) {
            if (userAnswer.length === correctAnswer.length && [...userAnswer].sort().toString() === [...correctAnswer].sort().toString()) {
                return acc + 1;
            }
            } else if (typeof userAnswer === 'number') {
            if (correctAnswer.length === 1 && userAnswer === correctAnswer[0]) {
                return acc + 1;
            }
            }
        }
        return acc;
        }, 0);

        const newPlayRecord: UserPlayRecord = {
        quizId: finishedQuiz.id,
        quizTitle: finishedQuiz.title,
        category: finishedQuiz.category,
        score: score,
        totalQuestions: finishedQuiz.questions.length,
        date: new Date().toISOString(),
        };
        setPlayHistory(prev => [newPlayRecord, ...prev]);
    }
    setCurrentView(AppView.RESULT);
  }, [isAuthenticated, user, setQuizzes, setPlayHistory, setLastAnswers, setCurrentView]);

  const handleGameOver = (game: keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'> | 'descriptionQuiz' | 'seriesDescriptionQuiz', genre: MovieGenre, result: GameOverResult) => {
    if (!isAuthenticated || !user) return;
    
    setGameStats(prev => {
        const newStats = { ...prev };

        if ((game === 'descriptionQuiz' || game === 'seriesDescriptionQuiz') && typeof result === 'object' && result !== null && 'rounds' in result) {
            const currentRecord = newStats[game]?.[genre] || { rounds: 0, avgPercentage: 0 };
            if (result.rounds > currentRecord.rounds) {
                const updatedGameStats = {
                    ...(newStats[game] || {}),
                    [genre]: { rounds: result.rounds, avgPercentage: result.avgPercentage }
                };
                newStats[game] = updatedGameStats as any;
                return newStats;
            }
        } else if (typeof result === 'number') {
            const score = result;
            const currentGameStats = newStats[game as keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'>] as { [key in MovieGenre]?: number } | undefined || {};
            const currentHighScore = currentGameStats[genre] || 0;

            if (score > currentHighScore) {
                const updatedGameStats = { ...currentGameStats, [genre]: score };
                (newStats[game as keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'>] as any) = updatedGameStats;
                return newStats;
            }
        }
        
        return prev;
    });

    if (typeof result === 'number' && result > 0) {
        const score = result;
        setLeaderboards(prev => {
            const newLeaderboards = JSON.parse(JSON.stringify(prev));
            const gameBoard = newLeaderboards[game as keyof Omit<Leaderboards, 'descriptionQuiz'>] || {};
            const genreBoard: LeaderboardEntry[] = gameBoard[genre] || [];

            const userIndex = genreBoard.findIndex(entry => entry.userId === user.id);

            if (userIndex > -1) {
                if (score > genreBoard[userIndex].score) {
                    genreBoard[userIndex].score = score;
                }
            } else {
                genreBoard.push({ userId: user.id, score });
            }

            genreBoard.sort((a, b) => b.score - a.score);
            
            gameBoard[genre] = genreBoard;
            newLeaderboards[game as keyof Omit<Leaderboards, 'descriptionQuiz'>] = gameBoard;

            return newLeaderboards;
        });
    }
  };


  const handleRateQuiz = (quizId: string, rating: number) => {
    if (!isAuthenticated) {
        handleShowNotification(t('quizResult.loginToRate'));
        return;
    }
    setQuizzes(prevQuizzes => prevQuizzes.map(quiz => {
      if (quiz.id === quizId) {
        const newRatings = [...quiz.ratings, rating];
        const newAverage = newRatings.reduce((acc, curr) => acc + curr, 0) / newRatings.length;
        return { ...quiz, ratings: newRatings, averageRating: newAverage };
      }
      return quiz;
    }));
  };

  const handleRestartQuiz = () => {
    if (activeQuiz) {
        handleStartQuiz(activeQuiz);
    }
  }
  
  const handleOpenReportDialog = (quiz: Quiz) => {
    setReportingQuiz(quiz);
  };

  const handleCloseReportDialog = () => {
      setReportingQuiz(null);
  };

  const handleSubmitReport = (quizId: string, reason: string) => {
      console.log(`Report submitted for quiz ${quizId}:`, reason);
      handleCloseReportDialog();
      alert(t('reportDialog.success'));
  };
  
  const handleShowNotification = (message: string) => {
    setNotification(message);
    setNotificationKey(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    handleBackToList();
  }

  const handleAddComment = (quizId: string, text: string, parentId: string | null) => {
    if (!user) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      quizId,
      authorId: user.id,
      text,
      parentId,
      createdAt: new Date().toISOString(),
      likes: [],
      dislikes: [],
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleToggleLike = (commentId: string) => {
    if (!user) return;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const newLikes = c.likes.includes(user.id) ? c.likes.filter(id => id !== user.id) : [...c.likes, user.id];
        const newDislikes = c.dislikes.filter(id => id !== user.id);
        return { ...c, likes: newLikes, dislikes: newDislikes };
      }
      return c;
    }));
  };

  const handleToggleDislike = (commentId: string) => {
    if (!user) return;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const newDislikes = c.dislikes.includes(user.id) ? c.dislikes.filter(id => id !== user.id) : [...c.dislikes, user.id];
        const newLikes = c.likes.filter(id => id !== user.id);
        return { ...c, likes: newLikes, dislikes: newDislikes };
      }
      return c;
    }));
  };

  const isPlaying = useMemo(() => [
    AppView.PLAY,
    AppView.MOVIE_QUIZ,
    AppView.SERIES_QUIZ,
    AppView.MOVIE_RATING_GAME,
    AppView.SERIES_SEASON_RATING_GAME,
    AppView.DIRECTOR_QUIZ,
    AppView.YEAR_QUIZ,
    AppView.ACTOR_QUIZ,
    AppView.DESCRIPTION_QUIZ,
    AppView.SERIES_SORTING_GAME,
    AppView.SERIES_ACTOR_QUIZ,
    AppView.SERIES_DESCRIPTION_QUIZ,
  ].includes(currentView), [currentView]);

  const renderView = () => {
    switch(currentView) {
      case AppView.LOGIN:
        return <LoginScreen onBack={handleBackToList} />;
      case AppView.CREATE:
        return <CreateQuiz onCreateQuiz={handleSaveQuiz} onUpdateQuiz={handleUpdateQuiz} onBack={handleBackToList} onDataChange={autosaveEnabled ? saveDraft : () => {}} autosaveEnabled={autosaveEnabled} />;
      case AppView.EDIT:
        return <CreateQuiz onCreateQuiz={handleSaveQuiz} onUpdateQuiz={handleUpdateQuiz} onBack={handleBackToList} quizToEdit={editingQuiz} onDataChange={autosaveEnabled ? saveDraft : () => {}} autosaveEnabled={autosaveEnabled} />;
      case AppView.STATS:
        if (statsQuiz) {
            return <QuizStatsComponent quiz={statsQuiz} onBack={handleBackToList} />;
        }
        return null;
      case AppView.PLAY:
        if (activeQuiz) {
            return <QuizPlayer quiz={activeQuiz} onFinish={handleFinishQuiz} onBack={handleBackToList} onReportQuiz={handleOpenReportDialog} />;
        }
        return null;
      case AppView.RESULT:
        if (activeQuiz) {
            return <QuizResult 
                quiz={activeQuiz} 
                userAnswers={lastAnswers}
                onRestart={handleRestartQuiz}
                onBackToList={handleBackToList}
                onRateQuiz={handleRateQuiz}
                isAuthenticated={isAuthenticated}
            />;
        }
        return null;
      case AppView.MOVIE_QUIZ:
        return <MovieQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_QUIZ:
        return <SeriesQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.MOVIE_RATING_GAME:
        return <MovieRatingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_SEASON_RATING_GAME:
        return <SeriesSeasonRatingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.DIRECTOR_QUIZ:
        return <DirectorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.YEAR_QUIZ:
        return <YearQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.ACTOR_QUIZ:
        return <ActorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.DESCRIPTION_QUIZ:
        return <DescriptionQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_SORTING_GAME:
        return <SeriesSortingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} />;
      case AppView.SERIES_ACTOR_QUIZ:
        return <SeriesActorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_DESCRIPTION_QUIZ:
        return <SeriesDescriptionQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.USER_PROFILE:
        return <UserProfile 
            playHistory={playHistory} 
            createdQuizzesCount={myQuizzesCount} 
            onBack={handleBackToList}
            gameStats={gameStats}
            onLogout={handleLogout}
        />;
      case AppView.DISCUSSION:
          if (discussionQuiz) {
              return <DiscussionView
                  quiz={discussionQuiz}
                  comments={comments}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onAddComment={handleAddComment}
                  onToggleLike={handleToggleLike}
                  onToggleDislike={handleToggleDislike}
                  onBack={handleBackToList}
              />;
          }
          return null;
      case AppView.LIST:
      default:
        return <QuizList 
          quizzes={quizzes}
          draft={draft}
          onStartQuiz={handleStartQuiz} 
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onEditDraft={handleEditDraft}
          onDeleteDraft={handleDeleteDraft}
          onStartMovieQuiz={handleStartMovieQuiz}
          onStartSeriesQuiz={handleStartSeriesQuiz}
          onStartMovieRatingGame={handleStartMovieRatingGame}
          onStartSeriesSeasonRatingGame={handleStartSeriesSeasonRatingGame}
          onStartDirectorQuiz={handleStartDirectorQuiz}
          onStartYearQuiz={handleStartYearQuiz}
          onStartActorQuiz={handleStartActorQuiz}
          onStartDescriptionQuiz={handleStartDescriptionQuiz}
          onStartSeriesSortingGame={handleStartSeriesSortingGame}
          onStartSeriesActorQuiz={handleStartSeriesActorQuiz}
          onStartSeriesDescriptionQuiz={handleStartSeriesDescriptionQuiz}
          onViewStats={handleViewStats}
          onDeleteQuiz={handleDeleteQuiz}
          onReportQuiz={handleOpenReportDialog}
          onShowNotification={handleShowNotification}
          onOpenDiscussion={handleOpenDiscussion}
          isMyQuiz={isMyQuiz}
          userId={user?.id || null}
          leaderboards={leaderboards}
          isAuthenticated={isAuthenticated}
        />;
    }
  }

  return (
    <div className="relative min-h-screen">
      {!isPlaying && currentView !== AppView.LOGIN && <Header onViewProfile={handleViewProfile} />}
      {renderView()}
      {confirmation && (
        <ConfirmationDialog 
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation(null)}
            isDestructive={confirmation.isDestructive}
            confirmButtonText={confirmation.confirmText}
            cancelButtonText={confirmation.cancelButtonText}
        />
      )}
      {reportingQuiz && (
        <ReportDialog
            quiz={reportingQuiz}
            onClose={handleCloseReportDialog}
            onSubmit={handleSubmitReport}
        />
      )}
      {notification && (
        <Notification
          key={notificationKey}
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;