
TabularTables.Item = new Tabular.Table({
  name: "Item",
  collection: Item,
  pub: "tabular_items",
  columns: [
    //{data: "fileId", visible: false},
    //{data: "file", title: "File"},
    {data: "groupId", visible: false},
    {data: "group", title: "Group"},
    {data: "type", title: "Type"},
    {data: "text", title: "Text"},
    {data: "ordering", title: "Ordering"},
    {data: "strokeColor", title: "Stroke Color"},
    {data: "strokeWidth", title: "Stroke Width"},
    {data: "fillColor", title: "Fill Color"},
    //{data: "complexity", title: "Complexity"},
    {
      data: "pointList", title: "List of Points"
    },
    {data: "closed", title: "Closed"},
    {
      data: "parameters", title: "Parameters",
      render: function(val, type, doc){
        console.log(val);
        return JSON.stringify(val);
      }
    },
    {tmpl: Meteor.isClient && Template.operation_item}
  ]
});
