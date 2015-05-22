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
    dateCreated: {
        type: Date,
        label: "Date Created",
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
    /*
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
    },*/
    fileType: {
        type: String,
        label: "File Type",
        max: 200,
        allowedValues: ["application/javascript", "image/svg+xml", "image/png", "image/jpeg", "text/css", "text/plain", "application/octet-stream", "gcode"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label: "js", value: "application/javascript"},
                    {label: "svg", value: "image/svg+xml"},
                    {label: "png", value: "image/png"},
                    {label: "jpeg", value: "image/jpeg"},
                    {label: "css", value: "text/css"},
                    {label: "txt", value: "text/plain"},
                    {label: "stream", value: "application/octet-stream"}
                ];
            }
        }*/
    },
    script: {
        type: String,
        label: "Script",
        optional: true,
        trim: false,
        /*
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        }*/
    },
    permissions: {
        type: Object,
        label: "Permissions",
        optional: true,
        blackbox: true
    },
    'permissions.view': {
        type: [String],
        label: "View Permissions",
        optional: true,
        defaultValue: []
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
        optional: true
    },
    locked: {
        type: String,
        label: "Locked",
        optional: true
    },
    selected: {
        type: [String],
        label: "Selected",
        optional: true,
        defaultValue: []
    },
    noofchildren: {
        type: Number,
        label: "No of children",
        optional: true,
        defaultValue: 0
    },
    structuralpath: {
        type: [String],
        label: "Structural Path",
        optional: true,
        defaultValue: []
    },
    dependencypath: {
        type: [String],
        label: "Dependency Path",
        optional: true,
        defaultValue: []
    },
    groupids: {
        type: [String],
        label: "Group Ids",
        optional: true
    },
    itemids: {
        type: [String],
        label: "Item Ids",
        optional: true
    },
    original: {
        type: String,
        label: "Original",
        optional: true
    },
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true,
        blackbox: true
    }
});

File.attachSchema(Schemas.File);