/* Copyright (c) 2010-2011 Marcus Westin */
var lstore=function(){var b={},e=window,g=e.document,c;b.disabled=false;b.set=function(){};b.get=function(){};b.remove=function(){};b.clear=function(){};b.transact=function(a,d){var f=b.get(a);if(typeof f=="undefined")f={};d(f);b.set(a,f)};b.serialize=function(a){return JSON.stringify(a)};b.deserialize=function(a){if(typeof a=="string")return JSON.parse(a)};var h;try{h="localStorage"in e&&e.localStorage}catch(k){h=false}if(h){c=e.localStorage;b.set=function(a,d){c.setItem(a,b.serialize(d))};b.get=
function(a){return b.deserialize(c.getItem(a))};b.remove=function(a){c.removeItem(a)};b.clear=function(){c.clear()}}else{var i;try{i="globalStorage"in e&&e.globalStorage&&e.globalStorage[e.location.hostname]}catch(l){i=false}if(i){c=e.globalStorage[e.location.hostname];b.set=function(a,d){c[a]=b.serialize(d)};b.get=function(a){return b.deserialize(c[a]&&c[a].value)};b.remove=function(a){delete c[a]};b.clear=function(){for(var a in c)delete c[a]}}else if(g.documentElement.addBehavior){c=g.createElement("div");
e=function(a){return function(){var d=Array.prototype.slice.call(arguments,0);d.unshift(c);g.body.appendChild(c);c.addBehavior("#default#userData");c.load("localStorage");d=a.apply(b,d);g.body.removeChild(c);return d}};b.set=e(function(a,d,f){a.setAttribute(d,b.serialize(f));a.save("localStorage")});b.get=e(function(a,d){return b.deserialize(a.getAttribute(d))});b.remove=e(function(a,d){a.removeAttribute(d);a.save("localStorage")});b.clear=e(function(a){var d=a.XMLDocument.documentElement.attributes;
a.load("localStorage");for(var f=0,j;j=d[f];f++)a.removeAttribute(j.name);a.save("localStorage")})}}try{b.set("__storejs__","__storejs__");if(b.get("__storejs__")!="__storejs__")b.disabled=true;b.remove("__storejs__")}catch(m){b.disabled=true}return b}();

