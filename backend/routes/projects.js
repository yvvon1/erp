const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/projects - 전체 조회 (클라이언트 정보 JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.회사명, c.담당자명
      FROM 프로젝트 p
      LEFT JOIN 클라이언트 c ON p.클라이언트ID = c.클라이언트ID
      ORDER BY p.착수일 DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/projects/:id - 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.회사명, c.담당자명, c.담당자이메일, c.연락처
      FROM 프로젝트 p
      LEFT JOIN 클라이언트 c ON p.클라이언트ID = c.클라이언트ID
      WHERE p.프로젝트ID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '없는 프로젝트입니다.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/projects - 등록
router.post('/', async (req, res) => {
  const { 프로젝트ID, 클라이언트ID, 프로젝트명, 프로젝트유형, 상태, 계약일, 착수일, 납기일, 완료일, 설명 } = req.body;
  try {
    await db.query(
      'INSERT INTO 프로젝트 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [프로젝트ID, 클라이언트ID, 프로젝트명, 프로젝트유형, 상태 || 'PLANNING', 계약일, 착수일, 납기일, 완료일, 설명]
    );
    res.status(201).json({ message: '등록 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// PUT /api/projects/:id - 수정
router.put('/:id', async (req, res) => {
  const { 프로젝트명, 프로젝트유형, 상태, 계약일, 착수일, 납기일, 완료일, 설명 } = req.body;
  try {
    await db.query(
      'UPDATE 프로젝트 SET 프로젝트명=?, 프로젝트유형=?, 상태=?, 계약일=?, 착수일=?, 납기일=?, 완료일=?, 설명=? WHERE 프로젝트ID=?',
      [프로젝트명, 프로젝트유형, 상태, 계약일, 착수일, 납기일, 완료일, 설명, req.params.id]
    );
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
