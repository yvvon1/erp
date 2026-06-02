import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, createClient } from "../../api/clients";
import { createProject } from "../../api/projects";
import {
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
} from "../../api/pipeline";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};

const STAGES = [
  {
    key: "RFP",
    label: "RFP 접수",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    key: "PROPOSAL",
    label: "제안 중",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    key: "NEGOTIATE",
    label: "협상 중",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
  },
  {
    key: "CONTRACT",
    label: "계약 완료",
    color: "#15803d",
    bg: "rgba(22,163,74,0.08)",
  },
];

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

const emptyDeal = {
  사업명: "",
  발주처: "",
  예상금액: "",
  마감일: "",
  메모: "",
  단계: "RFP",
};
const emptyProjectForm = {
  프로젝트ID: "",
  클라이언트ID: "",
  프로젝트명: "",
  프로젝트유형: "NEW",
  계약일: new Date().toISOString().slice(0, 10),
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
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAward, setShowAward] = useState(null);
  const [form, setForm] = useState(emptyDeal);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [dragId, setDragId] = useState(null);
  const [awarding, setAwarding] = useState(false);

  const refresh = async () => {
    try {
      const res = await getPipeline();
      setDeals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    getClients().then((res) => setClients(res.data));
  }, []);

  const handleAdd = async () => {
    if (!form.사업명 || !form.발주처) return;
    await createPipeline({ ...form, 파이프라인ID: `DEAL-${Date.now()}` });
    setShowAdd(false);
    setForm(emptyDeal);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await deletePipeline(id);
    refresh();
  };

  const handleStageChange = async (deal, stage) => {
    await updatePipeline(deal.파이프라인ID, {
      ...deal,
      단계: stage,
      마감일: deal.마감일 ? deal.마감일.slice(0, 10) : null,
    });
    refresh();
  };

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (dragId) {
      const deal = deals.find((d) => d.파이프라인ID === dragId);
      if (deal) handleStageChange(deal, stage);
      setDragId(null);
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleAward = async () => {
    if (
      !projectForm.프로젝트ID ||
      !projectForm.프로젝트명 ||
      !projectForm.클라이언트ID
    )
      return;
    setAwarding(true);
    try {
      await createProject({ ...projectForm, 상태: "PLANNING" });
      await deletePipeline(showAward.파이프라인ID);
      refresh();
      setShowAward(null);
      alert("수주 확정! 프로젝트가 생성됐습니다.");
      navigate("/pm/projects");
    } catch (e) {
      alert("프로젝트 생성 실패: " + e.message);
    } finally {
      setAwarding(false);
    }
  };

  const totalBudget = deals.reduce((s, d) => s + (Number(d.예상금액) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 헤더 */}
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
            수주 파이프라인
          </h1>
          <div
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: "rgba(0,0,0,0.4)",
              marginTop: 4,
            }}
          >
            제안부터 계약까지 수주 현황을 관리합니다.
            {totalBudget > 0 && (
              <span
                style={{ marginLeft: 8, color: "#1d4ed8", fontWeight: 500 }}
              >
                총 {(totalBudget / 100000000).toFixed(1)}억원
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
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
          + 수주 건 추가
        </button>
      </div>

      {/* KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
        }}
      >
        {STAGES.map((s) => {
          const cnt = deals.filter((d) => d.단계 === s.key).length;
          const budget = deals
            .filter((d) => d.단계 === s.key)
            .reduce((sum, d) => sum + (Number(d.예상금액) || 0), 0);
          return (
            <div key={s.key} style={{ ...glass, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.4)",
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 200,
                  color: "rgba(20,20,30,0.88)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {cnt}
                <span style={{ fontSize: 14, fontWeight: 300 }}>건</span>
              </div>
              {budget > 0 && (
                <div style={{ fontSize: 11, fontWeight: 500, color: s.color }}>
                  {(budget / 100000000).toFixed(1)}억원
                </div>
              )}
              <div
                style={{
                  height: 3,
                  borderRadius: 999,
                  background: s.bg,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, deals.length ? (cnt / deals.length) * 100 : 0)}%`,
                    background: s.color,
                    borderRadius: 999,
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 칸반 보드 */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "rgba(0,0,0,0.3)",
            fontSize: 13,
          }}
        >
          로딩 중...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}
        >
          {STAGES.map((s) => (
            <div
              key={s.key}
              onDrop={(e) => handleDrop(e, s.key)}
              onDragOver={handleDragOver}
              style={{ ...glass, padding: 16, minHeight: 300 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.85)",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: s.bg,
                    color: s.color,
                    marginLeft: "auto",
                  }}
                >
                  {deals.filter((d) => d.단계 === s.key).length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deals
                  .filter((d) => d.단계 === s.key)
                  .map((deal) => (
                    <div
                      key={deal.파이프라인ID}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.파이프라인ID)}
                      style={{
                        background: "#fff",
                        border: "0.5px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        padding: "12px 14px",
                        cursor: "grab",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "none")
                      }
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: "rgba(20,20,30,0.88)",
                          marginBottom: 4,
                        }}
                      >
                        {deal.사업명}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 400,
                          color: "rgba(0, 0, 0, 0.66)",
                          marginBottom: 8,
                        }}
                      >
                        {deal.발주처}
                      </div>
                      {deal.예상금액 > 0 && (
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: s.color,
                            marginBottom: 4,
                          }}
                        >
                          {Number(deal.예상금액).toLocaleString()}만원
                        </div>
                      )}
                      {deal.마감일 && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 400,
                            color: "rgba(0, 0, 0, 0.6)",
                            marginBottom: 8,
                          }}
                        >
                          마감 {deal.마감일?.slice(0, 10)}
                        </div>
                      )}
                      {deal.메모 && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 400,
                            color: "rgba(0, 0, 0, 0.66)",
                            lineHeight: 1.5,
                            marginBottom: 8,
                            padding: "6px 8px",
                            background: "rgba(0,0,0,0.03)",
                            borderRadius: 8,
                          }}
                        >
                          {deal.메모}
                        </div>
                      )}

                      {/* 단계 이동 버튼 */}
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        {STAGES.filter((st) => st.key !== deal.단계).map(
                          (st) => (
                            <button
                              key={st.key}
                              onClick={() => handleStageChange(deal, st.key)}
                              type="button"
                              style={{
                                fontSize: 10,
                                fontWeight: 500,
                                padding: "2px 8px",
                                borderRadius: 999,
                                border: `0.5px solid ${st.color}`,
                                background: "transparent",
                                color: st.color,
                                cursor: "pointer",
                              }}
                            >
                              → {st.label}
                            </button>
                          ),
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            setShowAward(deal);
                            setProjectForm({
                              ...emptyProjectForm,
                              프로젝트명: deal.사업명,
                              납기일: deal.마감일?.slice(0, 10) || "",
                              설명: deal.메모 || "",
                            });
                          }}
                          type="button"
                          style={{
                            flex: 1,
                            minHeight: 35,
                            border: "none",
                            borderRadius: 8,
                            background: "rgba(22,163,74,0.1)",
                            border: `0.5px solid rgba(22,163,74,0.3)`,
                            color: "#124224",
                            fontSize: 15,
                            fontWeight: 450,
                            cursor: "pointer",
                            padding: "6px 0",
                            marginTop: 4,
                          }}
                        >
                          계약 확정
                        </button>
                        <button
                          onClick={() => handleDelete(deal.파이프라인ID)}
                          type="button"
                          style={{
                            minHeight: 35,
                            minWidth: 35,
                            border: "none",
                            borderRadius: 8,
                            background: "rgba(185,28,28,0.07)",
                            color: "#b91c1c",
                            border: `0.5px solid rgba(185,28,28,0.3)`,
                            fontSize: 18,
                            cursor: "pointer",
                            marginTop: 4,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                {deals.filter((d) => d.단계 === s.key).length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      fontSize: 12,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.25)",
                    }}
                  >
                    드래그하여 이동
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수주 건 추가 모달 */}
      {showAdd && (
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
              수주 건 추가
            </h2>
            <Field label="사업명">
              <input
                style={inputStyle}
                placeholder="전술지휘통제 시스템 개발"
                value={form.사업명}
                onChange={(e) => setForm({ ...form, 사업명: e.target.value })}
              />
            </Field>
            <Field label="발주처">
              <input
                style={inputStyle}
                placeholder="한화시스템"
                value={form.발주처}
                onChange={(e) => setForm({ ...form, 발주처: e.target.value })}
              />
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field label="예상 금액 (만원)">
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="50000"
                  value={form.예상금액}
                  onChange={(e) =>
                    setForm({ ...form, 예상금액: e.target.value })
                  }
                />
              </Field>
              <Field label="제안 마감일">
                <input
                  style={inputStyle}
                  type="date"
                  value={form.마감일}
                  onChange={(e) => setForm({ ...form, 마감일: e.target.value })}
                />
              </Field>
            </div>
            <Field label="단계">
              <select
                style={inputStyle}
                value={form.단계}
                onChange={(e) => setForm({ ...form, 단계: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="메모">
              <textarea
                style={{
                  ...inputStyle,
                  height: 72,
                  padding: "10px 12px",
                  resize: "vertical",
                }}
                placeholder="RFP 요구사항, 특이사항 등"
                value={form.메모}
                onChange={(e) => setForm({ ...form, 메모: e.target.value })}
              />
            </Field>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm(emptyDeal);
                }}
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
                onClick={handleAdd}
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
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 낙찰 확정 모달 */}
      {showAward && (
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
              width: "min(520px,100%)",
              maxHeight: "calc(100vh - 36px)",
              overflow: "auto",
              background: "#fff",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}
            >
              낙찰 확정
            </h2>
            <p
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.45)",
                marginBottom: 20,
              }}
            >
              아래 정보를 확인하고 프로젝트를 자동 생성합니다.
            </p>
            <Field label="프로젝트ID">
              <input
                style={inputStyle}
                placeholder="PRJ-2025-007"
                value={projectForm.프로젝트ID}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, 프로젝트ID: e.target.value })
                }
              />
            </Field>
            <Field label="프로젝트명">
              <input
                style={inputStyle}
                value={projectForm.프로젝트명}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, 프로젝트명: e.target.value })
                }
              />
            </Field>
            <Field label="클라이언트">
              <select
                style={inputStyle}
                value={projectForm.클라이언트ID}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    클라이언트ID: e.target.value,
                  })
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
            <Field label="유형">
              <select
                style={inputStyle}
                value={projectForm.프로젝트유형}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    프로젝트유형: e.target.value,
                  })
                }
              >
                <option value="NEW">신규개발</option>
                <option value="RENEWAL">리뉴얼</option>
                <option value="MAINTENANCE">유지보수</option>
              </select>
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <Field label="계약일">
                <input
                  type="date"
                  style={inputStyle}
                  value={projectForm.계약일}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, 계약일: e.target.value })
                  }
                />
              </Field>
              <Field label="착수일">
                <input
                  type="date"
                  style={inputStyle}
                  value={projectForm.착수일}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, 착수일: e.target.value })
                  }
                />
              </Field>
              <Field label="납기일">
                <input
                  type="date"
                  style={inputStyle}
                  value={projectForm.납기일}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, 납기일: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="설명">
              <textarea
                style={{
                  ...inputStyle,
                  height: 72,
                  padding: "10px 12px",
                  resize: "vertical",
                }}
                value={projectForm.설명}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, 설명: e.target.value })
                }
              />
            </Field>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setShowAward(null)}
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
                onClick={handleAward}
                disabled={awarding}
                type="button"
                style={{
                  minHeight: 36,
                  border: "none",
                  borderRadius: 999,
                  padding: "0 20px",
                  background: "rgba(22,163,74,0.9)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: awarding ? "not-allowed" : "pointer",
                  opacity: awarding ? 0.6 : 1,
                }}
              >
                {awarding ? "생성 중..." : "프로젝트 생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
