const express = require("express");
const app = express("express");
const mysql = require("./database");
const PORT = 3000;

// const bodyParser = require('body-parser');


// 미들웨어 설정
app.use(express.json());
// app.use(cors());

// READ (전체 메모 조회)
app.get('/api/memos', async (req, res) => {
  try {
    const [rows] = await mysql.query("SELECT * from memos");
    res.json(rows);
  } catch (err) {
    console.error('Error Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// CREATE (새 메모 추가)
app.post('/api/memos', async (req, res) => {
  try {
    const { content } = req.body;
    await mysql.query('INSERT INTO memos (content) VALUES(?)', [content]);
    const [rows]  = await mysql.query("SELECT * from memos");
    res.json(rows);
  } catch (err) {
    console.error('DB  Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE (메모 수정)
app.put('/api/memos/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    await mysql.query( 'UPDATE memos SET content = ? WHERE id = ?', [content, id]);
    const [rows]  = await mysql.query("SELECT * from memos");
    res.json(rows);
  } catch (err) {
    console.error('DB  Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE (메모 삭제)
app.delete('/api/memos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await mysql.query( 'DELETE FROM memos WHERE id = ?', [id]);
    const [rows]  = await mysql.query("SELECT * from memos");
    res.json(rows);
  } catch (err) {
    console.error('DB  Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  };
});
// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});