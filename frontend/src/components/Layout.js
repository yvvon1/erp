import React from "react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../utils/session";

const pmMenus = [
  { icon: "⌂", label: "대시보드", path: "/pm/dashboard" },
  { icon: "▱", label: "프로젝트 목록", path: "/pm/projects" },
  { icon: "◌", label: "클라이언트", path: "/pm/clients" },
  { icon: "◎", label: "직원 관리", path: "/pm/employees" },
];

const memberMenus = [
  { icon: "⌂", label: "내 대시보드", path: "/member/dashboard" },
];

export default function Layout({ children, active }) {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const menus = user.직무 === "PM" ? pmMenus : memberMenus;
  const initials = user.이름?.slice(0, 1) || "U";

  const handleLogout = () => {
    clearStoredUser();
    navigate("/");
  };

  return (
    <div className="glass-shell">
      <div className="glass-app">
        <header className="app-topbar">
          <button
            className="brand"
            onClick={() => navigate(user.직무 === "PM" ? "/pm/dashboard" : "/member/dashboard")}
            style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}
            type="button"
          >
            <span className="brand-mark">✚</span>
            <span className="brand-name">PM ERP</span>
          </button>

          <nav className="nav-pill" aria-label="주요 메뉴">
            {menus.map((item) => (
              <button
                className={`nav-item ${active === item.label ? "active" : ""}`}
                key={item.label}
                onClick={() => navigate(item.path)}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="top-actions">
            <button className="icon-button" type="button" title="알림">
              ♧
            </button>
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
