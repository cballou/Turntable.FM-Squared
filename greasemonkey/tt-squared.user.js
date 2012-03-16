// ==UserScript==
// @name TT.FM Squared
// @description A set of tools including an improved chat UI, song analytics, auto-upvote (autobop), anti-idle, auto-respond, additional track information, and similar track listings.
// @namespace http://userscripts.org/users/119115
// @include http://turntable.fm/*
// @include https://turntable.fm/*
// @exclude http://turntable.fm/lobby
// @exclude http://turntable.fm/jobs
// @exclude http://turntable.fm/about
// @exclude http://turntable.fm/terms
// @exclude http://turntable.fm/copyright
// @exclude http://turntable.fm/privacy
// @exclude http://turntable.fm/static*
// @match http://turntable.fm/*
// @resource TTFM_CSS tt-squared.css
// ==/UserScript==

function ttSquared() {
    // inject stylesheet
    var cssTxt = GM_getResourceText('TTFM_CSS');
    GM_addStyle(cssTxt);
    /*
    var s = document.createElement('link');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('type', 'text/css');
    s.setAttribute('href', 'https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.css');
    (document.head || document.body).appendChild(s);
    //var el = (document.head || document.body).appendChild(s);
    //el.innerHTML = '@import url("https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.css");';

    var head = document.getElementsByTagName("HEAD")[0];
    var el = head.appendChild(document.createElement('style'));
    el.innerHTML = '@import url("//raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.css");';
    */

    // inject javascript
    var s = document.createElement('script');
    s.setAttribute('src', 'https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.js');
    s.setAttribute('type', 'text/javascript');
    (document.body || document.head || document.documentElement).appendChild(s);
}

ttSquared();
