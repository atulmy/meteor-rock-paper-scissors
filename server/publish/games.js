// Online Games
Meteor.publish('games', function() {
    var now = new Date().getTime();
    var msInDay = 1000 * 60 * 60 * 1;
    return Games.find({"is.public": true, "is.completed": false, "is.playing": false, createdAt:{$gte: new Date(now - msInDay)}}, {sort: {createdAt: -1}});
});

// Finished Games
Meteor.publish('gamesFinished', function() {
    return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : 20});
});

// Single Game
Meteor.publish('game', function(gameId) {
    return Games.find(gameId);
});