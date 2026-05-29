import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../api/projects";
import { getReports } from "../../api/reports";
import { getDeliverables } from "../../api/deliverables";
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

function dDay(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function DDayBadge({ date }) {
  const d = dDay(date);
  if (d === null)
    return <span style={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>-</span>;
  const color =
    d < 0 ? "#b91c1c" : d <= 7 ? "#b45309" : d <= 30 ? "#1d4ed8" : "#888";
  const bg =
    d < 0
      ? "rgba(185,28,28,0.08)"
      : d <= 7
        ? "rgba(180,83,9,0.08)"
        : d <= 30
          ? "rgba(37,99,235,0.08)"
          : "rgba(0,0,0,0.04)";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 9px",
        borderRadius: 999,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {d < 0 ? `D+${Math.abs(d)}` : d === 0 ? "D-Day" : `D-${d}`}
    </span>
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
      }}
    >
      {children}
    </div>
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

// 도넛 차트 SVG
function DonutChart({ value, total, color, label }) {
  const pct = total > 0 ? value / total : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
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
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
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

// 가로 바 차트
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
                transition: "width 0.5s ease",
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PMDashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
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
            return r.data.map((rr) => ({ ...rr, 프로젝트명: p.프로젝트명 }));
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

  const kpis = [
    {
      label: "전체",
      value: projects.length,
      color: "#1d4ed8",
      bg: "rgba(37,99,235,0.08)",
    },
    {
      label: "진행중",
      value: inProgress.length,
      color: "#0891b2",
      bg: "rgba(8,145,178,0.08)",
    },
    {
      label: "계획중",
      value: planning.length,
      color: "#7c3aed",
      bg: "rgba(139,92,246,0.08)",
    },
    {
      label: "종료",
      value: closed.length,
      color: "#15803d",
      bg: "rgba(22,163,74,0.08)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 페이지 타이틀 */}
      <div style={{ marginBottom: 4 }}>
        <h1
          style={{
            fontSize: 28,
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

      {/* KPI 4개 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
        }}
      >
        {kpis.map((k) => (
          <div key={k.label} style={{ ...glass, padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.45)",
                  letterSpacing: "0.01em",
                }}
              >
                {k.label} 프로젝트
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: k.color,
                  opacity: 0.7,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 200,
                color: "rgba(20,20,30,0.88)",
                letterSpacing: "-0.05em",
                lineHeight: 1,
                marginBottom: 10,
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
        ))}
      </div>

      {/* 메인 2열 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}
      >
        {/* 좌 — 전체 프로젝트 */}
        <div style={{ ...glass, padding: "20px 22px" }}>
          <SectionTitle>전체 프로젝트 현황</SectionTitle>
          <div
            style={{
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
          {projects.length === 0 && (
            <EmptyMsg>등록된 프로젝트가 없습니다.</EmptyMsg>
          )}
          {projects.map((p) => {
            const st = statusStyle[p.상태] || statusStyle.PLANNING;
            return (
              <div
                key={p.프로젝트ID}
                onClick={() => navigate(`/pm/projects/${p.프로젝트ID}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 72px 96px 72px",
                  gap: 8,
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom: "0.5px solid rgba(0,0,0,0.04)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0,0,0,0.012)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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

        {/* 우 — 통계 + 알림 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* 상태 분포 도넛 */}
          <div style={{ ...glass, padding: "20px 22px" }}>
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
          <div style={{ ...glass, padding: "20px 22px", flex: 1 }}>
            <div
              style={{
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
              urgent.map((p) => (
                <div
                  key={p.프로젝트ID}
                  onClick={() => navigate(`/pm/projects/${p.프로젝트ID}`)}
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* 하단 3열 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}
      >
        {/* 위클리리포트 */}
        <div style={{ ...glass, padding: "20px 22px" }}>
          <SectionTitle>최근 위클리리포트</SectionTitle>
          {reports.length === 0 && <EmptyMsg>보고서가 없습니다.</EmptyMsg>}
          {reports.slice(0, 5).map((r, i) => (
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
                  background:
                    r.처리여부 === "DONE"
                      ? "rgba(22,163,74,0.1)"
                      : "rgba(180,83,9,0.08)",
                  color: r.처리여부 === "DONE" ? "#15803d" : "#b45309",
                  whiteSpace: "nowrap",
                }}
              >
                {r.처리여부 === "DONE" ? "반영완료" : "반영중"}
              </span>
            </div>
          ))}
        </div>

        {/* 미처리 피드백 */}
        <div style={{ ...glass, padding: "20px 22px" }}>
          <div
            style={{
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
            pending.slice(0, 5).map((r, i) => (
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
            ))
          )}
        </div>

        {/* 작업물 + 바 차트 */}
        <div style={{ ...glass, padding: "20px 22px" }}>
          <SectionTitle>작업물 검토 대기</SectionTitle>
          {reviewWaiting.length === 0 ? (
            <EmptyMsg>검토 대기 없음 ✓</EmptyMsg>
          ) : (
            reviewWaiting.slice(0, 3).map((d, i) => (
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
            ))
          )}

          {/* 구분 */}
          {projects.length > 0 && (
            <>
              <div
                style={{
                  height: "0.5px",
                  background: "rgba(0,0,0,0.06)",
                  margin: "16px 0 14px",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(20,20,30,0.7)",
                  marginBottom: 12,
                }}
              >
                납기일 현황
              </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
