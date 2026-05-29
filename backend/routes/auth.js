const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { 직원ID, 비밀번호 } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM 직원 WHERE 직원ID = ? AND 재직여부 = "ACTIVE"',
      [직원ID],
    );
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(비밀번호, user.비밀번호);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }
    res.json({
      직원ID: user.직원ID,
      이름: user.이름,
      이메일: user.이메일,
      직무: user.직무,
      부서: user.부서,
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
