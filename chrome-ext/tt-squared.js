function ttSquared() {
	// inject javascript
	var s = document.createElement('script');
	s.setAttribute('src', 'https://raw.github.com/cballou/Turntable.FM-Squared/master/tt-squared.js');
	s.setAttribute('type', 'text/javascript');
	(document.body || document.head || document.documentElement).appendChild(s);
}

ttSquared();
