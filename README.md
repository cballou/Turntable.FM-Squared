Usage
=====

1. Clone this repository
2. Scroll down in autorespond.js and change the following vars to suit your needs:


```javascript
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
        'you guys'
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
        'respond'
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
```

3. Create a bookmarklet in your web browser and enter the following (swapping out YOURUSERNAME):
Name: Turntable.FM Anti-Idle
Url: javascript:(function(){$('body').append('<script src="https://raw.github.com/YOURUSERNAME/Turntable.FM-Anti-Idle-Autoresponder/master/autorespond.js"></script>');})();
4. When in a Turntable.FM room, click on your new bookmarklet.
