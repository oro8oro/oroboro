
//Template.show_meteor_file_svg.rendered = function(){    
   /*
    var draw = SVG('svg_test').size(x,y);
    var dGroups=[];
    var file = File.findOne({_id: this.data._id});
    var groups = Group.find({fileId: this.data._id}).fetch();
    for(var g in groups){
        dGroups[g] = recursive_group_client(draw, groups[g]);
    }  
    var grl = SVG.get('zKyEJctWRsFqteRud');
    grl.attr("name","GRL");
    var bra = SVG.get('4zxqbqffwLd9dhcyL').move(200,100);
    bra.attr("name", "BRA");
    var text = SVG.get('dDvYA847SkvD642AW').move(80,100);
    var path = SVG.get('4zxqbqffwLd9dhcyL').attr('d');
    var dpath = SVG.get('9DWcamNvdqPtASXvs');
    dpath.attr("name", "dpath");
    var dpath2 = SVG.get('mT9q9oyyAjQRR8pXx');
    dpath2.attr("name", "dpath2");

    SVG.get('wt9KAofELghRYiLWu').attr('fill-opacity', 0.5);

    //BRA cliper xor
    var cliptype = ClipperLib.ClipType.ctXor;
    var solution = new ClipperLib.Paths();
    var c = new ClipperLib.Clipper();
    c.AddPaths(pathArraySvgXY(bra.array.value), ClipperLib.PolyType.ptSubject, true);
    c.AddPaths(pathArraySvgXY(grl.array.value), ClipperLib.PolyType.ptClip, true);
    c.Execute(cliptype, solution);
    console.log("BRA cliper xor: " + solution);
    var xor = path_points(JSON.stringify(pathArrayXYOro(solution)));
    SVG.get('wt9KAofELghRYiLWu').path(xor).move(600,50);
    
    //Double path sqares cliper xor
    var solution2 = new ClipperLib.Paths();
    var c2 = new ClipperLib.Clipper();
    c2.AddPaths(pathArraySvgXY(dpath.array.value), ClipperLib.PolyType.ptSubject, true);
    c2.AddPaths(pathArraySvgXY(dpath2.array.value), ClipperLib.PolyType.ptClip, true);
    c2.Execute(cliptype, solution2);
    console.log("Double path sqares cliper xor: " + solution2);
    var xor2 = path_points(JSON.stringify(pathArrayXYOro(solution2)));
    SVG.get('wt9KAofELghRYiLWu').path(xor2).move(750,50);

    //complex path
    var complex = "m52.5,105c0,-30 2,-56 76,-47c74,9 124,7 102,66c-22,59 -25,79 -72,91c-47,12 -90,2 -90.5,2c-0.5,0 -59.5,-38 -60,-38c-0.5,0 4.5,-55 4,-55c-0.5,0 145.5,56 112.5,124c-33,68 160,-27 159.5,-27c-0.5,0 -95.5,-105 -96,-105c-0.5,0 -135.5,-11 -135.5,-11z";
    var complex_path = draw.group().attr("id","test_group").path(complex).attr("id","complex_path").move(350,20);
    complex_path.attr("name","complex_path");
    console.log("complex_path has " + complex_path.array.value.length +" points");

    //simplify complex path
    var spath = simplifyPath(SVG.get("complex_path"));
    var simplified1 = SVG.get("test_group").path(split_oro_path_points(spath)).attr("id","simple_path").move(400,250);
    simplified1.attr("name", "simplified_path");
    var complexity12 = getComplexity(complex_path);
    var complexity1 = getComplexity(simplified1);
    
    //circle
    var circle = SVG.get("test_group").circle(100).attr("id","simple_circle").move(20,150);
    circle.attr("name", "orig_circle");
    //circle toPath
    var circle_path = circle.toPath();
    circle_path.attr("id","circle_path").move(20, 250);
    circle_path.attr("name", "circle_toPath");
    console.log("circle_toPath " + circle_path.array.value.length +" points");

    //simplify circle
    var scircle = simplifyPath(circle_path);
    var simplified2 = SVG.get("test_group").path(split_oro_path_points(scircle)).attr("id","simple_circle_path").move(120,250);
    simplified2.attr("name","simplified_circle");
    var complexity22 = getComplexity(circle_path);
    var complexity2 = getComplexity(simplified2);

    console.log("BRA " + bra.array.value.length +" points");

    //simplify BRA
    var sbra = simplifyPath(bra);
    var simplified3 = SVG.get("test_group").path(split_oro_path_points(sbra)).attr("id","simple_bra").move(650,250);
    simplified3.attr("name","bra_simplified");
    var complexity33 = getComplexity(bra);
    var complexity3 = getComplexity(simplified3);
    */
