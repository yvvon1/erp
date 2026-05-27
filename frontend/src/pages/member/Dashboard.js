import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getProjects } from "../../api/projects";
import { formatDate, statusLabel, statusTone } from "../../utils/format";
import { getStoredUser } from "../../utils/session";

export default function MemberDashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const user = getStoredUser() || {};

  useEffect(() => {
    getProjects().then((res) => {
      setProjects(res.data.filter((project) => project.상태 !== "CLOSED"));
    });
  }, []);

  return (
    <Layout active="내 대시보드">
      <header className="page-header">
        <div>
          <h1 className="page-title">안녕하세요, {user.이름 || "멤버"}님</h1>
          <div className="page-subtitle">참여 중인 프로젝트와 리포트 제출 상태를 확인하세요.</div>
        </div>
      </header>

      <section className="glass-grid cards-grid">
        {projects.map((project) => (
          <article className="glass-card" key={project.프로젝트ID}>
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="tile-icon">{project.프로젝트명?.[0] || "P"}</div>
              <div className="row-main">
                <div className="row-title">{project.프로젝트명}</div>
                <div className="row-meta">{project.회사명 || "-"}</div>
              </div>
              <span className={`badge ${statusTone[project.상태] || "neutral"}`}>
                {statusLabel[project.상태] || project.상태}
              </span>
            </div>
            <div className="list-row">
              <div className="row-main">
                <div className="row-meta">납기일</div>
                <div className="row-title">{formatDate(project.납기일)}</div>
              </div>
            </div>
            <button
              className="btn primary"
              onClick={() => navigate(`/member/reports/${project.프로젝트ID}/1`)}
              type="button"
              style={{ width: "100%" }}
            >
              보고서 작성 →
            </button>
          </article>
        ))}
        {projects.length === 0 && <div className="glass-card empty-state">참여 중인 프로젝트가 없습니다.</div>}
      </section>
    </Layout>
  );
}
