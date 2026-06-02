import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../api/projects";
import { getReports } from "../../api/reports";
import { getDeliverables } from "../../api/deliverables";
import { getReport } from "../../api/reports";
import { formatDate } from "../../utils/format";
import { getStoredUser } from "../../utils/session";

const glass = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(48px)",
  WebkitBackdropFilter: "blur(48px)",
  border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};

const statusStyle = {
  IN_PROGRESS: { bg: "rgba(37,99,235,0.1)", color: "#1d4ed8", label: "진행중" },
  PLANNING: { bg: "rgba(0,0,0,0.06)", color: "#555", label: "계획중" },
  CLOSED: { bg: "rgba(22,163,74,0.1)", color: "#15803d", label: "종료" },
};

function dDay(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function DDayBadge({ date }) {
  const d = dDay(date);
  if (d === null)
    return <span style={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>-</span>;
  const color =
    d < 0 ? "#b91c1c" : d <= 7 ? "#b45309" : d <= 30 ? "#1d4ed8" : "#888";
  return (
    <span
      style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}
    >
      {d < 0 ? `D+${Math.abs(d)}` : d === 0 ? "D-Day" : `D-${d}`}
    </span>
  );
}

function EmptyMsg({ children }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "28px 0",
        fontSize: 13,
        fontWeight: 300,
        color: "rgba(0,0,0,0.28)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "rgba(20,20,30,0.88)",
        letterSpacing: "-0.02em",
        marginBottom: 16,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function DonutChart({ value, total, color, label }) {
  const pct = total > 0 ? value / total : 0;
  const r = 28,
    circ = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle
          cx={36}
          cy={36}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={8}
        />
        <circle
          cx={36}
          cy={36}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s" }}
        />
        <text
          x={36}
          y={40}
          textAnchor="middle"
          fontSize={14}
          fontWeight={600}
          fill="rgba(20,20,30,0.85)"
        >
          {value}
        </text>
      </svg>
      <span
        style={{ fontSize: 11, fontWeight: 400, color: "rgba(0,0,0,0.45)" }}
      >
        {label}
      </span>
    </div>
  );
}

function BarChart({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "rgba(20,20,30,0.75)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "70%",
              }}
            >
              {item.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: item.color }}>
              {item.value}
            </span>
          </div>
          <div
            style={{
              height: 5,
              borderRadius: 999,
              background: "rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(item.value / max) * 100}%`,
                background: item.color,
                borderRadius: 999,
                transition: "width 0.5s",
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "rgba(0,0,0,0.28)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px,100%)",
          maxHeight: "80vh",
          overflow: "auto",
          background: "rgba(255,255,255,0.96)",
          borderRadius: 22,
          padding: "28px 30px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function PMDashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [kpiFilter, setKpiFilter] = useState(null);
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();
  const user = getStoredUser() || {};

  useEffect(() => {
    (async () => {
      try {
        const pRes = await getProjects();
        setProjects(pRes.data);
        const rAll = await Promise.all(
          pRes.data.map(async (p) => {
            const r = await getReports(p.프로젝트ID);
            return r.data.map((rr) => ({
              ...rr,
              프로젝트ID: p.프로젝트ID,
              프로젝트명: p.프로젝트명,
            }));
          }),
        );
        setReports(rAll.flat());
        const dAll = await Promise.all(
          pRes.data.map(async (p) => {
            const d = await getDeliverables(p.프로젝트ID);
            return d.data.map((dd) => ({ ...dd, 프로젝트명: p.프로젝트명 }));
          }),
        );
        setDeliverables(dAll.flat());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const inProgress = projects.filter((p) => p.상태 === "IN_PROGRESS");
  const planning = projects.filter((p) => p.상태 === "PLANNING");
  const closed = projects.filter((p) => p.상태 === "CLOSED");
  const pending = reports.filter((r) => r.처리여부 !== "DONE");
  const urgent = inProgress.filter((p) => {
    const d = dDay(p.납기일);
    return d !== null && d <= 14;
  });
  const reviewWaiting = deliverables.filter((d) => d.상태 === "IN_REVIEW");

  const filteredProjects =
    !kpiFilter || kpiFilter === "ALL"
      ? projects
      : projects.filter((p) => p.상태 === kpiFilter);

  const kpis = [
    {
      label: "전체 프로젝트",
      value: projects.length,
      color: "#1d4ed8",
      bg: "rgba(37,99,235,0.08)",
      filter: "ALL",
    },
    {
      label: "진행중",
      value: inProgress.length,
      color: "#0891b2",
      bg: "rgba(8,145,178,0.08)",
      filter: "IN_PROGRESS",
    },
    {
      label: "계획중",
      value: planning.length,
      color: "#7c3aed",
      bg: "rgba(139,92,246,0.08)",
      filter: "PLANNING",
    },
    {
      label: "종료",
      value: closed.length,
      color: "#15803d",
      bg: "rgba(22,163,74,0.08)",
      filter: "CLOSED",
    },
  ];

  const openReportModal = async (r) => {
    try {
      const res = await getReport(r.프로젝트ID, r.차수);
      setModal({ type: "report", data: res.data });
    } catch {
      setModal({ type: "report", data: { report: r, details: [] } });
    }
  };

  const openProjectModal = (p) => setModal({ type: "project", data: p });

  return (
    /*
     * 전체 레이아웃:
     *   height:100%  → Shell <main> 의 남은 공간을 꽉 채움
     *   display:flex + flexDirection:column → 자식들이 세로로 쌓임
     *   gap:12 → 섹션 간격 (기존 16 → 12로 살짝 줄여 공간 확보)
     *
     * 구조:
     *   [타이틀]     — flexShrink:0  (고정)
     *   [KPI 4개]    — flexShrink:0  (고정)
     *   [메인 2열]   — flex:1        (남은 공간의 절반가량)
     *   [하단 3열]   — flex:1        (남은 공간의 절반가량)
     */
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* ── 타이틀 ── */}
      <div style={{ flexShrink: 0, marginBottom: 4 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "rgba(20,20,30,0.9)",
          }}
        >
          대시보드
        </h1>
        <div
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "rgba(0,0,0,0.4)",
            marginTop: 4,
          }}
        >
          안녕하세요, {user.이름 || "PM"}님 · 오늘의 프로젝트 현황입니다
        </div>
      </div>

      {/* ── KPI 4개 ── */}
      <div
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
        }}
      >
        {kpis.map((k) => {
          const isActive = kpiFilter === k.filter;
          return (
            <div
              key={k.label}
              onClick={() => setKpiFilter(isActive ? null : k.filter)}
              style={{
                ...glass,
                padding: "16px 20px",
                cursor: "pointer",
                outline: isActive ? `2px solid ${k.color}` : "none",
                transition: "outline 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.45)",
                  }}
                >
                  {k.label}
                </span>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: k.color,
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 200,
                  color: "rgba(20,20,30,0.88)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {k.value}
              </div>
              <div style={{ height: 3, borderRadius: 999, background: k.bg }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, projects.length ? (k.value / projects.length) * 100 : 0)}%`,
                    background: k.color,
                    borderRadius: 999,
                    opacity: 0.55,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 메인 2열 (flex:1 로 공간 확보) ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 12,
        }}
      >
        {/* 좌 — 전체 프로젝트 */}
        <div
          style={{
            ...glass,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <SectionTitle>
              {kpiFilter && kpiFilter !== "ALL"
                ? `${statusStyle[kpiFilter]?.label} 프로젝트`
                : "전체 프로젝트 현황"}
            </SectionTitle>
            {kpiFilter && (
              <button
                onClick={() => setKpiFilter(null)}
                type="button"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.4)",
                  background: "none",
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 999,
                  padding: "2px 10px",
                  cursor: "pointer",
                }}
              >
                필터 해제 ×
              </button>
            )}
          </div>
          {/* 테이블 헤더 */}
          <div
            style={{
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: "1fr 72px 96px 72px",
              gap: 8,
              padding: "0 0 10px",
              borderBottom: "0.5px solid rgba(0,0,0,0.07)",
              marginBottom: 4,
            }}
          >
            {["프로젝트명", "상태", "납기일", "D-Day"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.35)",
                  letterSpacing: "0.02em",
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {/* 스크롤 영역 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              paddingRight: 2,
            }}
          >
            {filteredProjects.length === 0 && (
              <EmptyMsg>등록된 프로젝트가 없습니다.</EmptyMsg>
            )}
            {filteredProjects.map((p) => {
              const st = statusStyle[p.상태] || statusStyle.PLANNING;
              return (
                <div
                  key={p.프로젝트ID}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 72px 96px 72px",
                    gap: 8,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "0.5px solid rgba(0,0,0,0.04)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.012)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => openProjectModal(p)}
                >
                  <div style={{ minWidth: 0 }}>
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
                        color: "rgba(0,0,0,0.38)",
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
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: st.bg,
                      color: st.color,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.45)",
                    }}
                  >
                    {formatDate(p.납기일) || "-"}
                  </span>
                  <DDayBadge date={p.납기일} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 우 — 통계 + 납기임박 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 0,
          }}
        >
          {/* 상태 분포 */}
          <div style={{ ...glass, padding: "18px 22px", flexShrink: 0 }}>
            <SectionTitle>프로젝트 상태 분포</SectionTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <DonutChart
                value={inProgress.length}
                total={Math.max(projects.length, 1)}
                color="#1d4ed8"
                label="진행중"
              />
              <DonutChart
                value={planning.length}
                total={Math.max(projects.length, 1)}
                color="#7c3aed"
                label="계획중"
              />
              <DonutChart
                value={closed.length}
                total={Math.max(projects.length, 1)}
                color="#15803d"
                label="종료"
              />
            </div>
          </div>

          {/* 납기 임박 */}
          <div
            style={{
              ...glass,
              padding: "18px 22px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "rgba(20,20,30,0.88)",
                  letterSpacing: "-0.02em",
                }}
              >
                납기 임박
              </span>
              {urgent.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(185,28,28,0.08)",
                    color: "#b91c1c",
                  }}
                >
                  {urgent.length}건
                </span>
              )}
            </div>
            {urgent.length === 0 ? (
              <EmptyMsg>임박한 납기 없음 ✓</EmptyMsg>
            ) : (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  minHeight: 0,
                  paddingRight: 2,
                }}
              >
                {urgent.map((p) => (
                  <div
                    key={p.프로젝트ID}
                    onClick={() => openProjectModal(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#b91c1c",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "rgba(20,20,30,0.85)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.프로젝트명}
                    </div>
                    <DDayBadge date={p.납기일} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 하단 3열 (flex:1 로 공간 확보) ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* 최근 위클리리포트 */}
        <div
          style={{
            ...glass,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <SectionTitle>최근 위클리리포트</SectionTitle>
          {reports.length === 0 ? (
            <EmptyMsg>보고서가 없습니다.</EmptyMsg>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                paddingRight: 2,
              }}
            >
              {reports.map((r, i) => (
                <div
                  key={i}
                  onClick={() => openReportModal(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.012)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(20,20,30,0.6)",
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
                        color: "rgba(20,20,30,0.85)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.프로젝트명}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 300,
                        color: "rgba(0,0,0,0.38)",
                        marginTop: 2,
                      }}
                    >
                      {r.차수}차 · {formatDate(r.회의일)}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                      background:
                        r.처리여부 === "DONE"
                          ? "rgba(22,163,74,0.1)"
                          : "rgba(180,83,9,0.08)",
                      color: r.처리여부 === "DONE" ? "#15803d" : "#b45309",
                    }}
                  >
                    {r.처리여부 === "DONE" ? "반영완료" : "반영중"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 미처리 피드백 */}
        <div
          style={{
            ...glass,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(20,20,30,0.88)",
                letterSpacing: "-0.02em",
              }}
            >
              미처리 피드백
            </span>
            {pending.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(180,83,9,0.08)",
                  color: "#b45309",
                }}
              >
                {pending.length}건
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <EmptyMsg>모든 피드백 처리됨 ✓</EmptyMsg>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                paddingRight: 2,
              }}
            >
              {pending.map((r, i) => (
                <div
                  key={i}
                  onClick={() => openReportModal(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.012)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(180,83,9,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#b45309",
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
                        color: "rgba(20,20,30,0.85)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.프로젝트명}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 300,
                        color: "rgba(0,0,0,0.38)",
                        marginTop: 2,
                      }}
                    >
                      {r.차수}차 보고 · 반영 대기
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 작업물 검토 대기 + 바 차트 */}
        <div
          style={{
            ...glass,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <SectionTitle>작업물 검토 대기</SectionTitle>
          {reviewWaiting.length === 0 ? (
            <EmptyMsg>검토 대기 없음 ✓</EmptyMsg>
          ) : (
            <div
              style={{
                overflowY: "auto",
                paddingRight: 2,
                flexShrink: 0,
                maxHeight: "40%",
              }}
            >
              {reviewWaiting.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(37,99,235,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1d4ed8",
                      flexShrink: 0,
                    }}
                  >
                    v{d.차수}
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
                      {d.프로젝트명}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 300,
                        color: "rgba(0,0,0,0.38)",
                        marginTop: 2,
                      }}
                    >
                      {d.파일명 || "-"}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(37,99,235,0.08)",
                      color: "#1d4ed8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    검토중
                  </span>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  height: "0.5px",
                  background: "rgba(0,0,0,0.06)",
                  margin: "14px 0 12px",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(20,20,30,0.7)",
                  marginBottom: 12,
                  flexShrink: 0,
                }}
              >
                납기일 현황
              </div>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <BarChart
                  items={projects.slice(0, 4).map((p) => ({
                    label: p.프로젝트명,
                    value: Math.max(0, dDay(p.납기일) ?? 0),
                    color:
                      (dDay(p.납기일) ?? 99) <= 14
                        ? "#b91c1c"
                        : (dDay(p.납기일) ?? 99) <= 30
                          ? "#b45309"
                          : "#1d4ed8",
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 모달: 프로젝트 ── */}
      {modal?.type === "project" && (
        <Modal onClose={() => setModal(null)}>
          {(() => {
            const p = modal.data;
            const st = statusStyle[p.상태] || statusStyle.PLANNING;
            const pReports = reports.filter(
              (r) => r.프로젝트명 === p.프로젝트명,
            );
            const pDeliverables = deliverables.filter(
              (d) => d.프로젝트명 === p.프로젝트명,
            );
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {p.프로젝트명}
                    </h2>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(0,0,0,0.45)",
                        marginTop: 3,
                      }}
                    >
                      {p.회사명 || "-"}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: st.bg,
                      color: st.color,
                    }}
                  >
                    {st.label}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {[
                    { label: "납기일", value: formatDate(p.납기일) },
                    {
                      label: "D-Day",
                      value: (() => {
                        const d = dDay(p.납기일);
                        return d === null
                          ? "-"
                          : d < 0
                            ? `D+${Math.abs(d)}`
                            : d === 0
                              ? "D-Day"
                              : `D-${d}`;
                      })(),
                    },
                    { label: "착수일", value: formatDate(p.착수일) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "rgba(0,0,0,0.03)",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: "rgba(0,0,0,0.35)",
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "rgba(20,20,30,0.85)",
                        }}
                      >
                        {item.value || "-"}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(37,99,235,0.05)",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(0,0,0,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      위클리리포트
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 200,
                        color: "#1d4ed8",
                      }}
                    >
                      {pReports.length}
                      <span style={{ fontSize: 12, fontWeight: 400 }}>건</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(0,0,0,0.38)",
                        marginTop: 2,
                      }}
                    >
                      반영완료{" "}
                      {pReports.filter((r) => r.처리여부 === "DONE").length}건
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(22,163,74,0.05)",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(0,0,0,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      작업물
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 200,
                        color: "#15803d",
                      }}
                    >
                      {pDeliverables.length}
                      <span style={{ fontSize: 12, fontWeight: 400 }}>건</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(0,0,0,0.38)",
                        marginTop: 2,
                      }}
                    >
                      승인완료{" "}
                      {
                        pDeliverables.filter((d) => d.상태 === "APPROVED")
                          .length
                      }
                      건
                    </div>
                  </div>
                </div>
                {p.설명 && (
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "rgba(20,20,30,0.6)",
                      lineHeight: 1.7,
                      background: "rgba(0,0,0,0.02)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 20,
                    }}
                  >
                    {p.설명}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setModal(null)}
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
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      setModal(null);
                      navigate(`/pm/projects/${p.프로젝트ID}`);
                    }}
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
                    상세보기 →
                  </button>
                </div>
              </>
            );
          })()}
        </Modal>
      )}

      {/* ── 모달: 리포트 ── */}
      {modal?.type === "report" && (
        <Modal onClose={() => setModal(null)}>
          {(() => {
            const { report, details } = modal.data;
            if (!report) return <div>데이터를 불러오는 중...</div>;
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {report.차수}차 보고
                    </h2>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(0,0,0,0.45)",
                        marginTop: 3,
                      }}
                    >
                      {formatDate(report.회의일)}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background:
                        report.처리여부 === "DONE"
                          ? "rgba(22,163,74,0.1)"
                          : "rgba(180,83,9,0.08)",
                      color: report.처리여부 === "DONE" ? "#15803d" : "#b45309",
                    }}
                  >
                    {report.처리여부 === "DONE" ? "반영완료" : "반영중"}
                  </span>
                </div>
                {report.요구사항 && (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      요구사항
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(20,20,30,0.75)",
                        lineHeight: 1.7,
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      {report.요구사항}
                    </div>
                  </div>
                )}
                {report.피드백 && (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      피드백
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(20,20,30,0.75)",
                        lineHeight: 1.7,
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      {report.피드백}
                    </div>
                  </div>
                )}
                {details?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(20,20,30,0.7)",
                        marginBottom: 10,
                      }}
                    >
                      팀원 작업내용 {details.length}명
                    </div>
                    {details.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(0,0,0,0.02)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "rgba(20,20,30,0.85)",
                            }}
                          >
                            {d.이름}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#1d4ed8",
                            }}
                          >
                            {d.진행률}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "rgba(0,0,0,0.06)",
                            borderRadius: 999,
                            overflow: "hidden",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${d.진행률}%`,
                              background:
                                "linear-gradient(90deg, #91eaa8, #25c76f)",
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 300,
                            color: "rgba(0,0,0,0.55)",
                            lineHeight: 1.6,
                          }}
                        >
                          {d.작업내용}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setModal(null)}
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
                    닫기
                  </button>
                </div>
              </>
            );
          })()}
        </Modal>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
      `}</style>
    </div>
  );
}
