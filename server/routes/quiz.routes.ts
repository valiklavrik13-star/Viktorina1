
import express from 'express';
import { Quiz } from '../models/quiz.model';
import { Question, QuestionStats } from '../../types';

const router = express.Router();

// GET all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single quiz by ID
router.get('/:id', async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
});

// POST a new quiz
router.post('/', async (req, res) => {
  const { title, category, questions, creatorId } = req.body;

  const newQuiz = new Quiz({
    title,
    category,
    questions,
    creatorId,
    stats: {
        totalPlays: 0,
        totalCorrectAnswers: 0,
        questionStats: questions.reduce((acc: any, q: Question) => {
            acc[q.id] = { attempts: 0, correct: 0, answers: {} };
            return acc;
        }, {})
    }
  });

  try {
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a quiz
router.put('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const { title, category, questions } = req.body;
        
        quiz.title = title;
        quiz.category = category;
        quiz.questions = questions;

        // Reset stats upon editing
        quiz.stats = {
            totalPlays: 0,
            totalCorrectAnswers: 0,
            questionStats: questions.reduce((acc: any, q: Question) => {
                acc[q.id] = { attempts: 0, correct: 0, answers: {} };
                return acc;
            }, {})
        };
        quiz.playedBy = [];
        
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// POST a rating for a quiz
router.post('/:id/rate', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const { rating } = req.body;
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating value' });
        }
        
        quiz.ratings.push(rating);
        quiz.averageRating = quiz.ratings.reduce((acc, curr) => acc + curr, 0) / quiz.ratings.length;
        
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// POST quiz results (play)
router.post('/:id/play', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { answers, userId } = req.body;
        
        // Only update stats on the first playthrough by a user
        if (quiz.playedBy.includes(userId)) {
            return res.status(200).json({ message: 'User has already played this quiz. Stats not updated.'});
        }
        
        quiz.playedBy.push(userId);
        quiz.stats.totalPlays += 1;
        let correctAnswersInThisPlay = 0;

        Object.entries(answers).forEach(([questionId, answerIndex]) => {
            const question = quiz.questions.find(q => q.id === questionId);
            if (question) {
                // FIX: Cast Mongoose Map to a compatible TypeScript type to resolve type conflict.
                // The previous cast created an impossible intersection type. This new type correctly reflects the structure.
                const questionStatsMap = quiz.stats.questionStats as unknown as Map<string, { attempts: number; correct: number; answers: Map<string, number> }>;
                // FIX: Initialize with a correctly typed Map to avoid assignment errors.
                const qStats = questionStatsMap.get(questionId) || { attempts: 0, correct: 0, answers: new Map<string, number>() };
                
                qStats.attempts += 1;
                // The cast on qStats.answers is no longer needed due to the corrected types above.
                const answersMap = qStats.answers;
                const currentAnswerCount = answersMap.get(String(answerIndex)) || 0;
                answersMap.set(String(answerIndex), currentAnswerCount + 1);

                if (answerIndex === question.correctAnswerIndex) {
                    qStats.correct += 1;
                    correctAnswersInThisPlay += 1;
                }
                
                questionStatsMap.set(questionId, qStats);
            }
        });

        quiz.stats.totalCorrectAnswers += correctAnswersInThisPlay;
        
        // Mark as modified to ensure Mongoose saves the nested map
        quiz.markModified('stats'); 

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});


export default router;