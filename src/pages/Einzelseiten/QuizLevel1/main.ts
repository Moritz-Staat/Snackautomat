import { questions, tiers, timerSeconds } from '../../../data/level1';
import { initQuiz } from '../../../lib/quiz-core';

initQuiz({ questions, tiers, timerSeconds, loco: '/Images/01.svg' });
