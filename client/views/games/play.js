var timer = 0;
Template.gamesPlay.helpers({
    currentUrl: function(){
        return 'http://'+window.location.host+Router.current().url;
    },
    game: function() {
        var gameId = Session.get('gameId');
        var game = Games.findOne({_id: gameId});
        return game;
    },
    gameCountdown: function() {
        return timer;
    }
});

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
