
Schemas.Group = new SimpleSchema({
    uuid: {
        type: String,
        label: "Subject",
        optional: true
    },
    fileId: {
        type: String,
        label: "File Id",
        max: 200,
        autoform: {
          type: "select",
          options: function () {
            var list = File.find({}).fetch();
            var option = [];
            for(u = 0; u < list.length ; u++){
                option.push({label: list[u].uuid, value: list[u]._id});
            }
            return option;
          }
        },
        optional: true
    },
    groupId: {
        type: String,
        label: "Group Id",
        max: 200,
        autoform: {
          type: "select",
          options: function () {
            var list = Group.find({}).fetch();
            var option = [];
            for(u = 0; u < list.length ; u++){
                if(list[u].uuid)
                    var name = list[u].uuid;
                else var name = list[u]._id;
                option.push({label: name, value: list[u]._id});
            }
            return option;
          }
        },
        optional: true
    },
    type: {
        type: String,
        label: "Type",
        optional: true,
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"Menu", value:"menu"},
                    {label:"Menu Item", value:"menu_item"},
                    {label:"Layer", value:"layer"},
                    {label:"Simple Group", value:"simpleGroup"},
                    {label:"Linked Group", value:"linkedGroup"}
                ];
            }
        }
    },
    ordering: {
        type: Number,
        label: "Ordering",
        optional: true
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
    transform: {
        type: String,
        label: "Transform",
        optional: true
    },
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true
    },
    'parameters.col': {
        type: Number,
        label: "No of Columns",
        optional: true
    },
    'parameters.row': {
        type: Number,
        label: "No of Rows",
        optional: true
    },
    transparency: {
        type: Number,
        label: "Transparency",
        optional: true,
        decimal: true
    }
});

Group.attachSchema(Schemas.Group);
