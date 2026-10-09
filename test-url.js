const express = require('express');
const app = express();
app.use((req, res) => {
  console.log('originalUrl:', req.originalUrl);
  res.send('done');
  server.close();
});
const server = app.listen(0, () => {
  const http = require('http');
  http.get('http://127.0.0.1:' + server.address().port + '/test-xss-%3Cscript%3Ealert(1)%3C/script%3E');
});
