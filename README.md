Note
====

This script is in what I would consider "beta", so don't blame me if things break. This script is also not intended to be used
in combination with other TT.FM modules or plugins you may have.

Features
========
* Heavily improved chat interface and users list
* Color coded users list for DJs (green), idle DJs (red), and moderators (blue)
* Song stats, room stats, and user stats
* Detailed song information, including album art and purchase links when available
* Similar track listings for the current song when available
* Increased height of the DJ Queue for easier queueing.
* Auto-Respond to messages
* Anti-idle script to help prevent you from going idle while djing
* Auto DJ (use with caution, configurable in milliseconds)
* Auto Upvote (autobop) while listening or DJing
* Chat alert on mention of name aliases (configurable)
* Chat alert of the elapsed time it took a DJ to fill a slot, aka anti-auto dj (configurable)

Installation
============

This script only works for Firefox and Chrome.
For Firefox, you must have Greasemonkey installed.

To install as a Greasemonkey script, simply navigate to:
https://github.com/cballou/Turntable.FM-Squared/raw/master/greasemonkey/tt-squared.user.js

To install as a Chrome Extension, simply navigate to:
https://github.com/cballou/Turntable.FM-Squared/raw/master/greasemonkey/tt-squared.user.js

After Installation
==================
When you enter a room, you'll notice TT.FM Squared on the right. Click on the settings tab to adjust your personal settings.

Change Log
==========

* 2012-03-13 - Fixing the chat idle time display. Removing dj idle times binding. Fixing similar track handling on next song play. Added TT.FM song search for similar tracks.
* 2012-01-10 - Adding handling for guest coloring.
* 2012-01-10 - Added LocalStorage support for saving a user's configuration preferences.

Credits
=======
This was made possible (in part) by research, porting, and idea grabbing from the following sources:

* https://github.com/michaelmwu/turntable.fm/
* https://github.com/dnephin/Turntable.fm-chat-bot/
* https://github.com/MarkReeder/Turntable.fm-Extensions/

