Schemas.File = new SimpleSchema({
    uuid: {
        type: String,
        label: "Subject",
        optional: true
    },
    title: {
        type: String,
        label: "Title",
        optional: true
    },
    width: {
        type: Number,
        label: "Width",
        optional: true,
        decimal: true
    },
    height: {
        type: Number,
        label: "Height",
        optional: true,
        decimal: true
    },
    dateModified: {
        type: Date,
        label: "Date Modified",
        defaultValue: new Date(),
        optional: true
    },
    version: {
        type: String,
        label: "Version",
        max: 200,
        defaultValue: "1",
        optional: true
    },
    image: {
        type: String,
        label: "Image",
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        }
    },
    fileType: {
        type: String,
        label: "File Type",
        max: 200,
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label: "svg", value: "image/svg+xml"},
                    {label: "js", value: "application/javascript"},
                    {label: "png", value: "image/png"},
                    {label: "jpeg", value: "image/jpeg"},
                    {label: "css", value: "text/css"},
                    {label: "txt", value: "text/plain"},
                    {label: "stream", value: "application/octet-stream"}
                ];
            }
        }
    },
    script: {
        type: String,
        label: "Script",
        optional: true,
        trim: false,
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        }
    },/*
    permissions: {
        type: String,
        label: "Permissions",
        max: 200,
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"public", value:"public"},
                    {label:"private", value:"private"}
                ];
            }
        },
        optional: true
    },*/
    permissions: {
        type: Object,
        label: "Permissions",
        optional: true
    },
    'permissions.view': {
        type: [String],
        label: "View Permissions",
        optional: true,
    },
    'permissions.edit': {
        type: [String],
        label: "View Permissions",
        optional: true
    },
    creatorId: {
        type: String,
        label: "Creator",
        max: 200,
        optional: true,
    },
    locked: {
        type: String,
        label: "Locked",
        optional: true,
    },
    selected: {
        type: [String],
        label: "Selected",
        optional: true,
        defaultValue: []
    }
});

File.attachSchema(Schemas.File);