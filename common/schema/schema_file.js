Schemas.File = new SimpleSchema({
    /*
    fileId2: {
        type: String,
        label: "Parent File",
        optional: true,
        autoform: {
          type: "select",
          options: function () {
            var list = File.find({}).fetch();
            if(list.length > 0){
                var option = [];
                for(u = 0; u < list.length ; u++){
                    option.push({label: list[u]._id, value: list[u]._id});
                }
                return option;
            }
          }
        }
    },*/
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
    }
});

File.attachSchema(Schemas.File);