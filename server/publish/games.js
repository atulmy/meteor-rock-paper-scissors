Meteor.publish('games', function() {
    return Games.find({isCompleted: false}, {sort: {createdAt: -1}, limit : 5});
});