Schemas.File = new SimpleSchema({
    uuid: {
        type: String,
        label: "Subject",
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
                    {label: "css", value: "text/css"}
                ];
            }
        }
    },
    script: {
        type: String,
        label: "Script",
        optional: true,
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        }
    },
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
    },
    creatorId: {
        type: String,
        label: "Creator",
        max: 200,
        optional: true,
        autoValue: function(){
            return Meteor.userId();
        }
    },
    locked: {
        type: String,
        label: "Locked",
        optional: true,
        autoValue: function(){
            if(false)
                return Meteor.userId();
            else
                return null;
        }
    },
    selected: {
        type: String,
        label: "Selected",
        optional: true,
        autoValue: function(){
            if(false)
                return Meteor.userId();
            else
                return null;
        }
    }
});

File.attachSchema(Schemas.File);