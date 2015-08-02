// Online Games (home page)
Meteor.publish('games', function() {
    var now = new Date().getTime();
    var msInDay = 1000 * 60 * 60 * 1;
    return Games.find({"is.public": true, "is.completed": false, "is.playing": false, createdAt:{$gte: new Date(now - msInDay)}}, {sort: {createdAt: -1}});
});

// Finished Games (home page)
Meteor.publish('gamesFinished', function() {
    return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : 20});
});

// Single Game
Meteor.publish('game', function(gameId) {
    return Games.find(gameId);
});


// Games Pagination
Meteor.publish('gamesPagination', function(gameType, limit) {
    var searchQuery = {};
    var limitQuery = {sort: {createdAt: -1}};

    if(gameType === 'finished') {
        searchQuery = {"is.public": true, "is.completed": true};
    }

    limit = parseInt(limit);
    if(limit > 0) {
        limitQuery.limit = limit;
    }
    return Games.find(searchQuery, limitQuery);
});