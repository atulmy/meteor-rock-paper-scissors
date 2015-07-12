var sets = new SimpleSchema({
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

    currentSet: {
        type: Number
    },

    scores: {
        type: [sets],
        optional: true
    },

    isInProgress: {
        type: Boolean
    },

    isCompleted: {
        type: Boolean
    },

    isPublic: {
        type: Boolean
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