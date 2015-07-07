Template.gamesList.helpers({
    userId: function() {
        return Meteor.userId();
    },
    games: function() {
        return Games.find({isCompleted: false, isPublic: true}, {sort: {createdAt: -1}, limit : 5});
    },
    gamesCount: function() {
        return Games.find({isCompleted: false, isPublic: true}, {sort: {createdAt: -1}, limit : 5}).count();
    }
});

Template.gamesList.events({
    'submit #game-create': function(event, template) {
        var gameTitle = template.$('#form-create-title').val();
        var gameIsPublic = template.$('#form-create-public').is(':checked');

        Meteor.call('gameInsert', gameTitle, gameIsPublic, function(error, response) {
            if(!error) {
                Router.go('play', {gameId: response});
            } else {
                alert(error.reason);
            }
        });

        event.preventDefault();
    }
});