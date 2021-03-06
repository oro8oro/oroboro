
Schemas.UserProfile = new SimpleSchema({
    name: {
        type: String,
        label: 'Name',
        optional: true
    },
    role: {
        type: String,
        label: 'Role',
        optional: true,
        allowedValues: ['client', 'admin']
        /*
        autoform: {
          type: "select",
          options: function () {
            var option = {"client":"client","admin":"admin"};
            return option;
          }
        }*/
    },
    icon: {
        type: String,
        label: 'Icon URL',
        optional: true,
        defaultValue: '/file/dfyWJwvZc6sWvXXsm'
    }
});
Schemas.User = new SimpleSchema({
    profile: {
        type: Schemas.UserProfile,
        optional: true
    },
    emails: {
        type: [Object],
        label: 'Email',
        optional: true
    },
    "emails.$.address": {
        type: String,
        label: 'Email',
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: Object,
        label: 'Role',
        blackbox: true,
        optional: true
    },
    parameters: {
        type: Object,
        label: "Parameters",
        blackbox: true,
        optional: true
    }
});

Meteor.users.attachSchema(Schemas.User);
