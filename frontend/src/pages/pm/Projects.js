import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getProjects, createProject } from "../../api/projects";
import { getClients } from "../../api/clients";
import { formatDate, statusLabel, statusTone, typeLabel } from "../../utils/format";

const emptyForm = {
  프로젝트ID: "",
  클라이언트ID: "",
  프로젝트명: "",
  프로젝트유형: "NEW",
  계약일: "",
  착수일: "",
  납기일: "",
  설명: "",
};

export default function PMProjects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  const refresh = () => getProjects().then((res) => setProjects(res.data));

  useEffect(() => {
    refresh();
    getClients().then((res) => setClients(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.프로젝트ID || !form.클라이언트ID || !form.프로젝트명) return;
    await createProject({ ...form, 상태: "PLANNING" });
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  return (
    <Layout active="프로젝트 목록">
      <header className="page-header">
        <div>
          <h1 className="page-title">프로젝트 목록</h1>
          <div className="page-subtitle">진행 상태와 납기일을 한눈에 확인합니다.</div>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} type="button">
          + 새 프로젝트
        </button>
      </header>

      <section className="glass-grid cards-grid">
        {projects.map((project) => (
          <article
            className="glass-card clickable"
            key={project.프로젝트ID}
            onClick={() => navigate(`/pm/projects/${project.프로젝트ID}`)}
          >
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="tile-icon">{project.프로젝트명?.[0] || "P"}</div>
              <div className="row-main">
                <div className="row-title">{project.프로젝트명}</div>
                <div className="row-meta">{project.회사명 || "-"}</div>
              </div>
              <span className={`badge ${statusTone[project.상태] || "neutral"}`}>
                {statusLabel[project.상태] || project.상태}
              </span>
            </div>
            <span className="badge neutral">{typeLabel[project.프로젝트유형]}</span>
            <div className="list-row" style={{ marginTop: 8 }}>
              <div className="row-main">
                <div className="row-meta">착수일</div>
                <div className="row-title">{formatDate(project.착수일)}</div>
              </div>
              <div className="row-main">
                <div className="row-meta">납기일</div>
                <div className="row-title">{formatDate(project.납기일)}</div>
              </div>
            </div>
          </article>
        ))}
        {projects.length === 0 && <div className="glass-card empty-state">등록된 프로젝트가 없습니다.</div>}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">새 프로젝트 등록</h2>
            <div className="form-grid">
              <div className="field">
                <label className="label">프로젝트ID</label>
                <input className="input" placeholder="PRJ-2025-001" value={form.프로젝트ID} onChange={(e) => setForm({ ...form, 프로젝트ID: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">유형</label>
                <select className="select" value={form.프로젝트유형} onChange={(e) => setForm({ ...form, 프로젝트유형: e.target.value })}>
                  <option value="NEW">신규개발</option>
                  <option value="RENEWAL">리뉴얼</option>
                  <option value="MAINTENANCE">유지보수</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">프로젝트명</label>
              <input className="input" value={form.프로젝트명} onChange={(e) => setForm({ ...form, 프로젝트명: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">클라이언트</label>
              <select className="select" value={form.클라이언트ID} onChange={(e) => setForm({ ...form, 클라이언트ID: e.target.value })}>
                <option value="">선택</option>
                {clients.map((client) => (
                  <option key={client.클라이언트ID} value={client.클라이언트ID}>
                    {client.회사명}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid">
              {["계약일", "착수일", "납기일"].map((key) => (
                <div className="field" key={key}>
                  <label className="label">{key}</label>
                  <input className="input" type="date" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="field">
              <label className="label">설명</label>
              <textarea className="textarea" value={form.설명} onChange={(e) => setForm({ ...form, 설명: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)} type="button">취소</button>
              <button className="btn primary" onClick={handleSubmit} type="button">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
