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
            playerOne: {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0},
            playerTwo: {id: "0", name: "Waiting for player...", score: 0},
            bestOf: gameBestOf,
            currentSet: 0,
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

        Games.update(gameId, {$set: {playerTwo: {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0}, isInProgress: true, isPublic: false}});
    },

    gameMarkCompleted: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {isCompleted: true, isInProgress: false}});
    },

    gameUpdateScore: function(game, playerSelection) {
        //console.log(game);
        var scores = game.scores;
        console.log(scores);
        var currentSet = game.currentSet;
        var updateCurrentSet = currentSet;
        if(!scores) {
            scores = [];
            scores[currentSet] = {setNumber: currentSet};
        } else {
            if(typeof scores[currentSet] === 'undefined') {
                scores[currentSet] = {setNumber: currentSet};
            }
        }
        if(game.playerOne.id === Meteor.userId()) {
            if(typeof scores[currentSet].playerOneSelection === 'undefined') {
                scores[currentSet].playerOneSelection = playerSelection;
            }
        } else {
            if(typeof scores[currentSet].playerTwoSelection === 'undefined') {
                scores[currentSet].playerTwoSelection = playerSelection;
            }
        }
        if(typeof scores[currentSet].playerOneSelection !== 'undefined' && typeof scores[currentSet].playerTwoSelection !== 'undefined') {
            updateCurrentSet++;
            if(
                scores[currentSet].playerOneSelection === 'scissors' && scores[currentSet].playerTwoSelection === 'paper' ||
                scores[currentSet].playerOneSelection === 'paper' && scores[currentSet].playerTwoSelection === 'rock' ||
                scores[currentSet].playerOneSelection === 'rock' && scores[currentSet].playerTwoSelection === 'scissors'
            ) {
                Games.update(game._id, {$inc: {"playerOne.score": 1}});
            } else if(
                scores[currentSet].playerTwoSelection === 'scissors' && scores[currentSet].playerOneSelection === 'paper' ||
                scores[currentSet].playerTwoSelection === 'paper' && scores[currentSet].playerOneSelection === 'rock' ||
                scores[currentSet].playerTwoSelection === 'rock' && scores[currentSet].playerOneSelection === 'scissors'
            ) {
                Games.update(game._id, {$inc: {"playerTwo.score": 1}});
            }
        }
        return Games.update(game._id, {$set: {currentSet: updateCurrentSet, scores: scores}});
    }
});