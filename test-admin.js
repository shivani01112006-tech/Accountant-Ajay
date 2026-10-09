const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const req = http.request(options, (res) => {
  const setCookie = res.headers['set-cookie'];
  if (res.statusCode === 302 && setCookie) {
    const cookie = setCookie[0].split(';')[0];
    
    // Fetch dashboard
    http.get('http://localhost:3000/admin/dashboard', { headers: { 'Cookie': cookie } }, (dashRes) => {
      let data = '';
      dashRes.on('data', chunk => data += chunk);
      dashRes.on('end', () => {
        if (data.includes('Showing 1 of 1 records') && data.includes('Test User')) {
          console.log('SUCCESS: Admin Dashboard works and shows the test submission.');
        } else {
          console.error('FAILED: Dashboard data does not match expectations.', data);
        }
      });
    });
  } else {
    console.error('Login failed.', res.statusCode);
  }
});

req.write('username=admin%40ajaysingla.com&password=AdminSecure123!');
req.end();
