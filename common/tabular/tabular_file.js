/*
TabularTables.File = new Tabular.Table({
  name: "File",
  collection: File,
  pub: "tabular_files",
  columns: [
    {data: "creatorId", visible: false},
    {tmpl: Meteor.isClient && Template.operation_file},
    {data: "_id", title: "File"},
    {data: "creator", title: "Creator"},
    {data: "uuid", title: "Subject"},
    {data: "title", title: "Title"},
    {data: "width", title: "Width"},
    {data: "height", title: "Height"},
    {
      data: "dateModified", title: "Date Modified",
      render: function (val, type, doc) {
        if (val instanceof Date) {
          return moment(val).calendar();
        } else {
          return "Never";
        }
      }
    },
    {data: "version", title: "Version"},
    {data: "fileType", title: "File Type"},
    {
      data: "script", title: "Script",
      render: function(val, type, doc){
          if(val && doc.script){
            if(doc.fileType == "image/svg+xml")
              return val;
            else
              return val.substr(0,200);
          }
      }
    },
    {data: "permissions", title: "Permissions"}
  ]
});
*/