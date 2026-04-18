(function () {
    'use strict';

    var cfg, shuffled, idx, numCorrect;
    var blurTimer, inactiveTimer, questionTimer;
    var isBlurred = false;

    // Cached DOM references — populated once in init()
    var qText, aBtns, qImg, pBar, pText, blurEl, timerBar;

    /* Fisher-Yates shuffle — O(n), unbiased */
    function shuffle(arr) {
        var a = arr.slice(), i, j, t;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function preload(src) {
        if (src) { var img = new Image(); img.src = src; }
    }

    function startGame() {
        shuffled     = shuffle(cfg.questions).slice(0, 10);
        idx          = 0;
        numCorrect   = 0;
        /* Preload only the 10 selected question images, not all 40+ */
        shuffled.forEach(function (q) { preload(q.image); });
        showQuestion(shuffled[0]);
    }

    function startQuestionTimer() {
        clearQuestionTimer();
        var seconds = cfg.timerSeconds;
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        timerBar.style.backgroundColor = '#62b55a';
        timerBar.offsetWidth; // force reflow to restart animation
        timerBar.style.transition = 'width ' + seconds + 's linear, background-color ' + (seconds * 0.4) + 's ease ' + (seconds * 0.5) + 's';
        timerBar.style.width = '0%';
        timerBar.style.backgroundColor = '#c62828';
        questionTimer = setTimeout(onTimerExpired, seconds * 1000);
    }

    function clearQuestionTimer() {
        clearTimeout(questionTimer);
        timerBar.style.transition = 'none';
        timerBar.style.width = '0%';
    }

    function onTimerExpired() {
        aBtns.querySelectorAll('.btn').forEach(function (b) {
            b.disabled = true;
            if (b.dataset.c === '1') b.classList.add('btn-hint');
        });
        resetTimer();
        setTimeout(function () {
            idx++;
            if (idx < shuffled.length) showQuestion(shuffled[idx]);
            else showResults();
        }, 1500);
    }

    function showQuestion(q) {
        qText.innerText = q.question;

        if (q.image) {
            qImg.src = q.image;
            qImg.style.display = 'block';
        } else {
            qImg.style.display = 'none';
        }

        /* DocumentFragment: single DOM insertion instead of 4 separate reflows */
        var frag = document.createDocumentFragment();
        q.answers.forEach(function (a) {
            var btn       = document.createElement('button');
            btn.innerText = a.text;
            btn.className = 'btn';
            btn.dataset.c = a.correct ? '1' : '0';
            frag.appendChild(btn);
        });
        aBtns.innerHTML = '';
        aBtns.appendChild(frag);

        updateBar();
        /* Preload the next question image while user reads the current one */
        var next = shuffled[idx + 1];
        if (next) preload(next.image);
        startQuestionTimer();
    }

    /* Single delegated handler — one listener instead of one per button */
    function onAnswer(e) {
        var btn = e.target.closest('.btn');
        if (!btn || btn.disabled) return;

        clearQuestionTimer();

        var won = btn.dataset.c === '1';
        if (won) numCorrect++;

        /* Highlight answers using CSS classes, not inline styles */
        aBtns.querySelectorAll('.btn').forEach(function (b) {
            b.disabled = true;
            if (b === btn) {
                b.classList.add(won ? 'btn-correct' : 'btn-wrong');
            } else if (b.dataset.c === '1') {
                b.classList.add('btn-hint');
            }
        });

        resetTimer();

        setTimeout(function () {
            idx++;
            if (idx < shuffled.length) showQuestion(shuffled[idx]);
            else showResults();
        }, 1500);
    }

    function startConfetti() {
        var canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        var colors = ['#62b55a', '#2e7d32', '#ffd700', '#ff6b35', '#4fc3f7', '#ffffff'];
        var particles = [];
        for (var i = 0; i < 130; i++) {
            particles.push({
                x:     Math.random() * canvas.width,
                y:     Math.random() * canvas.height - canvas.height,
                w:     Math.random() * 12 + 6,
                h:     Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                spin:  (Math.random() - 0.5) * 0.2,
                drift: (Math.random() - 0.5) * 1.5
            });
        }

        var start    = null;
        var duration = 4000;

        function frame(ts) {
            if (!start) start = ts;
            var elapsed = ts - start;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var alive = false;
            particles.forEach(function (p) {
                p.y += p.speed;
                p.x += p.drift;
                p.angle += p.spin;
                if (p.y < canvas.height + 20) alive = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                if (elapsed > duration * 0.7) {
                    ctx.globalAlpha = 1 - (elapsed - duration * 0.7) / (duration * 0.3);
                }
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });

            if (elapsed < duration && alive) {
                requestAnimationFrame(frame);
            } else {
                canvas.parentNode && canvas.parentNode.removeChild(canvas);
            }
        }

        requestAnimationFrame(frame);
    }

    function showResults() {
        clearQuestionTimer();

        /* Find the tier whose threshold the player reached */
        var tier = cfg.tiers.slice()
            .sort(function (a, b) { return b.min - a.min; })
            .find(function (t) { return numCorrect >= t.min; })
            || cfg.tiers[cfg.tiers.length - 1];

        if (tier.win) startConfetti();

        var container = document.getElementById('question-container');
        aBtns.innerHTML = '';

        var img      = document.createElement('img');
        img.src      = '../QuizImages/LOGO.svg';
        img.id       = 'result-image';

        var txt      = document.createElement('div');
        txt.id       = 'result-text';
        txt.innerText = tier.text;

        var btn      = document.createElement('button');
        btn.innerText = tier.win ? 'Preis abholen' : 'Zurück zum Start';
        btn.className = 'btn';
        btn.addEventListener('click', function () {
            window.parent.postMessage(tier.win ? 'prizeCollected' : 'quizFailed', '*');
        });

        var frag = document.createDocumentFragment();
        frag.appendChild(img);
        frag.appendChild(txt);
        frag.appendChild(btn);
        container.innerHTML = '';
        container.appendChild(frag);
    }

    function updateBar() {
        var num = idx + 1, total = shuffled.length;
        pBar.style.width = (num / total * 100) + '%';
        pText.innerText  = num + '/' + total;
    }

    function blurPage() {
        document.body.classList.add('blur');
        blurEl.style.display = 'flex';
        isBlurred = true;
    }

    function resetTimer() {
        clearTimeout(blurTimer);
        clearTimeout(inactiveTimer);
        if (isBlurred) {
            document.body.classList.remove('blur');
            blurEl.style.display = 'none';
            isBlurred = false;
        }
        blurTimer    = setTimeout(blurPage, 20000);
        inactiveTimer = setTimeout(function () {
            window.top.location.href = '../../Automat.html';
        }, 30000);
    }

    function init() {
        qText    = document.getElementById('question-text');
        aBtns    = document.getElementById('answer-buttons');
        qImg     = document.getElementById('question-image');
        pBar     = document.getElementById('progress-bar');
        pText    = document.getElementById('progress-text');
        blurEl   = document.getElementById('blur-overlay');
        timerBar = document.getElementById('timer-bar');

        /* One delegated listener on the container — handles all answer buttons */
        aBtns.addEventListener('click', onAnswer);

        document.addEventListener('click', resetTimer);
        document.addEventListener('touchstart', resetTimer);

        startGame();
        resetTimer();
    }

    /**
     * Entry point — called from each level's script.js
     * config = { questions: [...], tiers: [{min, win, text}, ...], timerSeconds: number }
     * tiers must be sorted by min descending; last entry is the fallback (min: 0)
     */
    window.initQuiz = function (config) {
        cfg = config;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    };
}());
