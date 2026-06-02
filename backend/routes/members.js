// backend/routes/members.js
// 기존 구조 유지 + capacity 엔드포인트 + 투입률 검증 추가
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ── GET /api/members/capacity — 전 직원 투입률 현황
// ※ /:projectId 보다 위에 있어야 라우팅 충돌 없음
router.get("/capacity", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         e.직원ID,
         e.이름,
         e.직무,
         e.부서,
         COALESCE(SUM(pm.투입률), 0)       AS 현재투입률,
         100 - COALESCE(SUM(pm.투입률), 0) AS 가용률
       FROM 직원 e
       LEFT JOIN 프로젝트멤버 pm ON e.직원ID = pm.직원ID
       LEFT JOIN 프로젝트 p     ON pm.프로젝트ID = p.프로젝트ID
                                AND p.상태 = 'IN_PROGRESS'
       WHERE e.재직여부 = 'ACTIVE'
       GROUP BY e.직원ID, e.이름, e.직무, e.부서
       ORDER BY 현재투입률 DESC`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ── GET /api/members/:projectId — 프로젝트 팀원 조회
router.get("/:projectId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pm.*, e.이름, e.이메일, e.직무, e.부서
       FROM 프로젝트멤버 pm
       LEFT JOIN 직원 e ON pm.직원ID = e.직원ID
       WHERE pm.프로젝트ID = ?`,
      [req.params.projectId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ── POST /api/members — 팀원 추가 (투입률 검증 포함)
router.post("/", async (req, res) => {
  const {
    프로젝트ID,
    직원ID,
    담당롤,
    투입일,
    투입종료일,
    투입률 = 100,
  } = req.body;
  try {
    // 1. 현재 투입률 합계 조회 (진행중 프로젝트 기준)
    const [[cap]] = await db.query(
      `SELECT COALESCE(SUM(pm.투입률), 0) AS 현재투입률
       FROM 프로젝트멤버 pm
       JOIN 프로젝트 p ON pm.프로젝트ID = p.프로젝트ID
       WHERE pm.직원ID = ? AND p.상태 = 'IN_PROGRESS'`,
      [직원ID],
    );

    // 2. 100% 초과 검증
    if (cap.현재투입률 + Number(투입률) > 100) {
      return res.status(400).json({
        message: `투입률 초과: 현재 ${cap.현재투입률}% 투입 중, ${투입률}% 추가 시 ${cap.현재투입률 + Number(투입률)}%`,
        현재투입률: cap.현재투입률,
        가용률: 100 - cap.현재투입률,
      });
    }

    // 3. 중복 배정 확인
    const [[dup]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM 프로젝트멤버
       WHERE 프로젝트ID = ? AND 직원ID = ?`,
      [프로젝트ID, 직원ID],
    );
    if (dup.cnt > 0) {
      return res.status(400).json({ message: "이미 배정된 팀원입니다." });
    }

    // 4. 삽입
    await db.query(
      `INSERT INTO 프로젝트멤버 (프로젝트ID, 직원ID, 담당롤, 투입일, 투입종료일, 투입률)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [프로젝트ID, 직원ID, 담당롤, 투입일, 투입종료일, 투입률],
    );
    res.status(201).json({ message: "팀원 추가 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ── DELETE /api/members/:projectId/:employeeId — 팀원 삭제
router.delete("/:projectId/:employeeId", async (req, res) => {
  try {
    await db.query("DELETE FROM 프로젝트멤버 WHERE 프로젝트ID=? AND 직원ID=?", [
      req.params.projectId,
      req.params.employeeId,
    ]);
    res.json({ message: "팀원 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
