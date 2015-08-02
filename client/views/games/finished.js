Template.gamesFinished.helpers({
    gamesPaginationCount: function() {
        return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}}).count();
    },

    gamesPagination: function() {
        var count = parseInt(Session.get('paginationCount'));
        return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : count});
    },

    paginationCount: function() {
        return parseInt(Session.get('paginationCount')) + 10;
    }
});

Template.gamesFinished.events({

});

// On Render
Template.gamesFinished.rendered = function () {
    $( function() {
        $('html,body').scrollTop($('html,body').height());
    });
};