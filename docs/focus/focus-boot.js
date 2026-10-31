/**
 * Focus on the pages that have no player of their own (Profile, Projects, People, Contact, ...). focus.js, the player,
 * is 90 KB; these pages need it only when Focus has something to show or do here:
 * - this page is open in the frame of a page that plays (focus.js, "the shell"): it uses that page's player and dock,
 *   as focus.js itself does in a frame;
 * - a session can be picked up again (the mini player offers it) or the focus timer runs: then focus.js loads.
 * The pages with a player (home and every Library page) load focus.js itself. The test below is focus.js's
 * resumable() and busy() on the saved state (a sound or the radio can't be playing in a page that just opened).
 */
(function () {
    'use strict';
    if (window.FocusPlayer) return;
    try {
        const t = window.top;
        if (t !== window && t.FocusPlayer && t.FocusPlayer.host) {
            window.FocusPlayer = t.FocusPlayer;
            if (t.TubeDock) window.TubeDock = t.TubeDock;
            t.FocusPlayer.attach(document);
            addEventListener('pagehide', () => t.FocusPlayer.detach(document));
            return;
        }
    } catch (e) { /* framed by another site: run on our own */ }
    let st = null;
    try { st = JSON.parse(localStorage.getItem('focus:v1')); } catch (e) { /* storage blocked or unreadable: nothing to resume */ }
    if (!st) return;
    const timer = !!(st.timer && st.timer.running);
    const resumable = !!st.active && ((st.mix && Object.keys(st.mix).length > 0) || !!st.radio) && Date.now() - (st.at || 0) < 6 * 3600000;
    if (!timer && !resumable) return;
    const s = document.createElement('script');
    s.src = new URL('focus.js?v=f7d0872936', document.currentScript ? document.currentScript.src : location.href).href;
    document.head.appendChild(s);
})();
