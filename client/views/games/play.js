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
    gameIndefinite: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.bestOf === 0) {
                return true;
            }
        }
        return false;
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
    },
    playerOneReadyText: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && game.playerOne.ready === true) {
            return 'ready <span class="glyphicon glyphicon-ok"></span>';
        }
        return 'not ready <span class="glyphicon glyphicon-time"></span>';
    },
    playerTwoReadyText: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && game.playerTwo.ready === true) {
            return 'ready <span class="glyphicon glyphicon-ok"></span>';
        }
        return 'not ready <span class="glyphicon glyphicon-time"></span>';
    },
    gameCurrentSet: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            return game.current.set + 1;
        }
        return 1;
    },
    currentlySelected: function() {
        var currentlySelected = '';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets[game.current.set] !== 'undefined') {
            if(game.playerOne.id === Meteor.userId() && typeof game.sets[game.current.set].playerOneSelection !== 'undefined') {
                return game.sets[game.current.set].playerOneSelection;
            } else if(game.playerTwo.id === Meteor.userId() && typeof game.sets[game.current.set].playerTwoSelection !== 'undefined') {
                return game.sets[game.current.set].playerTwoSelection;
            }
        }
        return currentlySelected;
    }
});

// Events
Template.gamesPlay.events({

    // Set ready and start game
    'click .button-ready': function (event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var isPlayerOne = false;
            if(Meteor.userId() === game.playerOne.id) {
                isPlayerOne = true;
            }
            Meteor.call('gameUpdatePlayerReady', game._id, isPlayerOne, function (error, response) {
                console.log('gameUpdatePlayerReady');
                if(!error) {
                    template.$('.button-ready').hide();

                    var game = Games.findOne({_id: Session.get('gameId')});
                    if(game.playerOne.ready && game.playerTwo.ready) {
                        Meteor.call('gameUpdateIsPlaying', game._id, function (error, response) {
                            console.log('gameUpdateIsPlaying');
                            if (!error) {
                                Meteor.call('gameShowRPS', game._id, interval, intervalWait, function (error, response) {
                                    console.log('gameShowRPS');
                                    interval = response;
                                });
                            }
                        });
                    }
                }
            });
        }
    },

    // select object
    'click .button-game': function(event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var currentSet = game.current.set;
            var selection = template.$(event.currentTarget).attr('selection');
            console.log(selection);
            Meteor.call('gameAddSet', game, selection, function (error, response) {
                console.log('response '+response);
                template.$(event.currentTarget).addClass('opacity-2');
                if (!error) {
                    if(game.bestOf !== 0 && response === game.bestOf) {
                        Meteor.call('gameUpdateIsCompletedAndIsPlaying', game._id, function (error, response) {
                            console.log('gameUpdateIsCompletedAndIsPlaying');
                            if (error) {
                                //alert(error.reason);
                            } else {
                                clearInterval(interval);
                            }
                        });
                    } else {
                        if (response != currentSet) {
                            setTimeout(function() {
                                $('.button-game').removeClass('opacity-2');
                            }, 1000);

                            Meteor.call('gameShowRPS', game._id, interval, intervalWait, function (error, response) {
                                console.log('gameShowRPS');
                                interval = response;

                                game = Games.findOne({_id: Session.get('gameId')});
                                Meteor.call('gameUpdatePlayerWinner', game, function(error, response) {
                                    console.log('gameUpdatePlayerWinner');
                                });
                            });
                        }
                    }
                }
            });
        }
    },

    // finish game
    'click .button-finish': function() {
        var confirmFinish = confirm('Are you sure you want to finish this game? Losing huh?');
        if(confirmFinish) {
            var game = Games.findOne({_id: Session.get('gameId')});
            if (game) {
                // mark game completed
                Meteor.call('gameUpdateIsCompletedAndIsPlaying', game._id, function (error, response) {
                    console.log('gameUpdateIsCompletedAndIsPlaying');
                    if (error) {
                        //alert(error.reason);
                    } else {
                        clearInterval(interval);
                    }
                });
            }
        }
    }
});

// On Render
Template.gamesPlay.rendered = function () {
    var userId = Meteor.userId();
    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        if(game.playerOne.id !== userId && game.is.completed === false && game.is.playing !== true) {

            // Player joined
            Meteor.call('gameUpdatePlayerTwo', game._id, function(error, response) {
                console.log('gameUpdatePlayerTwo');
                if(!error) {
                    //Meteor.call('browserNotificationShow', response.name+" has joined your game. Lets begin! Go go go...");
                }
            });
        }
    }
};
