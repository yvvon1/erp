const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/results/:projectId - 결과물 조회
router.get('/:projectId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, w.파일명, w.파일경로, w.차수
      FROM 결과물 r
      LEFT JOIN 작업물 w ON r.작업물ID = w.작업물ID
      WHERE r.프로젝트ID = ?
    `, [req.params.projectId]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/results - 결과물 등록 (최종 납품)
router.post('/', async (req, res) => {
  const { 결과물ID, 프로젝트ID, 작업물ID, 납품일, 비고 } = req.body;
  try {
    // 작업물 상태 확인
    const [w] = await db.query('SELECT 상태 FROM 작업물 WHERE 작업물ID = ?', [작업물ID]);
    if (w[0]?.상태 !== 'APPROVED') {
      return res.status(400).json({ message: '최종승인된 작업물만 결과물로 등록 가능합니다.' });
    }
    await db.query(
      'INSERT INTO 결과물 VALUES (?, ?, ?, ?, ?)',
      [결과물ID, 프로젝트ID, 작업물ID, 납품일, 비고]
    );
    // 프로젝트 상태 종료로 변경
    await db.query(
      'UPDATE 프로젝트 SET 상태=?, 완료일=? WHERE 프로젝트ID=?',
      ['CLOSED', 납품일, 프로젝트ID]
    );
    res.status(201).json({ message: '결과물 등록 및 프로젝트 종료 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
