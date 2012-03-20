// <![CDATA[
// ==UserScript==
// @name        TT.FM Squared
// @fullname    Turntable.FM Squared
// @description A set of Turntable.FM tools including an improved chat UI, song analytics, auto-upvote (autobop), anti-idle, auto-respond, additional track information, and similar track listings.
// @homepage    http://userscripts.org/scripts/show
// @icon        http://s3.amazonaws.com/uso_ss/icon/33042/large.PNG?1245499122
// @author      http://userscripts.org/users/441482
// @namespace   http://userscripts.org/users/441482
// @version     1.0.0
// @copyright   2012+, Corey Ballou (http://coreyballou.com)
// @license     MIT license; http://opensource.org/licenses/mit-license.php
// @run-at      document-end
// @include     http://turntable.fm/*
// @include     https://turntable.fm/*
// @exclude     http://turntable.fm/lobby
// @exclude     http://turntable.fm/jobs
// @exclude     http://turntable.fm/about
// @exclude     http://turntable.fm/terms
// @exclude     http://turntable.fm/copyright
// @exclude     http://turntable.fm/privacy
// @exclude     http://turntable.fm/static*
// @match       http://turntable.fm/*
// @resource TTFM_CSS tt-squared.css
// ==/UserScript==

// USERSCRIPT METADATA
var UserScript = {
    name: 'TT.FM Squared',
    id: 'ttfmsq',
    version: '1.0.0',
    include: [
        'http://turntable.fm/*',
        'https://turntable.fm/*'
    ],
    exclude: [
        'http://turntable.fm/lobby',
        'http://turntable.fm/jobs',
        'http://turntable.fm/about',
        'http://turntable.fm/terms',
        'http://turntable.fm/copyright',
        'http://turntable.fm/privacy',
        'http://turntable.fm/static*'
    ],
    manifest: 'https://raw.github.com/cballou/Turntable.FM-Squared/master/greasemonkey/manifest.json',
    codebase: 'http://userscripts.org/scripts/source/6178.user.js',
    description: 'A set of Turntable.FM tools including an improved chat UI, song analytics, auto-upvote (autobop), anti-idle, auto-respond, additional track information, and similar track listings.',
    copyright: '(C)2012, Corey Ballou',
    unwrap: true
};

/**
 * Where the magic happens.
 */
function ttSquared() {
    //var isGoogleChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    //if (!isGoogleChrome) {
        // inject stylesheet
        var cssTxt = GM_getResourceText('TTFM_CSS');
        GM_addStyle(cssTxt);
    //}

    // inject javascript
    var s = document.createElement('script');
    s.setAttribute('src', 'https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.js');
    s.setAttribute('type', 'text/javascript');
    (document.body || document.head || document.documentElement).appendChild(s);
}

// initialize
ttSquared();
