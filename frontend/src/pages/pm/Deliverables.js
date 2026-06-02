import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getDeliverables,
  createDeliverable,
  updateStatus,
} from "../../api/deliverables";
import { createResult } from "../../api/results";
import { getReports } from "../../api/reports";
import { formatDate } from "../../utils/format";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};

const inputStyle = {
  width: "100%",
  height: 40,
  border: "0.5px solid rgba(0,0,0,0.12)",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 13,
  fontWeight: 300,
  color: "rgba(20,20,30,0.85)",
  background: "rgba(255,255,255,0.8)",
  outline: "none",
  boxSizing: "border-box",
};

const reviewStyle = {
  IN_REVIEW: { bg: "rgba(37,99,235,0.1)", color: "#1d4ed8", label: "검토중" },
  REVISION: { bg: "rgba(185,28,28,0.08)", color: "#b91c1c", label: "수정요청" },
  APPROVED: { bg: "rgba(22,163,74,0.1)", color: "#15803d", label: "최종승인" },
};

const emptyForm = {
  작업물ID: "",
  차수: "",
  제출자ID: "",
  파일명: "",
  파일경로: "",
  제출일: "",
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

export default function PMDeliverables() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState([]);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNoReportModal, setShowNoReportModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [completed, setCompleted] = useState(false);
  const [completedFile, setCompletedFile] = useState("");

  const refresh = useCallback(
    () => getDeliverables(projectId).then((res) => setDeliverables(res.data)),
    [projectId],
  );

  useEffect(() => {
    refresh();
    getReports(projectId).then((res) => setReports(res.data));
  }, [projectId, refresh]);

  const handleOpenModal = () => {
    if (reports.length === 0) {
      setShowNoReportModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.작업물ID || !form.차수 || !form.제출자ID || !form.파일명) return;
    try {
      await createDeliverable({
        ...form,
        프로젝트ID: projectId,
        상태: "IN_REVIEW",
      });
      setShowModal(false);
      setForm(emptyForm);
      refresh();
    } catch {
      alert(
        "작업물 등록 실패: 해당 차수의 위클리리포트가 존재하는지 확인해주세요.",
      );
    }
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
    setCompletedFile(deliverable.파일명);
    setCompleted(true);
  };

  // 완료 화면
  if (completed) {
    return (
      <Layout active="프로젝트 목록">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
          }}
        >
          <div
            style={{
              ...glass,
              padding: "52px 44px",
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 18 }}>🎉</div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 10px",
                letterSpacing: "-0.03em",
                color: "rgba(20,20,30,0.9)",
              }}
            >
              프로젝트 완료!
            </h1>
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "rgba(0,0,0,0.5)",
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              <strong style={{ fontWeight: 600, color: "rgba(20,20,30,0.8)" }}>
                {completedFile}
              </strong>
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.45)",
                lineHeight: 1.7,
                marginBottom: 30,
              }}
            >
              결과물이 등록되어 프로젝트 상태가
              <br />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#15803d",
                  background: "rgba(22,163,74,0.1)",
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                종료
              </span>{" "}
              로 변경됐습니다.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => navigate(`/pm/projects/${projectId}`)}
                type="button"
                style={{
                  minHeight: 42,
                  border: "none",
                  borderRadius: 12,
                  padding: "0 24px",
                  background: "rgba(20,20,30,0.85)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                프로젝트 상세 →
              </button>
              <button
                onClick={() => navigate("/pm/dashboard")}
                type="button"
                style={{
                  minHeight: 42,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 12,
                  padding: "0 24px",
                  background: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                대시보드로
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="프로젝트 목록">
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/pm/projects/${projectId}`)}
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "rgba(0,0,0,0.4)",
            fontSize: 13,
            fontWeight: 300,
            cursor: "pointer",
            padding: 0,
            marginBottom: 8,
          }}
        >
          ← 프로젝트로
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: 0,
                color: "rgba(20,20,30,0.9)",
              }}
            >
              작업물 관리
            </h1>
            <div
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.4)",
                marginTop: 4,
              }}
            >
              검토 상태를 바꾸고 최종 승인본을 결과물로 등록합니다.
            </div>
          </div>
          <button
            onClick={handleOpenModal}
            type="button"
            style={{
              minHeight: 36,
              border: "1px solid rgba(20,20,30,0.85)",
              borderRadius: 999,
              padding: "0 18px",
              background: "rgba(20,20,30,0.85)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + 작업물 등록
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
          gap: 12,
        }}
      >
        {deliverables.map((item) => {
          const rv = reviewStyle[item.상태] || reviewStyle.IN_REVIEW;
          return (
            <div key={item.작업물ID} style={{ ...glass, padding: "20px 22px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: "rgba(37,99,235,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1d4ed8",
                    flexShrink: 0,
                  }}
                >
                  v{item.차수}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(20,20,30,0.88)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.파일명}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {item.제출자명 || "-"} · {formatDate(item.제출일)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: rv.bg,
                    color: rv.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rv.label}
                </span>
              </div>
              <div
                style={{
                  height: "0.5px",
                  background: "rgba(0,0,0,0.06)",
                  marginBottom: 14,
                }}
              />
              <div style={{ marginBottom: item.상태 === "APPROVED" ? 12 : 0 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.4)",
                    marginBottom: 6,
                  }}
                >
                  상태 변경
                </label>
                <select
                  style={{ ...inputStyle, height: 36 }}
                  value={item.상태}
                  onChange={(e) =>
                    handleStatusChange(item.작업물ID, e.target.value)
                  }
                >
                  <option value="IN_REVIEW">검토중</option>
                  <option value="REVISION">수정요청</option>
                  <option value="APPROVED">최종승인</option>
                </select>
              </div>
              {item.상태 === "APPROVED" && (
                <button
                  onClick={() => handleRegisterResult(item)}
                  type="button"
                  style={{
                    width: "100%",
                    minHeight: 38,
                    border: "none",
                    borderRadius: 10,
                    background: "rgba(22,163,74,0.12)",
                    color: "#15803d",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  결과물로 등록 →
                </button>
              )}
            </div>
          );
        })}
        {deliverables.length === 0 && (
          <div
            style={{
              ...glass,
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gridColumn: "1/-1",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(20,20,30,0.6)",
                  marginBottom: 6,
                }}
              >
                등록된 작업물이 없습니다.
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 300,
                  color: "rgba(0,0,0,0.35)",
                }}
              >
                {reports.length === 0
                  ? "위클리리포트를 먼저 등록해야 합니다."
                  : "작업물 등록 버튼을 눌러 추가해주세요."}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNoReportModal && (
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
              width: "min(420px,100%)",
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 20,
              padding: 32,
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              위클리리포트 필요
            </h2>
            <p
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.5)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              작업물을 등록하려면 먼저
              <br />
              위클리리포트가 등록되어 있어야 합니다.
              <br />
              차수에 맞는 리포트를 먼저 생성해주세요.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowNoReportModal(false)}
                type="button"
                style={{
                  minHeight: 36,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 999,
                  padding: "0 18px",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                돌아가기
              </button>
              <button
                onClick={() => {
                  setShowNoReportModal(false);
                  navigate(`/pm/reports/${projectId}`);
                }}
                type="button"
                style={{
                  minHeight: 36,
                  border: "none",
                  borderRadius: 999,
                  padding: "0 18px",
                  background: "rgba(20,20,30,0.85)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                위클리리포트 등록 →
              </button>
            </div>
          </div>
        </div>
      )}

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
              padding: 28,
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              작업물 등록
            </h2>
            <p
              style={{
                fontSize: 12,
                fontWeight: 300,
                color: "rgba(0,0,0,0.4)",
                marginBottom: 20,
              }}
            >
              등록된 위클리리포트 차수:{" "}
              {reports.map((r) => `${r.차수}차`).join(", ")}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="작업물ID"
                value={form.작업물ID}
                onChange={(v) => setForm({ ...form, 작업물ID: v })}
                placeholder="WRK-2025-001"
              />
              <Field
                label="차수"
                value={form.차수}
                onChange={(v) => setForm({ ...form, 차수: v })}
                placeholder={reports[0]?.차수?.toString() || "1"}
              />
            </div>
            <Field
              label="제출자ID"
              value={form.제출자ID}
              onChange={(v) => setForm({ ...form, 제출자ID: v })}
              placeholder="EMP-001"
            />
            <Field
              label="파일명"
              value={form.파일명}
              onChange={(v) => setForm({ ...form, 파일명: v })}
            />
            <Field
              label="파일경로"
              value={form.파일경로}
              onChange={(v) => setForm({ ...form, 파일경로: v })}
              placeholder="/files/..."
            />
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  marginBottom: 5,
                }}
              >
                제출일
              </label>
              <input
                type="date"
                style={inputStyle}
                value={form.제출일}
                onChange={(e) => setForm({ ...form, 제출일: e.target.value })}
              />
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setShowModal(false)}
                type="button"
                style={{
                  minHeight: 36,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                type="button"
                style={{
                  minHeight: 36,
                  border: "none",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "rgba(20,20,30,0.85)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
