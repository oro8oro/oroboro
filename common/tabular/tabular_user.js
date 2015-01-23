
TabularTables.UserList = new Tabular.Table({
    name: "UserList",
    collection: Meteor.users,
    pub: "users",
    columns: [
        {data: "profile", title: "Name",
            render: function (val, type, doc) {
                return val.name;
            }
        },
        {data: "profile", title: "Role",
            render: function (val, type, doc) {
                return val.role;
            }
        },
        {tmpl: Meteor.isClient && Template.operation_user}
    ]
});