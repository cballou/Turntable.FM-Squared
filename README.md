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

Current Issues
==============

* Album pricing sometimes shows $-1.
* Does not fit on small screens due to the intensive UI.

Installation
============

This script only works for Google Chrome and Firefox.
**For Firefox, you must have Greasemonkey installed.**

Google Chrome
-------------
You can install in three different ways depending on how hardcore you are:

* *Recommended:* Install from the Google Chrome Web Store: https://chrome.google.com/webstore/detail/ldipemodldjfgcejcgpehbnocimlllhn
* You can load the unpacked extension 
* You can click a link, **but you'll have to click it again whenever you want to update**

**To install from the Google Chrome Web Store *(the fast way)*:**
Just click here while in Chrome and click the `Add to Chrome` button: https://chrome.google.com/webstore/detail/ldipemodldjfgcejcgpehbnocimlllhn

**To load the packed extension *(the fast way)*:**
Just so you know, extensions are packaged as signed ZIP files with the file extension "crx". Don't be scurred.

* Click on the following link: https://github.com/cballou/Turntable.FM-Squared/raw/master/chrome-ext/tt-squared.crx

**To load the unpacked extension from the source code of this repository *(for young jedis)*:**

* Download/clone this repository to your machine via `git clone git@github.com:cballou/Turntable.FM-Squared.git`
* Open up your chrome browser.
* Type in `chrome://extensions/` in your location bar or click on the Wrench icon follwed by `Tools > Extensions`
* In the upper right of the screen, click the checkbox to turn on `Developer mode` if not already checked
* You should now see a button to `Load unpacked extension...`, click this bad boy.
* Using the directory finder that pops up, browse to and highlight the `chrome-ext` directory inside the newly cloned repository.
* Click `OK`.
* You should now be good to roll. Navigate over to a room on Turntable.FM and it should load up instantly.

Firefox
-------
To install as a Greasemonkey script, simply navigate to and follow the popup instructions:
https://github.com/cballou/Turntable.FM-Squared/raw/master/greasemonkey/tt-squared.user.js

After Installation
==================
When you enter a room, you'll notice TT.FM Squared on the right. Click on the settings tab to adjust your personal settings.

Screenshots
===========
![Chat window displaying idle DJs and user options](https://github.com/cballou/Turntable.FM-Squared/raw/master/screenshots/screenshot-chat-user-options.jpg)
![Chat window displaying current djs and idle times](https://github.com/cballou/Turntable.FM-Squared/raw/master/screenshots/screenshot-chat-window.jpeg)
![Similar tracks display for the current song](https://github.com/cballou/Turntable.FM-Squared/raw/master/screenshots/screenshot-similar-track-search.jpg)
![Settings page](https://github.com/cballou/Turntable.FM-Squared/raw/master/screenshots/screenshot-settings.jpg)
![Stats page](https://github.com/cballou/Turntable.FM-Squared/raw/master/screenshots/screenshot-stats.jpg)

Change Log
==========

* 2012-07-27 - Potentially fixed config persistance problems. Fixed issues with auto responder. Fixed PayPal form. Fixed some styling. Fixed affiliate linking for similar tracks.
* 2012-03-23 - Added to the Chrome store. Available at https://chrome.google.com/webstore/detail/ldipemodldjfgcejcgpehbnocimlllhn
* 2012-03-22 - Added new instructions for Chrome extension installation. Created a new package for easier Chrome install. 
* 2012-03-20 - Made the extension fully functional as a Firefox Greasemonkey script. Styling functional in Firefox. Fixed chat window resizing.
* 2012-03-13 - Fixing the chat idle time display. Removing dj idle times binding. Fixing similar track handling on next song play. Added TT.FM song search for similar tracks.
* 2012-01-10 - Adding handling for guest coloring.
* 2012-01-10 - Added LocalStorage support for saving a user's configuration preferences.

Documentation on Packaging Chrome Extensions
============================================
Just in case you wanted to repackage this for yourself.

* http://code.google.com/chrome/extensions/packaging.html

License
=======
This project is licensed under the GNU General Public License v3.0 with additional permissions. Permissions are detailed below. 

```bash
Turntable.FM Squared is distributed under the GNU General Public License version 3 with additional permissions. The following "Additional Permissions" are granted by Corey Ballou under GNU GPL version 3 section 7.

* If you modify this program, or any covered work, by linking or combining it with Turntable.FM Squared, containing parts covered by the terms fo the Turntable.FM Squared licenses, 
you must leave intact the portion of code for getSimilarTracks() as well as handleItunesResults(), as well as not modify the linksynergy.com URL containing an Apple Partner Program affiliate id.
```

You may read the GPLv3 license here: http://www.gnu.org/copyleft/gpl.html

Credits
=======
This was made possible (in part) by research, porting, and idea grabbing from the following sources:

* https://github.com/michaelmwu/turntable.fm/
* https://github.com/dnephin/Turntable.fm-chat-bot/
* https://github.com/MarkReeder/Turntable.fm-Extensions/

