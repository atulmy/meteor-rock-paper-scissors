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

Games.attachSchema(new SimpleSchema({
    title: {
        type: String
    },

    playerOneId: {
        type: String
    },

    playerOneScore: {
        type: Number
    },

    playerTwoId: {
        type: String,
        optional: true
    },

    playerTwoScore: {
        type: Number,
        optional: true
    },

    bestOf: {
        type: Number
    },

    scores: {
        type: [sets],
        optional: true
    },

    winnerId: {
        type: String,
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