Meteor.publish('games', function() {
    //return Games.find({isCompleted: [true, false]}, {sort: {createdAt: -1}, limit : 5});
    return Games.find({}, {sort: {createdAt: -1}});
});