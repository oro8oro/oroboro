
Template.operation_file.events({
    'click #view_file': function(event){
        Router.go('/file/'+this._id);
    }
});

/*
Template.view_files.events({
    'click tr': function (event) {
        if(event.target.className == "glyphicon glyphicon-eye-open"){
            var dataTable = $(event.target).closest('table').DataTable();
            var rowData = dataTable.row(event.currentTarget).data();
            console.log(rowData);
            Router.go('/file');
        }
    }
});
*/


var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

updateWindow = function updateWindow(id){
    x = w.innerWidth || e.clientWidth || g.clientWidth;
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    svg = SVG(id);
    svg.attr("width", x).attr("height", y);
}
/*
Session.set("resize", null); 
Meteor.startup(function () {
  $(window).resize(function(evt) {
    Session.set("resize", new Date());
  });
});
*/
/*
Tracker.autorun(function(){
    var items = Item.find().fetch();
    Blaze.render()
});
*/
Template.show_meteor_file_svg.rendered = function(){
    var file = File.findOne({_id: this.data._id});
    var groups = Group.find({fileId: this.data._id}).fetch();
    var draw = SVG('svg_test').size(x,y);
    var dGroups=[];
    for(var g in groups){
        dGroups[g] = recursive_group_client(draw, groups[g]);
    }

    var kids = draw.children();
    for(var k in kids)
        kids[k].scale(0.025,0.025);  
    
    //var grl = SVG.get('zKyEJctWRsFqteRud');
    //grl.attr("name","GRL");
    //var bra = SVG.get('4zxqbqffwLd9dhcyL').move(200,100);
    //bra.attr("name", "BRA");
    //var text = SVG.get('dDvYA847SkvD642AW').move(80,100);
    //var path = SVG.get('4zxqbqffwLd9dhcyL').attr('d');
    //var dpath = SVG.get('9DWcamNvdqPtASXvs');
    //dpath.attr("name", "dpath");
    //var dpath2 = SVG.get('mT9q9oyyAjQRR8pXx');
   // dpath2.attr("name", "dpath2");
    //SVG.get('wt9KAofELghRYiLWu').attr('fill-opacity', 0.5);

}
