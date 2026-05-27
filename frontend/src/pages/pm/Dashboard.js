import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getProjects } from "../../api/projects";
import { getReports } from "../../api/reports";
import { formatDate, statusLabel, statusTone } from "../../utils/format";

const bars = [28, 42, 61, 72, 76, 81, 88, 92, 86, 78, 70, 62, 54, 48, 43, 39, 34, 30, 26];

export default function PMDashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data);

        const reportResults = await Promise.all(
          res.data.map(async (project) => {
            const reportRes = await getReports(project.프로젝트ID);
            return reportRes.data.map((report) => ({
              ...report,
              프로젝트명: project.프로젝트명,
            }));
          }),
        );
        setReports(reportResults.flat());
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const memberProjectMap = useMemo(() => {
    return projects.reduce((map, project) => {
      (project.팀원목록 || []).forEach((member) => {
        map[member] = [...(map[member] || []), project.프로젝트명];
      });
      return map;
    }, {});
  }, [projects]);

  const inProgress = projects.filter((p) => p.상태 === "IN_PROGRESS").length;
  const planning = projects.filter((p) => p.상태 === "PLANNING").length;
  const closed = projects.filter((p) => p.상태 === "CLOSED").length;
  const pendingFeedbacks = reports.filter((r) => r.처리여부 !== "DONE").length;
  const healthScore = Math.max(0, Math.min(100, 82 - pendingFeedbacks * 4 + closed * 2));

  const stats = [
    ["프로젝트 활성도", `${projects.length ? Math.round((inProgress / projects.length) * 100) : 0}`, "/100", "Normal"],
    ["진행중 프로젝트", inProgress, "개", "Active"],
    ["계획중 프로젝트", planning, "개", "Planning"],
    ["종료 프로젝트", closed, "개", "Closed"],
  ];

  return (
    <Layout active="대시보드">
      <section className="glass-grid dashboard-hero-grid" style={{ marginBottom: 12 }}>
        <article className="glass-card dark-card">
          <div className="card-title">Project Mapping</div>
          <div className="brain-map">
            <div className="brain-visual" />
          </div>
          <div className="list-row" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <div className="row-main">
              <div className="row-title">PM ERP Operational Map</div>
              <div className="row-meta">프로젝트 흐름, 피드백, 산출물 승인을 하나의 맵으로 추적합니다.</div>
            </div>
            <span className="badge green">{healthScore}%</span>
          </div>
        </article>

        <article className="glass-card dark-card">
          <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
            <div className="row-main">
              <div className="section-title">AI Analytics Insights</div>
              <div className="row-meta">최근 프로젝트 상태 기반 운영 리스크</div>
            </div>
            <span className="badge neutral">Today</span>
          </div>

          <div className="insight-grid">
            <div className="insight-tile">
              <div className="row-title">Feedback Risk</div>
              <div className="row-meta">미처리 피드백</div>
              <div className="kpi-value" style={{ color: "#fff", fontSize: 26 }}>{pendingFeedbacks}</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, pendingFeedbacks * 12)}%`, background: "var(--red)" }} />
              </div>
            </div>
            <div className="insight-tile">
              <div className="row-title">Delivery Health</div>
              <div className="row-meta">종료/승인 흐름</div>
              <div className="kpi-value" style={{ color: "#fff", fontSize: 26 }}>{healthScore}%</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${healthScore}%` }} />
              </div>
            </div>
          </div>

          <div className="gauge">{projects.length}</div>
        </article>
      </section>

      <section className="glass-grid kpi-grid" style={{ marginBottom: 12 }}>
        {stats.map(([label, value, unit, tone]) => (
          <article className="glass-card" key={label}>
            <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
              <div className="row-main">
                <div className="card-title">{label}</div>
                <div>
                  <span className="kpi-value">{value}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 850, marginLeft: 4 }}>{unit}</span>
                </div>
              </div>
              <span className="badge green">{tone}</span>
            </div>
            <div className="mini-chart">
              {bars.map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="glass-grid content-grid">
        <article className="glass-card">
          <div className="page-header" style={{ marginBottom: 8 }}>
            <h2 className="section-title">프로젝트 현황</h2>
            <button className="btn" type="button" onClick={() => navigate("/pm/projects")}>Full list →</button>
          </div>
          {projects.length === 0 && <div className="empty-state">프로젝트가 없습니다.</div>}
          {projects.slice(0, 6).map((project) => (
            <div
              className="list-row clickable"
              key={project.프로젝트ID}
              onClick={() => navigate(`/pm/projects/${project.프로젝트ID}`)}
            >
              <div className="tile-icon">{project.프로젝트명?.[0] || "P"}</div>
              <div className="row-main">
                <div className="row-title">{project.프로젝트명}</div>
                <div className="row-meta">{project.회사명 || "-"} · 납기 {formatDate(project.납기일)}</div>
              </div>
              <span className={`badge ${statusTone[project.상태] || "neutral"}`}>
                {statusLabel[project.상태] || project.상태}
              </span>
            </div>
          ))}
        </article>

        <article className="glass-card">
          <div className="page-header" style={{ marginBottom: 8 }}>
            <h2 className="section-title">Suggested Next Steps</h2>
            <button className="btn primary" type="button">Create Plan +</button>
          </div>

          {[
            ["Diagnostic", "미처리 피드백 우선순위 정리", `${pendingFeedbacks}건 확인`],
            ["Specialist", "지연 가능 프로젝트 담당자 확인", `${inProgress}개 진행중`],
            ["Delivery", "승인 가능한 작업물 검토", "최종 산출물 점검"],
            ["Monitoring", "주간 리포트 제출 상태 추적", `${reports.length}개 리포트`],
          ].map(([type, title, meta]) => (
            <div className="list-row" key={title}>
              <div className="tile-icon">{type[0]}</div>
              <div className="row-main">
                <div className="row-title">{title}</div>
                <div className="row-meta">{meta}</div>
              </div>
              <span className="badge neutral">{type}</span>
            </div>
          ))}
        </article>
      </section>

      <section className="glass-grid content-grid" style={{ marginTop: 12 }}>
        <article className="glass-card">
          <h2 className="section-title">팀원 참여 현황</h2>
          {Object.entries(memberProjectMap).length === 0 && (
            <div className="empty-state">팀원 데이터가 없습니다.</div>
          )}
          {Object.entries(memberProjectMap).slice(0, 5).map(([member, projectList]) => (
            <div className="list-row" key={member}>
              <div className="avatar">{member[0]}</div>
              <div className="row-main">
                <div className="row-title">{member}</div>
                <div className="row-meta">{projectList.join(", ")}</div>
              </div>
              <span className="badge blue">{projectList.length}개</span>
            </div>
          ))}
        </article>

        <article className="glass-card">
          <h2 className="section-title">최근 위클리리포트</h2>
          {reports.slice(0, 5).map((report) => (
            <div className="list-row" key={`${report.프로젝트ID}-${report.차수}`}>
              <div className="tile-icon">{report.차수}</div>
              <div className="row-main">
                <div className="row-title">{report.프로젝트명}</div>
                <div className="row-meta">{report.차수}차 보고 · {formatDate(report.회의일)}</div>
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="empty-state">보고서가 없습니다.</div>}
        </article>
      </section>
    </Layout>
  );
}
