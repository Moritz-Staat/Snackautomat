(function () {
    'use strict';

    var cfg, shuffled, idx, numCorrect;
    var blurTimer, inactiveTimer;
    var isBlurred = false;

    // Cached DOM references — populated once in init()
    var qText, aBtns, qImg, pBar, pText, blurEl;

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
    }

    /* Single delegated handler — one listener instead of one per button */
    function onAnswer(e) {
        var btn = e.target.closest('.btn');
        if (!btn || btn.disabled) return;

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

    function showResults() {
        /* Find the tier whose threshold the player reached */
        var tier = cfg.tiers.slice()
            .sort(function (a, b) { return b.min - a.min; })
            .find(function (t) { return numCorrect >= t.min; })
            || cfg.tiers[cfg.tiers.length - 1];

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
        qText  = document.getElementById('question-text');
        aBtns  = document.getElementById('answer-buttons');
        qImg   = document.getElementById('question-image');
        pBar   = document.getElementById('progress-bar');
        pText  = document.getElementById('progress-text');
        blurEl = document.getElementById('blur-overlay');

        /* One delegated listener on the container — handles all answer buttons */
        aBtns.addEventListener('click', onAnswer);

        document.addEventListener('click', resetTimer);
        document.addEventListener('touchstart', resetTimer);

        startGame();
        resetTimer();
    }

    /**
     * Entry point — called from each level's script.js
     * config = { questions: [...], tiers: [{min, win, text}, ...] }
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
