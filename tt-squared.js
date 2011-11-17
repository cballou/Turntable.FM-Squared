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

	// default config values
	var config = {
		autoDj: false,
		autoRespond: true,
		antiIdle: true,
		muteAlert: false,
		smartVote: false,
		autoUpvote: true
	}

	// vote monitoring
	var votes = {
		// total songs played
		totalSongs: 0,

		// for the current song
		current: {
			score: 0,
			voters: 0,
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
			songs: {
				score: 0,
				voters: 0,
				upvoters: [],
				downvoters: [],
				song: []
			}
		}
	};

    // aliases
    var nameAliases = [
        'coreyballou',
        'Dr. awkwa .rD',
        'Corey Ballou',
        'CoreyBallou',
        'coreyb',
		'Dr.',
		'awkward'
    ];

    // general name aliases
    var generalNameAliases = [
        'djs',
        'everyone',
        'everbody',
        'you all',
        'ya\'ll',
        'you guys',
		'you'
    ];

    // idle aliases
    var idleAliases = [
        'afk',
        'checkin',
        'check in',
        'check-in',
        'here',
        'idle',
        'there',
        'respond',
		'status'
    ];

    // array of idle responses
    var idleReplies = [
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
    ];

	// array of auto-idle messages
	var idleMessages = [
		'ugh I\'ve got so much work to do',
		'busy day over here',
		'wish i wasn\'t so busy',
		':)',
		'.',
		'wish i didn\'t have to send messages to prevent idle...',
		'love tt.fm',
		'back to work..',
		'i\m so tired',
		'can\'t wait till 5',
		''
	];

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
        if (stringInText(nameAliases, e.text)) {
            playAlertSound();
        } else {
            if (!stringInText(generalNameAliases, e.text)) {
                return;
            }
        }

		if (!config.autoRespond) {
			return;
		}

        if (!stringInText(idleAliases, e.text) || e.text.length > 128) {
            return;
        }

		if (recentlyResponded()) {
			return;
		}

        // log the idle check
        _log('Possible idle check: ' + e.text);

        // create a response
        var response = randomChoice(idleReplies);

		// replace nickname
		response = response.replace('{{NICKNAME}}', e.name);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Responding with: ' + response);
            say(response);
        }, randomDelay(2, 8));
    }

	/**
	 * Handle auto-upvoting songs.
	 */
	function autoVote(e) {
		if (!config.autoUpvote) {
			return;
		}

		// don't vote on own song
		if (e.room.metadata.current_dj == _tt.user.id) {
			return;
		}

		// get the current song data
		var song = e.room.metadata.current_song.metadata;

		// our vote decision
		var vote = 'upvote';

		// if we're doing smart voting
		if (config.smartVote) {
			if (stringInText(upvoteArtists, song.artist, false)) {
				vote = 'upvote';
			} else if (stringInText(downvoteArtists, song.artist, false)) {
				vote = 'downvote';
			}
		} else {
			vote = 'upvote';
		}

		// cast vote
		setTimeout(function() {
			// if you're djing
			if (!isDj() || !isCurrentDj()) {
				_manager.callback('upvote');
			}
		}, randomDelay(3, 30))
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

		if (recentlyResponded()) {
			return;
		}

        // create a response
        var response = randomChoice(idleMessages);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Preventing idle: ' + response);
            say(response);
        }, randomDelay(2, 8));
	}

	/**
	 * Reset vote counters on a new song.
	 */
	function resetVotes(e) {
		// reset current vote counter
		votes.current.score = votes.current.voters = 0;
		votes.current.upvoters = [];
		votes.current.downvoters = [];

		// increment total songs played
		votes.totalSongs += 1;

		// initialize the new song array for voting
		var song = e.room.metadata.current_song.metadata;

		/*
		if (!votes.songs[blah]) {
			votes.songs[blah] = {
				artist: song.artist,
				title: song.title,
				plays: 1,
				score: 0,
				voters: 0,
				upvoters: [],
				downvoters: []
			}
		} else {
			// add to the play counter
			votes.songs[blah].plays += 1;
		}

		// track song votes
		if (!votes.songs.song[blah]) {
			votes.songs.song[blah] = {
				artist: song.artist,
				title: song.title,
				plays: 1,
				score: 0,
				voters: 0,
				upvoters: [],
				downvoters: []
			};
		} else {
			// add to the play counter
			votes.songs.song[blah].plays += 1;
		}

		// if im djing, track votes
		if (isCurrentDj()) {
			// add to total songs played
			votes.mine.totalSongs += 1;

			// handle individual song tracking
			if (!votes.mine.songs.song[blah]) {
				votes.mine.songs.song[blah] = {
					artist: song.artist,
					title: song.title,
					plays: 1,
					score: 0,
					voters: 0,
					upvoters: [],
					downvoters: []
				};
			} else {
				// add to the play counter
				votes.mine.songs[blah].plays += 1;
			}
		}
		*/
	}

	/**
	 * Keeps internal track of voting for each new song played.
	 */
	function updateVotes(e) {
		// initialize the new song array for voting
		var song = e.room.metadata.current_song.metadata;
		_log('===============CURRENT SONG=================');
		_log(song);


		/*
		// update the counters
		this.updateCounters = function(data) {
			votes.current.score = data.upvotes / (data.downvotes + data.upvotes);
			votes.current.voters = data.upvotes + data.downvotes;
		};

		// update the window title
		this.updateTitle = function(data) {
			document.title = data.upvotes - data.downvotes;
		};

		// record a vote
		this.recordVote = function(data, song) {
			var users = _room.users;
			var uid = data[0];

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
				votes.current.upvoters[uid] = u[uid].name;

				// add to the user
				votes.user[uid].songs += 1;
				votes.user[uid].upvotes += 1;
				votes.user[uid].score = votes.user[uid].upvotes / (votes.user[uid].downvotes + votes.user[uid].upvotes);

				// if im djing
				if (isCurrentDj()) {
					votes.mine.songs.song[song.id].upvoters[uid] = u[uid].name;
				}
			} else {
				// add to current downvoters
				votes.current.downvoters[uid] = u[uid].name;

				// add to the user
				votes.user[uid].songs += 1;
				votes.user[uid].downvotes += 1;
				votes.user[uid].score = votes.user[uid].upvotes / (votes.user[uid].downvotes + votes.user[uid].upvotes);

				// if im djing
				if (isCurrentDj()) {
					votes.mine.songs.song[song.id].downvoters[uid] = u[uid].name;
				}
			}
		}

		// retrieve voters
		this.getVoters = function() {
			_log('Upvoters: ' + votes.current.upvoters.join(', '));
			_log('Downvoters: ' + votes.current.downvoters.join(', '));
		}

		// initialize the new song array for voting
		var song = e.room.metadata.current_song.metadata;

		// perform actions
		updateCounters(e.room.metadata);
		updateTitle(e.room.metadata);
		recordVote(e.room.metadata.votelog[0], song);
		*/
	}

	/**
	 * Display the options menu.
	 */
	function displayOptionsMenu() {
		// watch for toggle of auto-dj
		var html = '<div id="tt2_options" style="position:absolute;top:10px;right:10px;width:200px;max-height: 90%;padding:10px;background:#333;color:#fff;font-size:12px;line-height:18px;vertical-align:middle;">';
		html += '<h4 style="padding-bottom:4px;margin-bottom: 10px;font-size:18px;line-height:18px;font-weight:bold;border-bottom:1px dotted #000;">TT<sup>2</sup> Options</h4>';
		html += '<div style="margin-bottom: 10px">';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autoupvote" id="tt2_autoupvote" value="1" checked="checked" /> Auto Upvote</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autodj" id="tt2_autodj" value="1" /> Auto DJ</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1" checked="checked" /> Auto Respond</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1" checked="checked" /> Anti Idle</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_config.muteAlert" id="tt2_config.muteAlert" value="1" checked="checked" /> Enable Mention Alert</label></div>';
		html += '</div>';

			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">Current Song Stats</h5>';
			html += '<div id="tt2_stats_current" style="max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul>';
			html += '<li>Song Artist: <span id="tt2_stats_current_artist" style="float:right;display:inline;text-align:right">n/a</span></li>';
			html += '<li>Song Title: <span id="tt2_stats_current_title" style="float:right;display:inline;text-align:right">n/a</span></li>';
			html += '<li>Upvotes: <span id="tt2_stats_current_upvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Downvotes: <span id="tt2_stats_current_downvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Rating: <span id="tt2_stats_current_rating" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '</ul>';
			html += '</div>';

			html += '<div>';
			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">Overall Stats</h5>';
			html += '<div id="tt2_stats_overall" style="max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul>';
			html += '<li>Songs Played: <span id="tt2_stats_overall_totalSongs" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Upvotes: <span id="tt2_stats_overall_upvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Downvotes: <span id="tt2_stats_overall_downvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Rating: <span id="tt2_stats_current_rating" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '</ul>';
			html += '</div>';

			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">Personal Stats</h5>';
			html += '<div id="tt2_stats_mine" style="max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul>';
			html += '<li>Songs Played: <span id="tt2_stats_mine_totalSongs" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Upvotes: <span id="tt2_stats_mine_upvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Downvotes: <span id="tt2_stats_mine_downvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Rating: <span id="tt2_stats_mine_rating" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '</ul>';
			html += '</div>';

			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">User Stats</h5>';
			html += '<div id="tt2_stats_user" style="display:none; max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '</div>';

			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">Song Stats</h5>';
			html += '<div id="tt2_stats_song" style="display:none; max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '</div>';

		html += '</div>';
		html += '</div>';
		$(html).appendTo('body');
		$options = $('#tt2_options');

		$options.find('#tt2_autoupvote').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Auto Upvote option to: ' + (checked ? 'Yes' : 'No'));
			config.autoUpvote = checked;
		});
		$options.find('#tt2_autodj').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Auto DJ option to: ' + (checked ? 'Yes' : 'No'));
			config.autoDj = checked;
			if (config.autoDj) {
				emptySlotCheck();
			}
		});
		$options.find('#tt2_autorespond').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Auto Respond option to: ' + (checked ? 'Yes' : 'No'));
			config.autoRespond = checked;
		});
		$options.find('#tt2_antiidle').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Anti Idle option to: ' + (checked ? 'Yes' : 'No'));
			config.antiIdle = checked;
		});
		$options.find('#tt2_config.muteAlert').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Enable Mention Alert option to: ' + (!checked ? 'Yes' : 'No'));
			config.muteAlert = !checked;
		});
	}

	/**
	 * Listen to all incoming messages and route accordingly.
	 */
	function messageListener(e) {
		// TT.fm does this, so shouldn't we
		if (e.hasOwnProperty('msgid') || !e.userid) {
			return;
		}

		// record any commands
		if (e.command) {
			if (e.command == 'newsong') {
				_log('Song change.');
				_log(e);
			}
		}

		// handle chat messages
		if (e.command == 'speak') {
			watchForChatMentions(e);
		} else if (e.command == 'newsong') {
			autoVote(e);
			resetVotes(e);
		} else if (e.command == 'update_votes') {
			updateVotes(e);
		}
	}

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
		// display the options menu
		_log('Displaying the options menu.');
		displayOptionsMenu();

        // begin event listeners
        _log('Initiating the event listener.');
		_tt.addEventListener('message', messageListener);
        //_tt.addEventListener('message', watchForChatMentions);
		//_log('Initiating the empty dj listener.');
		//_tt.addEventListener('message', watchForEmptyDjSlot);

		// periodically update turntable.lastMotionTime
		setInterval(function() {
			preventIdle();
		}, 10100);
    });

	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

	/**
	 * Check if currently DJing.
	 */
	function isDj() {
		if (typeof _manager.djs != 'undefined') {
			for (var i in _manager.djs) {
				if (typeof _manager.djs[i] != 'undefined') {
					if (_manager[djs][i][0] == _room.selfId) {
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
		return _manager.current_dj && _manager.current_dj[0] != _manager.myuserid;
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
	function stringInText(strings, text) {
		text = text.toLowerCase()
		for (var s in strings) {
			var string = strings[s].toLowerCase();
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
		if (window.console) {
			console.log(msg);
		}
	}

})();
