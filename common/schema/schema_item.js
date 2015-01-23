
Schemas.Item = new SimpleSchema({
    groupId: {
        type: String,
        label: "Group Id",
        max: 200,
        optional: true,
        autoform: {
          type: "select",
          options: function () {
            var list = Group.find({}).fetch();
            if(list.length > 0){
                var option = [];
                for(u = 0; u < list.length ; u++){
                    if(list[u].uuid)
                        var label = list[u].uuid;
                    else
                        var label = list[u]._id;
                    option.push({label: label, value: list[u]._id});
                }
                return option;
            }
          }
        }
    },
    type: {
        type: String,
        label: "Type",
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"Simple Path", value:"simple_path"},
                    {label:"Complex Path", value:"complex_path"},
                    {label:"Parametrized Path", value:"parametrized_simple_path"},
                    {label:"Polyline", value:"polyline"},
                    {label:"Text", value:"text"},
                    {label:"Raster Image", value:"rasterImage"},
                ];
            }
        }
    },
    text: {
        type: String,
        label: "Text",
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        },
        optional: true
    },
    ordering: {
        type: Number,
        label: "Ordering",
        optional: true
    },
    strokeColor: {
        type: String,
        label: "Stroke Color",
        optional: true,
        defaultValue: '#000'
    },
    strokeWidth: {
        type: String,
        label: "Stroke Width",
        optional: true,
        decimal: true,
        defaultValue: '0'
    },
    fillColor: {
        type: String,
        label: "Fill Color",
        optional: true,
        defaultValue: '#000'
    },
    complexity: {
        type: Number,
        label: "Complexity",
        optional: true,
        decimal: true
    },
    pointList: {
        type: String,
        label: 'List of Points',
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        },
        optional: true
    },
    closed: {
        type: Boolean,
        label: 'Closed',
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
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true
    }
});

Item.attachSchema(Schemas.Item);