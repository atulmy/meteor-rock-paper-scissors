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
    }
});

// Events
Template.gamesPlay.events({
    'click .button-game': function(event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var selection = template.$(event.currentTarget).attr('selection');
            console.log(selection);
            Meteor.call('gameUpdateScore', game, selection, function (error, response) {
                console.log('response '+response);
                if (!error) {

                }
            });
        }
    },
    'click .button-finish': function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            Meteor.call('gameMarkCompleted', game._id, function (error, response) {
                if (error) {
                    alert(error.reason);
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
        if(game.playerOne.id !== userId && game.isInProgress !== true) {
            Meteor.call('gameSetInProgress', game._id, function(error, response) {
                if(!error) {

                }
            });
        }
    }
};
