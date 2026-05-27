import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getReports, createReportDetail } from "../../api/reports";
import { formatDate, roleLabel } from "../../utils/format";
import { getStoredUser } from "../../utils/session";

export default function MemberReportDetail() {
  const { projectId, round } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const [reports, setReports] = useState([]);
  const [selectedRound, setSelectedRound] = useState(round || "");
  const [form, setForm] = useState({
    작업유형: "FRONT",
    작업내용: "",
    진행률: 50,
    비고: "",
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    getReports(projectId).then((res) => {
      setReports(res.data);
      if (!round && res.data.length > 0) {
        setSelectedRound(res.data[res.data.length - 1].차수);
      }
    });
  }, [projectId, round]);

  const handleSubmit = async () => {
    if (!selectedRound || !form.작업내용.trim()) return;
    await createReportDetail({
      프로젝트ID: projectId,
      차수: selectedRound,
      직원ID: user.직원ID,
      ...form,
    });
    setDone(true);
  };

  if (done) {
    return (
      <Layout active="내 대시보드">
        <section className="glass-card empty-state" style={{ minHeight: 420 }}>
          <div>
            <div className="tile-icon" style={{ margin: "0 auto 16px" }}>✓</div>
            <h1 className="page-title">작업내용 제출 완료</h1>
            <div className="page-subtitle">위클리리포트 상세가 성공적으로 저장됐습니다.</div>
            <button className="btn primary" onClick={() => navigate("/member/dashboard")} type="button" style={{ marginTop: 18 }}>
              대시보드로 돌아가기
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout active="내 대시보드">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate("/member/dashboard")} type="button">← 대시보드로</button>
          <h1 className="page-title">위클리리포트 작성</h1>
          <div className="page-subtitle">이번 주 작업 내용과 진행률을 제출합니다.</div>
        </div>
      </header>

      <section className="glass-card" style={{ maxWidth: 720 }}>
        <div className="field">
          <label className="label">보고 차수 선택</label>
          <select className="select" value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}>
            {reports.map((report) => (
              <option key={report.차수} value={report.차수}>
                {report.차수}차 보고 ({formatDate(report.회의일)})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">작업 유형</label>
          <select className="select" value={form.작업유형} onChange={(e) => setForm({ ...form, 작업유형: e.target.value })}>
            {["FRONT", "BACK", "REVIEW", "PLANNING", "ETC"].map((type) => (
              <option key={type} value={type}>{roleLabel[type]}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">작업 내용</label>
          <textarea
            className="textarea"
            placeholder="이번 주 작업한 내용을 상세히 입력하세요"
            value={form.작업내용}
            onChange={(e) => setForm({ ...form, 작업내용: e.target.value })}
          />
        </div>

        <div className="field">
          <div className="list-row" style={{ borderBottom: 0, padding: 0 }}>
            <label className="label" style={{ marginBottom: 0 }}>진행률</label>
            <span className="badge blue">{form.진행률}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={form.진행률}
            onChange={(e) => setForm({ ...form, 진행률: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${form.진행률}%` }} />
          </div>
        </div>

        <div className="field">
          <label className="label">비고</label>
          <input className="input" placeholder="특이사항이 있으면 입력하세요" value={form.비고} onChange={(e) => setForm({ ...form, 비고: e.target.value })} />
        </div>

        <button className="btn primary" onClick={handleSubmit} type="button" style={{ width: "100%" }}>
          제출하기
        </button>
      </section>
    </Layout>
  );
}
