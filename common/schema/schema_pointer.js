Schemas.Pointer = new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        optional: true
    },
    url: {
        type: String,
        label: "Url",
        optional: true
    },
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true
    }
});

Pointer.attachSchema(Schemas.Pointer);