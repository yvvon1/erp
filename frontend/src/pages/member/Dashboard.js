import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "../../components/MemberLayout";
import { getProjects } from "../../api/projects";
import { getReports } from "../../api/reports";
import { formatDate } from "../../utils/format";
import { getStoredUser } from "../../utils/session";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};

const statusStyle = {
  IN_PROGRESS: { bg: "rgba(37,99,235,0.1)", color: "#1d4ed8", label: "진행중" },
  PLANNING: { bg: "rgba(0,0,0,0.05)", color: "#666", label: "계획중" },
  CLOSED: { bg: "rgba(22,163,74,0.1)", color: "#15803d", label: "종료" },
};

function dDay(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function DDayBadge({ date }) {
  const d = dDay(date);
  if (d === null) return null;
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
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 11px",
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

function MiniDonut({ pct, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="rgba(20,20,30,0.8)"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export default function MemberDashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  useEffect(() => {
    getProjects().then((res) => {
      const active = res.data.filter((p) => p.상태 !== "CLOSED");
      setProjects(active);
      Promise.all(
        active.map((p) =>
          getReports(p.프로젝트ID).then((r) =>
            r.data.map((rr) => ({ ...rr, 프로젝트명: p.프로젝트명 })),
          ),
        ),
      ).then((all) => setReports(all.flat()));
    });
  }, []);

  const inProgress = projects.filter((p) => p.상태 === "IN_PROGRESS");
  const urgent = projects.filter((p) => {
    const d = dDay(p.납기일);
    return d !== null && d <= 14;
  });
  const done = reports.filter((r) => r.처리여부 === "DONE");
  const reportRatio = reports.length > 0 ? done.length / reports.length : 0;

  return (
    <MemberLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 헤더 */}
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "rgba(20,20,30,0.9)",
            }}
          >
            안녕하세요, {user.이름 || "멤버"}님
          </h1>
          <div
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: "rgba(0,0,0,0.4)",
              marginTop: 5,
            }}
          >
            {today} · 참여 중인 프로젝트를 확인하세요.
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
          {[
            {
              label: "참여 프로젝트",
              value: projects.length,
              color: "#1d4ed8",
              pct: 1,
            },
            {
              label: "진행중",
              value: inProgress.length,
              color: "#0891b2",
              pct: projects.length ? inProgress.length / projects.length : 0,
            },
            {
              label: "납기 임박",
              value: urgent.length,
              color: urgent.length > 0 ? "#b91c1c" : "#15803d",
              pct: projects.length ? urgent.length / projects.length : 0,
            },
            {
              label: "보고서 반영률",
              value: `${Math.round(reportRatio * 100)}%`,
              color: "#7c3aed",
              pct: reportRatio,
            },
          ].map((k) => (
            <div
              key={k.label}
              style={{
                ...glass,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 130,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                {k.label}
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 200,
                  color: "rgba(20,20,30,0.88)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 999,
                  background: `${k.color}18`,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, k.pct * 100)}%`,
                    background: k.color,
                    borderRadius: 999,
                    opacity: 0.6,
                    transition: "width 0.5s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 참여 프로젝트 + 위클리리포트 — 나란히 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: 12,
          }}
        >
          {/* 좌 — 프로젝트 카드 */}
          <div style={{ ...glass, padding: "22px 24px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(20,20,30,0.8)",
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              참여 프로젝트
            </div>

            {projects.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
                  color: "rgba(0,0,0,0.28)",
                  fontSize: 14,
                  fontWeight: 300,
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 32 }}>📋</div>
                참여 중인 프로젝트가 없습니다.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {projects.map((p) => {
                const st = statusStyle[p.상태] || statusStyle.PLANNING;
                const pReports = reports.filter(
                  (r) => r.프로젝트명 === p.프로젝트명,
                );
                const pDone = pReports.filter((r) => r.처리여부 === "DONE");
                const pRatio =
                  pReports.length > 0 ? pDone.length / pReports.length : 0;
                return (
                  <div
                    key={p.프로젝트ID}
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <MiniDonut pct={pRatio} color="#1d4ed8" size={60} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "rgba(20,20,30,0.88)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.프로젝트명}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 9px",
                            borderRadius: 999,
                            background: st.bg,
                            color: st.color,
                            flexShrink: 0,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 300,
                          color: "rgba(0,0,0,0.4)",
                          marginBottom: 6,
                        }}
                      >
                        {p.회사명 || "-"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 300,
                            color: "rgba(0,0,0,0.45)",
                          }}
                        >
                          납기 {formatDate(p.납기일) || "-"}
                        </span>
                        <DDayBadge date={p.납기일} />
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/member/reports/${p.프로젝트ID}/1`)
                      }
                      type="button"
                      style={{
                        minHeight: 40,
                        minWidth: 110,
                        border: "1px solid rgba(20,20,30,0.85)",
                        borderRadius: 12,
                        background: "rgba(20,20,30,0.85)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      보고서 작성 →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우 — 위클리리포트 */}
          <div style={{ ...glass, padding: "22px 22px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(20,20,30,0.8)",
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              최근 위클리리포트
            </div>

            {reports.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                  padding: "12px 14px",
                  background: "rgba(0,0,0,0.02)",
                  borderRadius: 12,
                }}
              >
                <MiniDonut pct={reportRatio} color="#7c3aed" size={52} />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(20,20,30,0.8)",
                    }}
                  >
                    반영 완료율
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {done.length}/{reports.length}건 반영완료
                  </div>
                </div>
              </div>
            )}

            {reports.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
                  flexDirection: "column",
                  gap: 8,
                  color: "rgba(0,0,0,0.28)",
                  fontSize: 13,
                  fontWeight: 300,
                }}
              >
                <div style={{ fontSize: 28 }}>📝</div>
                제출한 보고서가 없습니다.
              </div>
            )}

            {reports.slice(0, 8).map((r, i) => (
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
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
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
                      marginTop: 1,
                    }}
                  >
                    {r.차수}차 · {formatDate(r.회의일)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
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
                  {r.처리여부 === "DONE" ? "완료" : "대기"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
