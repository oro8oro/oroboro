Collections = {}
Collections.File = File = new Mongo.Collection("file");
Collections.Item = Item = new Mongo.Collection("item");
Collections.Group = Group = new Mongo.Collection("groupp");
Collections.Dependency = Dependency = new Mongo.Collection("dependency");

Collections.Images = Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {})]
});

//JPicker = new Mongo.Collection("jpicker");
