Games.attachSchema(new SimpleSchema({
    title: {
        type: String
    },

    playerOneId: {
        type: String
    },

    playerTwoId: {
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