import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getEmployees, createEmployee, updateEmployee } from "../../api/employees";

const emptyForm = {
  직원ID: "",
  이름: "",
  이메일: "",
  비밀번호: "1234",
  직무: "",
  부서: "",
};

export default function PMEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => getEmployees().then((res) => setEmployees(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async () => {
    if (!form.직원ID || !form.이름 || !form.직무) return;
    await createEmployee(form);
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleResign = async (employee) => {
    if (!window.confirm(`${employee.이름} 직원을 퇴사 처리하시겠습니까?`)) return;
    await updateEmployee(employee.직원ID, { ...employee, 재직여부: "RESIGNED" });
    refresh();
  };

  return (
    <Layout active="직원 관리">
      <header className="page-header">
        <div>
          <h1 className="page-title">직원 관리</h1>
          <div className="page-subtitle">계정, 직무, 재직 상태를 관리합니다.</div>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)} type="button">
          + 직원 등록
        </button>
      </header>

      <section className="glass-grid cards-grid">
        {employees.map((employee) => (
          <article className="glass-card" key={employee.직원ID}>
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="avatar">{employee.이름?.[0] || "E"}</div>
              <div className="row-main">
                <div className="row-title">{employee.이름}</div>
                <div className="row-meta">{employee.직무} · {employee.부서 || "-"}</div>
              </div>
              <span className={`badge ${employee.재직여부 === "ACTIVE" ? "green" : "red"}`}>
                {employee.재직여부 === "ACTIVE" ? "재직중" : "퇴사"}
              </span>
            </div>
            <div className="list-row">
              <div className="row-main">
                <div className="row-title">{employee.직원ID}</div>
                <div className="row-meta">{employee.이메일 || "-"}</div>
              </div>
            </div>
            {employee.재직여부 === "ACTIVE" && (
              <button className="btn danger" onClick={() => handleResign(employee)} type="button" style={{ width: "100%" }}>
                퇴사 처리
              </button>
            )}
          </article>
        ))}
        {employees.length === 0 && <div className="glass-card empty-state">등록된 직원이 없습니다.</div>}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">직원 등록</h2>
            <div className="form-grid">
              <Field label="직원ID" value={form.직원ID} onChange={(value) => setForm({ ...form, 직원ID: value })} placeholder="EMP-2025-005" />
              <Field label="초기 비밀번호" value={form.비밀번호} onChange={(value) => setForm({ ...form, 비밀번호: value })} type="password" />
            </div>
            <Field label="이름" value={form.이름} onChange={(value) => setForm({ ...form, 이름: value })} />
            <Field label="이메일" value={form.이메일} onChange={(value) => setForm({ ...form, 이메일: value })} placeholder="email@company.com" />
            <div className="form-grid">
              <Field label="직무" value={form.직무} onChange={(value) => setForm({ ...form, 직무: value })} placeholder="PM, 프론트엔드" />
              <Field label="부서" value={form.부서} onChange={(value) => setForm({ ...form, 부서: value })} placeholder="개발팀" />
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

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
