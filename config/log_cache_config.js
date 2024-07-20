const NodeCache = require('node-cache');
const requestCache = new NodeCache({stdTTL: 600, checkperiod: 120});
module.exports = requestCache;