import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setStoredUser } from "../utils/session";

export default function Login() {
  const [직원ID, set직원ID] = useState("");
  const [비밀번호, set비밀번호] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedId = 직원ID.trim();

    if (!trimmedId || !비밀번호) {
      setError("직원 ID와 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await login({ 직원ID: trimmedId, 비밀번호 });
      setStoredUser(res.data);
      navigate(res.data.직무 === "PM" ? "/pm/dashboard" : "/member/dashboard");
    } catch {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-panel">
        <section className="login-copy">
          <div className="brand">
            <div className="brand-mark">∴</div>
            <div>
              <div className="brand-name">PM ERP</div>
              <div className="brand-sub">Project Management</div>
            </div>
          </div>

          <h1 className="login-title">프로젝트 운영을 한 화면에서 정돈하세요</h1>
          <p className="page-subtitle" style={{ maxWidth: 460 }}>
            계약, 주간 리포트, 피드백, 산출물 승인까지 모든 흐름을 Apple 스타일의
            가벼운 업무 화면으로 관리합니다.
          </p>

          <div className="glass-grid cards-grid" style={{ marginTop: 28 }}>
            {[
              ["▦", "진행 현황", "프로젝트 상태와 마감일을 빠르게 확인"],
              ["◌", "피드백", "클라이언트 요구사항과 반영 상태 관리"],
              ["◎", "팀 작업", "직원별 작업 내용과 진행률 추적"],
            ].map(([icon, title, body]) => (
              <div className="glass-card" key={title}>
                <div className="tile-icon">{icon}</div>
                <div className="row-title" style={{ marginTop: 12 }}>
                  {title}
                </div>
                <div className="row-meta" style={{ whiteSpace: "normal" }}>
                  {body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="login-card">
          <h2 className="modal-title">로그인</h2>
          <p className="page-subtitle" style={{ marginBottom: 18 }}>
            계정 정보를 입력해주세요.
          </p>

          {error && <div className="error">{error}</div>}

          <div className="field">
            <label className="label">직원 ID</label>
            <input
              className="input"
              placeholder="EMP-2025-001"
              value={직원ID}
              onChange={(e) => set직원ID(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="field">
            <label className="label">비밀번호</label>
            <input
              className="input"
              type="password"
              placeholder="비밀번호 입력"
              value={비밀번호}
              onChange={(e) => set비밀번호(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            className="btn primary"
            disabled={loading}
            onClick={handleLogin}
            style={{ width: "100%", marginTop: 8 }}
            type="button"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="glass-card" style={{ marginTop: 18, padding: 14 }}>
            <div className="row-title">안내</div>
            <div className="row-meta" style={{ whiteSpace: "normal" }}>
              계정 문의는 담당 PM에게 연락하세요. 초기 비밀번호는 1234입니다.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
