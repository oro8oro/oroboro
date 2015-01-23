
TabularTables.Dependency = new Tabular.Table({
  name: "Dependency",
  collection: Dependency,
  pub: "tabular_dependencies",
  columns: [
    {data: "fileId1", title:"File"},
    {data: "subject1", title:"Subject1"},
    {data: "fileId2", title:"Parent File"},
    {data: "subject2", title:"Subject2"},
    {data: "type", title:"Type"},
    {tmpl: Meteor.isClient && Template.operation_depend}
  ]
});