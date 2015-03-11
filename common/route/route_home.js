Router.route('/tabular', {
    template: 'home'
});


Router.route('/', {
    template: 'oroboro',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('items').wait();
        this.subscribe('dependencies').wait();
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});

/*
Router.route('/', function(){
    window.location.href = 'http://oroboro.meteor.com/filem/eGfQyh6jCqxeEYmex';
})
*/