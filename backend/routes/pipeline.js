const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/pipeline
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM 수주파이프라인 ORDER BY 등록일 DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// POST /api/pipeline
router.post("/", async (req, res) => {
  const { 파이프라인ID, 사업명, 발주처, 예상금액, 마감일, 단계, 메모 } =
    req.body;
  try {
    await db.query(
      "INSERT INTO 수주파이프라인 (파이프라인ID, 사업명, 발주처, 예상금액, 마감일, 단계, 메모) VALUES (?,?,?,?,?,?,?)",
      [
        파이프라인ID,
        사업명,
        발주처,
        예상금액 || 0,
        마감일 || null,
        단계 || "RFP",
        메모 || null,
      ],
    );
    res.status(201).json({ message: "등록 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// PUT /api/pipeline/:id — 단계 또는 전체 수정
router.put("/:id", async (req, res) => {
  const { 사업명, 발주처, 예상금액, 마감일, 단계, 메모 } = req.body;
  try {
    await db.query(
      "UPDATE 수주파이프라인 SET 사업명=?, 발주처=?, 예상금액=?, 마감일=?, 단계=?, 메모=? WHERE 파이프라인ID=?",
      [
        사업명,
        발주처,
        예상금액 || 0,
        마감일 || null,
        단계,
        메모 || null,
        req.params.id,
      ],
    );
    res.json({ message: "수정 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// DELETE /api/pipeline/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM 수주파이프라인 WHERE 파이프라인ID=?", [
      req.params.id,
    ]);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
