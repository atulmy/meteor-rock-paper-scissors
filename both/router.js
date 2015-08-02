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
        return [Meteor.subscribe('games'), Meteor.subscribe('gamesFinished')];
    }
});
Router.route('/play/:gameId', {
    name: 'play',
    template: 'gamesPlay',
    waitOn: function() {
        return Meteor.subscribe('game', this.params.gameId);
    },
    onBeforeAction: function() {
        Session.set('gameId', this.params.gameId);
        console.log('game id set '+Session.get('gameId'));
        this.next();
    },
    onStop: function() {
        console.log('stop '+Session.get('gameId'));
        Meteor.call('gameUpdateIsCompletedAndIsPlaying', Session.get('gameId'), function(error, response) {
            if(error) {
                alert(error.reason);
            }
        });
    }
});
Router.route('games/finished/:count', {
    name: 'gamesFinished',
    template: 'gamesFinished',
    waitOn: function() {
        return [Meteor.subscribe('gamesPagination', 'finished', this.params.count)];
    },
    onBeforeAction: function() {
        Session.set('paginationCount', this.params.count);
        this.next();
    }
});