/*
    //H&V complex path
    var hv = "m173,74v126h140v-129z";
    var hvpath = SVG.get("test_group").path(hv).attr("id","hvpath").move(850,20);
    hvpath.attr("name","hvpath");
    console.log(hvpath);
    var shv = simplifyPath(hvpath);
    var simplified4 = SVG.get("test_group").path(split_oro_path_points(shv)).attr("id","simple_hv").move(650,250);
    simplified4.attr("name","hv_simplified");
    var complexity44 = getComplexity(hvpath);
    var complexity4 = getComplexity(simplified4);
*/
    //var draw = SVG('svg_test').size(1448,1024);
    //var gr = draw.group().attr("id","test_group");

    // 2 paths for clipper Diff
    //var p1 = "m2,222c0,-119.54338 100.45662,-220 220,-220l580,0c119.5434,0 220,100.45662 220,220l0,580c0,119.5434 -100.4566,220 -220,220l-580,0c-119.54338,0 -220,-100.4566 -220,-220l0,-580z";
    //var p2 = "m17,222c0,-111.39269 93.60731,-205 205,-205l580,0c111.3927,0 205,93.60731 205,205l0,580c0,111.3927 -93.6073,205 -205,205l-580,0c-111.39269,0 -205,-93.6073 -205,-205l0,-580z";

    //var p1 = " m1,31c0,-16.30137 13.69863,-30 30,-30l1386,0c16.30139,0 30,13.69863 30,30l0,962c0,16.30139 -13.69861,30 -30,30l-1386,0c-16.30137,0 -30,-13.69861 -30,-30l0,-962z";
    //var p2 = "m18,43c0,-13.58447 11.41553,-25 25,-25l1362,0c13.58447,0 25,11.41553 25,25l0,938c0,13.58447 -11.41553,25 -25,25l-1362,0c-13.58447,0 -25,-11.41553 -25,-25l0,-938z";

    //var d1 =  SVG.get("test_group").path(p1).attr("name","diff_path_1").opacity(0.1);
    //var d2 =  SVG.get("test_group").path(p2).attr("name","diff_path_2").opacity(0.1);
    //console.log("d1 " + d1.array.value.length +" points");
    //simplify paths
    //var sd1 = simplifyPath(d1);
    //var s = SVG.get("test_group").path(split_oro_path_points(sd1)).attr("id","simple_diff_path_1").opacity(0.2);
    //s.attr("name","simple_diff_path_1");
    //var complex = getComplexity(d1);
    //var complexi = getComplexity(s);
/*
    console.log("d2 " + d2.array.value.length +" points");

    var sd2 = simplifyPath(d2);
    var s2 = SVG.get("test_group").path(split_oro_path_points(sd2)).attr("id","simple_diff_path_2").opacity(0.2);
    s2.attr("name","simple_diff_path_2");
    var complex = getComplexity(d2);
    var complexi = getComplexity(s2);

    //do the diff
    var cliptype = ClipperLib.ClipType.ctDifference;
    var solution = new ClipperLib.Paths();
    var c = new ClipperLib.Clipper();
    c.AddPaths(pathArraySvgXY(s.array.value), ClipperLib.PolyType.ptSubject, true);
    c.AddPaths(pathArraySvgXY(s2.array.value), ClipperLib.PolyType.ptClip, true);
    c.Execute(cliptype, solution);
    //console.log("clipper diff: " + solution);
    //SVGjs string
    console.log(solution);
    console.log(JSON.stringify(pathArrayXYOro(solution)));
    var diff = split_oro_path_points(JSON.stringify(pathArrayXYOro(solution)));
    //diff path
    console.log(diff);
    var newdiff = SVG.get("test_group").path(diff);
*/

    //var draw = SVG('svg_test').size(1448,1024);
    //var gr = draw.group().attr("id","test_group");
 /*    var p1 = "m2,222c0,-119.54338 100.45662,-220 220,-220l580,0c119.5434,0 220,100.45662 220,220l0,580c0,119.5434 -100.4566,220 -220,220l-580,0c-119.54338,0 -220,-100.4566 -220,-220l0,-580z";
    var d1 =  SVG.get("test_group").path(p1).attr("name","diff_path_1").opacity(0.1);
     var sd1 = simplifyPath(d1);
    var s = SVG.get("test_group").path(split_oro_path_points(sd1)).attr("id","simple_diff_path_1").opacity(0.2);
    s.attr("name","simple_diff_path_1");

    d1.remove();
    but = [];

    var st = 0;
    var hg = 0;
    for(var i = 0 ; i < 3 ; i++){
        but[i] = [];
        for(var j = 0 ; j < 5 ; j++){
            but[i][j] = s.clone().transform({x:st,y:hg}).opacity(0.2);
            st = st + 1024;
            but[i][j].on('click', function(event){
                console.log(this.attr("id"));
                this.fill({ color: '#f06' });
            });
            but[i][j].on('mouseout', function(event){
                this.fill({ color: '#000' });
            });
            but[i][j].on('mouseover', function(event){
                this.scale();
            });
        }
        hg = hg + 1024;
        st = 0;
    }

    s.remove();
    gr.scale(0.1,0.1);
    gr.mousemove(function(event){
        console.log("X: " + event.x);
        console.log("Y: " + event.y);
    });
*/
    //var p1 = "M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h2.312c-0.126-0.266-0.2-0.556-0.2-0.859c0-0.535,0.208-1.04,0.587-1.415l4.325-4.329c0.375-0.377,0.877-0.585,1.413-0.585c0.54,0,1.042,0.21,1.417,0.587l4.323,4.329c0.377,0.373,0.585,0.878,0.585,1.413c0,0.304-0.073,0.594-0.2,0.859h1.312c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z M16.706,17.916c-0.193-0.195-0.45-0.291-0.706-0.291s-0.512,0.096-0.707,0.291l-4.327,4.33c-0.39,0.389-0.389,1.025,0.001,1.414l0.556,0.555c0.39,0.389,0.964,0.449,1.276,0.137s0.568-0.119,0.568,0.432v1.238c0,0.549,0.451,1,1,1h3.265c0.551,0,1-0.451,1-1v-1.238c0-0.551,0.256-0.744,0.569-0.432c0.312,0.312,0.887,0.252,1.276-0.137l0.556-0.555c0.39-0.389,0.39-1.025,0.001-1.414L16.706,17.916z";
    //var d1 =  gr.path(p1).attr("name","diff_path_1").opacity(0.1);
    //var sd1 = simplifyPath(d1);
    //console.log(sd1);
    //var p2 = gr.path(split_oro_path_points(sd1)).move(20,200);

//}