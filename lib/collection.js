File = new Mongo.Collection("file");
Item = new Mongo.Collection("item");
Group = new Mongo.Collection("group");
Dependency = new Mongo.Collection("dependency");

Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {})]
});
