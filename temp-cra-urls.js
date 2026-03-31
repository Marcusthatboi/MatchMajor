const WebpackDevServerUtils = require('./node_modules/react-dev-utils/WebpackDevServerUtils');
const urls = WebpackDevServerUtils.prepareUrls('http', 'localhost', 3000, '/');
console.log(JSON.stringify(urls, null, 2));
