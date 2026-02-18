const http = require('http');
const url = 'http://localhost:3000/assets/tailwind-B03_oMNq.css';
http.get(url, (res) => {
  console.log('statusCode', res.statusCode);
  console.log('content-type', res.headers['content-type']);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('head:', d.slice(0,200)));
}).on('error', e => console.error('ERR', e));
