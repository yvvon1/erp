const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/deliverables/:projectId - 작업물 목록
router.get('/:projectId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.*, e.이름 AS 제출자명
      FROM 작업물 w
      LEFT JOIN 직원 e ON w.제출자ID = e.직원ID
      WHERE w.프로젝트ID = ?
      ORDER BY w.차수
    `, [req.params.projectId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/deliverables - 작업물 등록
router.post('/', async (req, res) => {
  const { 작업물ID, 프로젝트ID, 차수, 제출자ID, 파일명, 파일경로, 상태, 제출일 } = req.body;
  try {
    await db.query(
      'INSERT INTO 작업물 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [작업물ID, 프로젝트ID, 차수, 제출자ID, 파일명, 파일경로, 상태 || 'IN_REVIEW', 제출일]
    );
    res.status(201).json({ message: '작업물 등록 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// PUT /api/deliverables/:id/status - 상태 변경
router.put('/:id/status', async (req, res) => {
  const { 상태 } = req.body;
  try {
    await db.query(
      'UPDATE 작업물 SET 상태=? WHERE 작업물ID=?',
      [상태, req.params.id]
    );
    res.json({ message: '상태 변경 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
