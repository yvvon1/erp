import React, { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "../../api/employees";

const glass = {
  background: "rgba(255,255,255,0.68)",
  backdropFilter: "blur(48px)",
  WebkitBackdropFilter: "blur(48px)",
  border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
  padding: "20px",
};

const inputStyle = {
  width: "100%",
  height: 40,
  border: "0.5px solid rgba(0,0,0,0.15)",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 13,
  fontWeight: 300,
  color: "rgba(20,20,30,0.85)",
  background: "rgba(255,255,255,0.8)",
  outline: "none",
  boxSizing: "border-box",
};

const emptyForm = {
  직원ID: "",
  이름: "",
  이메일: "",
  비밀번호: "1234",
  직무: "",
  부서: "",
};

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(0,0,0,0.5)",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        style={inputStyle}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const avatarColors = [
  { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8" },
  { bg: "rgba(22,163,74,0.12)", color: "#15803d" },
  { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  { bg: "rgba(8,145,178,0.12)", color: "#0891b2" },
  { bg: "rgba(180,83,9,0.12)", color: "#b45309" },
];

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
    if (!window.confirm(`${employee.이름} 직원을 퇴사 처리하시겠습니까?`))
      return;
    await updateEmployee(employee.직원ID, {
      ...employee,
      재직여부: "RESIGNED",
    });
    refresh();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(23px,3vw,34px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            직원 관리
          </h1>
          <div
            style={{
              marginTop: 6,
              color: "rgba(0,0,0,0.4)",
              fontSize: 12,
              fontWeight: 300,
            }}
          >
            계정, 직무, 재직 상태를 관리합니다.
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          type="button"
          style={{
            minHeight: 34,
            border: "1px solid rgba(20,20,30,0.85)",
            borderRadius: 999,
            padding: "0 16px",
            background: "rgba(20,20,30,0.85)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 450,
            cursor: "pointer",
          }}
        >
          + 직원 등록
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
          gap: 12,
        }}
      >
        {employees.map((e, i) => {
          const av = avatarColors[i % avatarColors.length];
          return (
            <div key={e.직원ID} style={glass}>
              {/* 상단 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: av.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: av.color,
                    flexShrink: 0,
                  }}
                >
                  {e.이름?.[0] || "E"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(20,20,30,0.85)",
                    }}
                  >
                    {e.이름}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {e.직무} · {e.부서 || "-"}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background:
                      e.재직여부 === "ACTIVE"
                        ? "rgba(22,163,74,0.1)"
                        : "rgba(185,28,28,0.08)",
                    color: e.재직여부 === "ACTIVE" ? "#15803d" : "#b91c1c",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.재직여부 === "ACTIVE" ? "재직중" : "퇴사"}
                </span>
              </div>
              {/* 구분선 */}
              <div
                style={{
                  height: "0.5px",
                  background: "rgba(0,0,0,0.06)",
                  marginBottom: 12,
                }}
              />
              {/* 계정 정보 */}
              <div style={{ marginBottom: e.재직여부 === "ACTIVE" ? 14 : 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(20,20,30,0.7)",
                    marginBottom: 2,
                  }}
                >
                  {e.직원ID}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 300,
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {e.이메일 || "-"}
                </div>
              </div>
              {/* 퇴사 버튼 */}
              {e.재직여부 === "ACTIVE" && (
                <button
                  onClick={() => handleResign(e)}
                  type="button"
                  style={{
                    width: "100%",
                    minHeight: 34,
                    border: "0.5px solid rgba(185,28,28,0.2)",
                    borderRadius: 10,
                    background: "rgba(185,28,28,0.06)",
                    color: "#b91c1c",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  퇴사 처리
                </button>
              )}
            </div>
          );
        })}
        {employees.length === 0 && (
          <div
            style={{
              ...glass,
              minHeight: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(0,0,0,0.3)",
              fontSize: 13,
              fontWeight: 300,
            }}
          >
            등록된 직원이 없습니다.
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "min(480px,100%)",
              maxHeight: "calc(100vh - 36px)",
              overflow: "auto",
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              직원 등록
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="직원ID"
                value={form.직원ID}
                onChange={(v) => setForm({ ...form, 직원ID: v })}
                placeholder="EMP-2025-005"
              />
              <Field
                label="초기 비밀번호"
                value={form.비밀번호}
                onChange={(v) => setForm({ ...form, 비밀번호: v })}
                type="password"
              />
            </div>
            <Field
              label="이름"
              value={form.이름}
              onChange={(v) => setForm({ ...form, 이름: v })}
            />
            <Field
              label="이메일"
              value={form.이메일}
              onChange={(v) => setForm({ ...form, 이메일: v })}
              placeholder="email@company.com"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="직무"
                value={form.직무}
                onChange={(v) => setForm({ ...form, 직무: v })}
                placeholder="PM, 프론트엔드"
              />
              <Field
                label="부서"
                value={form.부서}
                onChange={(v) => setForm({ ...form, 부서: v })}
                placeholder="개발팀"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                type="button"
                style={{
                  minHeight: 34,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                style={{
                  minHeight: 34,
                  border: "none",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "rgba(20,20,30,0.85)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