window.TTFM_SQ = null;
(function(){

	window.TTFM_SQ = function() {
		// TT.FM objects
		var _tt = turntable;
		var _room = null;
		var _mods = [];
		var _manager = null;
		var _k = null;
		var self = this;

		// some specific user monitors
		var _lastUserActions = {};
		var _usernameMappings = {};

		// sizing
		var windowSize = {
			width: $(window).width(),
			height: $(window).height()
		};
		var chat_user_width = 100;
		var containerWidth = $('#outer').width();
		var tt2_size = {
			width: windowSize.width - containerWidth,
			height: windowSize.height
		}

		// prepare default config
		var defaults = {
			debugMode: true,
			autoDj: false,
			autoRespond: true,
			antiIdle: true,
			showIdleTimes: false,
			muteAlert: false,
			autoUpvote: true,
			autoDjTimeout: 25,
			enableNotifications: false,
			notificationTime: 10,
			notifications: {
				enablePM: true,
				antiIdle: true,
				emptyDjSlot: true,
				songChange: true,
				fanChange: true,
				antiAutoDj: true
			},
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
			]
		};

		// handle config values
		var config = lstore.get('config');
		if (!config) {
			config = defaults;
			lstore.set('config', config);
		} else {
			// merge config with defaults to ensure no missing params
			config = $.extend({}, defaults, config);
			lstore.set('config', config);
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
			hearts: 0,

			// for the current song
			current: {
				score: 0,
				votes: 0,
				hearts: 0,
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
				hearts: 0,
				upvotes: 0,
				downvotes: 0,
				songs: {
					/* score: 0, votes: 0, hearts: 0, upvoters: [], downvoters: [], info: [] */
				}
			}
		};

		// the maximum idle response frequency (milliseconds)
		var maxIdleResponseFreq = 600000;
		var maxDjIdleTime = 600000;
		// the last idle response time for ourselves
		var lastIdleResponse = new Date().getTime();
		// settimeout for guest list update
		var idleTimeInterval = null;
		// the last time a dj stepped down from the decks
		var lastRemovedDjTime = null;

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
							_log(_room);
							_mods = _room.moderators || [];
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
								_log(_manager);
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
		function claimEmptyDjSlot(e) {
			if (config.notifications.emptyDjSlot) {
				var msg = '<p>A DJ slot just opened.</p>';
				//msg += '<button type="button" id="becomeDj" class="btn btnGreen" name="becomeDj">Grab Open Slot</button>';

				sendNotification(
					'Empty DJ Slot',
					msg,
					'http://cballou.github.com/Turntable.FM-Squared'
				);
			}

			// if auto dj disabled, return
			if (!config.autoDj) {
				return;
			}

			if (_tt.user.id == e.user[0].userid) {
				_log('You just stepped down or got kicked off the decks.');
				return;
			}

			if (isDj()) {
				_log('You are already on the decks. Can\'t step up.');
			}

			// become dj
			self.becomeDj();
		}

		/**
		 * Handles becoming a DJ.
		 */
		this.becomeDj = function() {
			_log('Attempting to become DJ.');
			setTimeout(function() {
				_manager.callback('become_dj', _manager.become_dj.data('spot'))
			}, config.autoDjTimeout);
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
		 * Watch for specific command triggers.
		 */
		function watchForCommands(e) {
			/*
			if (stringInText('/djs', e.text)) {
				if (config.showIdleTimes) {
					if (typeof _manager.djs != 'undefined') {
						var msg = [];
						for (var i in _manager.djs) {
							if (typeof _manager.djs[i] != 'undefined') {
								var user_id = _manager.djs[i][0];
								if (typeof _room.users[user_id] != 'undefined') {
									var username = _room.users[user_id].name;
									if (typeof _lastUserActions[user_id] != 'undefined') {
										msg.push(username + ': ' + formatDate(_lastUserActions[user_id]));
									} else {
										msg.push(username + ': 0:00');
									}
								}
							}
						}
						say('-= ' + msg.join(', ') + ' =-');
					}
				}
			}
			*/
		}

		/**
		 * Periodically check if you get mentioned in the chat room.
		 */
		function watchForChatMentions(e) {
			// don't deal with ourselves
			if (e.senderid && e.senderid == _manager.myuserid) {
				return;
			}

			// handle alerting when mentioned
			if (stringInText(config.nameAliases, e.text, true)) {
				// send a notification of the mention
				playAlertSound();

				// handle mention alert
				if (config.notifications.mention) {
					sendNotification(
						'Mention Alert',
						e.text,
						'http://cballou.github.com/Turntable.FM-Squared'
					);
				}
			} else {
				// don't continue if we don't have a generalized message to all
				if (!stringInText(config.generalNameAliases, e.text)) {
					return;
				}
			}

			// handle watching for an idle mention
			watchForIdleMention(e);
		}

		/**
		 * If mentioned while idle and a specific idle keyword is triggered,
		 * send random idle response.
		 */
		function watchForIdleMention(e) {
			// don't continue if we aren't autoresponding
			if (!config.autoRespond) {
				return;
			}

			if (!stringInText(config.idleAliases, e.text) || e.text.length > 128) {
				return;
			}

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

			// if we're not djing, nobody cares to hear you.
			// likewise if we recently replied
			if (!isDj() || recentlyResponded()) {
				return;
			}

			// handle notifying the user
			if (config.notifications.antiIdle) {
				sendNotification(
					'Are You There?',
					'It looks as though you may have gone idle. You have been idle for ' +
					formatDate(lastIdleResponse),
					'http://cballou.github.com/Turntable.FM-Squared'
				);
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
		 * Update the last user action
		 */
		function updateLastUserAction(user_id) {
			_lastUserActions[user_id] = new Date().getTime();
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
			}, randomDelay(5, 30));
		}

		/**
		 * Reset vote counters on a new song.
		 */
		function resetVotes(e) {
			// initially hide similar tracks
			if (!$('#similar_tracks').is(':hidden')) {
				$('#tt2_nav .btnS').filter(function() {
					return $(this).data('id') === 'chat'
				}).trigger('click');
			}

			// reset current vote counter
			votes.current.score = 0;
			votes.current.votes = 0;
			votes.current.hearts = 0;
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
				albumArt += '<img src="' + song.coverart + '" class="coverart" width="150" height="150" alt="' + alt + '" />';
			} else {
				albumArt += '<div class="coverart" width="150" height="150" alt="' + alt + '"></div>';
			}

			$('#tt2_stats_current_coverart').find('.songinfo').css('min-width', tt2_size.width - 225);
			$('#tt2_stats_current_coverart').find('.songinfo').html(details);
			$('#tt2_stats_current_coverart').find('.coverart').eq(0).remove();
			$('#tt2_stats_current_coverart').prepend(albumArt);

			// update current song
			performSearch(song.artist, song.song, song.album || '');

			// if im djing, track votes
			if (isCurrentDj()) {
				// add to total songs played
				votes.mine.totalSongs += 1;
				$('#tt2_stats_mine_totalSongs').text(votes.mine.totalSongs);

				// handle individual song tracking
				if (!votes.mine.songs[song_id]) {
					votes.mine.songs[song_id] = {
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

			// notify of song change
			if (config.notifications.songChange) {
				var msg = '';
				if (song.coverart) {
					msg += '<img src="' + song.coverart + '" height="75" width="75" alt="' + alt + '" style="float:left;display:inline;margin:0 10px 10px 0" />';
				} else {
					msg += '<div alt="' + alt + '" style="background: #222; width: 75px; height: 75px; float: left; display: inline; margin:0 10px 10px 0"></div> '
				}
				msg += '<p>' + song.artist + ' - "' + song.song + '"';
				if (song.album && song.album.length) {
					msg += ' (' + song.album + ')';
				}
				msg += '</p>';

				sendNotification(
					'Now Playing...',
					msg,
					'http://cballou.github.com/Turntable.FM-Squared'
				);
			}
		}

		/**
		 * A user update event occurred, check if it entails adding or removing
		 * a fan.
		 */
		function updateFans(e) {
			if (typeof e.fans == 'undefined') {
				return;
			}

			// only show for ourselves
			if (e.userid != _room.selfId) {
				return;
			}

			// if mentions disabled
			if (!config.notifications.fanChange) {
				return;
			}

			if (e.fans === 1) {
				if (typeof _room.users[e.userid] != 'undefined') {
					var msg = _room.users[e.userid].name + ' has a new fan.';
					sendNotification(
						'You Gained a Fan.',
						msg,
						'http://cballou.github.com/Turntable.FM-Squared'
					);
				}
			} else if (e.fans === -1) {
				if (typeof _room.users[e.userid] != 'undefined') {
					var msg = _room.users[e.userid].name + ' lost a fan.';
					sendNotification(
						'You Lost a Fan.',
						msg,
						'http://cballou.github.com/Turntable.FM-Squared'
					);
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
				albumArt += '<img src="' + song.coverart + '" class="coverart" width="150" height="150" alt="' + alt + '" />';
			} else {
				albumArt += '<div class="coverart" width="150" height="150" alt="' + alt + '"></div>';
			}

			$('#tt2_stats_current_coverart').find('.songinfo').css('min-width', tt2_size.width - 225);
			$('#tt2_stats_current_coverart').find('.songinfo').html(details);
			$('#tt2_stats_current_coverart').find('.coverart').remove();
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
		 * A new snag was recorded. Track it.
		 */
		function updateHearts(e) {
			if (!_room.currentSong || !_room.currentSong._id) {
				return false;
			}

			// retrieve song data
			var song_id = _room.currentSong._id;
			var song = _room.currentSong.metadata;

			// add to current song
			votes.current.hearts += 1;

			// add to song history
			votes.songs[song_id].hearts += 1;

			// add to overall hearts
			votes.hearts += 1;

			// if I'm currently playing, add to mine
			if (isCurrentDj()) {
				votes.mine.hearts += 1;
				votes.mine.songs[song_id].hearts += 1;
				$('#tt2_stats_mine_hearts').text(votes.mine.votes);
			}

			// update stats
			$('#tt2_stats_current_hearts').text(votes.current.hearts);
			$('#tt2_stats_overall_hearts').text(votes.hearts);
		}

		/**
		 * Handles receiving a PM.
		 */
		function handlePM(e) {
			if (!config.notifications.enablePM) {
				return;
			}

			var msg = '';

			// attempt to get sender by id
			var username = getUsernameById(e.senderid);
			if (username) {
				msg = '<strong></strong> has sent you a private message: ';
			}
			msg += e.text;

			sendNotification(
				'Private Message',
				escape(e.text),
				'http://cballou.github.com/Turntable.FM-Squared'
			);
		}

		/**
		 * Keeps internal track of voting for each new song played.
		 */
		function updateVotes(e) {
			// retrieve song data
			var song_id = _room.currentSong._id;
			var song = _room.currentSong.metadata;

			/**
			 * Record the new vote.
			 */
			var recordVote = function(data) {
				// the voting user
				var uid = data[0];

				// ensure we have an object to track user voting
				if (!votes.user[uid]) {
					votes.user[uid] = {
						votes: 0,
						score: 0,
						upvotes: 0,
						downvotes: 0,
						hearts: 0
					};
				}

				// increment vote counts
				votes.votes += 1;
				votes.user[uid].votes += 1;
				votes.current.votes += 1;
				if (isCurrentDj()) {
					votes.mine.votes += 1;
				}

				// if an upvote was cast
				if (data[1] == 'up') {
					// add to current upvoters
					votes.current.upvoters[uid] = _room.users[uid].name;
					votes.current.upvotes += 1;

					// add to the user's votes
					votes.user[uid].upvotes += 1;

					// add to overall votes
					votes.upvotes += 1;

					// add to my vote stats
					if (isCurrentDj()) {
						votes.mine.votes += 1;
						votes.mine.upvotes += 1;
						votes.mine.songs[song_id].upvoters[uid] = _room.users[uid].name;
					}

					// check if they reversed their vote
					if (typeof votes.current.downvoters[uid] != 'undefined') {
						// remove from downvoters
						delete votes.current.downvoters[uid];

						// update votes
						votes.user[uid].downvotes -= 1;
						votes.user[uid].votes -= 1;
						votes.current.downvotes -= 1;
						votes.current.votes -= 1;
						votes.downvotes -= 1;
						votes.votes -= 1;

						if (isCurrentDj()) {
							votes.mine.downvotes -= 1;
							votes.mine.votes -= 1;
						}
					}

				} else {
					// add to current downvoters list
					votes.current.downvoters[uid] = _room.users[uid].name;
					votes.current.downvotes += 1;

					// add to the user
					votes.user[uid].downvotes += 1;

					// add to overall votes
					votes.downvotes += 1;

					// add to my vote stats
					if (isCurrentDj()) {
						votes.mine.votes += 1;
						votes.mine.downvotes += 1;
						votes.mine.songs[song_id].downvoters[uid] = _room.users[uid].name;
					}

					// check if they reversed
					if (typeof votes.current.upvoters[uid] != 'undefined') {
						// remove from upvoters
						delete votes.current.upvoters[uid];

						votes.user[uid].upvotes -= 1;
						votes.user[uid].votes -= 1;
						votes.current.upvotes -= 1;
						votes.current.votes -= 1;
						votes.upvotes -= 1;
						votes.votes -= 1;

						if (isCurrentDj()) {
							votes.mine.upvotes -= 1;
							votes.mine.votes -= 1;
						}
					}
				}

				// update the user's score
				votes.user[uid].score = 100 * (votes.user[uid].upvotes / votes.user[uid].votes).toFixed(2);

				// log the vote change
				_log(votes);
			}

			/**
			 * Update vote counters on the stats tab.
			 */
			var updateCounters = function() {
				// recalculate scores
				votes.score = 100 * (votes.upvotes / votes.votes).toFixed(2);
				votes.current.score = 100 * (votes.current.upvotes / votes.current.votes).toFixed(2);
				if (isCurrentDj()) {
					votes.mine.score = 100 * (votes.mine.upvotes / votes.mine.votes).toFixed(2);
				}

				// update current stats
				$('#tt2_stats_current_upvotes').text(votes.current.upvotes);
				$('#tt2_stats_current_downvotes').text(votes.current.downvotes);
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

			/**
			 * Update the list of voters.
			 */
			var updateVotersList = function() {
				var html = [];
				if (votes.current.upvoters) {
					for (var i in votes.current.upvoters) {
						html.push('<li>' + votes.current.upvoters[i] + '</li>');
					}
					$('#tt2_stats_current_upvoters').html(html);
				}

				html = [];
				if (votes.current.downvoters) {
					for (var i in votes.current.downvoters) {
						html.push('<li>' + votes.current.downvoters[i] + '</li>');
					}
					$('#tt2_stats_current_downvoters').html(html);
				}
			}

			// perform actions
			recordVote(e.room.metadata.votelog[0]);
			updateCounters();
			updateVotersList();
		}

		/**
		 * Update the number of current users in the room.
		 */
		function updateRoomUsers() {
			// the current time
			var curTime = new Date().getTime();

			// the room users
			var _users = _room.users;
			for (var i in _users) {
				// if no previous action, set
				if (typeof _lastUserActions[i] == 'undefined') {
					_lastUserActions[i] = curTime;
				}

				// map names to ids
				if (typeof _usernameMappings[ _users[i].name ] == 'undefined')
					_usernameMappings[ _users[i].name ] = i;
			}
		}

		/**
		 * Listen to all incoming messages and route accordingly.
		 */
		function messageListener(e) {
			if (e.hasOwnProperty('msgid')) {
				return;
			}

			if (e.command == 'rem_dj') {
				if (config.notifications.antiAutoDj) {
					lastRemovedDjTime = new Date().getTime();
				}

				// potentially claim empty slot
				claimEmptyDjSlot(e);
			} else if (e.command == 'add_dj') {
				// check last removed time
				if (config.notifications.antiAutoDj && lastRemovedDjTime) {
					var msg = '';
					var curTime = new Date().getTime();
					var elapsed = curTime - lastRemovedDjTime;
					lastRemovedDjTime = null;
					if (elapsed > 60000) {
						msg = 'The DJ slot was open for a staggering ' + (elapsed / 60000).toFixed(2) + ' minutes.';
					} else if (elapsed > 1000) {
						msg = 'The DJ Slot was open for ' + (elapsed / 1000).toFixed(2) + ' seconds.';
					} else {
						msg = 'The DJ Slot was only open for ' + elapsed + ' milliseconds.';
					}

					// send notification
					sendNotification(
						'DJ Slot Stats',
						msg,
						'http://cballou.github.com/Turntable.FM-Squared'
					);
				}
			} else if (e.command == 'speak' && e.userid) {
				watchForCommands(e);
				watchForChatMentions(e);
				updateLastUserAction(e.userid);
			} else if (e.command == 'newsong') {
				resetVotes(e);
				autoVote(e);
			} else if (e.command == 'update_votes') {
				updateVotes(e);
			} else if (e.command == 'update_user') {
				updateFans(e);
			} else if (e.command == 'add_dj') {
				updateLastUserAction(e.user[0].userid);
			} else if (e.command == 'registered') {
				for (var i in e.user) {
					var userinfo = e.user[i];
					updateLastUserAction(userinfo.userid);
				}
			} else if (e.command == 'snagged') {
				updateHearts(e);
			} else if (e.command == 'pmmed') {
				handlePM(e);
			}
		}

		/**
		 * Update the idle time display of each user. Handled based on a very
		 * small setTimeout which gets cleared if this function gets called
		 * again.
		 */
		function displayIdleTimes() {
			// check if we need to clear a timeout
			if (typeof idleTimeInterval == "number") {
				clearTimeout(idleTimeInterval);
				idleTimeInterval = null;
			}

			// attempt to repaint the DOM in 50 ms unless cancelled
			idleTimeInterval = setTimeout(function() {
				// get the current time
				var now = new Date().getTime();

				// update the chat box
				$('#tt2_chat_box')
					.find('.guest-list-container .guest')
					.each(function() {
						var $this = $(this);
						var $name = $this.find('.guestName');
						var username = $name.text();
						if (typeof _usernameMappings[username] != 'undefined') {
							var user_id = _usernameMappings[username];
							if (typeof _lastUserActions[user_id] != 'undefined') {
								// update special highlighters
								var modClass = isRoomModerator(user_id) ? ' isMod' : '';
								var isDjing = isDj(user_id);
								modClass += isDjing ? ' isDj' : '';
								if (isDjing && (now - _lastUserActions[user_id] > maxDjIdleTime)) {
									modClass += ' isIdle';
								}
								$this.removeClass('isMod isDj isIdle').addClass(modClass);

								// update idle time
								var lastIdle = formatDate(_lastUserActions[user_id]);
								var $guestIdle = $this.find('.guestIdle');
								if (!$guestIdle.length) {
									$name.after('<div class="guestIdle">' + lastIdle + '</div>');
								} else {
									$guestIdle.html(lastIdle);
								}
							}
						}
					})
					// find all DJs and Supers in the list
					.filter(function() {
						return $(this).hasClass('isMod') || $(this).hasClass('isDj');
					})
					// move to the top
					.prependTo($('#tt2_chat_box').find('.guest-list-container .guests'));
			}, 50);
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

			// initialize user idle times
			var curTime = new Date().getTime();
			for (var user_id in _room.users) {
				_lastUserActions[user_id] = curTime;
			}

			// begin event listeners
			_log('Initiating the event listener.');
			_tt.addEventListener('message', messageListener);

			// grab initial song data
			initCurrentlyPlaying();

			// log the manager
			//_log(_room);
			//_log(_manager);

			// watch for window resize
			$(window).bind('resize', resizeWindow);

			// watch for changes to DOM nodes
			$(document).bind('DOMNodeInserted', function(event) {
				var $node = $(event.target);
				if ($node.hasClass('guest')) {
					displayIdleTimes();
				}
			});

			// watch for search of an artists
			$('#tt2_container').delegate('.btnSearchArtist', 'click', function() {
				// unescape the term
				var term = $(this).data('term');
				// trigger TT.FM search
				$('#playlist .addSongsButton').trigger('click');
				$('#right-panel').find('form.songSearch').find('input').val(term);
				$('#right-panel').find('form.songSearch').trigger('submit');
				return false;
			});

			// periodically check for number of users
			setInterval(function() {
				updateRoomUsers();
			}, 5000);

			// periodically update turntable.lastMotionTime
			setInterval(function() {
				preventIdle();
			}, 10100);

			// update the idle times every 30 seconds
			setInterval(function() {
				displayIdleTimes();
			}, 30000);
		});

		//==========================================================================
		// HELPER FUNCTIONS
		//==========================================================================

		/**
		 * Update settings by using localstorage.
		 */
		function updateSettings() {
			_log('Updating settings.');
			_log(config);
			lstore.set('config', config);
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
				html += '<li><a href="#" class="btnS btnBlack selected" data-id="chat">chat</a></li>';
				html += '<li><a href="#" class="btnS btnBlack" data-id="stats">stats</a></li>';
				html += '<li><a href="#" class="btnS btnBlack" data-id="settings">settings</a></li>';
				html += '</ul>';
				html += '</h3>';

				// currently playing container
				html += '<div id="tt2_playing">';
					html += '<h4 class="toggleAccordion">Currently Playing</h4>';
					html += '<div id="tt2_stats_current_coverart">';
						html += '<div class="songinfo"></div>';
					html += '</div>';
				html += '</div>';

				// stats wrapper
				html += '<div id="tt2_stats" class="section" style="display:none">';
					// current track stats
					html += '<h4>Stats</h4>';
					html += '<div class="accordion">'; // stats accordion wrapper
						html += '<div class="fullheight">';
							html += '<h5 class="toggleAccordion">Current Track</h5>';
							html += '<div id="tt2_stats_current">';
								html += '<ul class="stats">';
									html += '<li>Votes <span id="tt2_stats_current_votes">0</span></li>';
									html += '<li>Upvotes <span id="tt2_stats_current_upvotes">0</span></li>';
									html += '<li>Downvotes <span id="tt2_stats_current_downvotes">0</span></li>';
									html += '<li>Rating <span id="tt2_stats_current_rating">0</span></li>';
									html += '<li>Hearts <span id="tt2_stats_current_hearts">0</span></li>';
									/*
									html += '<li>';
									html += '<ul class="current_voters">';
									html += '<li class="current_upvoters"><h6>Current Upvoters</h6><ul id="tt2_stats_current_upvoters"></ul></li>';
									html += '<li class="current_downvoters"><h6>Current Downvoters</h6><ul id="tt2_stats_current_downvoters"></ul></li>';
									html += '</ul>';
									html += '</li>';
									*/
								html += '</ul>';
							html += '</div>';

							// personal stats
							html += '<h5 class="toggleAccordion">My Stats</h5>';
							html += '<div id="tt2_stats_mine">';
								html += '<ul class="stats">';
									html += '<li>Songs Played <span id="tt2_stats_mine_totalSongs">0</span></li>';
									html += '<li>Votes <span id="tt2_stats_mine_votes">0</span></li>';
									html += '<li>Upvotes <span id="tt2_stats_mine_upvotes">0</span></li>';
									html += '<li>Downvotes <span id="tt2_stats_mine_downvotes">0</span></li>';
									html += '<li>Rating <span id="tt2_stats_mine_rating">0</span></li>';
									html += '<li>Hearts <span id="tt2_stats_mine_hearts">0</span></li>';
								html += '</ul>';
							html += '</div>';

							// overall stats
							html += '<h5 class="toggleAccordion">Overall Room Stats</h5>';
							html += '<div id="tt2_stats_overall">';
								html += '<ul class="stats">';
									html += '<li>Total Users <span id="tt2_stats_overall_users">0</span></li>';
									html += '<li>Songs Played <span id="tt2_stats_overall_totalSongs">0</span></li>';
									html += '<li>Upvotes <span id="tt2_stats_overall_upvotes">0</span></li>';
									html += '<li>Downvotes <span id="tt2_stats_overall_downvotes">0</span></li>';
									html += '<li>Rating <span id="tt2_stats_overall_rating">0</span></li>';
									html += '<li>Hearts <span id="tt2_stats_overall_hearts">0</span></li>';
								html += '</ul>';
							html += '</div>';

							// user stats
							html += '<h5 class="toggleAccordion">User Stats</h5>';
							html += '<div id="tt2_stats_user" style="display:none">';
								html += '<ul></ul>';
							html += '</div>';
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
						html += '<div class="fullheight">';

							html += '<div class="clearfix">';
							html += '<div class="check" title="Auto upvote allows you to automatically upvote every song that gets played. Your avatar will start head bopping after a random time from song start."><label><input type="checkbox" class="checkbox" name="tt2_autoupvote" id="tt2_autoupvote" value="1" checked="checked" /> Auto Upvote</label></div>';
							html += '<div class="check" title="Auto DJ is frowned upon. Use with caution, you will get banned from rooms. Use this to attempt to claim an empty DJ slot when it opens. You can adjust the number of milliseconds to wait before attempting to grab the open slot."><label><input type="checkbox" class="checkbox" name="tt2_autodj" id="tt2_autodj" value="1"' + (config.autoDj == 1 ? ' checked="checked"' : '') + ' /> Auto DJ</label> <input type="text" name="tt2_autodj_timeout" id="tt2_autodj_timeout" class="tiny" maxlength="4" value="' + parseInt(config.autoDjTimeout) + '" /> ms</div>';
							html += '<div class="check" title="Anti Idle is intended to aid in tricking Turntable.FM into believing you are still active on the site."><label><input type="checkbox" class="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1"' + (config.antiIdle == 1 ? ' checked="checked"' : '') + ' /> Anti Idle</label></div>';
							html += '<div class="check" title="Auto respond is an addition to anti-idle. When someone mentions your name or an alias as well as an idle alias (both configurable below), this feature triggers an automatic response."><label><input type="checkbox" class="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1"' + (config.autoRespond == 1 ? ' checked="checked"' : '') + ' /> Auto Respond</label></div>';
							html += '<div class="check" title="This option toggles an audible alert noise when  any of your name aliases are mentioned anywhere in a chat message."><label><input type="checkbox" class="checkbox" name="tt2_muteAlert" id="tt2_muteAlert" value="1"' + (config.muteAlert == 1 ? ' checked="checked"' : '') + ' /> Enable Mention Alert</label></div>';
							html += '<div class="check" title="This option is for developers. It allows you to turn on and off the console log capabilities for debugging."><label><input type="checkbox" class="checkbox" name="tt2_debugMode" id="tt2_debugMode" value="1"' + (config.debugMode == 1 ? ' checked="checked"' : '') + ' /> Enable Debug Mode</label></div>';
							html += '</div>';

							if (typeof window.webkitNotifications != 'undefined') {
								html += '<h5 class="toggleAccordion space_bottom">Chrome Notifications</h5>';
								html += '<div class="accordion clearfix">';
								html += '<div class="check" title="This is a global notification option which overrides all other notification options if they are turned on. It allows you to turn on Chrome Notifications."><label><input type="checkbox" class="checkbox" name="tt2_enable_notifications" id="tt2_enable_notifications" value="1"' + (config.enableNotifications == 1 ? ' checked="checked"' : '') + ' /> Enable Notifications</label>, hide after <input type="text" name="tt2_notification_time" id="tt2_notification_time" class="tiny" value="' + parseInt(config.notificationTime) + '" maxlength="2" /> sec</div>';
								html += '<div class="check" title="Enable notifications whenever a song change occurs."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_songchange" id="tt2_enable_notification_songchange" value="1"' + (config.notifications.songChange == 1 ? ' checked="checked"' : '') + ' /> On Song Change</label></div>';
								html += '<div class="check" title="Enable notifications whenever a user sends you a private message."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_pm" id="tt2_enable_notification_pm" value="1"' + (config.notifications.enablePM == 1 ? ' checked="checked"' : '') + ' /> On Private Message</label></div>';
								html += '<div class="check" title="Enable notifications whenever you have gone idle while DJing."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_idle" id="tt2_enable_notification_idle" value="1"' + (config.notifications.antiIdle == 1 ? ' checked="checked"' : '') + ' /> Anti Idle</label></div>';
								html += '<div class="check" title="Enable notifications whenever a DJ slot has opened up."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_emptydjslot" id="tt2_enable_notification_emptydjslot" value="1"' + (config.notifications.emptyDjSlot == 1 ? ' checked="checked"' : '') + ' /> On Open DJ Slot</label></div>';
								html += '<div class="check" title="Enable notifications whenever one of your name aliases gets mentioned in chat."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_mention" id="tt2_enable_notification_mention" value="1"' + (config.notifications.mention == 1 ? ' checked="checked"' : '') + ' /> On Chat Mention</label></div>';
								html += '<div class="check" title="Enable notifications whenever are fanned or unfanned."><label><input type="checkbox" class="checkbox" name="tt2_enable_notification_fanchange" id="tt2_enable_notification_fanchange" value="1"' + (config.notifications.fanChange == 1 ? ' checked="checked"' : '') + ' /> On Fan Change</label></div>';
								html += '<div class="check" title="Enable notifications whenever a DJ slot is filled with the elapsed time it took to fill the slot. Used as a countermeasure for Auto DJs. When turned on, you will be notified of the elapsed time it took for a DJ slot to fill up. Anything below 500ms is fishy, especially if there was no fair warning of a DJ dropping."><label><input type="checkbox" class="checkbox" name="tt2_notification_antiautodj" id="tt2_notification_antiautodj" value="1"' + (config.notifications.antiAutoDj == 1 ? ' checked="checked"' : '') + ' /> Anti Auto DJ</label></div>';
								html += '</div>';
							}

							html += '<div class="clearfix">';
							html += '<div class="col"><label for="tt2_name_aliases">My Aliases</label><textarea name="tt2_name_aliases" id="tt2_name_aliases">' + config.nameAliases.join('\n') + '</textarea><span class="note">This represents any strings someone may use to reference you in a chat message. It could be shorthand for your alias. Separate each with a line break.</span></div>';
							html += '<div class="col"><label for="tt2_general_name_aliases">General Aliases</label><textarea name="tt2_general_name_aliases" id="tt2_general_name_aliases">' + config.generalNameAliases.join('\n') + '</textarea><span class="note">Any string in a chat message that may refer to everybody in the room as a whole. Separate each with a line break.</div>';
							html += '<div class="col"><label for="tt2_idle_aliases">Idle Aliases</label><textarea name="tt2_idle_aliases" id="tt2_idle_aliases">' + config.idleAliases.join('\n') + '</textarea><span class="note">Words mentioned in chat that may pertain to being idle, away from keyboard, etc.</div>';
							html += '</div>';

							html += '<div class="clearfix">';
							html += '<div class="col"><label for="tt2_idle_replies">Idle Replies</label><textarea name="tt2_idle_replies" id="tt2_idle_replies">' + config.idleReplies.join('\n') + '</textarea><span class="note">Auto reply messages when someone mentions your name. You can use <em>{{NICKNAME}}</em> to fill in their name. Separate each with a line break.</span></div>';
							html += '<div class="col"><label for="tt2_idle_messages">Idle Messages</label><textarea name="tt2_idle_messages" id="tt2_idle_messages">' + config.idleMessages.join('\n') + '</textarea><span class="note">If you are DJing and have been AFK too long, one of these messages will be sent at random. Separate each with a line break.</span></div>';
							html += '</div>';

							html += '<div><button type="button" name="updateSettings" id="updateSettings" class="btnS btnBlack" name="Save Changes">Save Changes</button></div>'
						html += '</div>';
					html += '</div>';
				html += '</div>';

				// chat container
				html += '<div id="tt2_chat" class="section">';
					html += '<h4 class="toggleAccordion">Chat</h4>';
					html += '<div class="accordion">';
						html += '<div id="tt2_chat_box" class="fullheight"></div>';
					html += '</div>';
				html += '</div>';

				// similar tracks container
				html += '<div id="similar_tracks" class="section" style="display:none">';
					html += '<h4 class="toggleAccordion">Similar Tracks</h4>';
					html += '<div class="accordion">';
						html += '<div class="fullheight">';
						html += '<table cellpadding="0" cellspacing="0"><thead><tr><th>&nbsp;</th><th>Artist</th><th>Song</th><th>&nbsp;</th></thead><tbody></tbody></table>';
						html += '</div>';
					html += '</div>';
				html += '</div>';

			html += '</div>'; // close container

			// append
			$(html).appendTo('body');

			// check for scrolling
			if ($(window).get(0).scrollHeight > windowSize.height) {
				$('#tt2_container').css('width', tt2_size.width-36);
				scrollbarWidth = 16;
			}

			// move the chat
			moveChatWindow();

			// watch for nav change
			$('#tt2_nav .btnS').live('click', function() {
				var $this = $(this);
				$('#tt2_nav').find('.btnS').removeClass('selected');
				$('#tt2_container').find('.section').hide();
				$this.addClass('selected');
				var target = $this.data('id');
				var $target = $('#tt2_' + target);
				if ($target.length) {
					// show the target and fix scroll
					$target.stop(true, true).slideDown('fast');
					$target.attr({
						scrollTop: $target.attr('scrollHeight')
					});

					// fix chat scroll when necessary
					if (target == 'chat') {
						var $messageBox = $('#tt2_chat_box').find('.chat-container .messages');
						$messageBox.animate(
							{ scrollTop: $messageBox[0].scrollHeight },
							500
						);
					}
				}
				return false;
			});

			// reference all config options just once
			var $options = $('#tt2_settings');
			var $auto_upvote = $options.find('#tt2_autoupvote');
			var $auto_dj = $options.find('#tt2_autodj');
			var $auto_dj_timeout = $options.find('#tt2_autodj_timeout');
			var $auto_respond = $options.find('#tt2_autorespond');
			var $anti_idle = $options.find('#tt2_antiidle');
			var $mute_alert = $options.find('#tt2_muteAlert');
			var $debug_mode = $options.find('#tt2_debugMode');

			// notifications
			var $notification_time = $options.find('#tt2_notification_time');
			var $enable_notifications = $options.find('#tt2_enable_notifications');
			var $enable_notification_songchange = $options.find('#tt2_enable_notification_songchange');
			var $enable_notification_pm = $options.find('#tt2_enable_notification_pm');
			var $enable_notification_idle = $options.find('#tt2_enable_notification_idle');
			var $enable_notification_emptyslot = $options.find('#tt2_enable_notification_emptydjslot');
			var $enable_notification_fanchange = $options.find('#tt2_enable_notification_fanchange');
			var $enable_notification_antiautodj = $options.find('#tt2_notification_antiautodj');

			// general aliases and message responses
			var $name_aliases = $options.find('#tt2_name_aliases');
			var $general_name_aliases = $options.find('#tt2_general_name_aliases');
			var $idle_aliases = $options.find('#tt2_idle_aliases');
			var $idle_replies = $options.find('#tt2_idle_replies');
			var $idle_messages = $options.find('#tt2_idle_messages');

			// watch for change to options
			$options.find('#updateSettings').click(function() {
				// save all option changes
				config.debugMode = $debug_mode.is(':checked');
				config.autoUpvote = $auto_upvote.is(':checked');
				config.autoDj = $auto_dj.is(':checked');
				config.autoDjTimeout = parseInt($auto_dj_timeout.val()) || 25;
				config.autoRespond = $auto_respond.is(':checked');
				config.antiIdle = $anti_idle.is(':checked');
				config.muteAlert = $mute_alert.is(':checked');

				// notification options
				config.notificationTime = $notification_time.length ? parseInt($notification_time.val()) : 10;
				config.enableNotifications = $enable_notifications.length && $enable_notifications.is(':checked');
				config.notifications.songChange = $enable_notification_songchange.length && $enable_notification_songchange.is(':checked');
				config.notifications.enablePM = $enable_notification_pm.length && $enable_notification_pm.is(':checked');
				config.notifications.antiIdle = $enable_notification_idle.length && $enable_notification_idle.is(':checked');
				config.notifications.emptyDjSlot = $enable_notification_emptyslot.length && $enable_notification_emptyslot.is(':checked');
				config.notifications.fanChange = $enable_notification_fanchange.length && $enable_notification_fanchange.is(':checked');
				config.notifications.antiAutoDj = $enable_notification_antiautodj.length && $enable_notification_antiautodj.is(':checked');

				// update textarea options
				config.nameAliases = $name_aliases.val().split(/\n\r?/g);
				config.generalNameAliases = $general_name_aliases.val().split(/\n\r?/g);
				config.idleAliases = $idle_aliases.val().split(/\n\r?/g);
				config.idleReplies = $idle_replies.val().split(/\n\r?/g);
				config.idleMessages = $idle_messages.val().split(/\n\r?/g);

				_log('aliases:');
				_log(config.nameAliases);

				// handle trying to auto-dj
				if (config.autoDj) {
					emptySlotCheck();
				}

				// check notification permissions
				if (config.enableNotifications) {
					checkNotificationPermissions();
				}

				// update the localstorage settings
				updateSettings();
			});

			// watch for accordion toggles
			$('.toggleAccordion').live('click', function() {
				$(this).next('div').stop().slideToggle('fast');
				return false;
			});

			// watch for similar track click
			$('#similarTracksBtn').live('click', function() {
				// show similar
				$('#tt2_nav').find('.btnS').removeClass('selected');
				$('#tt2_container').find('.section').hide();
				var $target = $('#similar_tracks');
				if ($target.length) {
					$target.stop(true, true).slideDown('fast');
				}
				return false;
			});
		}

		/**
		 * Checks if the given user is a moderator.
		 */
		function isRoomModerator(user_id) {
			for (var i in _mods) {
				if (_mods[i] == user_id) {
					return true;
				}
			}
			return false;
		}

		/**
		 * Move the chat window when the plugin is initially loaded.
		 */
		function moveChatWindow() {
			// get the chat container sizing
			var $chat_container = $('#right-panel').find('.chat-container');
			var $guest_container = $('#right-panel').find('.guest-list-container');
			var chat_height = $chat_container.height();
			var chat_width = $chat_container.width();
			var message_height = $chat_container.find('.chatBar').height();

			// calculate some additional sizes
			var title_height = $('#right-panel').find('.black-right-header').height();
			var songlist_height = $('#right-panel').find('.queueView .songlist').height();
			var queue_height = $('#right-panel').find('.queueView').height();

			// hide icons
			$chat_container.find('.guestListIcon').hide();
			$chat_container.find('.chatResizeIcon').hide();
			$guest_container.find('.chatResizeIcon').hide();

			// reference the new spot
			var $chat_box = $('#tt2_chat_box');
			var chat_box_width = $chat_box.width();

			// move the guest container
			$('#right-panel').find('.guest-list-container').appendTo($('#tt2_chat_box'));

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
			if (tt2_playing_size.height < 204) {
				tt2_playing_size.height = 204;
			}

			// fix guest container sizing
			$chat_box.find('.guest-list-container').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - 95) + 'px',
				width: '' + chat_width + 'px',
				top: '0',
				right: '0',
				left: 'auto'
			});

			// fix chat message sizing
			$chat_box.find('.guest-list-container .guests').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - title_height - message_height - 95) + 'px',
				width: '100%',
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});

			// fix chat sizing in TT2
			$('#tt2_chat_box').find('.chat-container').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - 95) + 'px',
				width: '' + (chat_box_width - chat_width - 20) + 'px',
				top: '0',
				left: '0'
			});

			// fix chat message sizing
			$chat_box.find('.chat-container .messages').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - title_height - message_height - 95) + 'px',
				width: '' + (chat_box_width - chat_width - 20) + 'px',
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});

			// fix remainder of windows
			$('#tt2_container').find('.fullheight').css(
				'height',
				'' + (tt2_size.height - tt2_playing_size.height - 95) + 'px'
			);
		}

		/**
		 * Event handler on window resize.
		 */
		function resizeWindow(e) {
			var $this = $(this);

			// recalculate the container width
			containerWidth = $('#outer').width();

			// compare old and new size
			var oldSize = windowSize;
			windowSize.width = $this.width();
			windowSize.height = $this.height();

			// check for scrolling
			var scrollbarWidth = 0;
			if ($this.get(0).scrollHeight > windowSize.height) {
				scrollbarWidth = 16;
			}

			// fix the width and height
			tt2_size.width = windowSize.width - containerWidth - scrollbarWidth;
			tt2_size.height = windowSize.height;

			$('#tt2_container').css('width', tt2_size.width - 20);
			$('#tt2_container').css('height', tt2_size.height - 20);

			// retrieve the size of the playing viewport
			var tt2_playing_size = {
				width: $('#tt2_playing').innerWidth(),
				height: $('#tt2_playing').innerHeight()
			};

			// fix for min-height
			if (tt2_playing_size.height < 204) {
				tt2_playing_size.height = 204;
			}

			// reference the new spot
			var $chat_box = $('#tt2_chat_box');
			var chat_box_width = $chat_box.width();

			// get the chat container sizing
			var $guest_container = $chat_box.find('.guest-list-container');
			var $chat_container = $chat_box.find('.chat-container');
			var guest_width = $guest_container.width();
			var chat_height = $chat_container.height();
			var chat_width = $chat_container.width();
			var message_height = $chat_container.find('.chatBar').height();
			var title_height = $chat_box.find('.black-right-header').height();

			// fix guest container sizing
			$('#tt2_chat_box').find('.guest-list-container').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - 95) + 'px',
				//width: '' + (chat_box_width - chat_width - 20) + 'px',
				top: '0',
				right: '0',
				left: 'auto'
			});

			$('#tt2_chat_box').find('.guest-list-container .guests').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - title_height - message_height - 95) + 'px',
				width: '100%',
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});

			// fix chat sizing in TT2
			$('#tt2_chat_box').find('.chat-container').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - 95) + 'px',
				width: '' + (chat_box_width - guest_width - 20) + 'px',
				top: '0',
				left: '0'
			});

			// fix chat message sizing
			$('#tt2_chat_box').find('.chat-container .messages').css({
				height: '' + (tt2_size.height - tt2_playing_size.height - title_height - message_height - 95) + 'px',
				width: '' + (chat_box_width - guest_width - 20) + 'px',
				'overflow-x': 'none',
				'overflow-y': 'auto'
			});

			// fix remainder of windows
			var tt2_title_height = $('#tt2_container').children('h3').eq(0).height();
			var tt2_section_title_height = $('#tt2_container').find('.section h4').eq(0).height();
			var tt2_section_padding = 20;
			$('#tt2_container').find('.fullheight').css(
				'height',
				'' + (tt2_size.height - tt2_playing_size.height - 95) + 'px'
			);
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
		 * Create a new Chrome notification.
		 */
		function sendNotification(title, message, html) {
			var favIcon = 'http://turntable.fm/favicon.ico', n;
			if (!html) html = false;

			_log('Send notification called.');

			if (!config.enableNotifications) {
				return false;
			}

			// error checking
			if (window.webkitNotifications.checkPermission() != 0) {
				alert('Please enable notifications by changing your configuration settings.');
				document.getElementById('allowNotificationLink').style.backgroundColor = 'red';
				return 0;
			}

			if (html) {
				// fix up the URL
				var url = html + '?title=' + encodeURIComponent(title) + '&message=' + encodeURIComponent(message);
				n = window.webkitNotifications.createHTMLNotification(url);
			} else {
				n = window.webkitNotifications.createNotification(favIcon, title, message);
			}

			n.ondisplay = function() {
				setTimeout(function() {
					n.cancel();
				}, parseInt(config.notificationTime) * 1000);
			};
			n.show();
		}

		/**
		 * Request permission to enable window notifications.
		 */
		function requestNotificationPermission() {
			if (typeof window.webkitNotifications != 'undefined') {
				window.webkitNotifications.requestPermission(notificationPermissionGranted);
			} else {
				config.enableNotifications = false;
			}
		}

		/**
		 * Handle permission granting of Chrome notifications.
		 */
		function notificationPermissionGranted() {
			var PERMISSION_ALLOWED = 0;
			// check permissions to update config
			if (window.webkitNotifications.checkPermission() == PERMISSION_ALLOWED) {
				config.enableNotifications = true;
			} else {
				config.enableNotifications = false;
			}
		}

		/**
		 * Check for notification permissions.
		 */
		function checkNotificationPermissions() {
			var PERMISSION_ALLOWED = 0;
			if (window.webkitNotifications.checkPermission() != PERMISSION_ALLOWED) {
				requestNotificationPermission();
			} else {
				// handle web worker in chrome (via toobify.com)
				/*
				if ("webkitNotifications" in window) {
					// create a new worker
					var worker = new SharedWorker('https://github.com/cballou/Turntable.FM-Squared/raw/master/notifications/worker.js');
					var incomingMsg = null;

					// watch for message passing
					worker.port.addEventListener('message', function(event) {
						if (event.data.msg !== incomingMsg) {
							$(window).trigger('toobifyRemote', [event.data]);
							// reset the event message state
							incomingMsg = null;
						}
					}, false);

					// start the shared worker connection
					worker.start();
				}
				*/
			}
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
		function isDj(user_id) {
			if (!user_id || typeof user_id == 'undefined') {
				user_id = _room.selfId;
			}

			if (typeof _manager.djs != 'undefined') {
				for (var i in _manager.djs) {
					if (typeof _manager.djs[i] != 'undefined') {
						if (_manager.djs[i][0] == user_id) {
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
		 * Check if we recently responded to a message or idle check. If not,
		 * update the last idle response time since we're going to handle it
		 * anyways.
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
		 * Given a user id, attempt to retrieve the user name.
		 */
		function getUsernameById(user_id) {
			if (typeof _room.users[user_id] != 'undefined') {
				return _room.users[user_id].name;
			}

			return false;
		}

		/**
		 * Given a user name, attempt to retrieve the user id.
		 */
		function getUserIdByUsername(user_name) {
			if (typeof _usernameMappings[username] != 'undefined') {
				return _usernameMappings[username];
			}

			return false;
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
			if (typeof strings == 'string') {
				strings = [strings];
			}
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
		 * Get minutes and seconds.
		 */
		function formatDate(date) {
			var curdate = new Date().getTime();
			curdate = Math.round(curdate / 1000);
			if (!date.length) date = date.toString();
			if (date.length == 10) date = parseInt(date);
			else if (date.length == 13) date = parseInt(parseInt(date) / 1000);
			else date = Math.round(Date.parse(date) / 1000);
			var diff = Math.abs(date - curdate);
			// get minutes
			if ((diff / 60) >= 1) {
				var min = Math.floor(diff / 60);
				var sec = diff - (min * 60);
			} else {
				var min = '00';
				var sec = diff;
			}

			min = min.toString();
			sec = sec.toString();
			if (min.length < 2) {
				min = '0' + min;
			}
			if (sec.length < 2) {
				sec = '0' + sec;
			}
			return min + ':' + sec;
		}

		/**
		 * Safely log a message.
		 */
		function _log(msg) {
			if (window.console && config.debugMode) {
				console.log(msg);
			}
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
			return false;
		} else if (typeof data.similartracks.track == 'string') {
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
				html += '<td><a href="#" class="btnS btnGreen" target="_blank"><span class="itunesIcon"></span> Preview &amp; Buy</a></td>';
				// get buy links and change them
				// http://www.last.fm/api/show?service=431
				var buyUrl = 'http://ws.audioscrobbler.com/2.0/?method=track.getbuylinks&artist=' + encodeURIComponent(artist) + '&track=' + encodeURIComponent(song) + '&api_key=d1b14c712954973f098a226d80d6b5c2&format=json&callback=?';
				$.getJSON(buyUrl, function(data) {
					_log('===== LASTFM PURCHASE INFO ====');
					_log(data);
				});
			} else {
				var baseurl = 'http://click.linksynergy.com/fs-bin/stat?id=5PGIX6Dk9zE&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=';
				var searchUrl = 'http://ax.itunes.apple.com/WebObjects/MZSearch.woa/wa/search?term=' + item.artist.name + ' ' + item.name;
				searchUrl = encodeURIComponent(encodeURIComponent(searchUrl));

				html += '<td><a href="' + baseurl + searchUrl + '" class="btnS btnGreen" target="_blank"><span class="itunesIcon"></span> Preview &amp; Buy</a></td>';
				//html += '<td>&nbsp;</td>';
			}

			html += '<td><a href="#" class="btnS btnBlue btnSearchArtist" data-term="' + escape(item.artist.name + ' ' + item.name) + '">TT.FM Search</a></td>';
			//if (item.artist.mbid.length) {
			//	html += '<p><a href="#" style="display:block">View Artist Details</a>';
			//}
			html += '</tr>';
			alt = !alt;
		});

		if (html.length) {
			// append html
			$('#similar_tracks').find('table tbody').html(html);
			// show similar tracks button
			$('<a href="#" class="btnS btnBlue" id="similarTracksBtn"><span class="iconS"><img src="https://github.com/cballou/Turntable.FM-Squared/raw/master/icons/plus.png" height="16" width="16" alt="Show Similar Tracks" /></span> Show Similar Tracks</a>').appendTo($('#tt2_stats_current_coverart .purchaseinfo'));
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
				var img = '<img class="coverart img100" src="' + results[i].artworkUrl100 + '" width="100" height="100" alt="' + alt + '" />';
				$caholder.find('#tt2_stats_current_coverart .coverart').remove();
				$caholder.find('#tt2_stats_current_coverart').prepend(img);
			}

			// generate baseurl
			var baseurl = 'http://click.linksynergy.com/fs-bin/stat?id=5PGIX6Dk9zE&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=';

			// attach partner id to link urls
			var trackUrl = baseurl + encodeURIComponent(encodeURIComponent(results[i].trackViewUrl + '&partnerId=30'));
			var artistUrl = baseurl + encodeURIComponent(encodeURIComponent(results[i].artistViewUrl + '&partnerId=30'));
			var albumUrl = baseurl + encodeURIComponent(encodeURIComponent(results[i].collectionViewUrl + '&partnerId=30'));

			// create html
			html += '<div class="purchaseinfo">';
			html += '<p><a href="' + trackUrl + '" class="btnS btnGreen" target="_blank"><span class="iconS"><img src="https://github.com/cballou/Turntable.FM-Squared/raw/master/icons/itunes-32.png" height="16" width="16" alt="Artist Details and Top Songs" /></span> Buy Track $' + results[i].trackPrice + '</a></p>';
			html += '<p><a href="' + albumUrl + '" class="btnS btnGreen" target="_blank"><span class="iconS"><img src="https://github.com/cballou/Turntable.FM-Squared/raw/master/icons/itunes-32.png" height="16" width="16" alt="Artist Details and Top Songs" /></span> Buy Album $' + results[i].collectionPrice + '</a></p>';
			html += '<p><a href="' + artistUrl + '" class="btnS btnBlue" target="_blank"><span class="iconS"><img src="https://github.com/cballou/Turntable.FM-Squared/raw/master/icons/plus.png" height="16" width="16" alt="Artist Details and Top Songs" /></span> Artist Details and Top Songs</a></p>';
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

// load it up
window.ttfmsq = new TTFM_SQ();
