import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getReports, createReport, updateReport, getReport } from "../../api/reports";
import { formatDate, roleLabel } from "../../utils/format";

const emptyForm = { 차수: "", 회의일: "", 다음회의일: "", 요구사항: "" };

export default function PMReports() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = useCallback(
    () => getReports(projectId).then((res) => setReports(res.data)),
    [projectId],
  );

  useEffect(() => {
    refresh();
  }, [projectId, refresh]);

  const handleSelect = async (round) => {
    const res = await getReport(projectId, round);
    setSelected(res.data.report);
    setDetails(res.data.details);
  };

  const handleCreate = async () => {
    if (!form.차수 || !form.회의일) return;
    await createReport({ ...form, 프로젝트ID: projectId, 처리여부: "IN_PROGRESS" });
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleUpdate = async () => {
    if (!selected) return;
    await updateReport(projectId, selected.차수, selected);
    refresh();
    alert("저장됐습니다.");
  };

  return (
    <Layout active="프로젝트 목록">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(`/pm/projects/${projectId}`)} type="button">← 프로젝트로</button>
          <h1 className="page-title">위클리리포트</h1>
          <div className="page-subtitle">회의 차수별 요구사항과 피드백 반영 상태를 관리합니다.</div>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} type="button">+ 새 보고 등록</button>
      </header>

      <section className="glass-grid two-col">
        <aside className="glass-card">
          <div className="card-title">Report List</div>
          {reports.map((report) => (
            <div className={`list-row clickable ${selected?.차수 === report.차수 ? "glass-card" : ""}`} key={report.차수} onClick={() => handleSelect(report.차수)}>
              <div className="tile-icon">{report.차수}</div>
              <div className="row-main">
                <div className="row-title">{report.차수}차 보고</div>
                <div className="row-meta">{formatDate(report.회의일)}</div>
              </div>
              <span className={`badge ${report.처리여부 === "DONE" ? "green" : "orange"}`}>{report.처리여부 === "DONE" ? "완료" : "진행"}</span>
            </div>
          ))}
          {reports.length === 0 && <div className="empty-state">보고서가 없습니다.</div>}
        </aside>

        {selected ? (
          <article className="glass-card">
            <div className="page-header">
              <h2 className="section-title">{selected.차수}차 보고 상세</h2>
              <button className="btn primary" onClick={handleUpdate} type="button">저장</button>
            </div>
            <div className="form-grid">
              <DateField label="회의일" value={selected.회의일} onChange={(value) => setSelected({ ...selected, 회의일: value })} />
              <DateField label="다음 회의일" value={selected.다음회의일} onChange={(value) => setSelected({ ...selected, 다음회의일: value })} />
            </div>
            <TextArea label="요구사항" value={selected.요구사항 || ""} onChange={(value) => setSelected({ ...selected, 요구사항: value })} />
            <TextArea label="피드백" value={selected.피드백 || ""} onChange={(value) => setSelected({ ...selected, 피드백: value })} />
            <div className="field">
              <label className="label">처리여부</label>
              <select className="select" value={selected.처리여부 || ""} onChange={(e) => setSelected({ ...selected, 처리여부: e.target.value })}>
                <option value="IN_PROGRESS">반영중</option>
                <option value="DONE">반영완료</option>
              </select>
            </div>

            <h3 className="section-title" style={{ marginTop: 22 }}>팀원 작업내용</h3>
            {details.map((detail) => (
              <div className="glass-card" key={detail.직원ID} style={{ padding: 14, marginBottom: 10 }}>
                <div className="list-row" style={{ borderBottom: 0, padding: 0 }}>
                  <div className="avatar">{detail.이름?.[0] || "M"}</div>
                  <div className="row-main">
                    <div className="row-title">{detail.이름}</div>
                    <div className="row-meta">{detail.직무} · {roleLabel[detail.작업유형] || detail.작업유형} · 진행률 {detail.진행률}%</div>
                  </div>
                </div>
                <div className="progress-track" style={{ marginTop: 12 }}>
                  <div className="progress-fill" style={{ width: `${detail.진행률 || 0}%` }} />
                </div>
                <div className="page-subtitle">{detail.작업내용}</div>
              </div>
            ))}
            {details.length === 0 && <div className="empty-state">제출된 작업내용이 없습니다.</div>}
          </article>
        ) : (
          <div className="glass-card empty-state">왼쪽에서 보고서를 선택하세요.</div>
        )}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">새 보고 등록</h2>
            <Field label="차수" value={form.차수} onChange={(value) => setForm({ ...form, 차수: value })} placeholder="1" />
            <div className="form-grid">
              <DateField label="회의일" value={form.회의일} onChange={(value) => setForm({ ...form, 회의일: value })} />
              <DateField label="다음 회의일" value={form.다음회의일} onChange={(value) => setForm({ ...form, 다음회의일: value })} />
            </div>
            <TextArea label="요구사항" value={form.요구사항} onChange={(value) => setForm({ ...form, 요구사항: value })} />
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)} type="button">취소</button>
              <button className="btn primary" onClick={handleCreate} type="button">등록</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return <div className="field"><label className="label">{label}</label><input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function DateField({ label, value, onChange }) {
  return <div className="field"><label className="label">{label}</label><input className="input" type="date" value={value?.slice?.(0, 10) || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="field"><label className="label">{label}</label><textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
