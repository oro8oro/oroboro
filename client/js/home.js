Template.registerHelper("log", function(opt){
  console.log(opt);
});

Meteor.subscribe('users');
Meteor.subscribe('files');
Meteor.subscribe('dependencies');
Meteor.subscribe('items');
Meteor.subscribe('groups');
Meteor.subscribe('images');

Template.home.rendered = function(){
  $('li').removeClass("active");
  $('#li_files').attr("class","active");
  Blaze.render(Template.files, document.getElementById("content"));
}

Template.home.events({
    'click #li_items': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_items').attr("class","active");
        Blaze.render(Template.items, document.getElementById("content"));
    },
    'click #li_files': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_files').attr("class","active");
        Blaze.render(Template.files, document.getElementById("content"));
    },
    'click #li_users': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_users').attr("class","active");
        Blaze.render(Template.users, document.getElementById("content"));
    },
    'click #li_groups': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_groups').attr("class","active");
        Blaze.render(Template.groups, document.getElementById("content"));
    },
    'click #li_depend': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_depend').attr("class","active");
        Blaze.render(Template.depends, document.getElementById("content"));
    },
    'click #li_rasters': function (event){
        $("#content").html('');
        $('li').removeClass("active");
        $('#li_rasters').attr("class","active");
        Blaze.render(Template.rasters, document.getElementById("content"));
    }
});

AutoForm.addHooks(null, {
    after: {
      insert: function(error, result, template) {
          $('select').val($('select').val()).change();
      }
    },
    onError: function(operation, error, template) {
      console.log(operation);
      console.log(error);
      console.log(template);
    }
});

AutoForm.hooks({
  insert_file: {
    onSubmit: function (doc) {
      Schemas.File.clean(doc);
      console.log("File doc with auto values", doc);
      this.done();
      return false;
    }
  },
  insert_item: {
    onSubmit: function (doc) {
      Schemas.Item.clean(doc);
      console.log("Item doc with auto values", doc);
      this.done();
      return false;
    }
  },
  insert_group: {
    onSubmit: function (doc) {
      Schemas.Group.clean(doc);
      console.log("Group doc with auto values", doc);
      this.done();
      return false;
    }
  },
  update_file: {
    before: {
      update: function(docId, modifier, template) {
        console.log(docId);
        console.log(modifier);
      },
      insert: function(doc, template) {
        console.log(doc);
      }
    },
    after: {
      update: function(error, result, template) {
          console.log(error);
          console.log(result);
      },
      insert: function(error, result, template) {
          console.log(error);
          console.log(result);
      }
    }
  }
});
