// Online Games
Meteor.publish('games', function() {
    return Games.find({"is.public": true, "is.completed": false, "is.playing": false}, {sort: {createdAt: -1}});
});

// Finished Games
Meteor.publish('gamesFinished', function() {
    return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : 20});
});

// Single Game
Meteor.publish('game', function(gameId) {
    return Games.find(gameId);
});