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
    gameInsert: function(gameTitle, gameIsPublic, gameBestOf){
        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameTitle, String);
        check(gameIsPublic, Boolean);
        check(gameBestOf, Number);

        // create game document (object)
        var game = {
            title: gameTitle,
            playerOneId: Meteor.userId(),
            playerOneScore: 0,
            playerTwoId: "",
            playerTwoScore: 0,
            bestOf: gameBestOf,
            winnerId: "",
            isInProgress: false,
            isCompleted: false,
            isPublic: gameIsPublic
        };

        // insert new game
        var gameId = Games.insert(game);

        return gameId;
    },

    gameSetInProgress: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {playerTwoId: Meteor.userId(), isInProgress: true, isPublic: false}});
    },

    gameMarkCompleted: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {isCompleted: true, isInProgress: false}});
    },

    gameUpdateScore: function(gameId, setNumber, playerOneResult, playerTwoResult) {
        var scores = {setNumber: setNumber, playerOneResult: Boolean(playerOneResult), playerTwoResult: Boolean(playerTwoResult)};
        return Games.update(gameId, {$addToSet: {scores: scores}});
    }
});