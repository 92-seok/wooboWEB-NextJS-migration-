# Node.js + MySQL/MariaDB 연결 방식 정리

MySQL/MariaDB와 Node.js를 연결하는 대표적인 3가지 방식입니다.  

---

## 📦 설치
```bash
npm install express mysql2 mariadb
```

---

## 1️⃣ mysql2/promise (추천, async/await)

### database.js
```js
// backend/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '비밀번호',
  database: 'mydb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### app.js
```js
const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// SELECT 예제
app.get('/memos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM memos');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB Error');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## 2️⃣ mysql2 (콜백 방식)

### database.js
```js
// backend/database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '비밀번호',
  database: 'mydb',
  port: 3306
});

module.exports = connection;
```

### app.js
```js
const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// SELECT 예제
app.get('/memos', (req, res) => {
  db.query('SELECT * FROM memos', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('DB Error');
    }
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## 3️⃣ mariadb 드라이버 (공식 지원)

### database.js
```js
// backend/database.js
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '비밀번호',
  database: 'mydb',
  port: 3306,
  connectionLimit: 5
});

module.exports = pool;
```

### app.js
```js
const express = require('express');
const pool = require('./database');
const app = express();

app.use(express.json());

// SELECT 예제
app.get('/memos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM memos');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB Error');
  } finally {
    if (conn) conn.release();
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## 📝 테이블 예시
```sql
CREATE TABLE memos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ 요약
- `mysql2/promise` → **async/await 지원** (대세, 추천)  
- `mysql2` (콜백) → 레거시 스타일, 간단하지만 비동기 처리 불편  
- `mariadb` → MariaDB 공식 드라이버, 안정적  
