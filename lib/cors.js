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

Meteor.startup(function () {
    if(Meteor.isServer){
          WebApp.connectHandlers.use(function (req, res, next) {
            //res.setHeader('Access-Control-Allow-Origin', "http://"+req.headers.host
            //res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
            res.setHeader("Access-Control-Allow-Origin", "*");
            //console.log(res.getHeader("Access-Control-Allow-Origin"))
            //res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
            //res.setHeader("Access-Control-Max-Age", "3600");
            //res.setHeader("Access-Control-Allow-Headers", "x-requested-with");
            return next();
          })
    }
})

/*******************/
/*
HTTP.methods({
  '/test': function() {
    this.addHeader('Access-Control-Allow-Origin', '*');
    return someContents;
  }
});
*/