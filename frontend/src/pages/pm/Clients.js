import React, { useEffect, useState } from "react";
import { getClients, createClient, deleteClient } from "../../api/clients";

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
  클라이언트ID: "",
  회사명: "",
  업종: "",
  담당자명: "",
  담당자이메일: "",
  연락처: "",
};

function Field({ label, value, onChange, placeholder = "" }) {
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const avatarColors = [
  { bg: "rgba(37,99,235,0.1)", color: "#1d4ed8" },
  { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
  { bg: "rgba(139,92,246,0.1)", color: "#7c3aed" },
  { bg: "rgba(8,145,178,0.1)", color: "#0891b2" },
  { bg: "rgba(180,83,9,0.1)", color: "#b45309" },
];

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
            클라이언트
          </h1>
          <div
            style={{
              marginTop: 6,
              color: "rgba(0,0,0,0.4)",
              fontSize: 12,
              fontWeight: 300,
            }}
          >
            고객사와 담당자 정보를 관리합니다.
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
          + 클라이언트 등록
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
          gap: 12,
        }}
      >
        {clients.map((c, i) => {
          const av = avatarColors[i % avatarColors.length];
          return (
            <div key={c.클라이언트ID} style={glass}>
              {/* 회사 */}
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
                    background: av.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: av.color,
                    flexShrink: 0,
                  }}
                >
                  {c.회사명?.[0] || "C"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(20,20,30,0.85)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.회사명}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {c.업종 || "-"}
                  </div>
                </div>
              </div>
              {/* 구분선 */}
              <div
                style={{
                  height: "0.5px",
                  background: "rgba(0,0,0,0.06)",
                  marginBottom: 12,
                }}
              />
              {/* 담당자 */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(0,0,0,0.35)",
                    marginBottom: 3,
                  }}
                >
                  담당자
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "rgba(20,20,30,0.85)",
                  }}
                >
                  {c.담당자명 || "-"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 300,
                    color: "rgba(0,0,0,0.4)",
                    marginTop: 2,
                  }}
                >
                  {c.담당자이메일 || "-"}
                </div>
              </div>
              {/* 연락처 */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(0,0,0,0.35)",
                    marginBottom: 3,
                  }}
                >
                  연락처
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "rgba(20,20,30,0.85)",
                  }}
                >
                  {c.연락처 || "-"}
                </div>
              </div>
              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(c.클라이언트ID)}
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
                삭제
              </button>
            </div>
          );
        })}
        {clients.length === 0 && (
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
            등록된 클라이언트가 없습니다.
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
              클라이언트 등록
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="클라이언트ID"
                value={form.클라이언트ID}
                onChange={(v) => setForm({ ...form, 클라이언트ID: v })}
                placeholder="CLI-2025-001"
              />
              <Field
                label="업종"
                value={form.업종}
                onChange={(v) => setForm({ ...form, 업종: v })}
                placeholder="이커머스"
              />
            </div>
            <Field
              label="회사명"
              value={form.회사명}
              onChange={(v) => setForm({ ...form, 회사명: v })}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="담당자명"
                value={form.담당자명}
                onChange={(v) => setForm({ ...form, 담당자명: v })}
              />
              <Field
                label="연락처"
                value={form.연락처}
                onChange={(v) => setForm({ ...form, 연락처: v })}
                placeholder="010-0000-0000"
              />
            </div>
            <Field
              label="이메일"
              value={form.담당자이메일}
              onChange={(v) => setForm({ ...form, 담당자이메일: v })}
              placeholder="email@company.com"
            />
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
