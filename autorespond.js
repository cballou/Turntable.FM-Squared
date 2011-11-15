/**
 * A subset of Turntable.fm Chat Bot:
 * https://github.com/dnephin/Turntable.fm-chat-bot
 */
(function(){

    // TT.FM objects
	var _tt = turntable;
	var _room = null;
	var _manager = null;

    // whether to alert on mute
    var muteAlert = false;

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
    var idleResponses = [
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

    // max idle time that users will accept
    var maxIdleTime = 6 * 60 * 1000;

    // the maximum idle response frequency
    var maxIdleResponseFreq = 15 * 1000;

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
     * Periodically check if you get mentioned in the chat room.
     */
    function watchForChatMentions(e) {
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

        if (!stringInText(idleAliases, e.text) || e.text.length > 128) {
            return;
        }

        // check if we responded to an idle request recently
        var now = new Date().getTime();
        if (now - lastIdleResponse < maxIdleResponseFreq) {
            _log('Already responded to idle request recently.');
            return;
        }

        // update the last idle response
        lastIdleResponse  = new Date().getTime();

        // log the idle check
        _log('Possible idle check: ' + e.text);

        // create a response
        var response = randomChoice(idleResponses);

		// replace nickname
		response = response.replace('{{NICKNAME}}', e.name);

        // handle response
        var responseTimeout = setTimeout(function() {
            _log('Responding with: ' + response);
            say(response);
        }, randomDelay(2, 8));
    }

    /**
     * Play an elert when mentioned.
     */
    function playAlertSound() {
        if (muteAlert) return;
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

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
        // watch for chat mentions
        _log('Initiating the chat message listener.');
        _tt.addEventListener('message', watchForChatMentions);
    });


	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

	function randomDelay(min, max) {
		min = min || 2;
		max = max || 70;
		return (Math.random() * max + min) * 1000;
	}

	function randomChoice(options) {
		var idx = Math.floor(Math.random() * options.length);
		return options[idx];
	}

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

	function _log(msg) {
		if (window.console) {
			_log(msg);
		}
	}

})();
