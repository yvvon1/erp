import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getProject, updateProject } from "../../api/projects";
import { getMembers, addMember, deleteMember } from "../../api/members";
import { getEmployees } from "../../api/employees";
import { getReports } from "../../api/reports";
import { getDeliverables } from "../../api/deliverables";
import {
  formatDate,
  reviewLabel,
  reviewTone,
  roleLabel,
  statusLabel,
  statusTone,
} from "../../utils/format";

export default function PMProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [tab, setTab] = useState("info");
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    직원ID: "",
    담당롤: "FRONT",
    투입일: "",
  });

  const refreshMembers = useCallback(
    () => getMembers(id).then((res) => setMembers(res.data)),
    [id],
  );

  useEffect(() => {
    getProject(id).then((res) => setProject(res.data));
    refreshMembers();
    getEmployees().then((res) => setEmployees(res.data));
    getReports(id).then((res) => setReports(res.data));
    getDeliverables(id).then((res) => setDeliverables(res.data));
  }, [id, refreshMembers]);

  const handleAddMember = async () => {
    if (!memberForm.직원ID || !memberForm.투입일) return;
    await addMember({ ...memberForm, 프로젝트ID: id });
    setShowAddMember(false);
    refreshMembers();
  };

  const handleStatusChange = async (status) => {
    await updateProject(id, { ...project, 상태: status });
    getProject(id).then((res) => setProject(res.data));
  };

  if (!project) {
    return (
      <Layout active="프로젝트 목록">
        <div className="glass-card empty-state">로딩중...</div>
      </Layout>
    );
  }

  return (
    <Layout active="프로젝트 목록">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate("/pm/projects")} type="button">
            ← 프로젝트 목록
          </button>
          <h1 className="page-title">{project.프로젝트명}</h1>
          <div className="page-subtitle">{project.회사명 || "-"} · {formatDate(project.납기일)} 납기</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="select" value={project.상태} onChange={(e) => handleStatusChange(e.target.value)} style={{ width: 132 }}>
            <option value="PLANNING">계획중</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="CLOSED">종료</option>
          </select>
          <button className="btn primary" onClick={() => navigate(`/pm/reports/${id}`)} type="button">위클리리포트</button>
          <button className="btn primary" onClick={() => navigate(`/pm/deliverables/${id}`)} type="button">작업물 관리</button>
        </div>
      </header>

      <div className="tabs">
        {[
          ["info", "프로젝트 정보"],
          ["members", "팀 구성"],
          ["reports", "위클리리포트"],
          ["deliverables", "작업물"],
        ].map(([key, label]) => (
          <button className={`tab ${tab === key ? "active" : ""}`} key={key} onClick={() => setTab(key)} type="button">
            {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <section className="glass-card">
          <div className="glass-grid cards-grid">
            {[
              ["상태", statusLabel[project.상태] || project.상태],
              ["클라이언트", project.회사명],
              ["담당자", project.담당자명],
              ["연락처", project.연락처],
              ["계약일", formatDate(project.계약일)],
              ["착수일", formatDate(project.착수일)],
              ["납기일", formatDate(project.납기일)],
            ].map(([label, value]) => (
              <div className="glass-card" style={{ padding: 14 }} key={label}>
                <div className="card-title">{label}</div>
                <div className="row-title">{value || "-"}</div>
              </div>
            ))}
          </div>
          {project.설명 && <p className="page-subtitle" style={{ marginTop: 16 }}>{project.설명}</p>}
          <span className={`badge ${statusTone[project.상태] || "neutral"}`}>{statusLabel[project.상태]}</span>
        </section>
      )}

      {tab === "members" && (
        <section className="glass-card">
          <div className="page-header" style={{ marginBottom: 6 }}>
            <h2 className="section-title">팀 구성</h2>
            <button className="btn primary" onClick={() => setShowAddMember(true)} type="button">+ 팀원 추가</button>
          </div>
          <div className="glass-grid cards-grid">
            {members.map((member) => (
              <div className="glass-card" key={member.직원ID} style={{ padding: 14 }}>
                <div className="list-row" style={{ borderBottom: 0, padding: 0 }}>
                  <div className="avatar">{member.이름?.[0] || "M"}</div>
                  <div className="row-main">
                    <div className="row-title">{member.이름}</div>
                    <div className="row-meta">{roleLabel[member.담당롤]} · {member.직무}</div>
                  </div>
                  <button className="icon-button" onClick={() => deleteMember(id, member.직원ID).then(refreshMembers)} type="button">×</button>
                </div>
              </div>
            ))}
          </div>
          {members.length === 0 && <div className="empty-state">팀원이 없습니다.</div>}
        </section>
      )}

      {tab === "reports" && (
        <SimpleList
          empty="등록된 리포트가 없습니다."
          items={reports}
          onManage={() => navigate(`/pm/reports/${id}`)}
          render={(report) => ({
            icon: report.차수,
            title: `${report.차수}차 보고`,
            meta: formatDate(report.회의일),
            badge: report.처리여부 === "DONE" ? "반영완료" : "반영중",
            tone: report.처리여부 === "DONE" ? "green" : "orange",
          })}
          title="위클리리포트"
        />
      )}

      {tab === "deliverables" && (
        <SimpleList
          empty="등록된 작업물이 없습니다."
          items={deliverables}
          onManage={() => navigate(`/pm/deliverables/${id}`)}
          render={(item) => ({
            icon: `v${item.차수}`,
            title: item.파일명,
            meta: `${item.제출자명 || "-"} · ${formatDate(item.제출일)}`,
            badge: reviewLabel[item.상태],
            tone: reviewTone[item.상태],
          })}
          title="작업물"
        />
      )}

      {showAddMember && (
        <div className="modal-backdrop">
          <div className="glass-modal">
            <h2 className="modal-title">팀원 추가</h2>
            <div className="field">
              <label className="label">직원 선택</label>
              <select className="select" value={memberForm.직원ID} onChange={(e) => setMemberForm({ ...memberForm, 직원ID: e.target.value })}>
                <option value="">선택</option>
                {employees.filter((e) => e.재직여부 === "ACTIVE").map((employee) => (
                  <option key={employee.직원ID} value={employee.직원ID}>{employee.이름} ({employee.직무})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">역할</label>
              <select className="select" value={memberForm.담당롤} onChange={(e) => setMemberForm({ ...memberForm, 담당롤: e.target.value })}>
                <option value="PM">PM</option>
                <option value="FRONT">프론트엔드</option>
                <option value="BACK">백엔드</option>
                <option value="PLANNER">기획자</option>
                <option value="ETC">기타</option>
              </select>
            </div>
            <div className="field">
              <label className="label">투입일</label>
              <input className="input" type="date" value={memberForm.투입일} onChange={(e) => setMemberForm({ ...memberForm, 투입일: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowAddMember(false)} type="button">취소</button>
              <button className="btn primary" onClick={handleAddMember} type="button">추가</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function SimpleList({ title, items, render, onManage, empty }) {
  return (
    <section className="glass-card">
      <div className="page-header" style={{ marginBottom: 6 }}>
        <h2 className="section-title">{title}</h2>
        <button className="btn primary" onClick={onManage} type="button">관리 →</button>
      </div>
      {items.map((item) => {
        const row = render(item);
        return (
          <div className="list-row" key={`${row.title}-${row.meta}`}>
            <div className="tile-icon">{row.icon}</div>
            <div className="row-main">
              <div className="row-title">{row.title}</div>
              <div className="row-meta">{row.meta}</div>
            </div>
            <span className={`badge ${row.tone || "neutral"}`}>{row.badge}</span>
          </div>
        );
      })}
      {items.length === 0 && <div className="empty-state">{empty}</div>}
    </section>
  );
}
