const https = require('https');

// Disabilita il controllo SSL per localhost
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/amazon/search?q=caffe&country=IT&limit=5',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

console.log('Testing:', `https://${options.hostname}:${options.port}${options.path}`);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.setTimeout(30000, () => {
  console.error('Request timeout');
  req.destroy();
});

req.end();