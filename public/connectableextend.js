//5DDxyYXeoX2yvhXwS - original connectable.js
/*!
 * SVG.js Connectable Plugin
 * =========================
 *
 * A JavaScript library for connecting SVG things.
 * Created with <3 and JavaScript by the jillix developers.
 *
 * svg.connectable.js 1.0.1
 * Licensed under the MIT license.
 * */
;(function() {

    var container = null;
    var markers = null;
    var labels = null;

    /**
     * connectable
     * Connects two elements.
     *
     * @name connectable
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `container` (SVGElement): The connector elements container.
     *  - `markers` (SVGElement): The marker elements container.
     *
     * @param {SVGElement} elmTarget The target SVG element.
     * @return {Object} The connectable object containing:
     *
     *  - `source` (SVGElement): The source element.
     *  - `target` (SVGElement): The target element.
     *  - `connector` (SVGElement): The connector element (line / path / polygon).
     *  - `marker` (SVGElement): The marker element.
     *  - [`computeConnectorCoordinates` (Function)](#computeconnectorcoordinatescon)
     *  - [`update` (Function)](#update)
     *  - [`setConnectorColor` (Function)](#setconnectorcolorcolor-c)
     */
    function connectable(options, elmTarget) {

        var con = {};

        if (elmTarget === undefined) {
            elmTarget = options;
            options = {};
        }
        //console.log(options);
        container = options.container || container;
        var elmSource = this;
        markers = options.markers || this.parent || markers;
        labels = options.labels || labels;

        // Append the SVG elements
        con.source = elmSource;
        con.target = elmTarget;
        con.type = options.type || 'straight'
        if(options.connector)
            con.connector = options.connector
        else
            con.connector = container.path().attr('connectortype', 'default').fill('none');

        con.sourceAttach = options.sourceAttach || 'center'
        con.targetAttach = options.targetAttach || 'center'
        con.color = options.color || '#000000'
        con.label = options.label || false
        con.dragstartcallback = options.dragstartcallback || function(){}
        con.dragendcallback = options.dragendcallback || function(){}
        con.labellink = options.labellink || false

        //set source as label
        con.setLabel = function(label, labels, c){
            c = c || this;
            if(labels)
                c.labels = labels
            if(label){

                var maxheight = 20;
                var strokewidth = 2;
                var scale = maxheight / c.source.bbox().height;
                //console.log(scale);

                c.source.move(0,0);
                c.source.scale(scale);

                var delta = Number(c.labels.children().length) * (maxheight + 2*strokewidth)
                var group = c.labels.group().attr('id', "label_"+c.source.attr('id')).opacity(0.5);
                group.add(c.source)

                var box = SVG.get(c.source).bbox();
                var pad = Math.min(box.width, box.height) / 10;

                var points = [
                    ['M', box.x-pad, box.y+box.height/2],
                    ['C', box.x-pad, box.y-pad, box.x-pad, box.y-pad, box.x+box.width/2, box.y-pad],
                    ['C', box.x2+pad, box.y-pad, box.x2+pad, box.y-pad, box.x2+pad, box.y+box.height/2],
                    ['C', box.x2+pad, box.y2+pad, box.x2+pad, box.y2+pad, box.x+box.width/2, box.y2+pad],
                    ['C', box.x-pad, box.y2+pad, box.x-pad, box.y2+pad, box.x-pad, box.y+box.height/2],
                    ['Z']
                ]
                
                c.label = c.source;
                c.source = group.path(points).stroke({color:"#000", width: strokewidth}).attr({'fill': '#000000', 'fill-opacity': '0.1'}).opacity(0.8);

                //console.log(pad);
                //console.log(pad/scale)
                //console.log(delta);

                var ct1 = transformPoint(pad, delta+pad, [c.label.node.getCTM().inverse()])
                //console.log(ct1)
                if(c.label.type != 'text'){
                    var ct2 = transformPoint(ct1[0], ct1[1], [c.label.node.getCTM()]);
                    //console.log(ct2);

                    c.label.move(ct2[0], ct2[1]);
                }
                else
                    c.label.move(ct1[0], ct1[1]);
                //c.label.dmove(pad/scale, delta + pad/scale);
                c.source.move(pad, delta + pad);
            }
        }

        con.setLabel(con.label, labels)

        //set connector's marker
        con.setMarker = function(marker, markers, c){
            c = c || this;

            if(markers)
                    c.markers = markers;
            if(!marker || marker == 'null'){
                c.marker = null
                if(c.connector.attr("marker-end")){
                    var markerid = c.connector.attr("marker-end");
                    SVG.get(markerid.slice(5, markerid.length-1)).remove();
                    c.connector.removeClass("marker-end");
                }
            }
            else if(marker == 'default'){
                var marker = c.markers.marker(30, 30);
                var markerId = "triangle-" + Math.random().toString(16);
                c.connector.attr("marker-end", "url(#" + markerId + ")");

                marker.attr({
                    id: markerId,
                    viewBox: "0 0 30 30",
                    refX: "30",
                    refY: "15",
                    markerUnits: "strokeWidth",
                    markerWidth: "12",
                    markerHeight: "15"
                });

                marker.path().attr({
                    d: "M 0 0 L 30 15 L 0 30 z"
                });

                c.marker = marker;
            }
            else
                c.marker = marker
        }

        con.setMarker(options.marker, options.markers);

        /**
         * computeConnectorCoordinates
         * The function that computes the new coordinates.
         * It can be overriden with a custom function.
         *
         * @name computeConnectorCoordinates
         * @function
         * @param {Connectable} con The connectable instance.
         * @return {Object} An object containing the `x1`, `x2`, `y1` and `y2` coordinates.
         */
        con.computeConnectorCoordinates = function (con) {
            con = con || this;
            var temp = {}, p;
            var view = SVG.get('viewport').node.getCTM();
            var invview = view.inverse();

            if(con.sourceAttach == 'center' || con.source.type != 'path'){
                if(con.label)
                    temp.point1 = transformPoint(con.source.cx(), con.source.cy(), [invview, con.source.node.getCTM().inverse()]);
                else
                    temp.point1 = transformPoint(con.source.cx(), con.source.cy(), [con.source.node.getCTM().inverse()]);
                //temp.point1 = [con.source.cx(), con.source.cy()]
            }
            else{
                var arr1 = JSON.parse(JSON.stringify(con.source.array.valueOf()));
                if(arr1[arr1.length-1][0] == 'Z')
                    arr1.splice(arr1.length-1,1)
                if(con.label)
                    for(var i = 0; i < arr1.length; i++){
                        p = transformPoint(arr1[i][arr1[i].length-2], arr1[i][arr1[i].length-1], [invview]);
                        arr1[i][arr1[i].length-2] = p[0];
                        arr1[i][arr1[i].length-1] = p[1];
                    }
                var arr = arr1;
                var point = 'point2'
            }

            if(con.targetAttach == 'center' || con.target.type != 'path'){
                temp.point2 = transformPoint(con.target.cx(), con.target.cy(), [con.target.node.getCTM().inverse()]);
                //temp.point2 = [con.target.cx(), con.target.cy()]
            }
            else{
                var arr2 = JSON.parse(JSON.stringify(con.target.array.valueOf()));
                if(arr2[arr2.length-1][0] == 'Z')
                    arr2.splice(arr2.length-1,1)
                var arr = arr2;
                var point = 'point1'
            }
            if(!temp.point1 || !temp.point2){
                temp.min = Number.MAX_VALUE;
                if(!temp.point1 && !temp.point2)
                    for(var i = 0 ; i < arr1.length; i++){
                        for(var j = 0 ; j < arr2.length; j++){
                            var dist = Math.pow((arr2[j][arr2[j].length-2] - arr1[i][arr1[i].length-2]),2) + Math.pow((arr2[j][arr2[j].length-1] - arr1[i][arr1[i].length-1]),2)
                            if(temp.min > dist){
                                temp.min = dist
                                temp.point1 = [arr1[i][arr1[i].length-2], arr1[i][arr1[i].length-1]]
                                temp.point2 = [arr2[j][arr2[j].length-2], arr2[j][arr2[j].length-1]]
                            }
                        }
                    }
                else{
                    point = temp[point];
                    for(var i = 0 ; i < arr.length; i++){
                        var dist = Math.pow((point[0] - arr[i][arr[i].length-2]),2) + Math.pow((point[1] - arr[i][arr[i].length-1]),2)
                        if(temp.min > dist){
                            temp.min = dist
                            temp.point = [arr[i][arr[i].length-2], arr[i][arr[i].length-1]]
                        }
                    }
                    if(!temp.point1)
                        temp.point1 = temp.point
                    else
                        temp.point2 = temp.point
                }
            }

            var pp1 = transformPoint(temp.point1[0], temp.point1[1], [view]);
            var pp2 = transformPoint(temp.point2[0], temp.point2[1], [view]);

            if(con.type == 'curved'){
                var p = transformPoint(con.target.cx(), con.target.cy(), [view])
                var c2 = {x: p[0], y: p[1]}

                if(con.label)
                    var c1 = {x: con.source.cx(), y: con.source.cy()}
                else{
                    var p = transformPoint(con.source.cx(), con.source.cy(), [view])
                    var c1 = {x: p[0], y: p[1]}
                }
                if(Math.abs(pp1[0] - c1.x) > 0.5){
                    var m1 = (pp1[1] - c1.y) / (pp1[0] - c1.x)
                    var b1 = pp1[1] - m1 * pp1[0];

                    if(Math.abs(pp2[0] - pp1[0]) < Math.abs(pp2[1] - pp1[1])){
                        var x1 = pp1[0] + (pp2[0] - pp1[0]) / 5
                        var attr1 = {x: x1, y: m1 * x1 + b1}
                    }
                    else if(Math.abs(pp1[1] - c1.y) > 0.5){
                        var y1 = pp1[1] + (pp2[1] - pp1[1]) / 5
                        var attr1 = {x: (y1 - b1) / m1, y: y1}
                    } 
                    else{
                        if(pp2[0]-pp1[0] >= 0)
                            var sign = 1
                        else
                            var sign = -1
                        var attr1 = {x: pp1[0] + sign * Math.abs((pp2[1] - pp1[1]) / 5), y: pp1[1]}
                    }                 
                }
                else
                    var attr1 = {x: pp1[0], y: pp1[1] + (pp2[1] - pp1[1]) / 5}

                if(Math.abs(pp2[0] - c2.x) > 0.5){
                    var m2 = (pp2[1] - c2.y) / (pp2[0] - c2.x)
                    var b2 = pp2[1] - m2 * pp2[0];

                    if(Math.abs(pp2[0] - pp1[0]) < Math.abs(pp2[1] - pp1[1])){
                        var x2 = pp2[0] - (pp2[0] - pp1[0]) / 5
                        var attr2 = {x: x2, y: m2 * x2 + b2}
                    }
                    else if(Math.abs(pp2[1] - c2.y) > 0.5){
                        var y2 = pp2[1] - (pp2[1] - pp1[1]) / 5
                        var attr2 = {x: (y2 - b2) / m2, y: y2}
                    }
                    else{
                        if(pp2[0]-pp1[0] >= 0)
                            var sign = 1
                        else
                            var sign = -1
                        var attr2 = {x: pp2[0] - sign * Math.abs((pp2[1] - pp1[1]) / 5), y: pp2[1]} 
                    }  
                }
                else
                    var attr2 = {x: pp2[0], y: pp2[1] - (pp2[1] - pp1[1]) / 5}

                var middle = {x: attr1.x + (attr2.x - attr1.x) / 2, y: attr1.y + (attr2.y - attr1.y) / 2}

                var points = [
                    ['M', pp1[0], pp1[1]],
                    ['C', attr1.x, attr1.y, attr1.x, attr1.y, middle.x, middle.y],
                    ['C', attr2.x, attr2.y, attr2.x, attr2.y, pp2[0], pp2[1]]
                ]  
            }
            else
                var points = [
                    ['M', pp1[0], pp1[1]],
                    ['L', pp2[0], pp2[1]]
                ]
            return points;
        };

        elmSource.cons = elmSource.cons || [];
        elmSource.cons.push(con);

        /**
         * update
         * Updates the connector coordinates.
         *
         * @name update
         * @function
         * @return {undefined}
         */
        con.update = function () {
            if(con.connector.attr('connectortype') == 'default'){
                con.connector.plot(con.computeConnectorCoordinates(con))
            }
            else{
                var arr = con.connector.target.array.valueOf();
                //find connector's attachment points
                var path = con.computeConnectorCoordinates(con)
                var coord = {x1: path[0][1], y1: path[0][2], x2: path[path.length-1][path[path.length-1].length-2], y2: path[path.length-1][path[path.length-1].length-1]}

                //inverse viewport matrix for transforming above coordinates
                var invview = SVG.get('viewport').node.getCTM().inverse();
                if(!con.label)
                    var pp1 = transformPoint(coord.x1, coord.y1, [invview]);
                else
                    var pp1 = [coord.x1, coord.y1]
                var pp2 = transformPoint(coord.x2, coord.y2, [invview]);

                //compare line(between attachment points) lengths for scale
                var newdiag = Math.sqrt(Math.pow((pp2[0] - pp1[0]),2) + Math.pow((pp2[1] - pp1[1]),2))
                var olddiag = Math.sqrt(Math.pow((arr[1][1] - arr[0][1]),2) + Math.pow((arr[1][2] - arr[0][2]),2))

                var scale = newdiag / olddiag

                //get angle of line from line slope
                var angle = Math.atan((coord.y2 - coord.y1) / (coord.x2 - coord.x1))
                if(angle > 0 && coord.y2 < coord.y1)
                    angle = Math.PI + angle
                else if(angle < 0 && coord.y2 > coord.y1 && coord.x2 < coord.x1)
                    angle = Math.PI + angle
                //get original angle of the line
                var originalangle = Math.atan((arr[1][2] - arr[0][2]) / (arr[1][1] - arr[0][1]))

                var center = {x: con.connector.target.cx(), y: con.connector.target.cy()}
                //transformed connector center coordinates for rotation
                var tcenter = {x: pp1[0] + (pp2[0]-pp1[0]) / 2, y: pp1[1] + (pp2[1]-pp1[1]) / 2}

                //initialize matrix with translation from original center to transformed center
                var transform = [1, 0, 0, 1, tcenter.x - center.x, tcenter.y - center.y];
                //rotate translated matrix and multiply it with scaled neutral matrix
                transform = rotateMatrix(transform, -angle+originalangle, tcenter)
                transformt = scaleMatrix([1,0,0,1,0,0], [scale, scale], center) 
                transform = multiplyMatrix(transformt, transform);
                con.connector.transform('matrix', transform.join(','));
            }
        };
        con.update();
        if(con.label){
            con.label.parent.draggable();
            var start = {}, center = {}, scenter = {};
            con.label.parent.on('dragstart', function(event){
                event.stopPropagation();
                event.preventDefault();
                con.dragstartcallback();
                
                start = {x: event.detail.event.clientX, y: event.detail.event.clientY}
                lcenter = {x : con.label.cx(), y: con.label.cy()};
                scenter = {x: con.source.cx(), y: con.source.cy()}
            })
            con.label.parent.on("dragmove", function(event){
                var lt = con.label.transform();
                var cx = lcenter.x + (event.detail.event.clientX - start.x) / lt.scaleX
                var cy = lcenter.y + (event.detail.event.clientY - start.y) / lt.scaleY
                var scx = scenter.x + event.detail.event.clientX - start.x
                var scy = scenter.y + event.detail.event.clientY - start.y
                con.label.center(cx, cy)
                con.source.center(scx, scy);
                this.node.removeAttribute('transform')
                start = {x: event.detail.event.clientX, y: event.detail.event.clientY}
                lcenter = {x : cx, y: cy};
                scenter = {x: scx, y: scy}
                con.update()
            })
            con.label.parent.on("dragend", function(event){
                event.stopPropagation();
                event.preventDefault();
                con.dragendcallback();
            })
            con.label.parent.on('click', function(event){
                var matrix = SVG.get('viewport').node.getCTM();
                var tcenter = transformPoint(con.target.cx(), con.target.cy(), [con.target.node.getCTM()])
                var p = transformPoint(window.innerWidth / 2, window.innerHeight / 2, [matrix.inverse()])
                matrix = translateMatrix(matrix, p[0]-tcenter[0], p[1]-tcenter[1])
                SVG.get('viewport').transform('matrix', [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].join(','))
                con.update();
            })
            con.label.parent.on('dblclick', function(event){
                if(con.labellink){
                    window.open(con.labellink,'_blank');
                }
            })
        }

        elmSource.on("dragmove", con.update);
        elmTarget.on("dragmove", con.update);

        con.connector.front();

        /**
         * setConnectorColor
         * Sets the connector color.
         *
         * @name setConnectorColor
         * @function
         * @param {String} color The new color.
         * @param {Connectable} c The connectable instance.
         * @return {undefined}
         */
        con.setConnectorColor = function (color, c) {
            c = c || this;
            c.connector.stroke(color);
            if(c.marker)
                c.marker.fill(color);
        };
        con.setConnectorColor(con.color)

        con.setConnectorAttachment = function(element, type, c){
            c = c || this;
            c[element+'Attach'] = type;
            c.update();
        }
        con.setConnector = function(connector, c){
            c = c || this;
            if(connector){
                c.connector.remove();
                if(connector == 'default'){
                    c.connector = container.path().attr('connectortype', 'default').fill('none');
                    c.setConnectorColor(c.color);
                }
                else
                    c.connector = connector;
                c.update();
            }
        }
        con.setType = function(type, c){
            c = c || this;
            if(['straight', 'curved'].indexOf(type) != -1){
                if(c.type != type){
                    //c.connector.remove();
                    c.type = type;
                    //c.connector = container.path().attr('connectortype', 'default').fill('none');
                    c.update();
                }
            }
        }

        return con;
    }

    SVG.extend(SVG.Element, {
        connectable: connectable
    });
}).call(this);