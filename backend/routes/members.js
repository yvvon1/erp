const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/members/:projectId - 프로젝트 팀원 조회
router.get('/:projectId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pm.*, e.이름, e.이메일, e.직무
      FROM 프로젝트멤버 pm
      LEFT JOIN 직원 e ON pm.직원ID = e.직원ID
      WHERE pm.프로젝트ID = ?
    `, [req.params.projectId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/members - 팀원 추가
router.post('/', async (req, res) => {
  const { 프로젝트ID, 직원ID, 담당롤, 투입일, 투입종료일 } = req.body;
  try {
    await db.query(
      'INSERT INTO 프로젝트멤버 VALUES (?, ?, ?, ?, ?)',
      [프로젝트ID, 직원ID, 담당롤, 투입일, 투입종료일]
    );
    res.status(201).json({ message: '팀원 추가 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// DELETE /api/members/:projectId/:employeeId - 팀원 삭제
router.delete('/:projectId/:employeeId', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM 프로젝트멤버 WHERE 프로젝트ID=? AND 직원ID=?',
      [req.params.projectId, req.params.employeeId]
    );
    res.json({ message: '팀원 삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
