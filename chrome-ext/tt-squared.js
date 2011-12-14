function ttSquared() {
	// inject stylesheet
	var s = document.createElement('link');
	s.setAttribute('rel', 'stylesheet');
	s.setAttribute('type', 'text/css');
	s.setAttribute('href', 'https://raw.github.com/cballou/Turntable.FM-Anti-Idle-Autoresponder/master/tt-squared.css');
	document.head.appendChild(s);

	// inject javascript
	var s = document.createElement('script');
	s.setAttribute('src', 'https://raw.github.com/cballou/Turntable.FM-Anti-Idle-Autoresponder/master/tt-squared.js');
	s.setAttribute('type', 'text/javascript');
	(document.body || document.head || document.documentElement).appendChild(s);
}

ttSquared();
