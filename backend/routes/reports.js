const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/reports/:projectId - 위클리리포트 목록
router.get('/:projectId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM 위클리리포트 WHERE 프로젝트ID = ? ORDER BY 차수',
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/reports/:projectId/:round - 단건 조회 + 상세
router.get('/:projectId/:round', async (req, res) => {
  try {
    const [report] = await db.query(
      'SELECT * FROM 위클리리포트 WHERE 프로젝트ID = ? AND 차수 = ?',
      [req.params.projectId, req.params.round]
    );
    const [details] = await db.query(`
      SELECT rd.*, e.이름, e.직무
      FROM 위클리리포트상세 rd
      LEFT JOIN 직원 e ON rd.직원ID = e.직원ID
      WHERE rd.프로젝트ID = ? AND rd.차수 = ?
    `, [req.params.projectId, req.params.round]);
    res.json({ report: report[0], details });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/reports - 위클리리포트 등록
router.post('/', async (req, res) => {
  const { 프로젝트ID, 차수, 회의일, 다음회의일, 요구사항, 피드백, 처리여부, 처리완료일 } = req.body;
  try {
    await db.query(
      'INSERT INTO 위클리리포트 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [프로젝트ID, 차수, 회의일, 다음회의일, 요구사항, 피드백, 처리여부, 처리완료일]
    );
    res.status(201).json({ message: '등록 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// PUT /api/reports/:projectId/:round - 수정 (피드백 반영)
router.put('/:projectId/:round', async (req, res) => {
  const { 피드백, 처리여부, 처리완료일, 요구사항 } = req.body;
  try {
    await db.query(
      'UPDATE 위클리리포트 SET 피드백=?, 처리여부=?, 처리완료일=?, 요구사항=? WHERE 프로젝트ID=? AND 차수=?',
      [피드백, 처리여부, 처리완료일, 요구사항, req.params.projectId, req.params.round]
    );
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/reports/detail - 상세 작성 (팀원)
router.post('/detail', async (req, res) => {
  const { 프로젝트ID, 차수, 직원ID, 작업유형, 작업내용, 진행률, 비고 } = req.body;
  try {
    await db.query(
      'INSERT INTO 위클리리포트상세 VALUES (?, ?, ?, ?, ?, ?, ?)',
      [프로젝트ID, 차수, 직원ID, 작업유형, 작업내용, 진행률, 비고]
    );
    res.status(201).json({ message: '상세 작성 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
