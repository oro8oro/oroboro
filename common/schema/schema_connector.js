Schemas.Connector = new SimpleSchema({
    source: {
        type: String,
        label: "Source",
    },
    target: {
        type: String,
        label: "Target",
    },
    connector:{
        type: String,
        label: "Connector",
        defaultValue: null,
        optional: true
    },
    marker:{
        type: String,
        label: "Marker",
        defaultValue: null,
        optional: true
    },
    sourceAttach: {
        type: String,
        label: "SourceAttach",
        allowedValues: ['center', 'perifery'],
        defaultValue: 'center',
        optional: true
    },
    targetAttach: {
        type: String,
        label: "TargetAttach",
        allowedValues: ['center', 'perifery'],
        defaultValue: 'center',
        optional: true
    },
    type: {
        type: String,
        label: "Type",
        allowedValues: ['straight', 'curved'],
        defaultValue: 'straight',
        optional: true
    },
    inflexions: {
        type: [Object],
        label: "Inflexions",
        optional: true,
        blackbox: true
    },
    color: {
        type: String,
        label: 'Color',
        optional: true
    },
    label: {
        type: String,
        label: 'Label',
        optional: true
    }
});

Connector.attachSchema(Schemas.Connector);