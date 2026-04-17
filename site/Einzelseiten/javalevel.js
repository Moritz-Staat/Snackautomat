/* Shared level wrapper — reads level config from body data attributes:
   data-storage-key  : localStorage key for win counter (e.g. "level1win")
   data-prize-endpoint : Schlüssel in AUTOMAT_CONFIG.relais_endpunkte (z.B. "level1_gewinn")
*/
(function () {
    'use strict';

    var TROSTPREIS_URL = AUTOMAT_CONFIG.relais_ip + AUTOMAT_CONFIG.relais_endpunkte.trostpreis;
    var body           = document.body;
    var storageKey     = body.dataset.storageKey;
    var prizeUrl       = AUTOMAT_CONFIG.relais_ip + AUTOMAT_CONFIG.relais_endpunkte[body.dataset.prizeEndpoint];

    var timeout;
    var _data;

    /* Cached DOM refs */
    var preisauswahl = document.getElementById('Preisauswahl');
    var popup        = document.getElementById('popup');
    var popupText    = document.getElementById('popupText');
    var popupGif     = document.getElementById('popupGif');
    var popupButtons = document.getElementById('popupButtons');
    var normalButton = document.getElementById('normalButton');
    var premiumButton = document.getElementById('premiumButton');
    var mainContent  = document.getElementById('mainContent');
    var pinModal     = document.getElementById('pinModal');
    var pinInput     = document.getElementById('pinInput');
    var wholepage    = document.getElementById('wholepage');

    function doPost(param, url) {
        fetch(url + '?param=' + param, { method: 'POST' })
            .catch(function () { /* fire-and-forget relay call */ });
    }

    function redirect(delay) {
        timeout = setTimeout(function () {
            timeout = undefined;
            window.location.href = '../Automat.html';
        }, delay);
    }

    function showPrizeSelection(data) {
        _data = data;
        preisauswahl.classList.remove('preise');
        preisauswahl.classList.add('preiseshown');
    }

    /* Quiz result comes from iframe via postMessage */
    window.addEventListener('message', function (event) {
        showPrizeSelection(event.data);
    });

    premiumButton.addEventListener('click', function () {
        popupText.textContent = 'Melde dich bei unserem Stand für dein Premium Geschenk!';
        popupGif.style.display  = 'none';
        popupButtons.style.display = 'none';
        redirect(10000);
    });

    normalButton.addEventListener('click', function () {
        if (timeout !== undefined) return;

        if (_data === 'prizeCollected') {
            var wins = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
            localStorage.setItem(storageKey, wins.toString());
            doPost('1', prizeUrl);
            redirect(3000);
        } else if (_data === 'quizFailed') {
            var loses = parseInt(localStorage.getItem('loses') || '0', 10) + 1;
            localStorage.setItem('loses', loses.toString());
            doPost('1', TROSTPREIS_URL);
            redirect(3000);
        }

        popup.style.display = 'none';
        mainContent.classList.remove('blurred');
    });

    /* PIN modal */
    document.getElementById('logo').addEventListener('click', function () {
        pinModal.style.display = 'block';
        wholepage.classList.add('blurred');
    });

    document.getElementsByClassName('close')[0].addEventListener('click', closeModal);

    window.addEventListener('click', function (event) {
        if (event.target === pinModal) closeModal();
    });

    document.getElementById('submitPin').addEventListener('click', function () {
        if (pinInput.value === AUTOMAT_CONFIG.pins.kontakt) {
            var k = parseInt(localStorage.getItem('kontaktdaten') || '0', 10) + 1;
            localStorage.setItem('kontaktdaten', k.toString());
            doPost('1', AUTOMAT_CONFIG.relais_ip + AUTOMAT_CONFIG.relais_endpunkte.trostpreis);
            closeModal();
        }
    });

    document.querySelectorAll('#numpad .num').forEach(function (btn) {
        btn.addEventListener('click', function () {
            pinInput.value += btn.innerText;
        });
    });

    document.getElementById('backspace').addEventListener('click', function () {
        pinInput.value = pinInput.value.slice(0, -1);
    });

    function closeModal() {
        pinInput.value = '';
        pinModal.style.display = 'none';
        wholepage.classList.remove('blurred');
    }
}());
