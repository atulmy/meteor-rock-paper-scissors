var playerInfo = new SimpleSchema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    score: {
        type: Number
    }
});

var set = new SimpleSchema({
    setNumber: {
        type: Number,
        optional: true
    },

    playerOneSelection: {
        type: String,
        optional: true
    },

    playerTwoSelection: {
        type: String,
        optional: true
    },

    result: {
        type: String,
        optional: true
    }
});

var current = new SimpleSchema({
    set: {
        type: Number
    },

    interval: {
        type: Number
    }
});

var is = new SimpleSchema({
    playing: {
        type: Boolean
    },

    completed: {
        type: Boolean
    },

    public: {
        type: Boolean
    }
});

Games.attachSchema(new SimpleSchema({
    title: {
        type: String
    },

    playerOne: {
        type: playerInfo
    },

    playerTwo: {
        type: playerInfo,
        optional: true
    },

    winner: {
        type: playerInfo,
        optional: true
    },

    bestOf: {
        type: Number
    },

    sets: {
        type: [set],
        optional: true
    },

    current: {
        type: current,
        optional: true
    },

    is: {
        type: is
    },

    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();
            }
        }
    },

    updatedAt: {
        type: Date,
        autoValue: function() {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    }
}));