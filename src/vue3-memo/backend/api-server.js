const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const mysql = require('./database');

// 임시 메모 데이터

const memos = [];

app.use(bodyParser.json());

// 기본 라우트
app.get('/api/memos', async (req, res) => {
  const [ result ] = await mysql.query("SELECT * from memos");
  res.send(result);
});

app.post('/api/memos', async (req, res) => {
  await mysql.query(`INSERT INTO memos (content) VALUES('${req.body.content}')`);
  const result  = await mysql.query("SELECT * from memos");
  res.send(result);
});

app.put('/api/memos/:id', async (req, res) => {
  await mysql.query(`UPDATE memos SET content = '${req.body.content}' WHERE id = ${req.params.id}`);
  const result  = await mysql.query("SELECT * from memos");
  res.send(result);
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});