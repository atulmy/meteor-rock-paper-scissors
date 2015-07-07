Template.gamesPlay.helpers({
    game: function() {
        var gameId = Router.current().params.gameId;
        var game = Games.findOne({_id: gameId});
        return game;
    }
});