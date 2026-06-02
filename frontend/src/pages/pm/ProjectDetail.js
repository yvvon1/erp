import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getProject, updateProject } from "../../api/projects";
import { getMembers, addMember, deleteMember, getMemberCapacity } from "../../api/members";
import { getEmployees } from "../../api/employees";
import { getReports } from "../../api/reports";
import { getDeliverables } from "../../api/deliverables";
import { formatDate, reviewLabel, reviewTone, roleLabel, statusLabel } from "../../utils/format";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};
const statusStyle = {
  IN_PROGRESS: { bg: "rgba(37,99,235,0.1)",  color: "#1d4ed8", label: "진행중" },
  PLANNING:    { bg: "rgba(0,0,0,0.05)",      color: "#666",    label: "계획중" },
  CLOSED:      { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "종료"   },
};
const reviewStyle = {
  IN_REVIEW: { bg: "rgba(37,99,235,0.1)",  color: "#1d4ed8", label: "검토중"   },
  REVISION:  { bg: "rgba(185,28,28,0.08)", color: "#b91c1c", label: "수정요청" },
  APPROVED:  { bg: "rgba(22,163,74,0.1)",  color: "#15803d", label: "최종승인" },
};
const avatarColors = [
  { bg: "rgba(37,99,235,0.12)",  color: "#1d4ed8" },
  { bg: "rgba(22,163,74,0.12)",  color: "#15803d" },
  { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  { bg: "rgba(8,145,178,0.12)",  color: "#0891b2" },
  { bg: "rgba(180,83,9,0.12)",   color: "#b45309" },
];
const inputStyle = {
  width: "100%", height: 40,
  border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 10,
  padding: "0 12px", fontSize: 13, fontWeight: 300,
  color: "rgba(20,20,30,0.85)", background: "rgba(255,255,255,0.8)",
  outline: "none", boxSizing: "border-box",
};

// 투입률 색상
function capColor(pct) {
  if (pct >= 100) return "#b91c1c";
  if (pct >= 80)  return "#b45309";
  if (pct >= 50)  return "#1d4ed8";
  return "#15803d";
}

function CapBar({ value }) {
  const pct   = Math.min(100, value);
  const color = capColor(pct);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 32 }}>{value}%</span>
    </div>
  );
}

