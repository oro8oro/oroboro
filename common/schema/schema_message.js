Schemas.Message = new SimpleSchema({
    fileId: {
        type: String,
        label: "File Id",
        optional: true
    },
    timestamp: {
        type: Date,
        label: "Timestamp",
        defaultValue: new Date(),
        optional: true
    },
    userId: {
        type: String,
        label: "User Id",
        optional: true
    },
    message: {
        type: String,
        label: "Message",
        optional: true
    },
    viewed: {
        type: Object,
        label: 'Viewed',
        optional: true
    }
});

Message.attachSchema(Schemas.Message);