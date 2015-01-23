
TabularTables.Group = new Tabular.Table({
  name: "Group",
  collection: Group,
  pub: "tabular_groups",
  columns: [
    {data: "uuid", title: "Group"}, 
    {data: "fileId", visible: false},
    {
      data: "file", title: "File",
      render: function(val, type, doc){
        if(!val.length)
          return "none";
        else
          return val;
      }
    },
    {data: "groupId", visible: false},
    {
      data: "group2", title: "Parent Group",
      render: function(val, type, doc){
        console.log(val);
        if(!val.length)
          return "none";
        else
          return val;
      }
    },
    {data: "type", title: "Type"},
    {data: "ordering", title: "Ordering"},
    {
      data: "parameters", title: "Parameters",
      render: function(val, type, doc){
        console.log(val);
        return JSON.stringify(val);
      }
    },
    {data: "transparency", title: "Transparency"},
    {tmpl: Meteor.isClient && Template.operation_group}
  ]
});
