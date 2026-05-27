const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/clients - 전체 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM 클라이언트');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/clients/:id - 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM 클라이언트 WHERE 클라이언트ID = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '없는 클라이언트입니다.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/clients - 등록
router.post('/', async (req, res) => {
  const { 클라이언트ID, 회사명, 업종, 담당자명, 담당자이메일, 연락처 } = req.body;
  try {
    await db.query(
      'INSERT INTO 클라이언트 VALUES (?, ?, ?, ?, ?, ?)',
      [클라이언트ID, 회사명, 업종, 담당자명, 담당자이메일, 연락처]
    );
    res.status(201).json({ message: '등록 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// PUT /api/clients/:id - 수정
router.put('/:id', async (req, res) => {
  const { 회사명, 업종, 담당자명, 담당자이메일, 연락처 } = req.body;
  try {
    await db.query(
      'UPDATE 클라이언트 SET 회사명=?, 업종=?, 담당자명=?, 담당자이메일=?, 연락처=? WHERE 클라이언트ID=?',
      [회사명, 업종, 담당자명, 담당자이메일, 연락처, req.params.id]
    );
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// DELETE /api/clients/:id - 삭제
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM 클라이언트 WHERE 클라이언트ID = ?', [req.params.id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
