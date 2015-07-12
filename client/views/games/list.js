Template.gamesList.helpers({
    userId: function() {
        return Meteor.userId();
    },
    games: function() {
        return Games.find({isPublic: true}, {sort: {createdAt: -1}, limit : 5});
    },
    gamesFinished: function() {
        return Games.find({isCompleted: true}, {sort: {createdAt: -1}, limit : 5});
    },
    gamesCount: function() {
        return Games.find({isPublic: true}, {sort: {createdAt: -1}, limit : 5}).count();
    },

    gamesFinishedCount: function() {
        return Games.find({isCompleted: true}, {sort: {createdAt: -1}, limit : 5}).count();
    }
});

Template.gamesList.events({
    'submit #game-create': function(event, template) {
        template.$('#game-create-submit').attr('disabled', 'disabled');

        var gameTitle = template.$('#form-create-title').val();
        var gameIsPublic = template.$('#form-create-public').is(':checked');
        var gameBestOf = parseInt(template.$('.form-create-bestof:checked').val());

        Meteor.call('gameInsert', gameTitle, gameIsPublic, gameBestOf, function(error, response) {
            if(!error) {
                Router.go('play', {gameId: response});
            } else {
                alert(error.reason);
            }
            template.$('#game-create-submit').removeAttr('disabled');
        });

        event.preventDefault();
    }
});