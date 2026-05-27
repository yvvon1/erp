const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET /api/employees
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 직원ID, 이름, 이메일, 직무, 부서, 재직여부 FROM 직원",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// GET /api/employees/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 직원ID, 이름, 이메일, 직무, 부서, 재직여부 FROM 직원 WHERE 직원ID = ?",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "없는 직원입니다." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// POST /api/employees - 비밀번호 해시화 포함
router.post("/", async (req, res) => {
  const { 직원ID, 이름, 이메일, 비밀번호, 직무, 부서 } = req.body;
  try {
    const hash = await bcrypt.hash(비밀번호 || "1234", 10);
    await db.query(
      'INSERT INTO 직원 (직원ID, 이름, 이메일, 비밀번호, 직무, 부서, 재직여부) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE")',
      [직원ID, 이름, 이메일, hash, 직무, 부서],
    );
    res.status(201).json({ message: "등록 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// PUT /api/employees/:id
router.put("/:id", async (req, res) => {
  const { 이름, 이메일, 직무, 부서, 재직여부 } = req.body;
  try {
    await db.query(
      "UPDATE 직원 SET 이름=?, 이메일=?, 직무=?, 부서=?, 재직여부=? WHERE 직원ID=?",
      [이름, 이메일, 직무, 부서, 재직여부, req.params.id],
    );
    res.json({ message: "수정 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
