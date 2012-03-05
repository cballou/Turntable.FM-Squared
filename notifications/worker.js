var i = 0;
var data = {};
onconnect = function (event) {
	var port = event.ports[0];
	var thread = i;

	/**
	 * Handle replying to the renderer and updating the revision.
	 */
	port.onmessage = function (event) {
		event.data.rev = ++i;
		//data = event.data;
		port.postMessage(event.data);
	};

	// open the port
	port.start();

	// check for messages every 200ms
	setInterval(function() {
		// is this thread up to date
		if (thread < i) {
			port.postMessage(data);
		}
		thread = i;
	}, 200);
};
