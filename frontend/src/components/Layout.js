import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../utils/session";

const pmMenus = [
  { label: "대시보드", path: "/pm/dashboard" },
  { label: "프로젝트 목록", path: "/pm/projects" },
  { label: "클라이언트", path: "/pm/clients" },
  { label: "직원 관리", path: "/pm/employees" },
];

const memberMenus = [{ label: "내 대시보드", path: "/member/dashboard" }];

export default function Layout({ children, active }) {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  const menus = user.직무 === "PM" ? pmMenus : memberMenus;
  const initials = user.이름?.slice(0, 1) || "U";

  const btnRefs = useRef([]);
  const [pill, setPill] = useState(null);
  const [isFirst, setIsFirst] = useState(true);

  useLayoutEffect(() => {
    const idx = menus.findIndex((m) => m.label === active);
    if (idx < 0 || !btnRefs.current[idx]) return;
    const el = btnRefs.current[idx];
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    const next = {
      left: rect.left - parentRect.left,
      width: rect.width,
    };
    setPill(next);
    if (isFirst) {
      setIsFirst(false);
    }
  }, [active]);

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
            onClick={() =>
              navigate(
                user.직무 === "PM" ? "/pm/dashboard" : "/member/dashboard",
              )
            }
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

          {/* 네비 */}
          <nav
            aria-label="주요 메뉴"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "4px",
              border: "1px solid var(--line)",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              gap: "0",
            }}
          >
            {/* 슬라이딩 pill */}
            {pill && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "4px",
                  bottom: "4px",
                  left: pill.left,
                  width: pill.width,
                  background: "var(--dark)",
                  borderRadius: "999px",
                  transition: isFirst
                    ? "none"
                    : "left 0.35s cubic-bezier(0.34,1.4,0.64,1), width 0.35s cubic-bezier(0.34,1.4,0.64,1)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}

            {menus.map((item, idx) => (
              <button
                key={item.label}
                ref={(el) => {
                  btnRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 0,
                  borderRadius: "999px",
                  padding: "0 16px",
                  background: "transparent",
                  color: active === item.label ? "#fff" : "#303231",
                  fontSize: "12px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.label}
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
