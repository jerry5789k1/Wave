const proxy = require('http-proxy-middleware');
    // module.exports = function(app) {
    // app.use(proxy('/api',{ target: 'http://localhost:3002/' }
    //   ));
    // }
var apiProxy = proxy('/api', {target: 'http://localhost:3002'});
app.use('/api',apiProxy)

module.exports = {apiProxy}