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
    playerOneScore: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var playerOneScore = Session.get('playerOneScore');
            if (playerOneScore != game.playerOne.score) {
                Session.set('playerOneScore', game.playerOne.score);
                if(typeof playerOneScore !== 'undefined' && game.playerOne.score > 0) {
                    setTimeout(function () {
                        $('#audio-score')[0].play();
                        $('.player-one-score').addClass('vibrate');
                        setTimeout(function () {
                            $('.player-one-score').removeClass('vibrate');
                        }, 2000);
                    }, 3000);
                }
            }
            return game.playerOne.score;
        }
        return 0;
    },
    playerTwoScore: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var playerTwoScore = Session.get('playerTwoScore');
            if (playerTwoScore != game.playerTwo.score) {
                Session.set('playerTwoScore', game.playerTwo.score);
                if(typeof playerTwoScore !== 'undefined' && game.playerTwo.score > 0) {
                    setTimeout(function () {
                        $('#audio-score')[0].play();
                        $('.player-two-score').addClass('vibrate');
                        setTimeout(function () {
                            $('.player-two-score').removeClass('vibrate');
                        }, 2000);
                    }, 3000);
                }
            }
            return game.playerTwo.score;
        }
        return 0;
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
    playerOneSelectionText: function() {
        var playerOneSelectionText = '?';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set - 1] !== 'undefined') {
            if(typeof game.sets[game.current.set - 1].playerOneSelection !== 'undefined') {
                return game.sets[game.current.set - 1].playerOneSelection;
            }
        }
        return playerOneSelectionText;
    },
    playerTwoSelectionText: function() {
        var playerOneSelectionText = '?';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set - 1] !== 'undefined') {
            if(typeof game.sets[game.current.set - 1].playerTwoSelection !== 'undefined') {
                return game.sets[game.current.set - 1].playerTwoSelection;
            }
        }
        return playerOneSelectionText;
    },
    showAnimation: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            return game.current.showAnimation;
        }
        return false;
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
            return (game.current.interval > 0 && !game.is.completed);
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
            return ++game.current.set;
        }
        return 1;
    },
    currentlySelected: function() {
        var currentlySelected = '';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set] !== 'undefined') {
            if(game.playerOne.id === Meteor.userId() && typeof game.sets[game.current.set].playerOneSelection !== 'undefined') {
                return game.sets[game.current.set].playerOneSelection;
            } else if(game.playerTwo.id === Meteor.userId() && typeof game.sets[game.current.set].playerTwoSelection !== 'undefined') {
                return game.sets[game.current.set].playerTwoSelection;
            }
        }
        return currentlySelected;
    },
    playFinishGameSound: function() {
        return Session.get('playFinishGameSound');
    },
    playFinishGameSoundStop: function() {
        return Session.set('playFinishGameSound', false);
    },
    gamePlayAgain: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.current.playAgain && typeof game.current.playAgainGameId != 'undefined' && game.current.playAgainGameId !== '') {
                Meteor.call('gameUpdateCurrentPlayAgain', game._id, false, function(error, response) {
                    console.log('gameUpdateCurrentPlayAgain');
                });
                setTimeout(function() {
                    Router.go('play', {gameId: game.current.playAgainGameId});
                }, 2000);
                return game.current.playAgain;
            }
        }
        return false;
    },
    allowPlayAgain: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.playerOne.id === Meteor.userId() || game.playerTwo.id === Meteor.userId()) {
                return true;
            }
        }
        return false;
    },
    gameSets: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        console.log(game);
        if(game) {
            if(typeof game.sets !== 'undefined' && game.sets.length > 0 && game.sets[0].playerOneSelection !== '' && game.sets[0].playerTwoSelection !== '') {
                return game.sets;
            }
        }
        return false;
    },

    gameChatShow: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.chat) {
                return true;
            }
        }
        return false;
    },
    gameChatAllow: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.chat && (Meteor.userId() === game.playerOne.id || Meteor.userId() === game.playerTwo.id)) {
                return true;
            }
        }
        return false;
    },
    gameChatScrollDiv: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.chat) {
                var gameChatConversationLength = Session.get('gameChatConversationLength');
                if(typeof gameChatConversationLength !== 'undefined' && gameChatConversationLength !== game.chat.conversation.length) {
                    $("#game-chat-conversations").animate({ scrollTop: $('#game-chat-conversations')[0].scrollHeight}, 1000);
                    $('#audio-chat')[0].play();
                    Session.set('gameChatConversationLength', game.chat.conversation.length);
                }
            }
        }
        return '';
    },
    gameChatUserName: function() {
        return 'A';
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
            Session.set('playFinishGameSound', true);

            Meteor.call('gameUpdatePlayerReady', game._id, isPlayerOne, function (error, response) {
                console.log('gameUpdatePlayerReady');
                if(!error) {
                    template.$('.button-ready').hide();

                    game = Games.findOne({_id: Session.get('gameId')});

                    if(game.playerOne.ready && game.playerTwo.ready) {

                        // update which player is winning
                        Meteor.call('gameUpdateIsPlaying', game._id, function (error, response) {
                            console.log('gameUpdateIsPlaying');
                            if (!error) {
                                // alert start
                                $('#audio-start-set')[0].play();

                                // show Rock Paper Scissors overlay
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
            if(
                (typeof game.sets !== 'undefined' && typeof game.sets[game.current.set] !== 'undefined')
                &&
                (
                    (game.playerOne.id === Meteor.userId() && typeof game.sets[game.current.set].playerOneSelection !== 'undefined')
                    ||
                    (game.playerTwo.id === Meteor.userId() && typeof game.sets[game.current.set].playerTwoSelection !== 'undefined')
                )
            ) {
                return false;
            }
            var currentSet = game.current.set;
            var selection = template.$(event.currentTarget).attr('selection');

            template.$(event.currentTarget).addClass('opacity-2');

            var computerSelection = '';
            if(game.ai) {
                var xmin = 0;
                var xmax = 2;
                var computerSelectionOptions = ['rock', 'paper', 'scissors'];
                computerSelection = computerSelectionOptions[Math.floor( Math.random() * (xmax + 1 - xmin) + xmin )];
                console.log(computerSelection);
            }

            Meteor.call('gameAddSet', game, selection, computerSelection, function (error, responseGameAddSet) {
                console.log('gameAddSet');
                if (!error) {
                    if(game.bestOf !== 0 && responseGameAddSet.updateCurrentSet === game.bestOf) {

                        // finish game
                        Meteor.call('gameUpdateIsCompletedAndIsPlaying', game._id, function (error, responseGameUpdateIsCompletedAndIsPlaying) {
                            console.log('gameUpdateIsCompletedAndIsPlaying');
                            if (error) {
                                //alert(error.reason);
                            } else {
                                clearInterval(interval);
                            }
                        });
                    } else {
                        if (responseGameAddSet.updateCurrentSet != currentSet) {
                            $('.button-game').removeClass('opacity-2');

                            game = Games.findOne({_id: Session.get('gameId')});

                            // update which player is winning
                            Meteor.call('gameUpdatePlayerWinner', game, function(error, response) {
                                console.log('gameUpdatePlayerWinner');

                                Meteor.call('gameUpdateCurrentShowAnimation', game._id, true, function () {
                                    $('#audio-selections')[0].play();
                                    console.log('gameUpdateCurrentShowAnimation');
                                    setTimeout(function () {
                                        Meteor.call('gameUpdateCurrentShowAnimation', game._id, false, function () {
                                            console.log('gameUpdateCurrentShowAnimation');
                                        });
                                    }, 2000);
                                });

                                // check if tie
                                var gameShowRPSTime = 4000;
                                if(responseGameAddSet.tie) {
                                    gameShowRPSTime = 2000;
                                }

                                setTimeout(function(){
                                    // alert start
                                    setTimeout(function() {
                                        $('#audio-start-set')[0].play();
                                    }, intervalWait);

                                    // show Rock Paper Scissors overlay
                                    Meteor.call('gameShowRPS', game._id, interval, intervalWait, function (error, responseGameShowRPS) {
                                        console.log('gameShowRPS');
                                        interval = responseGameShowRPS;
                                    });
                                }, gameShowRPSTime);
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
    },

    'click .game-play-again': function(event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if (game) {
            var playerOne = game.playerOne;
            var playerTwo = game.playerTwo;
            playerOne.ready = playerTwo.ready = false;
            playerOne.score = playerTwo.score = 0;
            playerOne.winner = playerTwo.winner = false;

            Meteor.call('gameUpdateCurrentPlayAgain', game._id, true, function(error, response) {
                console.log('gameUpdateCurrentPlayAgain');
                if(!error) {
                    Meteor.call('gameInsert', game.title+' - Rematch!', game.bestOf, game.is.public, game.ai, playerOne, playerTwo, function(error, response) {
                        console.log('gameInsert');
                        if(!error) {
                            Meteor.call('gameUpdateCurrentPlayAgainGameId', game._id, response, function(error, response) {
                                console.log('gameUpdateCurrentPlayAgainGameId')
                            });
                        } else {
                            alert(error.reason);
                        }
                    });
                } else {
                    alert(error.reason);
                }
            });
        }
    },

    'submit #form-game-chat':  function(event, template) {
        event.preventDefault();

        var game = Games.findOne({_id: Session.get('gameId')});
        if (game) {

            var text = template.$('#form-game-chat-text').val();
            template.$('#form-game-chat-send').attr('disabled', 'disabled');

            Meteor.call('gameUpdateChatConversation', game._id, text, function(error, response) {
                console.log('gameUpdateChatConversation');

                if(!error) {
                    template.$('#form-game-chat-text').val('');
                }

                template.$('#form-game-chat-send').removeAttr('disabled');
            });
        }
    }
});

// On Render
Template.gamesPlay.rendered = function () {
    var userId = Meteor.userId();
    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        Session.set('gameChatConversationLength', game.chat.conversation.length);

        if((game.playerOne.id !== userId || game.ai) && game.is.completed === false && game.is.playing !== true) {

            // Player joined
            Meteor.call('gameUpdatePlayerTwo', game._id, game.ai, function (error, response) {
                console.log('gameUpdatePlayerTwo');
                if (!error) {
                    //Meteor.call('browserNotificationShow', response.name+" has joined your game. Lets begin! Go go go...");
                }
            });
        }
    }
};
