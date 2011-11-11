/**
 * A subset of Turntable.fm Chat Bot:
 * https://github.com/dnephin/Turntable.fm-chat-bot
 */

// turntable object
//window.tt = turntable;

// room instance
//window.room = null; //getRoom();

// room manager
//window.roomman = null; //getRoomManager();

// get room reference
/*
window.getRoom = function() {
	for (var k in turntable) {
        var v = turntable[k];
        if (v) {
            if (v.creatorId) {
                return v;
            }
        }
    }
    return false;
}

// get roommanager reference
window.getRoomManager = function() {
	for (var k in room) {
        var v = room[k];
        if (v && v.myuserid) {
            return v;
        }
    }
    return false;
}
*/

/**
 * Where the magic happens.
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
        'coreyb'
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
        'Check check',
        'Yup',
        'Yeah',
        'Hey',
        'Still here',
        'Checking in',
        'Right here',
        'Yo',
        'Not idle',
        'I\'m here',
        'What?',
        'Huh?',
        'Nope',
        'Not here',
        'Yes..'
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
						console.log('Room found.');
                        _room = _tt[o];
						console.log(_room.nodes);
                        break;
                    }
                }

                // find room manager
                if (_room) {
                    for (var o in _room) {
                        if (_room[o] !== null && _room[o].myuserid) {
                            // we have a room manager
							console.log('Room manager found.');
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
		if (e.hasOwnProperty('msgid')) {
			return;
		}

		// we have other gems like the userid and name
		console.log('Message Userid: ' + e.userid);
		console.log('Message Name: ' + e.name);
		console.log('Message Text: ' + e.text);

        // handle alerting when mentioned
        if (stringInText(nameAliases, e.text)) {
			console.log('Name alias mentioned.');
            playAlertSound();
        } else {
            if (!stringInText(generalNameAliases, e.text)) {
                return;
            }
			console.log('General name alias mentioned.');
        }

        if (!stringInText(idleAliases, e.text) || e.text.length > 128) {
            return;
        }

		console.log('Idle alias mentioned.');

        // check if we responded to an idle request recently
        var now = new Date().getTime();
        if (now - lastIdleResponse < maxIdleResponseFreq) {
            console.log('Already responded to idle request recently.');
            return;
        }

        // update the last idle response
        lastIdleResponse  = new Date().getTime();

        // log the idle check
        console.log('Possible idle check: ' + e.text);

        // create a response
        var response = randomResponse(idleResponses);

        // handle response
        var responseTimeout = setTimeout(function() {
            console.log('Responding with: ' + response);
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
		console.log('Chat form:');
		console.log(_room.nodes.chatForm);
		var $chatForm = $(room.nodes.chatForm)
		$chatForm.find('input').val(msg)
		$chatForm.submit()
	}

    // ensure we get a valid user object before handling auto-responder
    $.when(getTurntableObjects()).then(function() {
        // watch for chat mentions
        console.log('Initiating the chat message listener.');
        _tt.addEventListener('message', watchForChatMentions);
    });


	//==========================================================================
	// HELPER FUNCTIONS
	//==========================================================================

	// generate a random number within a range.
	function randomDelay(min, max) {
		min = min || 2;
		max = max || 70;
		return (Math.random() * max + min) * 1000;
	}

	function randomChoice(options) {
		var idx = Math.floor(Math.random() * options.length);
		return options[idx];
	}

	function stringInText(strings, text, forceWord) {
		if (forceWord == null) {
			forceWord = true;
		}

		text = text.toLowerCase()
		for (var string in strings) {
			string = string.toLowerCase();
			if (forceWord) {
				string = new RegExp("\\b#{string}\\b");
			}
			if (text.search(string) > -1) {
				return true
			}
		}
		return false
	}

})();
