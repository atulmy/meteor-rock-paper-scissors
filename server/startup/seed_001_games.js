Meteor.startup(function() {
    var seedUserEmail = 'seed@example.com';

    if(Games.find().count() === 0) {
        var seedUser =  Meteor.users.findOne({'emails.address': {$regex: seedUserEmail, $options:'i'}});
        [
            {
                title: "Sample Game 1",
                playerOneId: seedUser._id,
                playerTwoId: "",
                isInProgress: false,
                isCompleted: false,
                isPublic: true
            },
            {
                title: "Sample Game 2",
                playerOneId: seedUser._id,
                playerTwoId: "",
                isInProgress: false,
                isCompleted: false,
                isPublic: true
            },
            {
                title: "Sample Game 3",
                playerOneId: seedUser._id,
                playerTwoId: "",
                isInProgress: false,
                isCompleted: false,
                isPublic: true
            },
        ].forEach(function(team) {
            Games.insert(team);
        });
    }
});