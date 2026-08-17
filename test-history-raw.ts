import { config } from './src/config/env.js';

const url = new URL('https://api.etherscan.io/v2/api');
url.searchParams.set('chainid', '11155111');
url.searchParams.set('module', 'account');
url.searchParams.set('action', 'txlist');
url.searchParams.set('address', '0xB16b418ceE824c7918461e8038116896F186e199');
url.searchParams.set('startblock', '0');
url.searchParams.set('endblock', '99999999');
url.searchParams.set('page', '1');
url.searchParams.set('offset', '5');
url.searchParams.set('sort', 'desc');
url.searchParams.set('apikey', config.etherscanApiKey);

const res = await fetch(url);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));