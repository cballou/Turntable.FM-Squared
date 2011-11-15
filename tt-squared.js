/**
 * A subset of Turntable.fm Chat Bot:
 * https://github.com/dnephin/Turntable.fm-chat-bot
 */
(function(){

    // TT.FM objects
	var _tt = turntable;
	var _room = null;
	var _manager = null;

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

    // the maximum idle response frequency
    var maxIdleResponseFreq = 10 * 1000;

    // the last idle response time
    var lastIdleResponse = 0;

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
                        break;
                    }
                }

                // find room manager
                if (_room) {
                    for (var o in _room) {
                        if (_room[o] !== null && _room[o].myuserid) {
                            // we have a room manager
							_log('Room manager found.');
                            _manager = _room[o];
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
		if (e.command != 'rem_dj' || !config.autoDj) {
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
		}, stageJumpDelay);
	}

    /**
     * Periodically check if you get mentioned in the chat room.
     */
    function watchForChatMentions(e) {
		// TT.fm does this, so shouldn't we
		if (e.hasOwnProperty('msgid') || !e.userid || !config.autoRespond) {
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
		// set the last motion time
		turntable.lastMotionTime = new Date().getTime();

		if (!config.antiIdle) {
			return;
		}

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
		_log('Begin generation of TT Squared display options.');

		// watch for toggle of auto-dj
		var html = '<div id="tt2_options" style="position:absolute;top:10px;right:10px;width:200px;height:200px;padding:10px;background:#333;color:#fff;font-size:12px;line-height:18px;vertical-align:middle;">';
		html += '<h4 style="padding-bottom:4px;margin-bottom: 10px;font-size:18px;line-height:18px;font-weight:bold;border-bottom:1px dotted #000;">TT<sup>2</sup> Options</h4>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autodj" id="tt2_autodj" value="1" /> Auto DJ</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_autorespond" id="tt2_autorespond" value="1" checked="checked" /> Auto Respond</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_antiidle" id="tt2_antiidle" value="1" checked="checked" /> Anti Idle</label></div>';
		html += '<div style="margin-bottom:8px"><label><input type="checkbox" name="tt2_config.muteAlert" id="tt2_config.muteAlert" value="1" /> Mute Ping Alert</label></div>';
		html += '</div>';
		$(html).appendTo('body');
		$options = $('#tt2_options');
		$options.find('#tt2_autodj').change(function() {
			var checked = $(this).is(':checked');
			config.autoDj = checked;
		});
		$options.find('#tt2_autorespond').change(function() {
			var checked = $(this).is(':checked');
			config.autoRespond = checked;
		});
		$options.find('#tt2_antiidle').change(function() {
			var checked = $(this).is(':checked');
			config.antiIdle = checked;
		});
		$options.find('#tt2_config.muteAlert').change(function() {
			var checked = $(this).is(':checked');
			config.muteAlert = checked;
		});

		_log('Completed display of TT Squared options.');
	}

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
		// display the options menu
		displayOptionsMenu();

		// initialize the lastIdleResponse to prevent message on room join
		lastIdleResponse  = new Date().getTime();

        // begin event listeners
        _log('Initiating the chat message listener.');
        _tt.addEventListener('message', watchForChatMentions);
		_log('Initiating the empty dj listener.');
		_tt.addEventListener('message', watchForEmptyDjSlot);

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
            _log('Already responded to idle request recently.');
            return true;
        }

		_log('Now: ' + now);
		_log('Last Idle Response: ' + lastIdleResponse);
		_log('Max Frequency: ' + maxIdleResponseFreq);

		// update the last idle response
        lastIdleResponse  = new Date().getTime();
		return false;
	}

    /**
     * Play an elert when mentioned.
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
