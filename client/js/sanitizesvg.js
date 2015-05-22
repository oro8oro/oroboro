svgedit = {
  // common namepaces constants in alpha order
  NS: {
    HTML: 'http://www.w3.org/1999/xhtml',
    MATH: 'http://www.w3.org/1998/Math/MathML',
    SE: 'http://svg-edit.googlecode.com',
    SVG: 'http://www.w3.org/2000/svg',
    XLINK: 'http://www.w3.org/1999/xlink',
    XML: 'http://www.w3.org/XML/1998/namespace',
    XMLNS: 'http://www.w3.org/2000/xmlns/' // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
  }
};

/*globals $, svgedit*/
/*jslint vars: true, eqeq: true*/
/**
 * Package: svgedit.browser
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

(function() {'use strict';

if (!svgedit.browser) {
    svgedit.browser = {};
}

// alias
var NS = svgedit.NS;

var supportsSvg_ = (function() {
    return !!document.createElementNS && !!document.createElementNS(NS.SVG, 'svg').createSVGRect;
}());

svgedit.browser.supportsSvg = function() { return supportsSvg_; };
if(!svgedit.browser.supportsSvg()) {
    window.location = 'browser-not-supported.html';
    return;
}

var userAgent = navigator.userAgent;
var svg = document.createElementNS(NS.SVG, 'svg');

// Note: Browser sniffing should only be used if no other detection method is possible
var isOpera_ = !!window.opera;
var isWebkit_ = userAgent.indexOf('AppleWebKit') >= 0;
var isGecko_ = userAgent.indexOf('Gecko/') >= 0;
var isIE_ = userAgent.indexOf('MSIE') >= 0;
var isChrome_ = userAgent.indexOf('Chrome/') >= 0;
var isWindows_ = userAgent.indexOf('Windows') >= 0;
var isMac_ = userAgent.indexOf('Macintosh') >= 0;
var isTouch_ = 'ontouchstart' in window;

var supportsSelectors_ = (function() {
    return !!svg.querySelector;
}());

var supportsXpath_ = (function() {
    return !!document.evaluate;
}());

// segList functions (for FF1.5 and 2.0)
var supportsPathReplaceItem_ = (function() {
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,10');
    var seglist = path.pathSegList;
    var seg = path.createSVGPathSegLinetoAbs(5,5);
    try {
        seglist.replaceItem(seg, 0);
        return true;
    } catch(err) {}
    return false;
}());

var supportsPathInsertItemBefore_ = (function() {
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,10');
    var seglist = path.pathSegList;
    var seg = path.createSVGPathSegLinetoAbs(5,5);
    try {
        seglist.insertItemBefore(seg, 0);
        return true;
    } catch(err) {}
    return false;
}());

// text character positioning (for IE9)
var supportsGoodTextCharPos_ = (function() {
    var svgroot = document.createElementNS(NS.SVG, 'svg');
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.appendChild(svgroot);
    svgcontent.setAttribute('x', 5);
    svgroot.appendChild(svgcontent);
    var text = document.createElementNS(NS.SVG, 'text');
    text.textContent = 'a';
    svgcontent.appendChild(text);
    var pos = text.getStartPositionOfChar(0).x;
    document.documentElement.removeChild(svgroot);
    return (pos === 0);
}());

var supportsPathBBox_ = (function() {
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.appendChild(svgcontent);
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 C0,0 10,10 10,0');
    svgcontent.appendChild(path);
    var bbox = path.getBBox();
    document.documentElement.removeChild(svgcontent);
    return (bbox.height > 4 && bbox.height < 5);
}());

// Support for correct bbox sizing on groups with horizontal/vertical lines
var supportsHVLineContainerBBox_ = (function() {
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.appendChild(svgcontent);
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,0');
    var path2 = document.createElementNS(NS.SVG, 'path');
    path2.setAttribute('d', 'M5,0 15,0');
    var g = document.createElementNS(NS.SVG, 'g');
    g.appendChild(path);
    g.appendChild(path2);
    svgcontent.appendChild(g);
    var bbox = g.getBBox();
    document.documentElement.removeChild(svgcontent);
    // Webkit gives 0, FF gives 10, Opera (correctly) gives 15
    return (bbox.width == 15);
}());

var supportsEditableText_ = (function() {
    // TODO: Find better way to check support for this
    return isOpera_;
}());

var supportsGoodDecimals_ = (function() {
    // Correct decimals on clone attributes (Opera < 10.5/win/non-en)
    var rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('x', 0.1);
    var crect = rect.cloneNode(false);
    var retValue = (crect.getAttribute('x').indexOf(',') == -1);
    if(!retValue) {
        $.alert('NOTE: This version of Opera is known to contain bugs in SVG-edit.\n'+
        'Please upgrade to the <a href="http://opera.com">latest version</a> in which the problems have been fixed.');
    }
    return retValue;
}());

var supportsNonScalingStroke_ = (function() {
    var rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('style', 'vector-effect:non-scaling-stroke');
    return rect.style.vectorEffect === 'non-scaling-stroke';
}());

var supportsNativeSVGTransformLists_ = (function() {
    var rect = document.createElementNS(NS.SVG, 'rect');
    var rxform = rect.transform.baseVal;
    var t1 = svg.createSVGTransform();
    rxform.appendItem(t1);
    return rxform.getItem(0) == t1;
}());

// Public API

svgedit.browser.isOpera = function() { return isOpera_; };
svgedit.browser.isWebkit = function() { return isWebkit_; };
svgedit.browser.isGecko = function() { return isGecko_; };
svgedit.browser.isIE = function() { return isIE_; };
svgedit.browser.isChrome = function() { return isChrome_; };
svgedit.browser.isWindows = function() { return isWindows_; };
svgedit.browser.isMac = function() { return isMac_; };
svgedit.browser.isTouch = function() { return isTouch_; };

svgedit.browser.supportsSelectors = function() { return supportsSelectors_; };
svgedit.browser.supportsXpath = function() { return supportsXpath_; };

svgedit.browser.supportsPathReplaceItem = function() { return supportsPathReplaceItem_; };
svgedit.browser.supportsPathInsertItemBefore = function() { return supportsPathInsertItemBefore_; };
svgedit.browser.supportsPathBBox = function() { return supportsPathBBox_; };
svgedit.browser.supportsHVLineContainerBBox = function() { return supportsHVLineContainerBBox_; };
svgedit.browser.supportsGoodTextCharPos = function() { return supportsGoodTextCharPos_; };
svgedit.browser.supportsEditableText = function() { return supportsEditableText_; };
svgedit.browser.supportsGoodDecimals = function() { return supportsGoodDecimals_; };
svgedit.browser.supportsNonScalingStroke = function() { return supportsNonScalingStroke_; };
svgedit.browser.supportsNativeTransformLists = function() { return supportsNativeSVGTransformLists_; };

}());

/*globals $, svgedit, unescape, DOMParser, ActiveXObject, getStrokedBBox*/
/*jslint vars: true, eqeq: true, bitwise: true, continue: true, forin: true*/
/**
 * Package: svgedit.utilities
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

 (function(undef) {'use strict';

if (!svgedit.utilities) {
  svgedit.utilities = {};
}

// alias
var NS = svgedit.NS;

 // Function: svgedit.utilities.getHref
// Returns the given element's xlink:href value
svgedit.utilities.getHref = function(elem) {
  return elem.getAttributeNS(NS.XLINK, 'href');
};

// Function: svgedit.utilities.setHref
// Sets the given element's xlink:href value
svgedit.utilities.setHref = function(elem, val) {
  elem.setAttributeNS(NS.XLINK, 'xlink:href', val);
};

// Function: svgedit.utilities.getUrlFromAttr
// Extracts the URL from the url(...) syntax of some attributes.
// Three variants:
//  * <circle fill="url(someFile.svg#foo)" />
//  * <circle fill="url('someFile.svg#foo')" />
//  * <circle fill='url("someFile.svg#foo")' />
//
// Parameters:
// attrVal - The attribute value as a string
//
// Returns:
// String with just the URL, like someFile.svg#foo
svgedit.utilities.getUrlFromAttr = function(attrVal) {
  if (attrVal) {
    // url("#somegrad")
    if (attrVal.indexOf('url("') === 0) {
      return attrVal.substring(5, attrVal.indexOf('"',6));
    }
    // url('#somegrad')
    if (attrVal.indexOf("url('") === 0) {
      return attrVal.substring(5, attrVal.indexOf("'",6));
    }
    if (attrVal.indexOf("url(") === 0) {
      return attrVal.substring(4, attrVal.indexOf(')'));
    }
  }
  return null;
};

}());

/*globals $, svgedit*/
/*jslint vars: true, eqeq: true*/
/**
 * Package: svgedit.sanitize
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) svgutils.js

// return the svgedit.NS with key values switched and lowercase
svgedit.getReverseNS = function() {'use strict';
  var reverseNS = {};
  $.each(this.NS, function(name, URI) {
    reverseNS[URI] = name.toLowerCase();
  });
  return reverseNS;
};

(function() {'use strict';

if (!svgedit.sanitize) {
  svgedit.sanitize = {};
}

var NS = svgedit.NS,
  REVERSE_NS = svgedit.getReverseNS();

// this defines which elements and attributes that we support
var svgWhiteList_ = {
  // SVG Elements
  "a": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "xlink:href", "xlink:title"],
  "circle": ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "r", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
  "clipPath": ["class", "clipPathUnits", "id"],
  "defs": [],
  "style" : ["type"],
  "desc": [],
  "ellipse": ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
  "feGaussianBlur": ["class", "color-interpolation-filters", "id", "requiredFeatures", "stdDeviation"],
  "filter": ["class", "color-interpolation-filters", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "requiredFeatures", "width", "x", "xlink:href", "y"],
  "foreignObject": ["class", "font-size", "height", "id", "opacity", "requiredFeatures", "style", "transform", "width", "x", "y"],
  "g": ["class", "clip-path", "clip-rule", "id", "display", "fill", "fill-opacity", "fill-rule", "filter", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "font-family", "font-size", "font-style", "font-weight", "text-anchor"],
  "image": ["class", "clip-path", "clip-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:href", "xlink:title", "y"],
  "line": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "x1", "x2", "y1", "y2"],
  "linearGradient": ["class", "id", "gradientTransform", "gradientUnits", "requiredFeatures", "spreadMethod", "systemLanguage", "x1", "x2", "xlink:href", "y1", "y2"],
  "marker": ["id", "class", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "systemLanguage", "viewBox"],
  "mask": ["class", "height", "id", "maskContentUnits", "maskUnits", "width", "x", "y"],
  "metadata": ["class", "id"],
  "path": ["class", "clip-path", "clip-rule", "d", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
  "pattern": ["class", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:href", "y"],
  "polygon": ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "id", "class", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
  "polyline": ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
  "radialGradient": ["class", "cx", "cy", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "requiredFeatures", "spreadMethod", "systemLanguage", "xlink:href"],
  "rect": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "width", "x", "y"],
  "stop": ["class", "id", "offset", "requiredFeatures", "stop-color", "stop-opacity", "style", "systemLanguage"],
  "svg": ["class", "clip-path", "clip-rule", "filter", "id", "height", "mask", "preserveAspectRatio", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xmlns", "xmlns:se", "xmlns:xlink", "y"],
  "switch": ["class", "id", "requiredFeatures", "systemLanguage"],
  "symbol": ["class", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "opacity", "preserveAspectRatio", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "viewBox"],
  "text": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "transform", "x", "xml:space", "y"],
  "textPath": ["class", "id", "method", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "transform", "xlink:href"],
  "title": [],
  "tspan": ["class", "clip-path", "clip-rule", "dx", "dy", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "rotate", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "textLength", "transform", "x", "xml:space", "y"],
  "use": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "transform", "width", "x", "xlink:href", "y"]
};

// Produce a Namespace-aware version of svgWhitelist
var svgWhiteListNS_ = {};
$.each(svgWhiteList_, function(elt, atts){
  var attNS = {};
  $.each(atts, function(i, att){
    if (att.indexOf(':') >= 0) {
      var v = att.split(':');
      attNS[v[1]] = NS[(v[0]).toUpperCase()];
    } else {
      attNS[att] = att == 'xmlns' ? NS.XMLNS : null;
    }
  });
  svgWhiteListNS_[elt] = attNS;
});

// Function: svgedit.sanitize.sanitizeSvg
// Sanitizes the input node and its children
// It only keeps what is allowed from our whitelist defined above
//
// Parameters:
// node - The DOM element to be checked (we'll also check its children)
svgedit.sanitize.sanitizeSvg = function(node) {

  // Cleanup text nodes
  if (node.nodeType == 3) { // 3 == TEXT_NODE
    // Trim whitespace
    node.nodeValue = node.nodeValue.replace(/^\s+|\s+$/g, '');
    // Remove if empty
    if (node.nodeValue.length === 0) {
      node.parentNode.removeChild(node);
    }
  }

  // We only care about element nodes.
  // Automatically return for all non-element nodes, such as comments, etc.
  if (node.nodeType != 1) { // 1 == ELEMENT_NODE
    return;
  }
  var doc = node.ownerDocument;
  var parent = node.parentNode;
  // can parent ever be null here?  I think the root node's parent is the document...
  // loredanacirstea: parent null when using this with svg.import.js https://github.com/wout/svg.import.js
  if (!doc || !parent) {
    return;
  }

  var allowedAttrs = svgWhiteList_[node.nodeName];
  var allowedAttrsNS = svgWhiteListNS_[node.nodeName];
  var i;
  // if this element is supported, sanitize it
  if (typeof allowedAttrs !== 'undefined') {

    var seAttrs = [];
    i = node.attributes.length;
    while (i--) {
      // if the attribute is not in our whitelist, then remove it
      // could use jQuery's inArray(), but I don't know if that's any better
      var attr = node.attributes.item(i);
      var attrName = attr.nodeName;
      var attrLocalName = attr.localName;
      var attrNsURI = attr.namespaceURI;
      // Check that an attribute with the correct localName in the correct namespace is on 
      // our whitelist or is a namespace declaration for one of our allowed namespaces
      if (!(allowedAttrsNS.hasOwnProperty(attrLocalName) && attrNsURI == allowedAttrsNS[attrLocalName] && attrNsURI != NS.XMLNS) &&
        !(attrNsURI == NS.XMLNS && REVERSE_NS[attr.value]) )
      {
        // TODO(codedread): Programmatically add the se: attributes to the NS-aware whitelist.
        // Bypassing the whitelist to allow se: prefixes.
        // Is there a more appropriate way to do this?
        if (attrName.indexOf('se:') === 0) {
          seAttrs.push([attrName, attr.value]);
        }
        node.removeAttributeNS(attrNsURI, attrLocalName);
      }

      // Add spaces before negative signs where necessary
      if (svgedit.browser.isGecko()) {
        switch (attrName) {
        case 'transform':
        case 'gradientTransform':
        case 'patternTransform':
          var val = attr.value.replace(/(\d)-/g, '$1 -');
          node.setAttribute(attrName, val);
          break;
        }
      }

      // For the style attribute, rewrite it in terms of XML presentational attributes
      if (attrName == 'style') {
        var props = attr.value.split(';'),
          p = props.length;
        while (p--) {
          var nv = props[p].split(':');
          var styleAttrName = $.trim(nv[0]);
          var styleAttrVal = $.trim(nv[1]);
          // Now check that this attribute is supported
          if (allowedAttrs.indexOf(styleAttrName) >= 0) {
            node.setAttribute(styleAttrName, styleAttrVal);
          }
        }
        node.removeAttribute('style');
      }
    }

    $.each(seAttrs, function(i, attr) {
      node.setAttributeNS(NS.SE, attr[0], attr[1]);
    });

    // for some elements that have a xlink:href, ensure the URI refers to a local element
    // (but not for links)
    var href = svgedit.utilities.getHref(node);
    if (href &&
      ['filter', 'linearGradient', 'pattern',
      'radialGradient', 'textPath', 'use'].indexOf(node.nodeName) >= 0) {
      // TODO: we simply check if the first character is a #, is this bullet-proof?
      if (href[0] != '#') {
        // remove the attribute (but keep the element)
        svgedit.utilities.setHref(node, '');
        node.removeAttributeNS(NS.XLINK, 'href');
      }
    }

    // Safari crashes on a <use> without a xlink:href, so we just remove the node here
    if (node.nodeName == 'use' && !svgedit.utilities.getHref(node)) {
      parent.removeChild(node);
      return;
    }
    // if the element has attributes pointing to a non-local reference,
    // need to remove the attribute
    $.each(['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'], function(i, attr) {
      var val = node.getAttribute(attr);
      if (val) {
        val = svgedit.utilities.getUrlFromAttr(val);
        // simply check for first character being a '#'
        if (val && val[0] !== '#') {
          node.setAttribute(attr, '');
          node.removeAttribute(attr);
        }
      }
    });

    // recurse to children
    i = node.childNodes.length;
    while (i--) { svgedit.sanitize.sanitizeSvg(node.childNodes.item(i)); }
  }
  // else (element not supported), remove it
  else {
    // remove all children from this node and insert them before this node
    // FIXME: in the case of animation elements this will hardly ever be correct
    var children = [];
    while (node.hasChildNodes()) {
      children.push(parent.insertBefore(node.firstChild, node));
    }

    // remove this node from the document altogether
    parent.removeChild(node);

    // call sanitizeSvg on each of those children
    i = children.length;
    while (i--) { svgedit.sanitize.sanitizeSvg(children[i]); }
  }
};

}());
