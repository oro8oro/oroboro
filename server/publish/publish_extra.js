/*
Meteor.publish(null, function (){ 
  return Meteor.roles.find({});
});
*/


Meteor.publish('images', function(){
    return Images.find();
});

Images.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  download: function () {
    return true;
  },
  update: function () {
    return true;
  }
});


