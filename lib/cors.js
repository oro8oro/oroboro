/**
 * HTTP Header Security
 *
 * enforce HTTP Strict Transport Security (HSTS) to prevent ManInTheMiddle-attacks
 * on supported browsers (all but IE)
 * > http://www.html5rocks.com/en/tutorials/security/transport-layer-security
 *
 * @header Strict-Transport-Security: max-age=2592000; includeSubDomains
 */

//var connectHandler = WebApp.connectHandlers; // get meteor-core's connect-implementation

// attach connect-style middleware for response header injection
/*
Meteor.startup(function () {
  WebApp.connectHandlers.use(function (req, res, next) {
    //res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  })
})
*/
/*******************/
/*
HTTP.methods({
  '/test': function() {
    this.addHeader('Access-Control-Allow-Origin', '*');
    return someContents;
  }
});
*/