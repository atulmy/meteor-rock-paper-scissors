var interval;
var intervalWait = 1000;

// Helpers
Template.gamesPlay.helpers({
    currentUrl: function(){
        return 'http://'+window.location.host+Router.current().url;
    },
    game: function() {
        return Games.findOne({_id: Session.get('gameId')});
    },
    winnerName: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.playerOne.score > game.playerTwo.score) {
                return 'Winner: '+game.playerOne.name;
            } else if(game.playerTwo.score > game.playerOne.score) {
                return 'Winner: '+game.playerTwo.name;
            } else {
                return "Its a draw. You <strong>must</strong> challenge again!";
            }
        }
        return '';
    },
    playerOnePointText: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.playerOne.score === 1) {
                return 'point';
            } else {
                return 'points';
            }
        }
    },
    playerTwoPointText: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.playerTwo.score === 1) {
                return 'point';
            } else {
                return 'points';
            }
        }
    },
    getIntervalText: function() {
        var intervalText = '';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            switch(game.current.interval % 3) {
                case 0:
                    intervalText = 'rock';
                    break;
                case 1:
                    intervalText = 'scissors';
                    break;
                case 2:
                    intervalText = 'paper';
                    break;
            }
        }
        return intervalText;
    },
    showGameOverlay: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            return (game.current.interval > 0);
        }
        return false;
    }
});

// Events
Template.gamesPlay.events({
    'click .button-game': function(event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var currentSet = game.current.set;
            var selection = template.$(event.currentTarget).attr('selection');
            console.log(selection);
            Meteor.call('gameAddSet', game, selection, function (error, response) {
                console.log('response '+response);
                if (!error) {
                    if(response != currentSet) {
                        var count = 3;
                        interval = setInterval(function () {
                            if (count >= 0) {
                                //$('#game-overlay').show().fadeOut();
                                Meteor.call('gameUpdateCurrentInterval', game._id, count, function (error, response) {

                                });
                                count--;
                            }
                        }, intervalWait, count);
                    }
                }
            });
        }
    },
    'click .button-finish': function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            // mark game completed
            Meteor.call('gameUpdateIsCompletedAndIsPlaying', game._id, function (error, response) {
                if (error) {
                    alert(error.reason);
                } else {
                    clearInterval(interval);
                }
            });
        }
    }
});

// On Render
Template.gamesPlay.rendered = function () {
    var userId = Meteor.userId();
    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        if(game.playerOne.id !== userId && game.is.completed === false && game.is.playing !== true) {

            // Start game
            Meteor.call('gameUpdateIsPlaying', game._id, function(error, response) {
                if(!error) {
                    var count = 3;
                    interval = setInterval(function() {
                        if(count >= 0) {
                            //$('#game-overlay').show().fadeOut();
                            Meteor.call('gameUpdateIntervalValue', game._id, count, function(error, response) {

                            });
                            count--;
                        }
                    }, intervalWait, count);
                }
            });
        }
    }
};
