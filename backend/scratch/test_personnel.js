const http = require('http');

const data = JSON.stringify({
  prenom: 'Test',
  nom: 'Medecin',
  email: 'testmedecin' + Date.now() + '@clinic.com',
  role: 'medecin',
  id_admin: 1
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/personnel',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-admin-role': 'super_admin'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
