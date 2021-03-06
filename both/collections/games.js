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
    gameInsert: function(gameTitle, gameBestOf, gameIsPublic, gameAi, playerOne, playerTwo){
        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameTitle, String);
        check(gameBestOf, Number)
        check(gameIsPublic, Boolean);
        check(gameAi, Boolean);

        if(typeof playerOne === 'undefined' || playerOne === '') {
            playerOne = {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0, ready: false, winner: false};
        }
        if(typeof playerTwo === 'undefined' || playerTwo === '') {
            playerTwo = {id: "0", name: "Waiting for player...", score: 0, ready: false, winner: false};
        }

        // create game document (object)
        var game = {
            title: gameTitle,
            playerOne: playerOne,
            playerTwo: playerTwo,
            ai: gameAi,
            bestOf: gameBestOf,
            current: {set: 0, interval: 0, showAnimation: false, playAgain: false},
            is: {playing: false, completed: false, public: gameIsPublic},
            chat: {show: true, conversation: [{id: "0", name: "Devil", text: "Swear against each other here"}]}
        };

        // insert new game
        var gameId = Games.insert(game);

        return gameId;
    },

    // player joined game
    gameUpdatePlayerTwo: function(gameId, ai) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        if(ai) {
            var playerTwo = {id: "COMPUTER", name: "Computer", score: 0, ready: true, winner: false};
        } else {
            var playerTwo = {id: Meteor.userId(), name: Meteor.user().profile.name, score: 0, ready: false, winner: false};
        }

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
    gameAddSet: function(game, playerSelection, computerSelection) {
        var sets = game.sets;

        var currentSet = game.current.set;
        var responseGameAddSet = {updateCurrentSet: currentSet, tie: false};

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

        if(game.ai) {
            sets[currentSet].playerTwoSelection = computerSelection;
        }

        if(typeof sets[currentSet].playerOneSelection !== 'undefined' && typeof sets[currentSet].playerTwoSelection !== 'undefined') {
            responseGameAddSet.updateCurrentSet++;
            if(
                sets[currentSet].playerOneSelection === 'scissors' && sets[currentSet].playerTwoSelection === 'paper' ||
                sets[currentSet].playerOneSelection === 'paper' && sets[currentSet].playerTwoSelection === 'rock' ||
                sets[currentSet].playerOneSelection === 'rock' && sets[currentSet].playerTwoSelection === 'scissors'
            ) {
                sets[currentSet].result = game.playerOne.name;
                Games.update(game._id, {$inc: {"playerOne.score": 1}});
                responseGameAddSet.tie = false
            } else if(
                sets[currentSet].playerTwoSelection === 'scissors' && sets[currentSet].playerOneSelection === 'paper' ||
                sets[currentSet].playerTwoSelection === 'paper' && sets[currentSet].playerOneSelection === 'rock' ||
                sets[currentSet].playerTwoSelection === 'rock' && sets[currentSet].playerOneSelection === 'scissors'
            ) {
                sets[currentSet].result = game.playerTwo.name;
                Games.update(game._id, {$inc: {"playerTwo.score": 1}});
                responseGameAddSet.tie = false
            } else {
                sets[currentSet].result = 'Draw';
                responseGameAddSet.tie = true;
            }
        }

        Games.update(game._id, {$set: {"current.set": responseGameAddSet.updateCurrentSet, sets: sets}});

        return responseGameAddSet;
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
    },

    gameUpdateCurrentShowAnimation: function(gameId, value) {
        var game = Games.findOne({_id: gameId});
        if(game) {
            // validate data
            check(gameId, String);
            check(Meteor.userId(), String);

            Games.update(game._id, {$set: {"current.showAnimation": value}});
        }
    },

    gameUpdateCurrentPlayAgain: function(gameId, value) {
        var game = Games.findOne({_id: gameId});
        if(game) {
            // validate data
            check(gameId, String);
            check(Meteor.userId(), String);
            check(value, Boolean);

            Games.update(game._id, {$set: {"current.playAgain": value}});
        }
    },

    gameUpdateCurrentPlayAgainGameId: function(gameId, playAgainGameId) {
        var game = Games.findOne({_id: gameId});
        if(game) {
            // validate data
            check(gameId, String);
            check(Meteor.userId(), String);
            check(playAgainGameId, String);

            Games.update(game._id, {$set: {"current.playAgainGameId": playAgainGameId}});
        }
    },

    gameUpdateChatConversation: function(gameId, text) {
        var game = Games.findOne({_id: gameId});
        if(game) {
            // validate data
            check(Meteor.userId(), String);
            check(gameId, String);
            check(text, String);

            game.chat.conversation.push({id: Meteor.userId(), name: Meteor.user().profile.name, text: text});

            Games.update(game._id, {$set: {"chat": game.chat}});
        }
    }
});