Router.configure({
    layoutTemplate: 'layoutDefault',
    loadingTemplate: 'commonLoading'
});

var loginCheck = function(){
    if(!Meteor.user()){
        if(Meteor.loggingIn()){
            this.render("commonLoading");
        } else {
            this.render("commonAuth");
        }
    } else {
        this.next();
    }
};
Router.onBeforeAction(loginCheck, {
    except: ['home']
});

Router.route('/', {
    name: 'home',
    template: 'staticHome',
    waitOn: function() {
        return Meteor.subscribe('games');
    }
});
Router.route('/play/:gameId', {
    name: 'play',
    template: 'gamesPlay',
    waitOn: function() {
        return Meteor.subscribe('games');
    },
    onRun: function(){
        var userId = Meteor.userId();
        var gameId = Router.current().params.gameId;
        var game = Games.findOne({_id: gameId});
        if(game) {
            if(game.playerOneId !== userId) {
                Meteor.call('gameSetInProgress', game._id, function(error, response) {
                    if(error) {
                        alert(error.reason);
                    }
                });
            }
        } else {
            Router.go('home');
        }
        this.next();
    }
});