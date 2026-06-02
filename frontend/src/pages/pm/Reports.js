import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getReports,
  createReport,
  updateReport,
  getReport,
} from "../../api/reports";
import { formatDate, roleLabel } from "../../utils/format";

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

const avatarColors = [
  { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8" },
  { bg: "rgba(22,163,74,0.12)", color: "#15803d" },
  { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  { bg: "rgba(8,145,178,0.12)", color: "#0891b2" },
  { bg: "rgba(180,83,9,0.12)", color: "#b45309" },
];

const emptyForm = { 차수: "", 회의일: "", 다음회의일: "", 요구사항: "" };

export default function PMReports() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(
    () => getReports(projectId).then((res) => setReports(res.data)),
    [projectId],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSelect = async (round) => {
    const res = await getReport(projectId, round);
    setSelected(res.data.report);
    setDetails(res.data.details);
  };

  const handleCreate = async () => {
    if (!form.차수 || !form.회의일) return;
    await createReport({
      ...form,
      프로젝트ID: projectId,
      처리여부: "IN_PROGRESS",
    });
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    await updateReport(projectId, selected.차수, selected);
    refresh();
    setSaving(false);
  };

  return (
    <Layout active="프로젝트 목록">
      {/* 헤더 */}
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
              위클리리포트
            </h1>
            <div
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.4)",
                marginTop: 4,
              }}
            >
              회의 차수별 요구사항과 피드백 반영 상태를 관리합니다.
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
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
            + 새 보고 등록
          </button>
        </div>
      </div>

      {/* 메인 2열 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}
      >
        {/* 좌 — 리포트 목록 */}
        <div style={{ ...glass, padding: "18px 16px", height: "fit-content" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            보고 목록 {reports.length}건
          </div>
          {reports.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "rgba(0,0,0,0.25)",
                fontSize: 13,
                fontWeight: 300,
              }}
            >
              보고서가 없습니다.
            </div>
          )}
          {reports.map((r) => {
            const isSelected = selected?.차수 === r.차수;
            return (
              <div
                key={r.차수}
                onClick={() => handleSelect(r.차수)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  marginBottom: 4,
                  background: isSelected
                    ? "rgba(20,20,30,0.88)"
                    : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: isSelected
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: isSelected ? "#fff" : "rgba(20,20,30,0.6)",
                    flexShrink: 0,
                  }}
                >
                  {r.차수}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isSelected ? "#fff" : "rgba(20,20,30,0.85)",
                    }}
                  >
                    {r.차수}차 보고
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: isSelected
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(0,0,0,0.38)",
                      marginTop: 1,
                    }}
                  >
                    {formatDate(r.회의일)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: 999,
                    background:
                      r.처리여부 === "DONE"
                        ? "rgba(22,163,74,0.15)"
                        : "rgba(180,83,9,0.12)",
                    color: r.처리여부 === "DONE" ? "#15803d" : "#b45309",
                  }}
                >
                  {r.처리여부 === "DONE" ? "완료" : "진행"}
                </span>
              </div>
            );
          })}
        </div>

        {/* 우 — 상세 */}
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* 보고 정보 */}
            <div style={{ ...glass, padding: "22px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.9)",
                  }}
                >
                  {selected.차수}차 보고 상세
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  type="button"
                  style={{
                    minHeight: 34,
                    border: "1px solid rgba(20,20,30,0.85)",
                    borderRadius: 999,
                    padding: "0 18px",
                    background: "rgba(20,20,30,0.85)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "저장중..." : "저장"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.4)",
                      marginBottom: 5,
                    }}
                  >
                    회의일
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={selected.회의일?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, 회의일: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.4)",
                      marginBottom: 5,
                    }}
                  >
                    다음 회의일
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={selected.다음회의일?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, 다음회의일: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.4)",
                      marginBottom: 5,
                    }}
                  >
                    처리여부
                  </label>
                  <select
                    style={inputStyle}
                    value={selected.처리여부 || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, 처리여부: e.target.value })
                    }
                  >
                    <option value="IN_PROGRESS">반영중</option>
                    <option value="DONE">반영완료</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.4)",
                    marginBottom: 5,
                  }}
                >
                  요구사항
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    height: 80,
                    padding: "10px 12px",
                    resize: "vertical",
                  }}
                  value={selected.요구사항 || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, 요구사항: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.4)",
                    marginBottom: 5,
                  }}
                >
                  피드백
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    height: 80,
                    padding: "10px 12px",
                    resize: "vertical",
                  }}
                  value={selected.피드백 || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, 피드백: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 팀원 작업내용 */}
            <div style={{ ...glass, padding: "22px 24px" }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "rgba(20,20,30,0.9)",
                  marginBottom: 16,
                }}
              >
                팀원 작업내용
              </div>
              {details.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px 0",
                    color: "rgba(0,0,0,0.25)",
                    fontSize: 13,
                    fontWeight: 300,
                  }}
                >
                  제출된 작업내용이 없습니다.
                </div>
              )}
              {details.map((d, i) => {
                const av = avatarColors[i % avatarColors.length];
                return (
                  <div
                    key={d.직원ID}
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: av.bg,
                          color: av.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {d.이름?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "rgba(20,20,30,0.85)",
                          }}
                        >
                          {d.이름}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 300,
                            color: "rgba(0,0,0,0.4)",
                            marginTop: 2,
                          }}
                        >
                          {d.직무} · {roleLabel[d.작업유형] || d.작업유형}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: av.color,
                        }}
                      >
                        {d.진행률}%
                      </span>
                    </div>
                    {/* 진행률 바 */}
                    <div
                      style={{
                        height: 5,
                        background: "rgba(0,0,0,0.06)",
                        borderRadius: 999,
                        marginBottom: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${d.진행률 || 0}%`,
                          background: av.color,
                          borderRadius: 999,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(20,20,30,0.65)",
                        lineHeight: 1.6,
                      }}
                    >
                      {d.작업내용}
                    </div>
                    {d.비고 && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 300,
                          color: "rgba(0,0,0,0.38)",
                          marginTop: 6,
                        }}
                      >
                        비고: {d.비고}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              ...glass,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <div style={{ textAlign: "center", color: "rgba(0,0,0,0.25)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 300 }}>
                왼쪽에서 보고서를 선택하세요.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 새 보고 등록 모달 */}
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
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              새 보고 등록
            </h2>
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
                차수
              </label>
              <input
                style={inputStyle}
                placeholder="1"
                value={form.차수}
                onChange={(e) => setForm({ ...form, 차수: e.target.value })}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.5)",
                    marginBottom: 5,
                  }}
                >
                  회의일
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.회의일}
                  onChange={(e) => setForm({ ...form, 회의일: e.target.value })}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.5)",
                    marginBottom: 5,
                  }}
                >
                  다음 회의일
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.다음회의일}
                  onChange={(e) =>
                    setForm({ ...form, 다음회의일: e.target.value })
                  }
                />
              </div>
            </div>
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
                요구사항
              </label>
              <textarea
                style={{
                  ...inputStyle,
                  height: 80,
                  padding: "10px 12px",
                  resize: "vertical",
                }}
                value={form.요구사항}
                onChange={(e) => setForm({ ...form, 요구사항: e.target.value })}
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