export default function PMProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,      setProject]      = useState(null);
  const [members,      setMembers]      = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [capacity,     setCapacity]     = useState({}); // { 직원ID: { 현재투입률, 가용률 } }
  const [reports,      setReports]      = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [tab,          setTab]          = useState("info");

  // 팀원 추가 모달 state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm,    setMemberForm]    = useState({ 직원ID: "", 담당롤: "FRONT", 투입일: "", 투입률: 100 });
  const [memberError,   setMemberError]   = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [search,        setSearch]        = useState("");

  const refreshMembers = useCallback(() =>
    getMembers(id).then((res) => setMembers(res.data)), [id]);

  const refreshCapacity = useCallback(() =>
    getMemberCapacity().then((res) => {
      const map = {};
      res.data.forEach((c) => { map[c.직원ID] = c; });
      setCapacity(map);
    }), []);

  useEffect(() => {
    getProject(id).then((res) => setProject(res.data));
    refreshMembers();
    refreshCapacity();
    getEmployees().then((res) => setEmployees(res.data));
    getReports(id).then((res) => setReports(res.data));
    getDeliverables(id).then((res) => setDeliverables(res.data));
  }, [id, refreshMembers, refreshCapacity]);

  const handleAddMember = async () => {
    if (!memberForm.직원ID || !memberForm.투입일) return;
    const cap = capacity[memberForm.직원ID];
    if (cap && memberForm.투입률 > cap.가용률) {
      setMemberError(`가용률 초과: ${cap.이름 || ""}의 가용률은 ${cap.가용률}%입니다.`);
      return;
    }
    setMemberLoading(true);
    setMemberError("");
    try {
      await addMember({ ...memberForm, 프로젝트ID: id });
      setShowAddMember(false);
      setMemberForm({ 직원ID: "", 담당롤: "FRONT", 투입일: "", 투입률: 100 });
      setSearch("");
      refreshMembers();
      refreshCapacity();
    } catch (e) {
      setMemberError(e.response?.data?.message || "추가 실패");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleDeleteMember = async (직원ID, 이름) => {
    if (!window.confirm(`${이름}을(를) 팀에서 제외하시겠습니까?`)) return;
    await deleteMember(id, 직원ID);
    refreshMembers();
    refreshCapacity();
  };

  const handleStatusChange = async (status) => {
    const sliceDate = (d) => (d ? String(d).slice(0, 10) : null);
    await updateProject(id, {
      ...project, 상태: status,
      계약일: sliceDate(project.계약일), 착수일: sliceDate(project.착수일),
      납기일: sliceDate(project.납기일), 완료일: sliceDate(project.완료일),
    });
    getProject(id).then((res) => setProject(res.data));
  };

  if (!project)
    return (
      <Layout active="프로젝트 목록">
        <div style={{ textAlign: "center", padding: 48, color: "rgba(0,0,0,0.3)", fontSize: 14 }}>
          로딩중...
        </div>
      </Layout>
    );

  const st   = statusStyle[project.상태] || statusStyle.PLANNING;
  const TABS = [
    { key: "info",         label: "프로젝트 정보"               },
    { key: "members",      label: `팀 구성 ${members.length}명` },
    { key: "reports",      label: `위클리리포트 ${reports.length}건` },
    { key: "deliverables", label: `작업물 ${deliverables.length}건`  },
  ];

  // 팀원 추가 모달 — 배정 안 된 직원 + 검색 필터
  const assignedIds  = members.map((m) => m.직원ID);
  const activeEmps   = employees.filter((e) => e.재직여부 === "ACTIVE" && !assignedIds.includes(e.직원ID));
  const filteredEmps = activeEmps.filter((e) =>
    e.이름.includes(search) || e.직무.includes(search) || e.부서?.includes(search)
  );
  const selectedCap  = memberForm.직원ID ? capacity[memberForm.직원ID] : null;
  const maxRate      = selectedCap ? selectedCap.가용률 : 100;

  return (
    <Layout active="프로젝트 목록">
      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/pm/projects")} type="button"
          style={{ background: "none", border: "none", color: "rgba(0,0,0,0.4)", fontSize: 13, fontWeight: 300, cursor: "pointer", padding: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          ← 프로젝트 목록
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "rgba(20,20,30,0.9)" }}>
                {project.프로젝트명}
              </h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: st.bg, color: st.color }}>
                {st.label}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 300, color: "rgba(0,0,0,0.45)" }}>
              {project.회사명 || "-"} · 납기 {formatDate(project.납기일) || "-"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <select value={project.상태} onChange={(e) => handleStatusChange(e.target.value)}
              style={{ ...inputStyle, width: 120, height: 36 }}>
              <option value="PLANNING">계획중</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="CLOSED">종료</option>
            </select>
            <button onClick={() => navigate(`/pm/reports/${id}`)} type="button"
              style={{ minHeight: 36, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 999, padding: "0 16px", background: "#fff", fontSize: 12, fontWeight: 500, color: "rgba(20,20,30,0.7)", cursor: "pointer" }}>
              위클리리포트
            </button>
            <button onClick={() => navigate(`/pm/deliverables/${id}`)} type="button"
              style={{ minHeight: 36, border: "1px solid rgba(20,20,30,0.85)", borderRadius: 999, padding: "0 16px", background: "rgba(20,20,30,0.85)", fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
              작업물 관리
            </button>
          </div>
        </div>
      </div>

      {/* ── 탭 ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(255,255,255,0.6)", borderRadius: 999, padding: 4, width: "fit-content", border: "0.5px solid rgba(0,0,0,0.08)" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} type="button"
            style={{ minHeight: 32, border: "none", borderRadius: 999, padding: "0 16px", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", background: tab === t.key ? "rgba(20,20,30,0.88)" : "transparent", color: tab === t.key ? "#fff" : "rgba(0,0,0,0.5)", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 프로젝트 정보 탭 ── */}
      {tab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "클라이언트",  value: project.회사명            },
              { label: "담당자",      value: project.담당자명          },
              { label: "연락처",      value: project.연락처            },
              { label: "계약일",      value: formatDate(project.계약일) },
              { label: "착수일",      value: formatDate(project.착수일) },
              { label: "납기일",      value: formatDate(project.납기일) },
              { label: "완료일",      value: formatDate(project.완료일) },
              { label: "프로젝트ID",  value: project.프로젝트ID        },
            ].map((item) => (
              <div key={item.label} style={{ ...glass, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(0,0,0,0.35)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(20,20,30,0.85)" }}>
                  {item.value || "-"}
                </div>
              </div>
            ))}
          </div>
          {project.설명 && (
            <div style={{ ...glass, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.35)", marginBottom: 8 }}>프로젝트 설명</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: "rgba(20,20,30,0.75)", lineHeight: 1.6 }}>{project.설명}</div>
            </div>
          )}
        </div>
      )}

      {/* ── 팀 구성 탭 ── */}
      {tab === "members" && (
        <div style={{ ...glass, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(20,20,30,0.9)" }}>팀 구성</div>
            <button onClick={() => { setShowAddMember(true); setMemberError(""); setSearch(""); }}
              type="button"
              style={{ minHeight: 34, border: "1px solid rgba(20,20,30,0.85)", borderRadius: 999, padding: "0 16px", background: "rgba(20,20,30,0.85)", fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
              + 팀원 추가
            </button>
          </div>

          {members.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "rgba(0,0,0,0.25)", fontSize: 13 }}>
              팀원이 없습니다.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 10 }}>
            {members.map((m, i) => {
              const av  = avatarColors[i % avatarColors.length];
              const cap = capacity[m.직원ID];
              const total = cap?.현재투입률 ?? m.투입률;
              return (
                <div key={m.직원ID}
                  style={{ background: "rgba(0,0,0,0.02)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 600, flexShrink: 0 }}>
                      {m.이름?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* 이름 +3px, 색 진하게 */}
                      <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(20,20,30,0.95)", marginBottom: 3 }}>{m.이름}</div>
                      {/* 직무(프론트엔드 등) + 담당롤(역할/직급) — roleLabel 제거, 직무만 + 담당롤 뱃지 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(20,20,30,0.7)" }}>{m.직무}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: av.bg, color: av.color }}>
                          {m.담당롤 === "PM" ? "PM" : m.담당롤 === "FRONT" ? "Frontend" : m.담당롤 === "BACK" ? "Backend" : m.담당롤 === "PLANNER" ? "기획" : m.담당롤}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteMember(m.직원ID, m.이름)} type="button"
                      style={{ fontSize: 11, fontWeight: 500, color: "#b91c1c", background: "rgba(185,28,28,0.06)", border: "none", borderRadius: 999, padding: "3px 10px", cursor: "pointer", flexShrink: 0 }}>
                      제외
                    </button>
                  </div>

                  {/* 투입률 표시 — 레이블 +3px, 수치 +3px, 색 진하게 */}
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(20,20,30,0.6)" }}>이 프로젝트 투입률</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: capColor(m.투입률) }}>{m.투입률}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(20,20,30,0.6)" }}>전체 투입률</span>
                    </div>
                    <CapBar value={total} />
                  </div>

                  {/* 투입일 +3px, 색 진하게 */}
                  <div style={{ fontSize: 14, fontWeight: 400, color: "rgba(20,20,30,0.55)", marginTop: 8 }}>
                    투입일 {formatDate(m.투입일) || "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 위클리리포트 탭 ── */}
      {tab === "reports" && (
        <div style={{ ...glass, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(20,20,30,0.9)" }}>위클리리포트</div>
            <button onClick={() => navigate(`/pm/reports/${id}`)} type="button"
              style={{ minHeight: 34, border: "1px solid rgba(20,20,30,0.85)", borderRadius: 999, padding: "0 16px", background: "rgba(20,20,30,0.85)", fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
              관리 →
            </button>
          </div>
          {reports.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "rgba(0,0,0,0.25)", fontSize: 13 }}>
              등록된 위클리리포트가 없습니다.
            </div>
          )}
          {reports.map((r) => (
            <div key={r.차수}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "rgba(20,20,30,0.6)", flexShrink: 0 }}>
                {r.차수}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(20,20,30,0.85)" }}>{r.차수}차 보고</div>
                <div style={{ fontSize: 11, fontWeight: 300, color: "rgba(0,0,0,0.38)", marginTop: 2 }}>{formatDate(r.회의일)}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
                background: r.처리여부 === "DONE" ? "rgba(22,163,74,0.1)" : "rgba(180,83,9,0.08)",
                color:      r.처리여부 === "DONE" ? "#15803d"             : "#b45309" }}>
                {r.처리여부 === "DONE" ? "반영완료" : "반영중"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── 작업물 탭 ── */}
      {tab === "deliverables" && (
        <div style={{ ...glass, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(20,20,30,0.9)" }}>작업물</div>
            <button onClick={() => navigate(`/pm/deliverables/${id}`)} type="button"
              style={{ minHeight: 34, border: "1px solid rgba(20,20,30,0.85)", borderRadius: 999, padding: "0 16px", background: "rgba(20,20,30,0.85)", fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
              관리 →
            </button>
          </div>
          {deliverables.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "rgba(0,0,0,0.25)", fontSize: 13 }}>
              등록된 작업물이 없습니다.
            </div>
          )}
          {deliverables.map((d) => {
            const rv = reviewStyle[d.상태] || reviewStyle.IN_REVIEW;
            return (
              <div key={d.작업물ID}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(37,99,235,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>
                  v{d.차수}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(20,20,30,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.파일명}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: "rgba(0,0,0,0.38)", marginTop: 2 }}>{d.제출자명 || "-"} · {formatDate(d.제출일)}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: rv.bg, color: rv.color, whiteSpace: "nowrap" }}>
                  {rv.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 팀원 추가 모달 ── */}
      {showAddMember && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 18, background: "rgba(0,0,0,0.28)", backdropFilter: "blur(12px)" }}>
          <div style={{ width: "min(480px,100%)", maxHeight: "calc(100vh - 36px)", display: "flex", flexDirection: "column", background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.12)" }}>

            {/* 모달 헤더 */}
            <div style={{ padding: "24px 24px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.07)", flexShrink: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em" }}>팀원 추가</h2>
              <input type="text" placeholder="이름·직무·부서 검색..." value={search}
                onChange={(e) => { setSearch(e.target.value); setMemberForm({ ...memberForm, 직원ID: "" }); }}
                style={{ ...inputStyle, height: 36, fontSize: 12 }} />
            </div>

            {/* 직원 목록 */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
              {filteredEmps.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "rgba(0,0,0,0.3)" }}>
                  {activeEmps.length === 0 ? "배정 가능한 직원이 없습니다." : "검색 결과 없음"}
                </div>
              )}
              {filteredEmps.map((e) => {
                const cap       = capacity[e.직원ID];
                const isSelected = memberForm.직원ID === e.직원ID;
                const used      = cap?.현재투입률 ?? 0;
                const avail     = cap?.가용률 ?? 100;
                return (
                  <div key={e.직원ID} onClick={() => { setMemberForm({ ...memberForm, 직원ID: e.직원ID, 투입률: Math.min(100, avail) }); setMemberError(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 12, marginBottom: 4, cursor: "pointer",
                      background: isSelected ? "rgba(20,20,30,0.05)" : "transparent",
                      border: isSelected ? "0.5px solid rgba(20,20,30,0.12)" : "0.5px solid transparent" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#232323,#ffcb82)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {e.이름[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(20,20,30,0.85)" }}>{e.이름}</span>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.45)" }}>{e.직무}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${used}%`, background: capColor(used), borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
                          투입 {used}% · <span style={{ fontWeight: 600, color: capColor(used) }}>가용 {avail}%</span>
                        </span>
                      </div>
                    </div>
                    {isSelected && <span style={{ fontSize: 14, color: "rgba(20,20,30,0.5)" }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {/* 하단 설정 */}
            <div style={{ padding: "16px 24px 24px", borderTop: "0.5px solid rgba(0,0,0,0.07)", flexShrink: 0 }}>
              {/* 역할 + 투입일 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)", marginBottom: 5 }}>역할</label>
                  <select style={inputStyle} value={memberForm.담당롤}
                    onChange={(e) => setMemberForm({ ...memberForm, 담당롤: e.target.value })}>
                    <option value="PM">PM</option>
                    <option value="FRONT">프론트엔드</option>
                    <option value="BACK">백엔드</option>
                    <option value="PLANNER">기획자</option>
                    <option value="ETC">기타</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)", marginBottom: 5 }}>투입일</label>
                  <input type="date" style={inputStyle} value={memberForm.투입일}
                    onChange={(e) => setMemberForm({ ...memberForm, 투입일: e.target.value })} />
                </div>
              </div>

              {/* 투입률 슬라이더 — 직원 선택 시 표시 */}
              {memberForm.직원ID && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,0,0,0.5)" }}>
                      투입률 <span style={{ color: "rgba(0,0,0,0.3)", fontWeight: 300 }}>(최대 가용 {maxRate}%)</span>
                    </label>
                    <span style={{ fontSize: 13, fontWeight: 700, color: capColor(memberForm.투입률) }}>{memberForm.투입률}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={10} max={Math.max(10, maxRate)} step={10}
                      value={memberForm.투입률}
                      onChange={(e) => { setMemberForm({ ...memberForm, 투입률: Number(e.target.value) }); setMemberError(""); }}
                      style={{ flex: 1, accentColor: "rgba(20,20,30,0.85)" }} />
                    <input type="number" min={10} max={Math.max(10, maxRate)} step={10}
                      value={memberForm.투입률}
                      onChange={(e) => { setMemberForm({ ...memberForm, 투입률: Number(e.target.value) }); setMemberError(""); }}
                      style={{ ...inputStyle, width: 64, textAlign: "center" }} />
                  </div>
                  {/* 배정 후 예상 */}
                  {selectedCap && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }}>배정 후 총 투입률</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: capColor(selectedCap.현재투입률 + memberForm.투입률) }}>
                          {selectedCap.현재투입률 + memberForm.투입률}%
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, selectedCap.현재투입률 + memberForm.투입률)}%`,
                          background: capColor(selectedCap.현재투입률 + memberForm.투입률), borderRadius: 999, opacity: 0.7, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {memberError && (
                <div style={{ fontSize: 12, color: "#b91c1c", background: "rgba(185,28,28,0.06)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                  ⚠️ {memberError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { setShowAddMember(false); setMemberError(""); setSearch(""); }} type="button"
                  style={{ minHeight: 36, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 999, padding: "0 16px", background: "#fff", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", cursor: "pointer" }}>
                  취소
                </button>
                <button onClick={handleAddMember} type="button" disabled={!memberForm.직원ID || !memberForm.투입일 || memberLoading || memberForm.투입률 > maxRate}
                  style={{ minHeight: 36, border: "none", borderRadius: 999, padding: "0 16px",
                    background: (!memberForm.직원ID || !memberForm.투입일 || memberForm.투입률 > maxRate) ? "rgba(0,0,0,0.2)" : "rgba(20,20,30,0.85)",
                    fontSize: 12, fontWeight: 500, color: "#fff",
                    cursor: (!memberForm.직원ID || !memberForm.투입일 || memberForm.투입률 > maxRate) ? "not-allowed" : "pointer" }}>
                  {memberLoading ? "추가 중..." : `${memberForm.투입률}%로 추가`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}