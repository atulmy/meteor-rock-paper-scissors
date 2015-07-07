Meteor.startup(function() {
    var seedUserEmail = 'seed@example.com';

    if (Meteor.users.find({"emails.address": seedUserEmail}).count() == 0){
        var ownerId = Accounts.createUser({
            email: seedUserEmail,
            password: '123456'
        });
    }
});