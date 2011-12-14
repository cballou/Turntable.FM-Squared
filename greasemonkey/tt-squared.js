// ==UserScript==
// @match http://*/*
// @match http://*.google.com/*
// @match http://www.google.com/*
// ==/UserScript==

function ttSQuared() {
	/**
	 * Inject the remote script.
	 */
	var s = document.createElement('script');
	s.setAttribute('src', 'https://raw.github.com/cballou/Turntable.FM-Anti-Idle-Autoresponder/master/tt-squared.js');
	s.setAttribute('type', 'text/javascript');
	(document.body || document.head || document.documentElement).appendChild(s);
}

location.href="javascript:(function(){" + ttSQuared + "})()";
