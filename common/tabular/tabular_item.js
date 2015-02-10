
TabularTables.Item = new Tabular.Table({
  name: "Item",
  collection: Item,
  pub: "tabular_items",
  columns: [
    //{data: "fileId", visible: false},
    //{data: "file", title: "File"},
    {data: "groupId", visible: false},
    {tmpl: Meteor.isClient && Template.operation_item},
    {data: "group", title: "Group"},
    {data: "type", title: "Type"},
    {data: "text", title: "Text"},
    {data: "ordering", title: "Ordering"},
    {
      data: "palette", title: "Palette",
      render: function(val, type, doc){
          if(val){
            return JSON.stringify(val);
          }
      }
    },
    //{data: "strokeWidth", title: "Stroke Width"},
    //{data: "fillColor", title: "Fill Color"},
    //{data: "complexity", title: "Complexity"},
    {
      data: "pointList", title: "List of Points",
      render: function(val, type, doc){
          if(val){
              return val.substr(0,200);
          }
      }
    },
    {data: "closed", title: "Closed"},
    {
      data: "parameters", title: "Parameters",
      render: function(val, type, doc){
        console.log(val);
        return JSON.stringify(val);
      }
    }
  ]
});
