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
		width: $('window').width(),
		height: $('window').height()
	};
	var containerWidth = $('#outer').width();
	var tt2_size = {
		width: windowSize.width - containerWidth,
		height: windowSize.height
	}
	
	alert(windowSize.width+'x'+windowSize.height);
	alert(tt2_size.width+'x'+tt2_size.height);

	// default config values
	var config = {
		autoDj: false,
		autoRespond: true,
		antiIdle: true,
		muteAlert: false,
		smartVote: false,
		autoUpvote: true,
		debugMode: false
	}

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
	 * Reset vote counters on a new song.
	 */
	function resetVotes(e) {
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
		var details = song.artist + ' - "' + song.song + (song.album?'" on the album '+song.album:'"');
		var albumArt = '';
		if (song.coverart) {
			var alt = song.artist + ' - "' + song.song + '" (' + song.album + ')';
			albumArt += '<img src="' + song.coverart + '" width="150" height="150" alt="' + alt + '" style="float:left;display:inline;margin:0 10px 10px 0;border:4px solid #222;" />';
		} 
		$('#tt2_stats_current_coverart').find('.songinfo').html(details);
		$('#tt2_stats_current_coverart').find('img').remove();
		$('#tt2_stats_current_coverart').prepend(albumArt);

		// update current song
		performSearch(song.artist, song.song, song.album || '');

		// track song votes
		if (!votes.songs.song[song_id]) {
			votes.songs.song[song_id] = {
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
			votes.songs.song[song_id].plays += 1;
		}

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
		if (!_room.currentSong || !_room.currentSong.id) {
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
		var details = song.artist + ' - "' + song.song + (song.album?'" on the album '+song.album:'"');
		var albumArt = '';
		if (song.coverart) {
			var alt = song.artist + ' - "' + song.song + '" (' + song.album + ')';
			albumArt += '<img src="' + song.coverart + '" width="150" height="150" alt="' + alt + '" style="float:left;display:inline;margin:0 10px 10px 0;border:4px solid #222;" />';
		} 
		$('#tt2_stats_current_coverart').find('.songinfo').html(details);
		$('#tt2_stats_current_coverart').find('img').remove();
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
		
		// track song votes
		if (!votes.songs.song[song_id]) {
			votes.songs.song[song_id] = {
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
			votes.songs.song[song_id].plays += 1;
		}
	}

	/**
	 * Keeps internal track of voting for each new song played.
	 */
	function updateVotes(e) {

		_log('Update the mfin votes');
		_log(e);

		// retrieve song data
		var song_id = _room.currentSong._id;
		var song = _room.currentSong.metadata;

		_log('Update vote, prior to functions.');

		// update the counters
		var updateCounters = function(data) {
			votes.current.score = 100 * (data.upvotes / (data.downvotes + data.upvotes));
			votes.current.votes = data.upvotes + data.downvotes;

			// display stat updates
			$('#tt2_stats_current_upvotes').text(data.upvotes);
			$('#tt2_stats_current_downvotes').text(data.downvotes);
			$('#tt2_stats_current_rating').text(votes.current.score + '%');
			$('#tt2_stats_current_votes').text(votes.current.votes);
		};

		// record a vote
		var recordVote = function(data) {
			// the room users
			var users = _room.users;

			// update the number of users in the room
			$('#tt2_stats_overall_users').text(users.length);

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

				$('#tt2_stats_overall_upvotes').text(votes.upvotes);
				$('#tt2_stats_overall_rating').text(votes.score);

				// if im djing
				if (isCurrentDj()) {
					// increment my total upvotes
					votes.mine.votes += 1;
					votes.mine.upvotes += 1;
					votes.mine.score = Math.round(10000 * (votes.mine.upvotes / (votes.mine.downvotes + votes.mine.upvotes))) / 100;

					$('#tt2_stats_mine_votes').text(votes.mine.votes);
					$('#tt2_stats_mine_upvotes').text(votes.mine.upvotes);
					$('#tt2_stats_mine_rating').text(votes.mine.score + '%');

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

				$('#tt2_stats_overall_downvotes').text(votes.downvotes);
				$('#tt2_stats_overall_rating').text(votes.score);

				// if im djing
				if (isCurrentDj()) {
					_log('I must be djing...');

					// increment my total downvotes
					votes.mine.votes += 1;
					votes.mine.downvotes += 1;
					votes.mine.score = votes.mine.upvotes / (votes.mine.downvotes + votes.mine.upvotes);

					$('#tt2_stats_mine_votes').text(votes.mine.votes);
					$('#tt2_stats_mine_downvotes').text(votes.mine.downvotes);
					$('#tt2_stats_mine_rating').text(votes.mine.score + '%');

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

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
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
		});

		// periodically update turntable.lastMotionTime
		setInterval(function() {
			preventIdle();
		}, 10100);
    });

	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

	/**
	 * Display the options menu.
	 */
	function displayOptionsMenu() {
		// re-position TT.FM
		$('#outer').css('margin', 0);
		$('#footer').css({ 'text-align': 'left' });
		
		_log('Container size');
		_log(tt2_size);
		
		// create tt2 container
		var html = '<div id="tt2_container" style="position:absolute;top:10px;right:10px;width:' + (tt2_size.width-20) + 'px;height:' + (tt2_size.height-20) + 'px;margin:0;padding:0;background:#333;color:#FFF;font-size:12px;line-height:18px;overflow-x:hidden;overflow-y:auto;">';
		html += '<h3 style="padding:0 10px 4px;margin-bottom: 10px;font-size:22px;line-height:22px;font-weight:bold;background:#44D2E5;color:#000;">TT<sup>SQUARED</sup></h3>';

		// currently playing container
		html += '<div id="tt2_playing">';
			html += '<h4 style="padding:0 10px 4px;margin-bottom: 0;font-size:18px;line-height:18px;font-weight:bold;background:#5C755E;color:#FFF;">Currently Playing</h4>';
			html += '<ul style="padding:10px 10px 0">';
			html += '<li id="tt2_stats_current_coverart">';
			html += '<p class="songinfo" style="margin:0"></p>';
			html += '</li>';
			html += '</ul>';
		html += '</div>';

		// stats container
		html += '<div id="tt2_stats">';
		
			// current track stats
			html += '<h4 style="padding:0 10px 4px;margin-bottom: 0;font-size:18px;line-height:18px;font-weight:bold;background:#5C755E;color:#FFF;">Stats</h4>';
			html += '<div>';
				html += '<h5 class="stat_heading" style="padding:4px 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;cursor:pointer;">Current Track</h5>';
				html += '<div id="tt2_stats_current" style="max-height:500px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
					html += '<ul style="padding:10px 10px 0">';
					html += '<li>Rating: <span id="tt2_stats_current_rating" style="float:right;display:inline;text-align:right">0</span></li>';
					html += '<li>Upvotes: <span id="tt2_stats_current_upvotes" style="float:right;display:inline;text-align:right">0</span><ul id="tt2_stats_current_upvoters" style="max-height: 200px;overflow-x:hidden;overflow-y:auto"></ul></li>';
					html += '<li>Downvotes: <span id="tt2_stats_current_downvotes" style="float:right;display:inline;text-align:right">0</span><ul id="tt2_stats_current_downvoters" style="max-height: 200px;overflow-x:hidden;overflow-y:auto"></ul></li>';
					html += '</ul>';
				html += '</div>';
			html += '</div>';
		
			// personal stats
			html += '<h5 class="stat_heading" style="padding:4px 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;cursor:pointer;">My Stats</h5>';
			html += '<div id="tt2_stats_mine" style="max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul style="padding:10px 10px 0">';
			html += '<li>Songs Played: <span id="tt2_stats_mine_totalSongs" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Votes: <span id="tt2_stats_mine_votes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Upvotes: <span id="tt2_stats_mine_upvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Downvotes: <span id="tt2_stats_mine_downvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Rating: <span id="tt2_stats_mine_rating" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '</ul>';
			html += '</div>';
		
			// overall stats
			html += '<div>';
			html += '<h5 class="stat_heading" style="padding:4px 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;cursor:pointer;">Overall Room Stats</h5>';
			html += '<div id="tt2_stats_overall" style="max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul style="padding:10px 10px 0">';
			html += '<li>Total Users: <span id="tt2_stats_overall_users" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Songs Played: <span id="tt2_stats_overall_totalSongs" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Upvotes: <span id="tt2_stats_overall_upvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Downvotes: <span id="tt2_stats_overall_downvotes" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '<li>Rating: <span id="tt2_stats_current_rating" style="float:right;display:inline;text-align:right">0</span></li>';
			html += '</ul>';
			html += '</div>';
		
			// user stats
			html += '<h5 class="stat_heading" style="padding:4px 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;cursor:pointer;">User Stats</h5>';
			html += '<div id="tt2_stats_user" style="display:none; max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul style="padding:10px 10px 0"></ul>';
			html += '</div>';
		
			/*
			// song stats
			html += '<h5 style="padding:4px;margin-bottom: 10px;font-size:14px;line-height:14px;font-weight:bold;background: #222;">Song Stats</h5>';
			html += '<div id="tt2_stats_song" style="display:none; max-height:100px; overflow-x:hidden; overflow-y: auto; margin-bottom: 10px;">';
			html += '<ul></ul>';
			html += '</div>';
			*/
		html += '</div>';
					
		// options container
		html += '<div id="tt2_options">';
			html += '<h4 class="toggleAccordion" style="padding:0 10px 4px;margin-bottom: 10px;font-size:18px;line-height:18px;font-weight:bold;background:#5C755E;color:#FFF;">Configuration Options</h4>';
			html += '<div style="padding:10px 10px 0;display:none;">';
				html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autoupvote" id="tt2_autoupvote" value="1" checked="checked" /> Auto Upvote</label></div>';
				html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autodj" id="tt2_autodj" value="1" /> Auto DJ</label></div>';
				html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1" checked="checked" /> Auto Respond</label></div>';
				html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1" checked="checked" /> Anti Idle</label></div>';
				html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_muteAlert" id="tt2_muteAlert" value="1" checked="checked" /> Enable Mention Alert</label></div>';
			html += '</div>';
		html += '</div>';
		
		html += '</div>'; // close container

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
		$options.find('#tt2_muteAlert').change(function() {
			var checked = $(this).is(':checked');
			_log('Changed Enable Mention Alert option to: ' + (!checked ? 'Yes' : 'No'));
			config.muteAlert = !checked;
		});
		$('#tt2_stats').find('.stat_heading').click(function() {
			$(this).next('div').stop().slideToggle();
		});
	}

	/**
	 * Retrieve similar tracks via Last.FM
	 * http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=cher&track=believe&api_key=d1b14c712954973f098a226d80d6b5c2
	 */
	function getSimilarTracks(artist, song, album) {
		var url = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&autocorrect=1&artist=' + encodeURIComponent(artist) + '&track=' + encodeURIComponent(song) + '&api_key=d1b14c712954973f098a226d80d6b5c2&format=json&callback=?';
		$.getJSON(url, function(data) {
			$.each(data.recenttracks.track, function(i, item){
				if (item.image[1]['#text'] == '') {
					art = settings.noart;
				} else {
					art = stripslashes(item.image[imgSize]['#text']);
				}
	
				url = stripslashes(item.url);
				song = item.name;
				artist = item.artist['#text'];
				album = item.album['#text'];
	
				$this.append(container);
				
				var $current = $this.children(':eq('+i+')');
				
				$current.find('[class=lfm_song]').append(song);
				$current.find('[class=lfm_artist]').append(artist);
				$current.find('[class=lfm_album]').append(album);
				$current.find('[class=lfm_art]').append("<img src='"+art+"' alt='Artwork for "+album+"'/>");
				$current.find('a').attr('href', url).attr('title', 'Listen to '+song+' on Last.FM').attr('target', '_blank');
				
				//callback
				if(i==(settings.number-1)){
					settings.onComplete.call(this);
				}
				
			});
		});
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
			callback: '?' // handleItunesResults
		};
		var url = 'http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?' + urlencode(params);
		$.getJSON(url, function(results) {

			//var results = arg.results;
			var len = results ? results.length : 0;
		
			_log(results);
		
			var $caholder = $('#tt2_stats_current_coverart');
			var html = '';
		
			if (len) {
				for (var i = 0; i < len; i++) {
					// check if we need album art
					if ($caholder.find('img').length == 0 && results[i].artworkUrl100) {
						var alt = results[i].artistName + ' - "' + results[i].trackName + '" (' + results[i].collectionName + ')';
						var img = '<img src="' + results[i].artworkUrl100 + '" width="100" height="100" alt="' + alt + '" style="float:left;display:inline;margin: 0 10px 10px 0;border:4px solid #222;" />';
						$caholder.find('#tt2_stats_current_coverart_wrapper').append(img);
					}
		
					// copy example affiliate link up to point indiciated
					var baseurl = 'http://click.linksynergy.com/fs-bin/stat?id=5PGIX6Dk9zE&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=';
		
					// attach partner id to link urls
					var trackUrl = baseurl + encodeURI(encodeURI(results[i].trackViewUrl + '&partnerId=30'));
					var artistUrl = baseurl + encodeURI(encodeURI(results[i].artistViewUrl + '&partnerId=30'));
					var albumUrl = baseurl + encodeURI(encodeURI(results[i].collectionViewUrl + '&partnerId=30'));
		
					// create html
					html += '<a href="' + artistUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#fff">View Artist</a>';
					html += '<a href="' + trackUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#fff">Buy Track $' + results[i].trackPrice + '</a>';
					html += '<a href="' + albumUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#fff">Buy Album $' + results[i].collectionPrice + '</a>';
					html += '<a href="#" class="similarTracks" target="_blank" style="display:block;padding:4px 10px;color:#fff">See Similar Tracks</a>';
				}
		
				// display
				$('#tt2_stats_current_coverart_wrapper').append(html);
			}
			
		});
		
		//var html = '<script src="' + url + '"><\/script>';
		//$('head').append(html);
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
 * Given a set of itunes search results, display them.
 * http://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html#lookup
 * http://www.rahulsingla.com/blog/2011/08/itunes-performing-itunes-store-search-in-javascript
 */
/*
function handleItunesResults(arg) {
	var results = arg.results;
	var len = results ? results.length : 0;

	_log(results);

	var $caholder = $('#tt2_stats_current_coverart');
	var html = '';
	var width = 150, height = 150;

	if (len) {
		for (var i = 0; i < len; i++) {
			// check if we need album art
			if ($caholder.find('img').length == 0 && results[i].artworkUrl100) {
				var alt = results[i].artistName + ' - "' + results[i].trackName + '" (' + results[i].collectionName + ')';
				$caholder.find('#tt2_stats_current_coverart_wrapper').append('<img src="' + results[i].artworkUrl100 + '" width="100" height="100" alt="' + alt + '" style="text-align:center;border:4px solid #222;" />');
				width = 100;
				height = 100;
			}

			// copy example affiliate link up to point indiciated
			var baseurl = 'http://click.linksynergy.com/fs-bin/stat?id=5PGIX6Dk9zE&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=';

			// attach partner id to link urls
			var trackUrl = baseurl + encodeURI(encodeURI(results[i].trackViewUrl + '&partnerId=30'));
			var artistUrl = baseurl + encodeURI(encodeURI(results[i].artistViewUrl + '&partnerId=30'));
			var albumUrl = baseurl + encodeURI(encodeURI(results[i].collectionViewUrl + '&partnerId=30'));

			// create html
			html += '<div style="position:absolute;top:0;left:0;z-index:1;width:' + width + 'px;height:' + height + 'px;background:#444;width:16px;height:16px;">';
			//html += '<a href="#" target="_blank" style="display:block;width:' + width + 'px;height:' + height + 'px;background:;width:16px;height:16px;"></a>';
			html += '<a href="' + artistUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#000;background:#222;text-decoration:none">View Artist</a>';
			html += '<a href="' + trackUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#000;background:#222;text-decoration:none">Buy Track $' + results[i].trackPrice + '</a>';
			html += '<a href="' + albumUrl + '" target="_blank" style="display:block;padding:4px 10px;color:#000;background:#222;text-decoration:none">Buy Album $' + results[i].collectionPrice + '</a>';
			html += '</div>';
		}

		// display
		$('#tt2_stats_current_coverart_wrapper').append(html);
	}

	// clean up the JS from HEAD
	$('head').find('script[src^="http://ax.itunes.apple.com"]').remove();
}
*/