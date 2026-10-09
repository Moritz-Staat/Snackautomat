import { questions, tiers, timerSeconds } from '../../../data/level3';
import { initQuiz } from '../../../lib/quiz-core';

initQuiz({ questions, tiers, timerSeconds, loco: '/Images/02.svg' });
