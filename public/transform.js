var path_source = $("#path_1").attr("d");
// Get bounding box of text path
var bounds = $("#path_1")[0].getBoundingClientRect();

// Make array of coordinates, every array member represent corner of text path
var source = new Array(
{x:bounds.left,y:bounds.top},
{x:bounds.right,y:bounds.top},
{x:bounds.right,y:bounds.bottom},
{x:bounds.left,y:bounds.bottom}
);

// Create SVG with circles and joining lines
var R = Raphael("canvas", 2000, 2000);    
var l0 = R.path("M10 10L100 100").attr({stroke:"blue","stroke-width":2});
var l1 = R.path("M10 10L100 110").attr({stroke:"blue","stroke-width":2});
var l2 = R.path("M10 10L100 120").attr({stroke:"blue","stroke-width":2});
var l3 = R.path("M10 10L100 130").attr({stroke:"blue","stroke-width":2});
//var dl0 = R.path("M10 10L100 130").attr({stroke:"red","stroke-width":2});
//var dl1 = R.path("M10 10L100 130").attr({stroke:"red","stroke-width":2});
var c0 = R.circle(100, 100, 10).attr({fill: "blue",stroke: "none"});
var c1 = R.circle(100, 110, 10).attr({fill: "blue",stroke: "none"});
var c2 = R.circle(100, 120, 10).attr({fill: "blue",stroke: "none"});
var c3 = R.circle(100, 130, 10).attr({fill: "blue",stroke: "none"});

// Corner drag functions (start, move, up)
var start = function () {
    // storing original coordinates
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
},
move = function (dx, dy) {
    // move will be called with dx and dy
    this.attr({cx: this.ox + dx, cy: this.oy + dy});
    updatelines();
    update_text();
},
up = function () {
    // restoring state
};

// Function updates lines between corner circles
function updatelines()
{
    $(l0.node).attr({d:"M"+c0.attr("cx")+","+c0.attr("cy")+"L"+c1.attr("cx")+","+c1.attr("cy")});
    $(l1.node).attr({d:"M"+c1.attr("cx")+","+c1.attr("cy")+"L"+c2.attr("cx")+","+c2.attr("cy")});
    $(l2.node).attr({d:"M"+c2.attr("cx")+","+c2.attr("cy")+"L"+c3.attr("cx")+","+c3.attr("cy")});
    $(l3.node).attr({d:"M"+c3.attr("cx")+","+c3.attr("cy")+"L"+c0.attr("cx")+","+c0.attr("cy")});
    
    // Update also diagonal lines
    // as you see, the distort is perspectivelly correct
    // which means eg. that center of text remains on center
    // while distorting
//$(dl0.node).attr({d:"M"+c0.attr("cx")+","+c0.attr("cy")+"L"+c2.attr("cx")+","+c2.attr("cy")});
    //$(dl1.node).attr({d:"M"+c1.attr("cx")+","+c1.attr("cy")+"L"+c3.attr("cx")+","+c3.attr("cy")});
}

// Set up drag functionality of circles
c0.drag(move, start, up); 
c1.drag(move, start, up);
c2.drag(move, start, up);
c3.drag(move, start, up);

// Place circles on corners of text path
c0.attr({cx:source[0].x, cy:source[0].y});
c1.attr({cx:source[1].x, cy:source[1].y});
c2.attr({cx:source[2].x, cy:source[2].y});
c3.attr({cx:source[3].x, cy:source[3].y});
updatelines();

// To fit text path on screen, place circles at certain positions
// and update lines between circles and update text path
c0.attr({cx:source[0].x+20, cy:source[0].y-100});
c1.attr({cx:source[1].x-600, cy:source[1].y-100});
c2.attr({cx:source[2].x-700, cy:source[2].y-200});
c3.attr({cx:source[3].x+120, cy:source[3].y-200});

updatelines();
update_text();

function update_text()
{
    // Make array of destination coordinates, every array member represent corner of text path (the new dragged destination)
    var destination=new Array(
    {x:c0.attr("cx"),y:c0.attr("cy")},
    {x:c1.attr("cx"),y:c1.attr("cy")},
    {x:c2.attr("cx"),y:c2.attr("cy")},
    {x:c3.attr("cx"),y:c3.attr("cy")}
    );
    
    // Actual calculation which transfers each coordinate
    // of text path from source coordinates to destination
    // coordinates.
    var path_destination = distort_path(path_source,source,destination);
    // Update path on screen
    $("#path_1").attr("d",path_destination);
}

/*
    transferPoint()

    Parameters:
     xI = x coordinate of point in original figure
     yI = y coordinate of point in original figure

    source = array of corner coordinates of original four-sided figure
    var source:Array = new Array();
    source[0] = new Point(0, 0);
    source[2] = new Point(200,100);

     destination = corner coordinates of destination (perspective distorted) figure
  Example of destination-array:

    var destination:Array = new Array();
    destination[n] = new Point(0, 0); //n=0...4
*/
 
