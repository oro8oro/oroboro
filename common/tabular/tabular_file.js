TabularTables.File = new Tabular.Table({
  name: "File",
  collection: File,
  pub: "tabular_files",
  columns: [
    {data: "_id", title: "File"},
    {
      data: "fileId2", title: "Parent File",
      render: function(val, type, doc){
        if(!val.length)
          return "none";
        else
          return val;
      }
    },
    {data: "creatorId", visible: false},
    {data: "creator", title: "Creator"},
    {data: "uuid", title: "Subject"},
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
    {data: "permissions", title: "Permissions"},
    {tmpl: Meteor.isClient && Template.operation_file}
  ]
});
