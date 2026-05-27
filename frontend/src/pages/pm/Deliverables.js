import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getDeliverables, createDeliverable, updateStatus } from "../../api/deliverables";
import { createResult } from "../../api/results";
import { formatDate, reviewLabel, reviewTone } from "../../utils/format";

const emptyForm = {
  작업물ID: "",
  차수: "",
  제출자ID: "",
  파일명: "",
  파일경로: "",
  제출일: "",
};

export default function PMDeliverables() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = useCallback(
    () => getDeliverables(projectId).then((res) => setDeliverables(res.data)),
    [projectId],
  );

  useEffect(() => {
    refresh();
  }, [projectId, refresh]);

  const handleCreate = async () => {
    if (!form.작업물ID || !form.차수 || !form.제출자ID || !form.파일명) return;
    await createDeliverable({ ...form, 프로젝트ID: projectId, 상태: "IN_REVIEW" });
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleStatusChange = async (id, status) => {
    await updateStatus(id, { 상태: status });
    refresh();
  };

  const handleRegisterResult = async (deliverable) => {
    const resultId = `RES-${Date.now()}`;
    await createResult({
      결과물ID: resultId,
      프로젝트ID: projectId,
      작업물ID: deliverable.작업물ID,
      납품일: new Date().toISOString().slice(0, 10),
    });
    alert("결과물 등록 및 프로젝트 종료 완료");
    navigate(`/pm/projects/${projectId}`);
  };

  return (
    <Layout active="프로젝트 목록">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(`/pm/projects/${projectId}`)} type="button">← 프로젝트로</button>
          <h1 className="page-title">작업물 관리</h1>
          <div className="page-subtitle">검토 상태를 바꾸고 최종 승인본을 결과물로 등록합니다.</div>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} type="button">+ 작업물 등록</button>
      </header>

      <section className="glass-grid cards-grid">
        {deliverables.map((item) => (
          <article className="glass-card" key={item.작업물ID}>
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="tile-icon">v{item.차수}</div>
              <div className="row-main">
                <div className="row-title">{item.파일명}</div>
                <div className="row-meta">{item.제출자명 || "-"} · {formatDate(item.제출일)}</div>
              </div>
              <span className={`badge ${reviewTone[item.상태] || "neutral"}`}>{reviewLabel[item.상태]}</span>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="label">상태</label>
              <select className="select" value={item.상태} onChange={(e) => handleStatusChange(item.작업물ID, e.target.value)}>
                <option value="IN_REVIEW">검토중</option>
                <option value="REVISION">수정요청</option>
                <option value="APPROVED">최종승인</option>
              </select>
            </div>
            {item.상태 === "APPROVED" && (
              <button className="btn primary" onClick={() => handleRegisterResult(item)} type="button" style={{ width: "100%" }}>
                결과물로 등록 →
              </button>
            )}
          </article>
        ))}
        {deliverables.length === 0 && <div className="glass-card empty-state">등록된 작업물이 없습니다.</div>}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">작업물 등록</h2>
            <div className="form-grid">
              <Field label="작업물ID" value={form.작업물ID} onChange={(value) => setForm({ ...form, 작업물ID: value })} placeholder="WRK-2025-001" />
              <Field label="차수" value={form.차수} onChange={(value) => setForm({ ...form, 차수: value })} placeholder="1" />
            </div>
            <Field label="제출자ID" value={form.제출자ID} onChange={(value) => setForm({ ...form, 제출자ID: value })} placeholder="EMP-2025-001" />
            <Field label="파일명" value={form.파일명} onChange={(value) => setForm({ ...form, 파일명: value })} />
            <Field label="파일경로" value={form.파일경로} onChange={(value) => setForm({ ...form, 파일경로: value })} placeholder="/files/..." />
            <div className="field">
              <label className="label">제출일</label>
              <input className="input" type="date" value={form.제출일} onChange={(e) => setForm({ ...form, 제출일: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)} type="button">취소</button>
              <button className="btn primary" onClick={handleCreate} type="button">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
