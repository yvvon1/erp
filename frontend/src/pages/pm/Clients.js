import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getClients, createClient, deleteClient } from "../../api/clients";

const emptyForm = {
  클라이언트ID: "",
  회사명: "",
  업종: "",
  담당자명: "",
  담당자이메일: "",
  연락처: "",
};

export default function PMClients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => getClients().then((res) => setClients(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async () => {
    if (!form.클라이언트ID || !form.회사명) return;
    await createClient(form);
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("클라이언트를 삭제하시겠습니까?")) return;
    await deleteClient(id);
    refresh();
  };

  return (
    <Layout active="클라이언트">
      <header className="page-header">
        <div>
          <h1 className="page-title">클라이언트</h1>
          <div className="page-subtitle">고객사와 담당자 정보를 관리합니다.</div>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} type="button">
          + 클라이언트 등록
        </button>
      </header>

      <section className="glass-grid cards-grid">
        {clients.map((client) => (
          <article className="glass-card" key={client.클라이언트ID}>
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="tile-icon">{client.회사명?.[0] || "C"}</div>
              <div className="row-main">
                <div className="row-title">{client.회사명}</div>
                <div className="row-meta">{client.업종 || "-"}</div>
              </div>
            </div>
            <div className="list-row">
              <div className="row-main">
                <div className="row-title">{client.담당자명 || "-"}</div>
                <div className="row-meta">{client.담당자이메일 || "-"}</div>
              </div>
            </div>
            <div className="list-row" style={{ borderBottom: 0 }}>
              <div className="row-main">
                <div className="row-meta">연락처</div>
                <div className="row-title">{client.연락처 || "-"}</div>
              </div>
              <button className="btn danger" onClick={() => handleDelete(client.클라이언트ID)} type="button">
                삭제
              </button>
            </div>
          </article>
        ))}
        {clients.length === 0 && <div className="glass-card empty-state">등록된 클라이언트가 없습니다.</div>}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">클라이언트 등록</h2>
            <div className="form-grid">
              <Field label="클라이언트ID" value={form.클라이언트ID} onChange={(value) => setForm({ ...form, 클라이언트ID: value })} placeholder="CLI-2025-001" />
              <Field label="업종" value={form.업종} onChange={(value) => setForm({ ...form, 업종: value })} placeholder="이커머스" />
            </div>
            <Field label="회사명" value={form.회사명} onChange={(value) => setForm({ ...form, 회사명: value })} />
            <div className="form-grid">
              <Field label="담당자명" value={form.담당자명} onChange={(value) => setForm({ ...form, 담당자명: value })} />
              <Field label="연락처" value={form.연락처} onChange={(value) => setForm({ ...form, 연락처: value })} placeholder="010-0000-0000" />
            </div>
            <Field label="이메일" value={form.담당자이메일} onChange={(value) => setForm({ ...form, 담당자이메일: value })} placeholder="email@company.com" />
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

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
