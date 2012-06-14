// ==UserScript==
// @name        Turntable.FM Squared
// @namespace   ttfm-squared-ffgm
// @name        TT.FM Squared
// @fullname    Turntable.FM Squared
// @homepage    https://github.com/cballou/Turntable.FM-Squared
// @icon        https://github.com/cballou/Turntable.FM-Squared/raw/master/greasemonkey/icon.png
// @author      Corey Ballou
// @copyright   2012+, Corey Ballou (http://coreyballou.com)
// @license     MIT license; http://opensource.org/licenses/mit-license.php
// @run-at      document-end
// @description A set of Turntable.FM tools including an improved chat UI, song analytics, auto-upvote (autobop), anti-idle, auto-respond, additional track information, and similar track listings.
// @include     http://turntable.fm/*
// @include     https://turntable.fm/*
// @exclude     http://turntable.fm/lobby
// @exclude     http://turntable.fm/jobs
// @exclude     http://turntable.fm/about
// @exclude     http://turntable.fm/terms
// @exclude     http://turntable.fm/copyright
// @exclude     http://turntable.fm/privacy
// @exclude     http://turntable.fm/static*
// @version     1.0.1
// @resource      myCustomCss https://raw.github.com/cballou/Turntable.FM-Squared/master/greasemonkey/tt-squared.css
// ==/UserScript==

GM_addStyle (GM_getResourceText ("myCustomCss") );
document.body.appendChild(document.createElement("script")).src="https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.js";
