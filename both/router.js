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
    onBeforeAction: function() {
        Session.set('gameId', this.params.gameId);
        console.log('game id set '+Session.get('gameId'));
        this.next();
    },
    onStop: function() {
        console.log('stop '+Session.get('gameId'));
        Meteor.call('gameMarkCompleted', Session.get('gameId'), function(error, response) {
            if(error) {
                alert(error.reason);
            }
        });
    }
});