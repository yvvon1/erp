import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject } from "../../api/projects";
import { getClients } from "../../api/clients";
import { formatDate, statusLabel, typeLabel } from "../../utils/format";

const glass = {
  background: "rgba(255,255,255,0.68)",
  backdropFilter: "blur(48px)",
  WebkitBackdropFilter: "blur(48px)",
  border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
  padding: "20px",
};

const statusStyle = {
  IN_PROGRESS: { bg: "rgba(37,99,235,0.1)", color: "#1d4ed8", label: "진행중" },
  PLANNING: { bg: "rgba(0,0,0,0.06)", color: "#555", label: "계획중" },
  CLOSED: { bg: "rgba(22,163,74,0.1)", color: "#15803d", label: "종료" },
};

const typeStyle = {
  NEW: { bg: "rgba(8,145,178,0.08)", color: "#0891b2", label: "신규개발" },
  RENEWAL: { bg: "rgba(139,92,246,0.08)", color: "#7c3aed", label: "리뉴얼" },
  MAINTENANCE: { bg: "rgba(0,0,0,0.05)", color: "#555", label: "유지보수" },
};

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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(0,0,0,0.5)",
          marginBottom: 5,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

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
    <>
      {/* 헤더 */}
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
            프로젝트 목록
          </h1>
          <div
            style={{
              marginTop: 6,
              color: "rgba(0,0,0,0.4)",
              fontSize: 12,
              fontWeight: 300,
            }}
          >
            진행 상태와 납기일을 한눈에 확인합니다.
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
            whiteSpace: "nowrap",
          }}
        >
          + 새 프로젝트
        </button>
      </div>

      {/* 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
          gap: 12,
        }}
      >
        {projects.map((p) => {
          const st = statusStyle[p.상태] || statusStyle.PLANNING;
          const tp = typeStyle[p.프로젝트유형] || typeStyle.NEW;
          return (
            <div
              key={p.프로젝트ID}
              onClick={() => navigate(`/pm/projects/${p.프로젝트ID}`)}
              style={{
                ...glass,
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)")
              }
            >
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
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.6)",
                    flexShrink: 0,
                  }}
                >
                  {p.프로젝트명?.[0] || "P"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(20,20,30,0.85)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.프로젝트명}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {p.회사명 || "-"}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: st.bg,
                    color: st.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: tp.bg,
                  color: tp.color,
                }}
              >
                {tp.label}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(0,0,0,0.35)",
                      marginBottom: 3,
                    }}
                  >
                    착수일
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "rgba(20,20,30,0.75)",
                    }}
                  >
                    {formatDate(p.착수일) || "-"}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(0,0,0,0.35)",
                      marginBottom: 3,
                    }}
                  >
                    납기일
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "rgba(20,20,30,0.75)",
                    }}
                  >
                    {formatDate(p.납기일) || "-"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
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
            등록된 프로젝트가 없습니다.
          </div>
        )}
      </div>

      {/* 모달 */}
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
              width: "min(540px,100%)",
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
              새 프로젝트 등록
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field label="프로젝트ID">
                <input
                  style={inputStyle}
                  placeholder="PRJ-2025-001"
                  value={form.프로젝트ID}
                  onChange={(e) =>
                    setForm({ ...form, 프로젝트ID: e.target.value })
                  }
                />
              </Field>
              <Field label="유형">
                <select
                  style={inputStyle}
                  value={form.프로젝트유형}
                  onChange={(e) =>
                    setForm({ ...form, 프로젝트유형: e.target.value })
                  }
                >
                  <option value="NEW">신규개발</option>
                  <option value="RENEWAL">리뉴얼</option>
                  <option value="MAINTENANCE">유지보수</option>
                </select>
              </Field>
            </div>
            <Field label="프로젝트명">
              <input
                style={inputStyle}
                value={form.프로젝트명}
                onChange={(e) =>
                  setForm({ ...form, 프로젝트명: e.target.value })
                }
              />
            </Field>
            <Field label="클라이언트">
              <select
                style={inputStyle}
                value={form.클라이언트ID}
                onChange={(e) =>
                  setForm({ ...form, 클라이언트ID: e.target.value })
                }
              >
                <option value="">선택</option>
                {clients.map((c) => (
                  <option key={c.클라이언트ID} value={c.클라이언트ID}>
                    {c.회사명}
                  </option>
                ))}
              </select>
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {["계약일", "착수일", "납기일"].map((key) => (
                <Field key={key} label={key}>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="설명">
              <textarea
                style={{
                  ...inputStyle,
                  height: 80,
                  padding: "10px 12px",
                  resize: "vertical",
                }}
                value={form.설명}
                onChange={(e) => setForm({ ...form, 설명: e.target.value })}
              />
            </Field>
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
