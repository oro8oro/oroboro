/*
browsePosition = function(browser, files, prop, width,height, dim, col, transform){    
    var x, y=0;
    var svg=[],gr=[];
    for(var i = 0 ; i < files.length ; i++){
        if (i % dim == 0) {
            x = 0;
            y = y + height/dim;
        }
        gr[i] = browser.group()
        gr[i].transform(transform);
        gr[i].rect(width,height).attr({rx:20,ry:20, fill:"#eee", strokeWidth:6,stroke:"#000"});
        if(col == "file"){
            var f = File.findOne({_id: files[i][prop]});
            var image = '/file/'+files[i]["fileId1"];
        }
        else{
            var f = {width:1448, height:1024, _id: files[i][prop]};
            var image = '/group/'+files[i][prop];
        }
        svg[i] = gr[i].nested().attr("id", "file_"+i).attr("fileId", f._id);
        svg[i].rect(f.width,f.height).fill('#FFFFFF');
        svg[i].attr({preserveAspectRatio: "xMidYMid meet"})
        svg[i].viewbox(0,0,f.width,f.height);
        svg[i].image(image); 
        svg[i].group().attr("id","container_"+i)
        x=x+width/dim
        
    }
}
*/
Template.filebrowse.rendered = function(){
    var files = this.data.files;
    //var start = this.data.start;
    var dim = this.data.dim;
    Session.set('fileBDim',dim);
    var col = this.data.col;
    if(col == "file")
        var parent = File.findOne({_id: this.data.id});
    else
        var parent = {width:1448, height:1024};
    $('body').attr({"class": "no_scroll"}).css({margin:0,padding:0});
    var browser = SVG('fileBrowse'); 
    browser.viewbox(0,0,parent.width,parent.height);
    //browser.rect(parent.width,parent.height).attr({rx:20,ry:20, fill:"none", strokeWidth:6,stroke:"#000"});
    //var transform = {"scaleX": (1/dim)*0.99,"scaleY": (1/dim)*0.99,x: x,y: y-parent.height/dim};
    //browsePosition(browser, files, 'fileId1', parent.width,parent.height, dim, col, transform);

    var x, y=0;
    var svg=[],gr=[];
    for(var i = 0 ; i < files.length ; i++){
        if (i % dim == 0) {
            x = 0;
            y = y + parent.height/dim;
        }
        gr[i] = browser.group()
        gr[i].transform({"scaleX": (1/dim)*0.99,"scaleY": (1/dim)*0.99,x: x,y: y-parent.height/dim});
        gr[i].rect(parent.width,parent.height).attr({rx:20,ry:20, fill:"#eee", strokeWidth:6,stroke:"#000"});
        if(col == "file"){
            var f = File.findOne({_id: files[i]["fileId1"]});
            var image = '/file/'+files[i]["fileId1"];
        }
        else{
            var f = {width:1448, height:1024, _id: files[i]._id};
            var image = '/group/'+files[i]._id;
        }
        svg[i] = gr[i].nested().attr("id", "file_"+i).attr("fileId", f._id);
        svg[i].rect(f.width,f.height).fill('#FFFFFF');
        svg[i].attr({preserveAspectRatio: "xMidYMid meet"})
        svg[i].viewbox(0,0,f.width,f.height);
        svg[i].image(image); 
        svg[i].group().attr("id","container_"+i)
        x=x+parent.width/dim
        
    }

    this.autorun(function(){
       var win = Session.get("window");
       browser.attr({ "width": win.w, "height": win.h})
   });

    fileBMenu(browser, col, this.data.id, Number(this.data.start), Number(this.data.dim), files.length);
    //fileBcrumbs(browser, this.data, col, parent);
}

fileBMenu = function(browser,col, id, start, dim, len){
    //var buttons = Group.find({groupId: "SFMFzsNfG7kQwTMoD"}).fetch();
    var next = Group.findOne({_id: "Ka4qTJEBoLLLrmNK7"});
    var prev = Group.findOne({_id: "CrtnLmouQCC9eWWg8"});
    var buttons = browser.group().attr("id","sideMenu").scale(0.1).dx(-400);
    recursive_group_client(buttons, next);
    recursive_group_client(buttons, prev);
    var n = SVG.get("Ka4qTJEBoLLLrmNK7")
    var p = SVG.get("CrtnLmouQCC9eWWg8").dx(1000)
    n.on('click', function(event){
        var ini = start+dim*dim;
        //Router.go('/filebrowse/'+id+"/"+ini+"/"+dim);
        window.location.href = '/browse/'+col+'/'+id+"/"+ini+"/"+dim;
    })
    p.on('click', function(event){
        var ini = start-dim*dim;
        if(ini > 0)
            window.location.href = '/browse/'+col+'/'+id+"/"+ini+"/"+dim;
    })
    var each = Group.findOne({_id: "hBKYCaWAxHGkMLBYF"});
    var butt = [];
    for(i = 0; i < len; i++){
        recursive_group_client(SVG.get("container_"+i), each);
        var vb = SVG.get('file_'+i).attr("viewBox").split(" ");
        SVG.get("container_"+i).scale(0.8 * Number(vb[2]) / SVG.get("container_"+i).bbox().width);
        SVG.get("container_"+i).hide();
        SVG.get("file_"+i).on('mouseover', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            SVG.get("container_"+i).show();
            Session.set("fileBIt", this.attr("fileId"));
        })
        SVG.get("file_"+i).on('mouseout', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            SVG.get("container_"+i).hide();
        })
        var subfiles = Dependency.find({fileId2: SVG.get("file_"+i).attr("fileId"), type: 1}).fetch()
        if(subfiles.length > 0){
            var fold = SVG.get("file_"+i).group().move(Number(vb[2])-300, Number(vb[3])-300).scale(0.2).fill('none').opacity(0.5);
            var folder = Group.findOne({_id: "8pmQarpMhMqeReis3"});
            recursive_group_client(fold, folder);

        }
    }

}

fileBcrumbs = function(browser, data, type, parent){
    var crumbs = browser.group().attr("id", "Bcrumbs");
    var path = getPath(data.id);
    browsePosition(browser, path, 'fileId2', parent, data.dim, data.col, 0.33);
}

editIt = function editIt(){
    window.open('/filem/'+Session.get("fileBIt"), '_blank');
}

viewIt = function viewIt(){
    window.open('/file/'+Session.get("fileBIt"), '_blank');
}

editCloneIt = function editCloneIt(){
    cloneFile(Session.get("fileBIt"))
    //window.open('/filem/'+id, '_blank');
}

browseIt = function browseIt(){
    window.location.href = '/browse/file/'+Session.get("fileBIt")+"/"+1+"/"+Session.get('fileBDim');
}

disectIt = function disectIt(){
    window.location.href = '/browse/group/'+Session.get("fileBIt")+"/"+1+"/"+Session.get('fileBDim');
}