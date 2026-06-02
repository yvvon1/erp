import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MemberLayout from "../../components/MemberLayout";
import { getReports, createReportDetail, getReport } from "../../api/reports";
import { formatDate, roleLabel } from "../../utils/format";
import { getStoredUser } from "../../utils/session";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
  padding: "24px 26px",
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

export default function MemberReportDetail() {
  const { projectId, round } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const [reports, setReports] = useState([]);
  const [selectedRound, setSelectedRound] = useState(round || "");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [form, setForm] = useState({
    작업유형: "FRONT",
    작업내용: "",
    진행률: 50,
    비고: "",
  });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(null); // null=폼, report=상세보기

  useEffect(() => {
    getReports(projectId).then((res) => {
      setReports(res.data);
      if (!round && res.data.length > 0)
        setSelectedRound(res.data[res.data.length - 1].차수);
    });
  }, [projectId, round]);

  const handleViewReport = async (r) => {
    const res = await getReport(projectId, r.차수);
    setSelectedReport(res.data.report);
    setSelectedDetails(res.data.details);
    setViewMode("report");
  };

  const handleSubmit = async () => {
    if (!selectedRound || !form.작업내용.trim()) return;
    setSubmitting(true);
    await createReportDetail({
      프로젝트ID: projectId,
      차수: selectedRound,
      직원ID: user.직원ID,
      ...form,
    });
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <MemberLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              ...glass,
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              제출 완료!
            </h1>
            <div
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "rgba(0,0,0,0.45)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              위클리리포트 상세가 성공적으로 저장됐습니다.
            </div>
            <button
              onClick={() => navigate("/member/dashboard")}
              type="button"
              style={{
                minHeight: 40,
                border: "1px solid rgba(20,20,30,0.85)",
                borderRadius: 999,
                padding: "0 24px",
                background: "rgba(20,20,30,0.85)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate("/member/dashboard")}
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
          ← 대시보드로
        </button>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "rgba(20,20,30,0.9)",
          }}
        >
          위클리리포트 작성
        </h1>
        <div
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "rgba(0,0,0,0.4)",
            marginTop: 4,
          }}
        >
          이번 주 작업 내용과 진행률을 제출합니다.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* 좌 — 기존 리포트 내역 */}
        <div style={{ ...glass, padding: "20px 18px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            보고 내역 {reports.length}건
          </div>

          {reports.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(0,0,0,0.28)",
              }}
            >
              보고서가 없습니다.
            </div>
          )}

          {reports.map((r) => {
            const isActive =
              viewMode === "report" && selectedReport?.차수 === r.차수;
            return (
              <div
                key={r.차수}
                onClick={() => handleViewReport(r)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  marginBottom: 4,
                  background: isActive ? "rgba(20,20,30,0.88)" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? "#fff" : "rgba(20,20,30,0.6)",
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
                      color: isActive ? "#fff" : "rgba(20,20,30,0.85)",
                    }}
                  >
                    {r.차수}차 보고
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: isActive
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
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.처리여부 === "DONE" ? "완료" : "대기"}
                </span>
              </div>
            );
          })}

          {/* 새 보고서 작성 버튼 */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "0.5px solid rgba(0,0,0,0.06)",
            }}
          >
            <button
              onClick={() => setViewMode(null)}
              type="button"
              style={{
                width: "100%",
                minHeight: 36,
                border:
                  viewMode === null ? "none" : "0.5px solid rgba(0,0,0,0.1)",
                borderRadius: 10,
                background:
                  viewMode === null ? "rgba(20,20,30,0.85)" : "transparent",
                color: viewMode === null ? "#fff" : "rgba(0,0,0,0.5)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ✏️ 새 보고서 작성
            </button>
          </div>
        </div>

        {/* 우 — 폼 or 상세보기 */}
        {viewMode === "report" && selectedReport ? (
          /* 리포트 상세 보기 */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={glass}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(20,20,30,0.9)",
                  marginBottom: 16,
                }}
              >
                {selectedReport.차수}차 보고 상세
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "회의일", value: formatDate(selectedReport.회의일) },
                  {
                    label: "다음 회의일",
                    value: formatDate(selectedReport.다음회의일),
                  },
                  {
                    label: "처리여부",
                    value:
                      selectedReport.처리여부 === "DONE"
                        ? "반영완료"
                        : "반영중",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(0,0,0,0.02)",
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
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(20,20,30,0.85)",
                      }}
                    >
                      {item.value || "-"}
                    </div>
                  </div>
                ))}
              </div>
              {selectedReport.요구사항 && (
                <div style={{ marginBottom: 12 }}>
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
                    {selectedReport.요구사항}
                  </div>
                </div>
              )}
              {selectedReport.피드백 && (
                <div>
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
                    {selectedReport.피드백}
                  </div>
                </div>
              )}
            </div>

            {/* 팀원 작업내용 */}
            {selectedDetails.length > 0 && (
              <div style={glass}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.9)",
                    marginBottom: 14,
                  }}
                >
                  팀원 작업내용
                </div>
                {selectedDetails.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "rgba(37,99,235,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1d4ed8",
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
                            marginTop: 1,
                          }}
                        >
                          {roleLabel[d.작업유형] || d.작업유형}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1d4ed8",
                        }}
                      >
                        {d.진행률}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "rgba(0,0,0,0.06)",
                        borderRadius: 999,
                        overflow: "hidden",
                        marginBottom: 8,
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
                        fontSize: 13,
                        fontWeight: 300,
                        color: "rgba(20,20,30,0.65)",
                        lineHeight: 1.6,
                      }}
                    >
                      {d.작업내용}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 작성 폼 */
          <div style={glass}>
            {/* 차수 선택 */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                보고 차수 선택
              </label>
              <select
                style={inputStyle}
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
              >
                {reports.map((r) => (
                  <option key={r.차수} value={r.차수}>
                    {r.차수}차 보고 ({formatDate(r.회의일)})
                  </option>
                ))}
              </select>
            </div>

            {/* 작업 유형 */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                작업 유형
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["FRONT", "BACK", "REVIEW", "PLANNING", "ETC"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, 작업유형: type })}
                    style={{
                      minHeight: 34,
                      border:
                        form.작업유형 === type
                          ? "none"
                          : "0.5px solid rgba(0,0,0,0.12)",
                      borderRadius: 999,
                      padding: "0 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      background:
                        form.작업유형 === type ? "rgba(20,20,30,0.85)" : "#fff",
                      color:
                        form.작업유형 === type ? "#fff" : "rgba(0,0,0,0.5)",
                      transition: "all 0.15s",
                    }}
                  >
                    {roleLabel[type]}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                height: "0.5px",
                background: "rgba(0,0,0,0.06)",
                marginBottom: 18,
              }}
            />

            {/* 작업 내용 */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                작업 내용
              </label>
              <textarea
                style={{
                  ...inputStyle,
                  height: 120,
                  padding: "10px 12px",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
                placeholder="이번 주 작업한 내용을 상세히 입력하세요"
                value={form.작업내용}
                onChange={(e) => setForm({ ...form, 작업내용: e.target.value })}
              />
            </div>

            {/* 진행률 */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(0,0,0,0.45)",
                    letterSpacing: "0.02em",
                  }}
                >
                  진행률
                </label>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.85)",
                  }}
                >
                  {form.진행률}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.진행률}
                onChange={(e) =>
                  setForm({ ...form, 진행률: Number(e.target.value) })
                }
                style={{
                  width: "100%",
                  accentColor: "rgba(20,20,30,0.85)",
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 5,
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${form.진행률}%`,
                    background: "linear-gradient(90deg, #91eaa8, #25c76f)",
                    borderRadius: 999,
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </div>

            {/* 비고 */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                비고
              </label>
              <input
                style={inputStyle}
                placeholder="특이사항이 있으면 입력하세요"
                value={form.비고}
                onChange={(e) => setForm({ ...form, 비고: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
              style={{
                width: "100%",
                minHeight: 46,
                border: "none",
                borderRadius: 12,
                background: "rgba(20,20,30,0.85)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "제출 중..." : "제출하기"}
            </button>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
