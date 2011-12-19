/**
 * localStorage handler.
 *
 * Copyright (c) 2010-2011 Marcus Westin
 */
var store=function(){var b={},g=window,m=g.document,f;b.disabled=false;b.set=function(){};b.get=function(){};b.remove=function(){};b.clear=function(){};b.transact=function(a,c){var d=b.get(a);if(typeof d=="undefined")d={};c(d);b.set(a,d)};b.serialize=function(a){return JSON.stringify(a)};b.deserialize=function(a){if(typeof a=="string")return JSON.parse(a)};var p;try{p="localStorage"in g&&g.localStorage}catch(i){p=false}if(p){f=g.localStorage;b.set=function(a,c){f.setItem(a,b.serialize(c))};b.get=
function(a){return b.deserialize(f.getItem(a))};b.remove=function(a){f.removeItem(a)};b.clear=function(){f.clear()}}else{var n;try{n="globalStorage"in g&&g.globalStorage&&g.globalStorage[g.location.hostname]}catch(r){n=false}if(n){f=g.globalStorage[g.location.hostname];b.set=function(a,c){f[a]=b.serialize(c)};b.get=function(a){return b.deserialize(f[a]&&f[a].value)};b.remove=function(a){delete f[a]};b.clear=function(){for(var a in f)delete f[a]}}else if(m.documentElement.addBehavior){f=m.createElement("div");
g=function(a){return function(){var c=Array.prototype.slice.call(arguments,0);c.unshift(f);m.body.appendChild(f);f.addBehavior("#default#userData");f.load("localStorage");c=a.apply(b,c);m.body.removeChild(f);return c}};b.set=g(function(a,c,d){a.setAttribute(c,b.serialize(d));a.save("localStorage")});b.get=g(function(a,c){return b.deserialize(a.getAttribute(c))});b.remove=g(function(a,c){a.removeAttribute(c);a.save("localStorage")});b.clear=g(function(a){var c=a.XMLDocument.documentElement.attributes;
a.load("localStorage");for(var d=0,h;h=c[d];d++)a.removeAttribute(h.name);a.save("localStorage")})}}try{b.set("__storejs__","__storejs__");if(b.get("__storejs__")!="__storejs__")b.disabled=true;b.remove("__storejs__")}catch(o){b.disabled=true}return b}();if(!this.JSON)this.JSON={};
(function(){function b(a){return a<10?"0"+a:a}function g(a){p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function(c){var d=r[c];return typeof d==="string"?d:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function m(a,c){var d,h,k,q,l=i,j,e=c[a];if(e&&typeof e==="object"&&typeof e.toJSON==="function")e=e.toJSON(a);if(typeof o==="function")e=o.call(c,a,e);switch(typeof e){case "string":return g(e);case "number":return isFinite(e)?String(e):"null";case "boolean":case "null":return String(e);
case "object":if(!e)return"null";i+=n;j=[];if(Object.prototype.toString.apply(e)==="[object Array]"){q=e.length;for(d=0;d<q;d+=1)j[d]=m(d,e)||"null";k=j.length===0?"[]":i?"[\n"+i+j.join(",\n"+i)+"\n"+l+"]":"["+j.join(",")+"]";i=l;return k}if(o&&typeof o==="object"){q=o.length;for(d=0;d<q;d+=1){h=o[d];if(typeof h==="string")if(k=m(h,e))j.push(g(h)+(i?": ":":")+k)}}else for(h in e)if(Object.hasOwnProperty.call(e,h))if(k=m(h,e))j.push(g(h)+(i?": ":":")+k);k=j.length===0?"{}":i?"{\n"+i+j.join(",\n"+i)+
"\n"+l+"}":"{"+j.join(",")+"}";i=l;return k}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+b(this.getUTCMonth()+1)+"-"+b(this.getUTCDate())+"T"+b(this.getUTCHours())+":"+b(this.getUTCMinutes())+":"+b(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var f=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
p=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,n,r={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},o;if(typeof JSON.stringify!=="function")JSON.stringify=function(a,c,d){var h;n=i="";if(typeof d==="number")for(h=0;h<d;h+=1)n+=" ";else if(typeof d==="string")n=d;if((o=c)&&typeof c!=="function"&&(typeof c!=="object"||typeof c.length!=="number"))throw Error("JSON.stringify");return m("",
{"":a})};if(typeof JSON.parse!=="function")JSON.parse=function(a,c){function d(k,q){var l,j,e=k[q];if(e&&typeof e==="object")for(l in e)if(Object.hasOwnProperty.call(e,l)){j=d(e,l);if(j!==undefined)e[l]=j;else delete e[l]}return c.call(k,q,e)}var h;a=String(a);f.lastIndex=0;if(f.test(a))a=a.replace(f,function(k){return"\\u"+("0000"+k.charCodeAt(0).toString(16)).slice(-4)});if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){h=eval("("+a+")");return typeof c==="function"?d({"":h},""):h}throw new SyntaxError("JSON.parse");}})();

/**
 * A subset of Turntable.fm Chat Bot with a ton of additions and improvements.
 * https://github.com/dnephin/Turntable.fm-chat-bot
 */
(function(){

    // TT.FM objects
	var _tt = turntable;
	var _room = null;
	var _manager = null;
	var _k = null;

	// sizing
	var windowSize = {
		width: $(window).width(),
		height: $(window).height()
	};
	var containerWidth = $('#outer').width();
	var tt2_size = {
		width: windowSize.width - containerWidth,
		height: windowSize.height
	}

	// prepare default config
	var defaults = {
		autoDj: false,
		autoRespond: true,
		antiIdle: true,
		muteAlert: false,
		autoUpvote: true,
		nameAliases: [
			'corey',
			'ballou',
			'cballou',
			'coreyballou',
			'Dr. awkwa .rD',
			'Corey Ballou',
			'CoreyBallou',
			'coreyb',
			'Dr',
			'Dr.',
			'awk',
			'awkward'
		],
		generalNameAliases: [
			'djs',
			'everyone',
			'everbody',
			'you all',
			'yall',
			'ya\'ll',
			'you guys',
			'you'
		],
		idleAliases: [
			'afk',
			'checkin',
			'check in',
			'check-in',
			'here',
			'idle',
			'there',
			'respond',
			'status',
			'away',
			'where'
		],
		idleReplies: [
			'check check.',
			'yup',
			'yeah {{NICKNAME}}',
			'hey {{NICKNAME}} :)',
			'still here {{NICKNAME}}',
			'checking in',
			'right here {{NICKNAME}}',
			'yo {{NICKNAME}}',
			'not idle',
			'i\'m here',
			'what?',
			'nope :)',
			'whatup {{NICKNAME}}',
			'mos def',
			'not here',
			'sup {{NICKNAME}}',
			'definitely not here',
			'yes.. right here {{NICKNAME}}',
			'yepp {{NICKNAME}}',
			'{{NICKNAME}}, right here',
			'{{NICKNAME}}, still here',
			'wink wink'
		],
		idleMessages: [
			'ugh I\'ve got so much work to do',
			'busy day over here',
			'wish i wasn\'t so busy',
			':)',
			'liking this',
			'good track',
			'nice mix',
			'wish i didn\'t have to send messages to prevent idle...',
			'love tt.fm',
			'back to work..',
			'i\m so tired',
			'can\'t wait till 5',
			'i should be working',
			'moar coffee.'
		],
		debugMode: true
	};

	// handle config values
	var config = store.get('config');
	if (!config) {
		config = defaults;
		store.set('config', config);
	} else {
		// merge config with defaults to ensure no missing params
		config = $.extend({}, defaults, config);
		store.set('config', config);
	}

	// stats monitoring
	var stats = {
		usersCount: 0
	};

	// vote monitoring
	var votes = {
		// total songs played
		totalSongs: 0,
		score: 0,
		votes: 0,
		upvotes: 0,
		downvotes: 0,

		// for the current song
		current: {
			score: 0,
			votes: 0,
			upvoters: [],
			downvoters: []
		},
		// for each song
		songs: {},
		// by each user
		user: {},
		// for my songs
		mine: {
			totalSongs: 0,
			score: 0,
			votes: 0,
			upvotes: 0,
			downvotes: 0,
			songs: {
				score: 0,
				votes: 0,
				upvoters: [],
				downvoters: [],
				song: []
			}
		}
	};

    // the maximum idle response frequency (milliseconds)
    var maxIdleResponseFreq = 600000;

    // the last idle response time
    var lastIdleResponse = new Date().getTime();

    /**
     * Function to retrieve turntable objects.
     */
    function getTurntableObjects() {
        // reset room
        _room = null;

        var dfd = $.Deferred();
        var resolveWhenReady = function() {
            if (window.location.pathname !== '/lobby') {
                // find room
                for (var o in _tt) {
                    if (_tt[o] !== null && _tt[o].creatorId) {
						_log('Room found.');
                        _room = _tt[o];
						_k = {};
						_k[0] = o;
                        break;
                    }
                }

                // find room manager
                if (_room) {
                    for (var o in _room) {
                        if (_room[o] !== null && _room[o].myuserid) {
							_log('Room manager found.');
                            _manager = _room[o];
							_k[1] = o;
                        }
                    }
                    dfd.resolve();
                } else {
                    setTimeout(function() {
                        resolveWhenReady();
                    }, 250);
                }
            } else {
                setTimeout(function() {
                    resolveWhenReady();
                }, 250);
            }
        };

        resolveWhenReady();
        return dfd.promise();
    }

	/**
	 * Watch for an empty DJ slot and fill it.
	 */
	function watchForEmptyDjSlot(e) {
		if (!config.autoDj) {
			return;
		}

		if (e.command != 'rem_dj') {
			return;
		}

		if (_tt.user.id == e.user[0].userid) {
			_log('You just stepped down or got kicked off the decks.');
			return;
		}

		if (_room.isDj()) {
			_log('You are already on the decks.');
		}

		setTimeout(function() {
			_manager.callback('become_dj', _manager.become_dj.data('spot'))
		}, 500);
	}

	/**
	 * When the Auto DJ option is turned on, initially check if an empty
	 * slot exists and jump on it.
	 */
	function emptySlotCheck() {
		if (turntable[_k[0]][_k[1]].taken_dj_map) {
			for (var i in turntable[_k[0]][_k[1]].taken_dj_map) {
				if (turntable[_k[0]][_k[1]].taken_dj_map[i] == -1) {
					_log('Empty DJ slot found: #' + i);
					_manager.callback('become_dj', _manager.become_dj.data('spot'))
					break;
				}
			}
		}
	}

    /**
     * Periodically check if you get mentioned in the chat room.
     */
    function watchForChatMentions(e) {
        // handle alerting when mentioned
        if (stringInText(config.nameAliases, e.text)) {
            playAlertSound();
        } else {
            if (!stringInText(config.generalNameAliases, e.text)) {
                return;
            }
        }

		if (!config.autoRespond) {
			return;
		}

        if (!stringInText(config.idleAliases, e.text) || e.text.length > 128) {
            return;
        }

        // log the idle check
        _log('Possible idle check: ' + e.text);

        // create a response
        var response = randomChoice(config.idleReplies);

		// replace nickname
		response = response.replace('{{NICKNAME}}', e.name);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Responding with: ' + response);
            say(response);
        }, randomDelay(2, 8));
    }

	/**
	 * Prevent user from becoming idle if no recent chat messaging.
	 */
	function preventIdle() {
		if (!config.antiIdle) {
			return;
		}

		// set the last motion time
		turntable.lastMotionTime = new Date().getTime();

		// attempt to override idle boot
		if (turntable.timers && turntable.timers.checkIdle && turntable.timers.checkIdle != null) {
			clearTimeout(turntable.timers.checkIdle);
			turntable.timers.checkIdle=null;
		}
		turntable.isIdle = false;

		// if we're not djing, nobody cares to hear you. likewise if we recently replied
		if (!isDj() || recentlyResponded()) {
			return;
		}

        // create a response
        var response = randomChoice(config.idleMessages);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Preventing idle: ' + response);
            say(response);
        }, randomDelay(2, 8));
	}

	/**
	 * Handle auto-upvoting songs.
	 */
	function autoVote(e) {
		if (!config.autoUpvote || isCurrentDj()) {
			return;
		}

		// get the current song data
		var song = e.room.metadata.current_song.metadata;

		// our vote decision
		var vote = 'upvote';

		// cast vote
		setTimeout(function() {
			// if you're djing
			if (!isDj() || !isCurrentDj()) {
				_manager.callback('upvote');
			}
		}, randomDelay(3, 30))
	}

	/**
	 * Reset vote counters on a new song.
	 */
	function resetVotes(e) {
		// initially hide similar tracks
		$('#similarTracks').hide();

		// reset current vote counter
		votes.current.score = votes.current.votes = 0;
		votes.current.upvoters = [];
		votes.current.downvoters = [];

		// display stat updates
		$('#tt2_stats_current_upvotes').text(0);
		$('#tt2_stats_current_downvotes').text(0);
		$('#tt2_stats_current_rating').text(0);
		$('#tt2_stats_current_votes').text(0);

		// increment total songs played
		votes.totalSongs += 1;
		$('#tt2_stats_overall_totalSongs').text(votes.totalSongs);

		// retrieve song data
		var song_id = _room.currentSong._id;
		var song = _room.currentSong.metadata;

		// update the window title
		document.title = 'TT.FM Playing: ' + song.artist + ' - "' + song.song + '" (' + song.album + ')';

		// if this is the first time the song has been played
		if (!votes.songs[song_id]) {
			votes.songs[song_id] = {
				artist: song.artist,
				title: song.song,
				album: song.album,
				coverart: song.coverart,
				plays: 1,
				score: 0,
				votes: 0,
				upvoters: [],
				downvoters: []
			}
		} else {
			// add to the play counter
			votes.songs[song_id].plays += 1;
		}

		// handle purchase cover art
		var alt = escape(song.artist) + ' - ' + escape(song.song) + ' (' + escape(song.album) + ')';
		var details = '<p><span>Artist:</span> <strong>' + song.artist + '</strong></p>';
		details += '<p><span>Track:</span> <strong>' + song.song + '</strong></p>';
		details += '<p><span>Album:</span> <strong>' + (song.album?song.album:'n/a') + '</strong></p>';

		var albumArt = '';
		if (song.coverart) {
			albumArt += '<img src="' + song.coverart + '" width="150" height="150" alt="' + alt + '" />';
		} else {
			albumArt += '<div class="img" width="150" height="150" alt="' + alt + '"></div>';
		}

		$('#tt2_stats_current_coverart').find('.songinfo').css('min-width', tt2_size.width - 225);
		$('#tt2_stats_current_coverart').find('.songinfo').html(details);
		$('#tt2_stats_current_coverart').find('img, .img').eq(0).remove();
		$('#tt2_stats_current_coverart').prepend(albumArt);

		// update current song
		performSearch(song.artist, song.song, song.album || '');

		// if im djing, track votes
		if (isCurrentDj()) {
			// add to total songs played
			votes.mine.totalSongs += 1;
			$('#tt2_stats_mine_totalSongs').text(votes.mine.totalSongs);

			// handle individual song tracking
			if (!votes.mine.songs.song[song_id]) {
				votes.mine.songs.song[song_id] = {
					artist: song.artist,
					title: song.song,
					album: song.album,
					coverart: song.coverart,
					plays: 1,
					score: 0,
					votes: 0,
					upvoters: [],
					downvoters: []
				};
			} else {
				// add to the play counter
				votes.mine.songs[song_id].plays += 1;

			}
		}
	}

	/**
	 * Initially display song information when app is first loaded.
	 */
	function initCurrentlyPlaying() {
		if (!_room.currentSong || !_room.currentSong._id) {
			return false;
		}

		// retrieve song data
		var song_id = _room.currentSong._id;
		var song = _room.currentSong.metadata;

		// update the window title
		document.title = 'TT.FM Playing: ' + song.artist + ' - "' + song.song + '" (' + song.album + ')';

		// increment total songs played
		votes.totalSongs += 1;
		$('#tt2_stats_overall_totalSongs').text(votes.totalSongs);

		// handle purchase cover art
		var alt = escape(song.artist) + ' - ' + escape(song.song) + ' (' + escape(song.album) + ')';
		var details = '<p><span>Artist:</span> <strong>' + song.artist + '</strong></p>';
		details += '<p><span>Track:</span> <strong>' + song.song + '</strong></p>';
		details += '<p><span>Album:</span> <strong>' + (song.album?song.album:'n/a') + '</strong></p>';

		var albumArt = '';
		if (song.coverart) {
			albumArt += '<img src="' + song.coverart + '" width="150" height="150" alt="' + alt + '" />';
		} else {
			albumArt += '<div class="img" width="150" height="150" alt="' + alt + '"></div>';
		}

		$('#tt2_stats_current_coverart').find('.songinfo').css('min-width', tt2_size.width - 225);
		$('#tt2_stats_current_coverart').find('.songinfo').html(details);
		$('#tt2_stats_current_coverart').find('img, .img').remove();
		$('#tt2_stats_current_coverart').prepend(albumArt);

		// update current song
		performSearch(song.artist, song.song, song.album || '');

		// if this is the first time the song has been played
		if (!votes.songs[song_id]) {
			votes.songs[song_id] = {
				artist: song.artist,
				title: song.song,
				album: song.album,
				coverart: song.coverart,
				plays: 1,
				score: 0,
				votes: 0,
				upvoters: [],
				downvoters: []
			}
		} else {
			// add to the play counter
			votes.songs[song_id].plays += 1;
		}
	}

	/**
	 * Keeps internal track of voting for each new song played.
	 */
	function updateVotes(e) {
		// retrieve song data
		var song_id = _room.currentSong._id;
		var song = _room.currentSong.metadata;

		// update the counters
		var updateCounters = function(data) {
			votes.current.score = 100 * (data.upvotes / (data.downvotes + data.upvotes));
			votes.current.votes = data.upvotes + data.downvotes;

			// update current stats
			$('#tt2_stats_current_upvotes').text(data.upvotes);
			$('#tt2_stats_current_downvotes').text(data.downvotes);
			$('#tt2_stats_current_rating').text(votes.current.score + '%');
			$('#tt2_stats_current_votes').text(votes.current.votes);

			// update overall stats
			$('#tt2_stats_overall_upvotes').text(votes.upvotes);
			$('#tt2_stats_overall_downvotes').text(votes.downvotes);
			$('#tt2_stats_overall_rating').text(votes.score + '%');

			// update personal stats
			$('#tt2_stats_mine_votes').text(votes.mine.votes);
			$('#tt2_stats_mine_upvotes').text(votes.mine.upvotes);
			$('#tt2_stats_mine_downvotes').text(votes.mine.downvotes);
			$('#tt2_stats_mine_rating').text(votes.mine.score + '%');
		};

		// record a vote
		var recordVote = function(data) {
			// the room users
			var users = _room.users;

			// the voting user
			var uid = data[0];

			// add to overall votes
			votes.votes += 1;

			// ensure we have an object to track user voting
			if (!votes.user[uid]) {
				votes.user[uid] = {
					songs: 0,
					score: 0,
					upvotes: 0,
					downvotes: 0
				};
			}

			// if an upvote was cast
			if (data[1] == 'up') {
				// add to current upvoters
				votes.current.upvoters[uid] = users[uid].name;

				// add to the user
				votes.user[uid].songs += 1;
				votes.user[uid].upvotes += 1;
				votes.user[uid].score = Math.round(10000 * (votes.user[uid].upvotes / (votes.user[uid].downvotes + votes.user[uid].upvotes))) / 100;

				// add to overall
				votes.upvotes += 1;
				votes.score = Math.round(10000 * (votes.upvotes / votes.votes)) / 100;

				// if im djing
				if (isCurrentDj()) {
					// increment my total upvotes
					votes.mine.votes += 1;
					votes.mine.upvotes += 1;
					votes.mine.score = Math.round(10000 * (votes.mine.upvotes / (votes.mine.downvotes + votes.mine.upvotes))) / 100;

					// add upvoter to my song
					votes.mine.songs.song[song_id].upvoters[uid] = users[uid].name;
				}
			} else {
				// add to current downvoters
				votes.current.downvoters[uid] = users[uid].name;

				// add to the user
				votes.user[uid].songs += 1;
				votes.user[uid].downvotes += 1;
				votes.user[uid].score = Math.round(10000 * (votes.user[uid].upvotes / (votes.user[uid].downvotes + votes.user[uid].upvotes))) / 100;

				// add to overall
				votes.downvotes += 1;
				votes.score = Math.round(10000 * (votes.upvotes / votes.votes)) / 100;

				// if im djing
				if (isCurrentDj()) {
					_log('I must be djing...');

					// increment my total downvotes
					votes.mine.votes += 1;
					votes.mine.downvotes += 1;
					votes.mine.score = votes.mine.upvotes / (votes.mine.downvotes + votes.mine.upvotes);

					// add downvoter to my song
					votes.mine.songs.song[song_id].downvoters[uid] = users[uid].name;
				}
			}
		}

		// retrieve voters
		var updateVotersList = function() {
			if (votes.current.upvoters.length) {
				$('#tt2_stats_current_upvoters').html('<li>' + votes.current.upvoters.join('</li><li>') + '</li>');
			}
			if (votes.current.downvoters.length) {
				$('#tt2_stats_current_downvoters').html('<li>' + votes.current.downvoters.join('</li><li>') + '</li>');
			}
		}

		_log('Performing vote updating actions.');

		// perform actions
		updateCounters(e.room.metadata);
		recordVote(e.room.metadata.votelog[0]);

		// update list of voters
		updateVotersList();
	}

	/**
	 * Update the number of current users in the room.
	 */
	function getUsersCount() {
		// update the number of users in the room
		var count = _room.numUsers();
		if (stats.usersCount != count) {
			stats.usersCount = count;
			$('#tt2_stats_overall_users').text(count);
		}
	}

	/**
	 * Listen to all incoming messages and route accordingly.
	 */
	function messageListener(e) {
		if (e.hasOwnProperty('msgid')) {
			return;
		}

		// handle chat messages
		if (e.command == 'speak' && e.userid) {
			watchForChatMentions(e);
		} else if (e.command == 'newsong') {
			resetVotes(e);
			autoVote(e);
		} else if (e.command == 'update_votes') {
			updateVotes(e);
		}
	}

	//=========================================
	// INITIALIZER - WHERE THE MAGIC  HAPPENS =
	//=========================================

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {

		// unbind some initial crap
		$(document.body).unbind("mousemove mouseup mouseout");
		$('#right-panel').find(".chatHeader").unbind('mousedown').css('cursor', 'default');

		// display the options menu
		_log('Displaying the options menu.');
		displayOptionsMenu();

        // begin event listeners
        _log('Initiating the event listener.');
		_tt.addEventListener('message', messageListener);

		// grab initial song data
		initCurrentlyPlaying();

		// log the manager
		_log(_room);
		_log(_manager);

		// watch for window resize
		$(window).bind('resize', function(e) {
			var $this = $(this);
			// compare old and new size
			var oldSize = windowSize;
			windowSize.width = $this.width();
			windowSize.height = $this.height();
			if (oldSize.width != windowSize.width) {
				tt2_size.width = windowSize.width - containerWidth;
				$('#tt2_container').css('width', tt2_size.width - 20);
			}

			if (oldSize.height != windowSize.height) {
				tt2_size.height = windowSize.height;
				$('#tt2_container').css('height', tt2_size.height - 20);
			}

			// fix chat window size
			var tt2_playing_size = {
				width: $('#tt2_playing').innerWidth(),
				height: $('#tt2_playing').innerHeight()
			};

			$('#tt2_chat_box').find('.chat_container').css({
				height: tt2_size.height - tt2_playing_size.height,
				width: tt2_size.width - tt2_playing_size.width,
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});
		});

		// periodically check for number of users
		setInterval(function() {
			getUsersCount();
		}, 5000);

		// periodically update turntable.lastMotionTime
		setInterval(function() {
			preventIdle();
		}, 10100);
    });

	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

	/**
	 * Update settings by using localstorage.
	 */
	function updateSettings() {
		store.set('config', config);
	}

	/**
	 * Display the options menu.
	 */
	function displayOptionsMenu() {
		// re-position TT.FM
		$('#outer').css('margin', 0);
		$('#footer').css({ 'text-align': 'left' });

		// create tt2 container
		var html = '<div id="tt2_container" style="display: block; width:' + (tt2_size.width-20) + 'px;height:' + (tt2_size.height-20) + 'px;">';
			html += '<h3>';
			html += '<span class="floatleft">Turntable.FM Squared</span>';
			html += '<ul id="tt2_nav" class="floatright">';
			html += '<li><a href="#" class="btn selected" data-id="chat">chat</a></li>';
			html += '<li><a href="#" class="btn" data-id="stats">stats</a></li>';
			html += '<li><a href="#" class="btn" data-id="settings">settings</a></li>';
			html += '</ul>';
			html += '</h3>';

			// currently playing container
			html += '<div id="tt2_playing">';
				html += '<h4 class="toggleAccordion">Currently Playing</h4>';
				html += '<div id="tt2_stats_current_coverart">';
					html += '<div class="songinfo"></div>';
				html += '</div>';
				html += '<div id="similarTracks">';
					html += '<h4 class="toggleAccordion">Similar Tracks</h4>';
					html += '<div class="scroller">';
						html += '<table cellpadding="0" cellspacing="0"><thead><tr><th>&nbsp;</th><th>Artist</th><th>Song</th><th>&nbsp;</th></thead><tbody></tbody></table>';
					html += '</div>';
				html += '</div>';
			html += '</div>';

			// stats wrapper
			html += '<div id="tt2_stats" class="section" style="display:none">';
				// current track stats
				html += '<h4>Stats</h4>';
				html += '<div class="accordion">'; // stats accordion wrapper
					html += '<h5 class="toggleAccordion">Current Track</h5>';
					html += '<div id="tt2_stats_current">';
						html += '<ul class="stats">';
							html += '<li>Votes: <span id="tt2_stats_current_votes">0</span></li>';
							html += '<li>Upvotes: <span id="tt2_stats_current_upvotes">0</span></li>';
							html += '<li>Downvotes: <span id="tt2_stats_current_downvotes">0</span></li>';
							html += '<li>Rating: <span id="tt2_stats_current_rating">0</span></li>';
						html += '</ul>';
					html += '</div>';

					// personal stats
					html += '<h5 class="toggleAccordion">My Stats</h5>';
					html += '<div id="tt2_stats_mine">';
						html += '<ul class="stats">';
							html += '<li>Songs Played: <span id="tt2_stats_mine_totalSongs">0</span></li>';
							html += '<li>Votes: <span id="tt2_stats_mine_votes">0</span></li>';
							html += '<li>Upvotes: <span id="tt2_stats_mine_upvotes">0</span></li>';
							html += '<li>Downvotes: <span id="tt2_stats_mine_downvotes">0</span></li>';
							html += '<li>Rating: <span id="tt2_stats_mine_rating">0</span></li>';
						html += '</ul>';
					html += '</div>';

					// overall stats
					html += '<h5 class="toggleAccordion">Overall Room Stats</h5>';
					html += '<div id="tt2_stats_overall">';
						html += '<ul class="stats">';
							html += '<li>Total Users: <span id="tt2_stats_overall_users">0</span></li>';
							html += '<li>Songs Played: <span id="tt2_stats_overall_totalSongs">0</span></li>';
							html += '<li>Upvotes: <span id="tt2_stats_overall_upvotes">0</span></li>';
							html += '<li>Downvotes: <span id="tt2_stats_overall_downvotes">0</span></li>';
							html += '<li>Rating: <span id="tt2_stats_overall_rating">0</span></li>';
						html += '</ul>';
					html += '</div>';

					// user stats
					html += '<h5 class="toggleAccordion">User Stats</h5>';
					html += '<div id="tt2_stats_user" style="display:none">';
						html += '<ul></ul>';
					html += '</div>';

					/*
					// song stats
					html += '<h5>Song Stats</h5>';
					html += '<div id="tt2_stats_song">';
					html += '<ul></ul>';
					html += '</div>';
					*/
				html += '</div>'; // end stats accordion container
			html += '</div>'; // end stats wrapper

			// options container
			html += '<div id="tt2_settings" class="section" style="display:none">';
				html += '<h4 class="toggleAccordion">Settings</h4>';
				html += '<div class="accordion">';
					html += '<div><label><input type="checkbox" name="tt2_autoupvote" id="tt2_autoupvote" value="1" checked="checked" /> Auto Upvote</label></div>';
					html += '<div><label><input type="checkbox" name="tt2_autodj" id="tt2_autodj" value="1" /> Auto DJ</label></div>';
					html += '<div><label><input type="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1" checked="checked" /> Auto Respond</label></div>';
					html += '<div><label><input type="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1" checked="checked" /> Anti Idle</label></div>';
					html += '<div><label><input type="checkbox" name="tt2_muteAlert" id="tt2_muteAlert" value="1" checked="checked" /> Enable Mention Alert</label></div>';

					html += '<div><label for="tt2_name_aliases">My Aliases</label><textarea name="tt2_name_aliases" id="tt2_name_aliases">' + config.nameAliases.join('\n') + '</textarea><span class="note">This represents any strings someone may use to reference you in a chat message. It could be shorthand for your alias. Separate each with commas.</span></div>';
					html += '<div><label for="tt2_general_name_aliases">General Aliases</label><textarea name="tt2_general_name_aliases" id="tt2_general_name_aliases">' + config.generalNameAliases.join('\n') + '</textarea><span class="note">Any string in a chat message that may refer to everybody in the room as a whole. Separate by commas.</div>';
					html += '<div><label for="tt2_idle_aliases">Idle Aliases</label><textarea name="tt2_idle_aliases" id="tt2_idle_aliases">' + config.idleAliases.join('\n') + '</textarea><span class="note">Words mentioned in chat that may pertain to being idle, away from keyboard, etc.</div>';
					html += '<div><label for="tt2_idle_replies">Idle Replies</label><textarea name="tt2_idle_replies" id="tt2_idle_replies">' + config.idleReplies.join('\n') + '</textarea><span class="note"></span></div>';
					html += '<div><label for="tt2_idle_messages">Idle Messages</label><textarea name="tt2_idle_messages" id="tt2_idle_messages">' + config.idleMessages.join('\n') + '</textarea><span class="note"></span></div>';

					html += '<div><button type="button" name="updateSettings" id="updateSettings" name="Save Changes">Save Changes</button></div>'

				html += '</div>';
			html += '</div>';

			// chat container
			html += '<div id="tt2_chat" class="section">';
				html += '<h4 class="toggleAccordion">Chat</h4>';
				html += '<div class="accordion">';
					html += '<div id="tt2_chat_box"></div>';
				html += '</div>';
			html += '</div>';

		html += '</div>'; // close container

		// append
		$(html).appendTo('body');

		// get title height
		var title_height = $('#right-panel').find('.black-right-header').height();

		// get the chat container height
		var $chat_container = $('#right-panel').find('.chat-container');
		$chat_container.find('.chatResizeIcon').hide();
		var chat_height = $chat_container.height();

		// get the current songlist height
		var songlist_height = $('#right-panel').find('.queueView .songlist').height();

		// get the current queue height
		var queue_height = $('#right-panel').find('.queueView').height();

		// move the chat container
		$chat_container.appendTo($('#tt2_chat_box'));

		// fix songlist height within queue
		$('#right-panel').find('.queueView .songlist').css('height', songlist_height + chat_height);
		$('#right-panel').find('.searchView .songlist').css('height', songlist_height + chat_height);
		$('#right-panel').find('.addSongsView').css('height', queue_height + chat_height);

		// set container height to full
		$('#right-panel').find('.playlist-container').css('height', queue_height + chat_height + title_height);

		// fix chat window size
		var tt2_playing_size = {
			width: $('#tt2_playing').innerWidth(),
			height: $('#tt2_playing').outerHeight()
		};

		// fix for min-height
		if (tt2_playing_size.height < 204) tt2_playing_size.height = 204;

		// fix chat sizing in TT2
		$('#tt2_chat_box').find('.chat-container').css({
			height: '' + (tt2_size.height - tt2_playing_size.height - 40) + 'px !important',
			width: '100%',
			top: '0 !important',
			left: '0 !important'
		});

		$('#tt2_chat_box').find('.chat-container .messages').css({
			height: '' + (tt2_size.height - tt2_playing_size.height - title_height - 40) + 'px !important',
			'overflow-x': 'none !important',
			'overflow-y': 'auto !important'
		});

		// reference all config options just once
		var $options = $('#tt2_stats');
		var $auto_upvote = $options.find('#tt2_autoupvote');
		var $auto_dj = $options.find('#tt2_autodj');
		var $auto_respond = $options.find('#tt2_autorespond');
		var $anti_idle = $options.find('#tt2_antiidle');
		var $mute_alert = $options.find('#tt2_muteAlert');
		var $name_aliases = $options.find('#tt2_name_aliases');
		var $general_name_aliases = $options.find('#tt2_general_name_aliases');
		var $idle_aliases = $options.find('#tt2_idle_aliases');
		var $idle_replies = $options.find('#tt2_idle_replies');
		var $idle_messages = $options.find('#tt2_idle_messages');

		// watch for nav change
		$('#tt2_nav .btn').live('click', function() {
			var $this = $(this);
			$('#tt2_nav').find('.btn').removeClass('selected');
			$('#tt2_container').find('.section').hide();
			$this.addClass('selected');
			var $target = $('#tt2_' + $this.data('id'));
			if ($target.length) {
				$target.stop(true, true).slideDown('fast');
			}
			return false;
		});

		// watch for change to options
		$options.find('#updateSettings').click(function() {
			var checked;
			// save all option changes
			config.autoUpvote = $auto_upvote.is(':checked');
			config.autoDj = $auto_dj.is(':checked');
			config.autoRespond = $auto_respond.is(':checked');
			config.antiIdle = $anti_idle.is(':checked');
			config.muteAlert = $mute_alert.is(':checked');

			// update textarea options
			config.nameAliases = $name_aliases.val().split(/\n\r?/g);
			config.generalNameAliases = $general_name_aliases.val().split(/\n\r?/g);
			config.idleAliases = $idle_aliases.val().split(/\n\r?/g);
			config.idleReplies = $idle_replies.val().split(/\n\r?/g);
			config.idleMessages = $idle_messages.val().split(/\n\r?/g);

			// handle trying to auto-dj
			if (config.autoDj) emptySlotCheck();

			// update the localstorage settings
			updateSettings();
		});

		// watch for accordion toggles
		$('.toggleAccordion').live('click', function() {
			$(this).next('div').stop().slideToggle('fast');
			return false;
		});

		// watch for similar track click
		/*
		$('.similarTracks').live('click', function() {
			var $this = $(this);
			var artist = $this.data('artist');
			var song = $this.data('song');
			getSimilarTracks(artist, song);
			return false;
		});
		*/
	}

	/**
	 * Perform an iTunes song search. Valid return entities include
	 * musicArtist, musicTrack, album, musicVideo, mix, and song.
	 *
	 * Please note that "musicTrack" can include both songs and music videos in
	 * the results.
	 */
	function performSearch(artist, song, album) {
		// create new search
		var params = {
			term: artist + ' ' + song,
			country: 'US',
			media: 'music',
			entity: 'musicTrack',
			// mixTerm, genreIndex, artistTerm, composerTerm, albumTerm, ratingIndex, songTerm, musicTrackTerm
			//attribute: 'artistTerm,albumTerm,songTerm,musicTrackTerm',
			limit: 1,
			callback: 'handleItunesResults'
		};
		var url = 'http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?' + urlencode(params);
		var html = '<script src="' + url + '"><\/script>';
		$('head').append(html);
	}

	/**
	 * Urlencode a flat JSON object.
	 */
	function urlencode(params) {
		var combined = [];
		for (var k in params) {
			combined.push(k + '=' + encodeURIComponent(params[k]));
		}
		return combined.join('&');
	}

	/**
	 * Check if currently DJing.
	 */
	function isDj() {
		if (typeof _manager.djs != 'undefined') {
			for (var i in _manager.djs) {
				if (typeof _manager.djs[i] != 'undefined') {
					if (_manager.djs[i][0] == _room.selfId) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Check if currently playing a song.
	 */
	function isCurrentDj() {
		return _manager.current_dj && _manager.current_dj[0] == _manager.myuserid;
	}

	/**
	 * Check if we recently responded to a message or idle check.
	 */
	function recentlyResponded() {
        // check if we responded to an idle request recently
        var now = new Date().getTime();
        if (now - lastIdleResponse < maxIdleResponseFreq) {
            return true;
        }

		// update the last idle response
		_log('No recent activity in ' + (maxIdleResponseFreq / 60000) + ' minutes, updating lastIdleResponse time.');
        lastIdleResponse = new Date().getTime();

		return false;
	}

    /**
     * Play an alert when mentioned.
     */
    function playAlertSound() {
        if (config.muteAlert) return;
		if (turntablePlayer) {
			setTimeout(function() {
				turntablePlayer.playEphemeral(UI_SOUND_CHAT, true);
			}, 500);
		}
    }

	// send a message
	function say(msg) {
		var $chatForm = $(_room.nodes.chatForm)
		$chatForm.find('input').val(msg)
		$chatForm.submit()
	}

	/**
	 * Handle stopping Auto DJ and stepping down from the decks.
	 */
	function stopDjing(delay) {
		if (!delay) delay = 0;
		setTimeout(function() {
			stopBot();
			_manager.callback('rem_dj');
		}, delay);
	}

	/**
	 * Return a random int between two vals.
	 */
	function randomDelay(min, max) {
		min = min || 2;
		max = max || 70;
		return (Math.random() * max + min) * 1000;
	}

	/**
	 * Given an array, return a random val.
	 */
	function randomChoice(options) {
		var idx = Math.floor(Math.random() * options.length);
		return options[idx];
	}

	/**
	 * Check for text match in an array of strings.
	 */
	function stringInText(strings, text, forceWord) {
		forceWord = !forceWord ? false : true;
		text = text.toLowerCase();
		for (var s in strings) {
			var string = strings[s].toLowerCase();
			if (forceWord) {
				string = new RegExp("\\b#{string}\\b");
			}
			if (text.search(string) > -1) {
				return true
			}
		}
		return false
	}

	/**
	 * Safely log a message.
	 */
	function _log(msg) {
		if (window.console && config.debugMode) {
			console.log(msg);
		}
	}

})();

/**
 * Safely log a message.
 */
function _log(msg) {
	if (window.console) {
		console.log(msg);
	}
}

/**
 * Retrieve similar tracks via Last.FM
 * http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=cher&track=believe&api_key=d1b14c712954973f098a226d80d6b5c2
 */
function getSimilarTracks(artist, song, album) {
	var url = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&autocorrect=1&artist=' + encodeURIComponent(artist) + '&track=' + encodeURIComponent(song) + '&api_key=d1b14c712954973f098a226d80d6b5c2&format=json&callback=?';
	$.getJSON(url, function(data) {
		var html = '';
		if (!data || !data.similartracks || !data.similartracks.track) {
			return;
		}

		// log similar tracks until we're happy
		_log('Similar tracks');
		_log(data);
		_log(data.similartracks);

		if (typeof data.similartracks.track == 'string') {
			_log('Hiding similar tracks due to no string match.');
			$('#similarTracks').hide();
			return false;
		}

		// iterate over each similar track
		var alt = false;
		$.each(data.similartracks.track, function(i, item) {

			// name
			// playcount
			// duration
			// url
			// artist.name
			// artist.mbid
			// artist.url
			// image[size|"#text"]

			html += '<tr ' + (alt ? 'style="background-color:#292929";' : 'style="background-color:#2c2c2c";') + '>';
			if (item.image && item.image[1] && item.image[1]['#text'].length) {
				html += '<td><img src="' + item.image[1]['#text'] + '" height="32" width="32" /></td>';
			} else {
				html += '<td><div class="img"></div></td>';
			}
			html += '<td>' + item.artist.name + '</td>';
			html += '<td>' + item.name + '</td>';

			if (item.mbid.length) {
				html += '<td><a href="#">Preview &amp; Buy Track</a></td>';
				// get buy links and change them
				// http://www.last.fm/api/show?service=431
				var buyUrl = 'http://ws.audioscrobbler.com/2.0/?method=track.getbuylinks&artist=' + encodeURIComponent(artist) + '&track=' + encodeURIComponent(song) + '&api_key=d1b14c712954973f098a226d80d6b5c2&format=json&callback=?';
				$.getJSON(buyUrl, function(data) {
					_log('buy url data');
					_log(data);
				});
			} else {
				html += '<td>&nbsp;</td>';
			}
			//if (item.artist.mbid.length) {
			//	html += '<p><a href="#" style="display:block">View Artist Details</a>';
			//}
			html += '</tr>';
			alt = !alt;
		});

		if (html.length) {
			// append html
			$('#similarTracks').find('table tbody').html(html);
			$('#similarTracks').show();
		}
	});
}

/**
 * Given a set of itunes search results, display them.
 * http://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html#lookup
 * http://www.rahulsingla.com/blog/2011/08/itunes-performing-itunes-store-search-in-javascript
 */
function handleItunesResults(arg) {
	var results = arg.results;
	var len = results ? results.length : 0;
	if (len) {

		var html = '';
		var sim = '';

		for (var i = 0; i < len; i++) {
			// check if we need album art
			$caholder = $('#tt2_stats_current_coverart');
			if ($caholder.find('img').length == 0 && results[i].artworkUrl100) {
				var alt = escape(results[i].artistName) + ' - ' + escape(results[i].trackName) + ' (' + escape(results[i].collectionName) + ')';
				var img = '<img class="img100" src="' + results[i].artworkUrl100 + '" width="100" height="100" alt="' + alt + '" />';
				$caholder.find('#tt2_stats_current_coverart .img').eq(0).remove();
				$caholder.find('#tt2_stats_current_coverart').prepend(img);
			}

			// generate baseurl
			var baseurl = 'http://click.linksynergy.com/fs-bin/stat?id=5PGIX6Dk9zE&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=';

			// attach partner id to link urls
			var trackUrl = baseurl + encodeURI(encodeURI(results[i].trackViewUrl + '&partnerId=30'));
			var artistUrl = baseurl + encodeURI(encodeURI(results[i].artistViewUrl + '&partnerId=30'));
			var albumUrl = baseurl + encodeURI(encodeURI(results[i].collectionViewUrl + '&partnerId=30'));

			// create html
			html += '<div class="purchaseinfo">';
			html += '<a href="' + trackUrl + '" target="_blank">Buy Track $' + results[i].trackPrice + '</a>';
			html += '<a href="' + albumUrl + '" target="_blank">Buy Album $' + results[i].collectionPrice + '</a>';
			html += '<a href="' + artistUrl + '" target="_blank">View Artist Details and Top Songs</a>';
			html += '</div>';

			// only display first result
			break;
		}

		// display
		$('#tt2_stats_current_coverart').find('.songinfo').append(html);

		// attempt to find similar tracks
		getSimilarTracks(results[i].artistName, results[i].trackName);
	}

	// clean up the JS from HEAD
	$('head').find('script[src^="http://ax.itunes.apple.com"]').remove();
}
