const http = require('http');
http.get('http://localhost:3000', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log(d.slice(0, 2000));
  });
}).on('error', e => console.error('ERR', e));
