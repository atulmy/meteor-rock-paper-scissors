Games = new Mongo.Collection('games');

Games.allow({
    insert: function (userId, doc) {
        return (userId && doc.playerOne.id === userId);
    },
    update: function (userId, doc, fields, modifier) {
        return doc.playerOne.id === userId;
    },
    remove: function (userId, doc) {
        return doc.playerOne.id === userId;
    },
    fetch: ['playerOne.id']
});

Meteor.methods({

    // add new game
    gameInsert: function(gameTitle, gameBestOf, gameIsPublic){
        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameTitle, String);
        check(gameBestOf, Number)
        check(gameIsPublic, Boolean);;

        // create game document (object)
        var game = {
            title: gameTitle,
            playerOne: {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0, ready: false, winner: false},
            playerTwo: {id: "0", name: "Waiting for player...", score: 0, ready: false, winner: false},
            bestOf: gameBestOf,
            current: {set: 0, interval: 0},
            is: {playing: false, completed: false, public: gameIsPublic}
        };

        // insert new game
        var gameId = Games.insert(game);

        return gameId;
    },

    // player joined game
    gameUpdatePlayerTwo: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        var playerTwo = {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0, ready: false, winner: false};
        Games.update(gameId, {$set: {playerTwo: playerTwo}});

        return playerTwo;
    },

    // player says is ready to play
    gameUpdatePlayerReady: function(gameId, isPlayerOne) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        if(isPlayerOne) {
            Games.update(gameId, {$set: {"playerOne.ready": true}});
        } else {
            Games.update(gameId, {$set: {"playerTwo.ready": true}});
        }

        return true;
    },

    // start game
    gameUpdateIsPlaying: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {"is.playing": true}});

        return true;
    },

    // called after choosing object (rock / paper / scissor) for both the user
    gameAddSet: function(game, playerSelection) {
        var sets = game.sets;

        var currentSet = game.current.set;
        var updateCurrentSet = currentSet;
        if(!sets) {
            sets = [];
            sets[currentSet] = {setNumber: currentSet};
        } else {
            if(typeof sets[currentSet] === 'undefined') {
                sets[currentSet] = {setNumber: currentSet};
            }
        }

        if(game.playerOne.id === Meteor.userId()) {
            if(typeof sets[currentSet].playerOneSelection === 'undefined') {
                sets[currentSet].playerOneSelection = playerSelection;
            }
        } else {
            if(typeof sets[currentSet].playerTwoSelection === 'undefined') {
                sets[currentSet].playerTwoSelection = playerSelection;
            }
        }

        if(typeof sets[currentSet].playerOneSelection !== 'undefined' && typeof sets[currentSet].playerTwoSelection !== 'undefined') {
            updateCurrentSet++;
            if(
                sets[currentSet].playerOneSelection === 'scissors' && sets[currentSet].playerTwoSelection === 'paper' ||
                sets[currentSet].playerOneSelection === 'paper' && sets[currentSet].playerTwoSelection === 'rock' ||
                sets[currentSet].playerOneSelection === 'rock' && sets[currentSet].playerTwoSelection === 'scissors'
            ) {
                Games.update(game._id, {$inc: {"playerOne.score": 1}});
            } else if(
                sets[currentSet].playerTwoSelection === 'scissors' && sets[currentSet].playerOneSelection === 'paper' ||
                sets[currentSet].playerTwoSelection === 'paper' && sets[currentSet].playerOneSelection === 'rock' ||
                sets[currentSet].playerTwoSelection === 'rock' && sets[currentSet].playerOneSelection === 'scissors'
            ) {
                Games.update(game._id, {$inc: {"playerTwo.score": 1}});
            }
        }

        Games.update(game._id, {$set: {"current.set": updateCurrentSet, sets: sets}});
        return updateCurrentSet;
    },

    gameUpdateCurrentInterval: function(gameId, count) {
        Games.update(gameId, {$set: {"current.interval": count}});
    },

    // mark game completed
    gameUpdateIsCompletedAndIsPlaying: function(gameId) {
        var game = Games.findOne({_id: gameId});
        if(game && game.is.completed === false && game.is.playing === true) {
            // validate data
            check(gameId, String);
            check(Meteor.userId(), String);

            Games.update(gameId, {$set: {"is.completed": true, "is.playing": false}});
        }
    },

    gameUpdatePlayerWinner: function(game) {
        if(game.playerOne.score == game.playerTwo.score) {
            // nothing
        } else if(game.playerOne.score > game.playerTwo.score) {
            Games.update(game._id, {$set: {"playerOne.winner": true}});
        } else if(game.playerTwo.score > game.playerOne.score) {
            Games.update(game._id, {$set: {"playerTwo.winner": true}});
        }
        return true;
    }
});