function transferPoint (xI, yI, source, destination)
{
    var ADDING = 0.001; // to avoid dividing by zero

    var xA = source[0].x;
    var yA = source[0].y;

    var xC = source[2].x;
    var yC = source[2].y;
    
    var xAu = destination[0].x;
    var yAu = destination[0].y;

    var xBu = destination[1].x;
    var yBu = destination[1].y;

    var xCu = destination[2].x;
    var yCu = destination[2].y;

    var xDu = destination[3].x;
    var yDu = destination[3].y;

    // Calcultations
    // if points are the same, have to add a ADDING to avoid dividing by zero
    if (xBu==xCu) xCu+=ADDING;
    if (xAu==xDu) xDu+=ADDING;
    if (xAu==xBu) xBu+=ADDING;
    if (xDu==xCu) xCu+=ADDING;
    var kBC = (yBu-yCu)/(xBu-xCu);
    var kAD = (yAu-yDu)/(xAu-xDu);
    var kAB = (yAu-yBu)/(xAu-xBu);
    var kDC = (yDu-yCu)/(xDu-xCu);

    if (kBC==kAD) kAD+=ADDING;
    var xE = (kBC*xBu - kAD*xAu + yAu - yBu) / (kBC-kAD);
    var yE = kBC*(xE - xBu) + yBu;

    if (kAB==kDC) kDC+=ADDING;
    var xF = (kAB*xBu - kDC*xCu + yCu - yBu) / (kAB-kDC);
    var yF = kAB*(xF - xBu) + yBu;

    if (xE==xF) xF+=ADDING;
    var kEF = (yE-yF) / (xE-xF);

    if (kEF==kAB) kAB+=ADDING;
    var xG = (kEF*xDu - kAB*xAu + yAu - yDu) / (kEF-kAB);
    var yG = kEF*(xG - xDu) + yDu;

    if (kEF==kBC) kBC+=ADDING;
    var xH = (kEF*xDu - kBC*xBu + yBu - yDu) / (kEF-kBC);
    var yH = kEF*(xH - xDu) + yDu;

    var rG = (yC-yI)/(yC-yA);
    var rH = (xI-xA)/(xC-xA);

    var xJ = (xG-xDu)*rG + xDu;
    var yJ = (yG-yDu)*rG + yDu;

    var xK = (xH-xDu)*rH + xDu;
    var yK = (yH-yDu)*rH + yDu;

    if (xF==xJ) xJ+=ADDING;
    if (xE==xK) xK+=ADDING;
    var kJF = (yF-yJ) / (xF-xJ); //23
    var kKE = (yE-yK) / (xE-xK); //12

    var xKE;
    if (kJF==kKE) kKE+=ADDING;
    var xIu = (kJF*xF - kKE*xE + yE - yF) / (kJF-kKE);
    var yIu = kJF * (xIu - xJ) + yJ;

    var b={x:xIu,y:yIu}; 
    b.x=Math.round(b.x);
    b.y=Math.round(b.y);
    return b;
}

// Function splits path string to coordinates array
function path_string_to_array(path_str)
{
    var patt1=/[mzlhvcsqta]|-?[0-9.]+/gi;
    var path_arr=path_str.match(patt1);
    patt1=/[mzlhvcsqta]/i;
    for(var i=0;i<path_arr.length;i++)
    {
        if (!path_arr[i].match(patt1))
        {
            path_arr[i]=parseFloat(path_arr[i]);
        }
    }
    return path_arr;
}

// Function joins array coordinates back to string
function path_array_to_string(path_arr)
{
    var path_str=path_arr.toString();
    path_str=path_str.replace(/([0-9]),([-0-9])/g, "$1 $2");
    path_str=path_str.replace(/([0-9]),([-0-9])/g, "$1 $2"); // for some reason have to do twice
    path_str=path_str.replace(/,/g, "");
    return path_str;
}

// Function distorts path_str from source coordinates
// to destination coordinates
function distort_path(path_str,source,destination)
{
    var path_arr=path_string_to_array(path_str);

    var subpath_type="";
    var is_num;
    var xy_counter;
    var xy;
    var path_arr2=new Array();
    var subpath_type_upper;
    var point;
    for(var i=0;i<path_arr.length;i++)
    {
        patt1=/[mzlhvcsqta]/i;
        curr=path_arr[i];
        if (curr.toString().match(patt1))
        {
            xy_counter=-1;
            subpath_type=curr;
            subpath_type_upper=subpath_type.toUpperCase();
            is_num=false;
            path_arr2.push(curr);
        }
        else
        {
            is_num=true;
            curr=parseFloat(curr);
        }
        if (xy_counter%2 == 0) xy="x";
        else xy="y";

        if (is_num) // && subpath_type=="q")
        {            
            if(xy=="y")
            {
                point=transferPoint(parseFloat(path_arr[i-1]),curr,source,destination);
                path_arr2.push(point.x);
                path_arr2.push(point.y);
            }
        }
        xy_counter++;
    }
    path_str=path_array_to_string(path_arr2);
    return path_str;
}