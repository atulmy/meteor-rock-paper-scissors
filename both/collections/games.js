Games = new Mongo.Collection('games');

Games.allow({
    insert: function (userId, doc) {
        return (userId && doc.ownerId === userId);
    },
    update: function (userId, doc, fields, modifier) {
        return doc.ownerId === userId;
    },
    remove: function (userId, doc) {
        return doc.ownerId === userId;
    },
    fetch: ['ownerId']
});

Meteor.methods({
    gameInsert: function(gameTitle, gameIsPublic){
        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameTitle, String);
        check(gameIsPublic, Boolean);

        // create game document (object)
        var game = {
            title: gameTitle,
            playerOneId: Meteor.userId(),
            playerTwoId: "",
            isInProgress: false,
            isCompleted: false,
            isPublic: gameIsPublic
        };

        // insert new game
        var gameId = Games.insert(game);

        return gameId;
    },

    gameSetInProgress: function(gameId) {
        // check user signed in
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {playerTwoId: Meteor.userId(), isInProgress: true, isPublic: false}});
    }
});