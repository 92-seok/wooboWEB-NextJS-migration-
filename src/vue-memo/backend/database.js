// backend/database.js
const mysql = require('mysql2/promise');

// 커넥션 풀 생성
const pool = mysql.createPool({
  host: '211.105.45.86',     // DB 서버 주소
  port: 3306,            // 기본 포트
  user: 'WBEarly',          // DB 사용자
  password: '#woobosys@early!',   // DB 비밀번호
  database: 'memo',      // 사용할 DB 이름
  // connectionLimit: 5     // 최대 커넥션 개수
});

// 쿼리 실행용 함수
async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  } finally {
    if (conn) conn.release(); // 커넥션 반환
  }
}

module.exports = { query };
