
Schemas.Group = new SimpleSchema({
    uuid: {
        type: String,
        label: "Subject",
        optional: true
    },
    fileId: {
        type: String,
        label: "File Id",
        /*
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
        },*/
        optional: true
    },
    groupId: {
        type: String,
        label: "Group Id",
        /*
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
        },*/
        optional: true
    },
    type: {
        type: String,
        label: "Type",
        optional: true,
        allowedValues: ["menu", "menu_item", "menu_button", "layer", "simpleGroup", "linkedGroup", "parametrizedGroup"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"Menu", value:"menu"},
                    {label:"Menu Item", value:"menu_item"},
                    {label:"Menu Button", value:"menu_button"},
                    {label:"Layer", value:"layer"},
                    {label:"Simple Group", value:"simpleGroup"},
                    {label:"Linked Group", value:"linkedGroup"},
                    {label:"Parametrized Group", value:"parametrizedGroup"}
                ];
            }
        }*/
    },
    ordering: {
        type: Number,
        label: "Ordering",
        optional: true,
        defaultValue: 100
    },
    selected: {
        type: String,
        label: "Selected",
        optional: true,
        defaultValue: 'null'
    },
    locked: {
        type: String,
        label: "Locked",
        optional: true,
        defaultValue: 'null'
    },
    transform: {
        type: String,
        label: "Transform",
        optional: true
    },
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true,
        blackbox: true
    /*},
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
    'parameters.hide': {
        type: String,
        label: "Hide Content",
        optional: true,
        allowedValues: ["true", "false"],
        defaultValue: "false"*/
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"true", value:"true"},
                    {label:"false", value:"false"},
                ];
            }
        }
        */
    },
    transparency: {
        type: Number,
        label: "Transparency",
        optional: true,
        decimal: true
    },
    original: {
        type: String,
        label: "Original",
        optional: true
    }
});

Group.attachSchema(Schemas.Group);
