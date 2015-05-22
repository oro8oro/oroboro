
Schemas.Item = new SimpleSchema({
    groupId: {
        type: String,
        label: "Group Id",
        optional: true,
        /*
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
        }*/
    },
    type: {
        type: String,
        label: "Type",
        allowedValues: ["simple_path", "complex_path", "para_simple_path", "para_complex_path", "text", "rasterImage", "formulae", "embeddediFrame", "embeddedCanvas", "embeddedHtml", "nestedSvg", 'qrcode', 'gradient', 'markdown', 'pathEquation']
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"Simple Path", value:"simple_path"},
                    {label:"Complex Path", value:"complex_path"},
                    {label:"Parametrized SPath", value:"para_simple_path"},
                    {label:"Parametrized CPath", value:"para_complex_path"},
                    {label:"Text", value:"text"},
                    {label:"Raster Image", value:"rasterImage"},
                    {label:"Formulae", value:"formulae"},
                    {label:"Embeded iFrame", value:"embedediFrame"},
                    {label:"Embeded Canvas", value:"embededCanvas"},
                    {label:"Embeded Html", value:"embededHtml"},
                    {label:"Nested SVG", value:"nestedSvg"}
                ];
            }
        }*/
    },
    text: {
        type: String,
        label: "Text",
        /*
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        },*/
        optional: true
    },
    ordering: {
        type: Number,
        label: "Ordering",
        optional: true,
        defaultValue: 100
    },
    palette:{
        type: Object,
        label: "Palette",
        optional: true,
        blackbox: true
    },
    'palette.strokeColor': {
        type: String,
        label: "Stroke Color",
        optional: true,
        defaultValue: '000000ff'
    },
    'palette.strokeWidth': {
        type: String,
        label: "Stroke Width",
        optional: true,
        decimal: true,
        defaultValue: '0'
    },
    'palette.strokeOpacity': {
        type: String,
        label: "Stroke Opacity",
        optional: true,
        decimal: true,
        defaultValue: '1'
    },
    'palette.fillColor': {
        type: String,
        label: "Fill Color",
        optional: true,
        defaultValue: '000000'
    },
    'palette.fillOpacity': {
        type: String,
        label: "Fill Opacity",
        optional: true,
        decimal: true,
        defaultValue: '1'
    },
    'palette.strokeDasharray': {
        type: String,
        label: "Dash Array",
        optional: true
    },
    'palette.strokeLinejoin': {
        type: String,
        label: "Stroke Linejoin",
        optional: true,
        allowedValues: ["bevel", "round", "miter"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"bevel", value:"bevel"},
                    {label:"round", value:"round"},
                    {label:"miter", value:"miter"}
                ];
            }
        }*/
    },
    'palette.strokeLinecap': {
        type: String,
        label: "Stroke Linecap",
        optional: true,
        allowedValues: ["square", "round", "butt"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"square", value:"square"},
                    {label:"round", value:"round"},
                    {label:"butt", value:"butt"}
                ];
            }
        }*/
    },
    'palette.opacity': {
        type: String,
        label: "General Opacity",
        optional: true,
        decimal: true,
        defaultValue: '1'
    },
    font:{
        type: Object,
        label: "Font",
        optional: true,
        blackbox: true
    },
    'font.style': {
        type: String,
        label: "Font Style",
        optional: true,
        allowedValues: ["normal", "italic"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"normal", value:"normal"},
                    {label:"italic", value:"italic"}
                ];
            }
        }*/
    },
    'font.weight': {
        type: String,
        label: "Font Weight",
        optional: true,
        allowedValues: ["normal", "bold"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"normal", value:"normal"},
                    {label:"bold", value:"bold"}
                ];
            }
        }*/
    },
    'font.family': {
        type: String,
        label: "Font Family",
        optional: true,
        allowedValues: ["serif", "Sans-serif", "Cursive", "Fantasy", "Monospace"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"serif", value:"serif"},
                    {label:"Sans-serif", value:"Sans-serif"},
                    {label:"Cursive", value:"Cursive"},
                    {label:"Fantasy", value:"Fantasy"},
                    {label:"Monospace", value:"Monospace"}
                ];
            }
        }*/
    },
    'font.size': {
        type: String,
        label: "Font Size",
        optional: true
    },
    'font.textAnchor': {
        type: String,
        label: "Text Anchor",
        optional: true,
        allowedValues: ["start", "middle", "end"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"start", value:"start"},
                    {label:"middle", value:"middle"},
                    {label:"end", value:"end"},
                ];
            }
        }*/
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
        /*
        autoform: {
          afFieldInput: {
            type: "textarea"
          }
        },*/
        optional: true
    },
    closed: {
        type: String,
        label: 'Closed',
        optional: true,
        allowedValues: ["true", "false"]
        /*
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"true", value:"true"},
                    {label:"false", value:"false"},
                ];
            }
        }*/
    },
    selected: {
        type: String,
        label: "Selected",
        defaultValue: 'null'
    },
    locked: {
        type: String,
        label: "Locked",
        optional: true,
        defaultValue: 'null'
    },
    parameters: {
        type: Object,
        label: "Parameters",
        optional: true,
        blackbox: true
    },
    original: {
        type: String,
        label: "Original",
        optional: true
    },
    linkto: {
        type: String,
        label: "Link To",
        optional: true
    }
});

Item.attachSchema(Schemas.Item);