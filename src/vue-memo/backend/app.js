const express = require('express');
const db = require('mysql2/promise'); // 우리가 만든 db 모듈 불러오기

const app = express();

app.get('/users', async (req, res) => {
  try {
    const rows = await db.query('SELECT now() from dual');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Database Error');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
