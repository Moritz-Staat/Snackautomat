import { questions, tiers, timerSeconds } from '../../../data/level2';
import { initQuiz } from '../../../lib/quiz-core';

initQuiz({ questions, tiers, timerSeconds, loco: '/Images/03.svg' });
