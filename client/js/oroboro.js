Template.oroboro.rendered = function(){
    $("head").append('<script type="application/javascript" src="/file/YDJP8fNBqqaMNbeTw">');
    $("head").append('<script type="application/javascript" src="/svgextend.js">'); // my svgjs extension
    //$("head").append('<script type="application/javascript" src="/file/6gzBGRqzhvXb2HRXj">'); //easing
    var win = Session.get("window");
    var oro = SVG('oroboro');
    oro.attr("width", win.w);
    oro.attr("height", win.h);

    var link = oro.link('/filem/eGfQyh6jCqxeEYmex');
    var g = Group.findOne({fileId: 'JZXXMo5N38iwgfNAG'});
    var logog = recursive_group_client(link, g);
    //logog.attr('id', 'logog').center(win.w/2, win.h/2);

    var logo1 = logog.first().attr('id','logo');
    var a = Math.min(win.w, win.h) / logo1.height();
    logo1.scale(a*0.9 ,a*0.9);
    link.circle(SVG.get('logo').height()).fill('#FFFFFF').opacity(0).cx(logo1.cx()).cy(logo1.cy());

    //Session.set('trueh', logo1.height());
    //link.circle(SVG.get('logo').height()).fill('#FFFFFF').opacity(0).attr('id', 'background').center(win.w/2, win.h/2);

/*
    this.autorun(function(){
        var win = Session.get("window");
        SVG.get('oroboro').attr("width", win.w);
        SVG.get('oroboro').attr("height", win.h);
        var a = Math.min(win.w, win.h) / Number(Session.get('trueh'));
        SVG.get('logo').scale(a ,a);
        //SVG.get('logo').move(win.w/2 - SVG.get('logo').width()/2, win.h/2 - SVG.get('logo').height()/2)
        SVG.get('logog').center(win.w/2, win.h/2);
        SVG.get('background').radius(SVG.get('logo').height()).center(win.w/2, win.h/2);
    })
*/
}