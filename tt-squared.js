/**
 * A subset of Turntable.fm Chat Bot:
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
		muteAlert: false
	}

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

		// log the event
		if (e.command && e.command == 'new_moderator') {
			_log('========NEW MODERATOR========');
		}
		_log(e);

		// TT.fm does this, so shouldn't we
		if (e.hasOwnProperty('msgid') || !e.userid) {
			return;
		}

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

		return;

        // create a response
        var response = randomChoice(idleMessages);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Preventing idle: ' + response);
            say(response);
        }, randomDelay(2, 8));
	}

	/**
	 * Display the options menu.
	 */
	function displayOptionsMenu() {
		// watch for toggle of auto-dj
		var html = '<div id="tt2_options" style="position:absolute;top:10px;right:10px;width:200px;height:200px;padding:10px;background:#333;color:#fff;font-size:12px;line-height:18px;vertical-align:middle;">';
		html += '<h4 style="padding-bottom:4px;margin-bottom: 10px;font-size:18px;line-height:18px;font-weight:bold;border-bottom:1px dotted #000;">TT<sup>2</sup> Options</h4>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autodj" id="tt2_autodj" value="1" /> Auto DJ</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1" checked="checked" /> Auto Respond</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1" checked="checked" /> Anti Idle</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_config.muteAlert" id="tt2_config.muteAlert" value="1" checked="checked" /> Enable Mention Alert</label></div>';
		html += '</div>';
		$(html).appendTo('body');
		$options = $('#tt2_options');
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

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
		// display the options menu
		displayOptionsMenu();

        // begin event listeners
        _log('Initiating the chat message listener.');
        _tt.addEventListener('message', watchForChatMentions);
		_log('Initiating the empty dj listener.');
		_tt.addEventListener('message', watchForEmptyDjSlot);

		_log(turntable);
		_log(_manager);
		/*
		// attempt to receive moderator status
		_log('Attempting to receive moderator status.');

		// spoof a moderator
		var myuserid = turntable[_k[0]][_k[1]].myuserid;
		turntable[_k[0]][_k[1]].moderator = true;
		turntable[_k[0]][_k[1]].myuserid = turntable[_k[0]][_k[1]].moderators[0];
		turntable[_k[0]].selfId = turntable[_k[0]][_k[1]].moderators[0];
		turntable.user.id = turntable[_k[0]][_k[1]].moderators[0];
		turntable.user.acl = 1;

		// make call for moderator
		turntable[_k[0]][_k[1]].callback('add_moderator', myuserid);

		// revert back to original user
		turntable[_k[0]][_k[1]].myuserid = myuserid;
		turntable.user.id = myuserid;
		turntable.user.acl = 0;

		$("#room-info-tab .edit-description-btn").show();
		_log('You are now potentially a moderator.');
		*/

		// periodically update turntable.lastMotionTime
		setInterval(function() {
			preventIdle();
		}, 10100);
    });

	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

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
        for (i = 0; i < 5; i++) {
            setTimeout(function() {
				if (turntablePlayer) {
					turntablePlayer.playEphemeral(UI_SOUND_CHAT, true);
				}
			}, i*700);
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
