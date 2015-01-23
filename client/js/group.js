Template.operation_group.events({
    'click #view_group': function(event){
        Router.go('/group/'+this._id);
    }
});