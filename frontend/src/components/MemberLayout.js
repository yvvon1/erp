import React from "react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../utils/session";

export default function MemberLayout({ children }) {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const initials = user.이름?.slice(0, 1) || "U";

  const handleLogout = () => {
    clearStoredUser();
    navigate("/");
  };

  return (
    <div className="glass-shell">
      <div className="glass-app">
        <header className="app-topbar">
          {/* 브랜드 */}
          <button
            className="brand"
            onClick={() => navigate("/member/dashboard")}
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
            type="button"
          >
            <span className="brand-mark">✚</span>
            <span className="brand-name">Project Management System</span>
          </button>

          {/* 팀원은 탭 없이 현재 위치만 표시 */}
          <nav
            aria-label="주요 메뉴"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px",
              border: "1px solid var(--line)",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/member/dashboard")}
              style={{
                minHeight: "32px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: 0,
                borderRadius: "999px",
                padding: "0 16px",
                background: "var(--dark)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              내 대시보드
            </button>
          </nav>

          {/* 우측 */}
          <div className="top-actions">
            <div className="profile-card">
              <div className="avatar">{initials}</div>
              <div>
                <div className="profile-name">{user.이름 || "사용자"}</div>
                <div className="profile-role">{user.직무 || "Member"}</div>
              </div>
            </div>
            <button
              className="icon-button"
              onClick={handleLogout}
              title="로그아웃"
              type="button"
            >
              ↗
            </button>
          </div>
        </header>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
