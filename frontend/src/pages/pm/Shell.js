import React, { useLayoutEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../../utils/session";
import PMDashboard from "./Dashboard";
import PMProjects from "./Projects";
import PMClients from "./Clients";
import PMEmployees from "./Employees";
import Pipeline from "./Pipeline";

const TABS = [
  { label: "대시보드", path: "/pm/dashboard" },
  { label: "수주 파이프라인", path: "/pm/pipeline" },
  { label: "프로젝트 목록", path: "/pm/projects" },
  { label: "클라이언트", path: "/pm/clients" },
  { label: "직원 관리", path: "/pm/employees" },
];

// CONTENT는 컴포넌트 밖에 정의하여 리렌더 방지
const STATIC_CONTENT = {
  "/pm/dashboard": <PMDashboard />,
  "/pm/pipeline": <Pipeline />,
  "/pm/projects": <PMProjects />,
  "/pm/clients": <PMClients />,
  "/pm/employees": <PMEmployees />,
};

const ICON_SIZE = 42;
const ICON_STYLE = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export default function PMShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser() || {};
  const initials = user.이름?.slice(0, 1) || "U";

  const activeTab =
    TABS.find((t) => location.pathname.startsWith(t.path))?.path ||
    "/pm/dashboard";

  const btnRefs = useRef([]);
  const navRef = useRef(null);
  const profileRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useLayoutEffect(() => {
    const idx = TABS.findIndex((t) => t.path === activeTab);
    if (idx < 0 || !btnRefs.current[idx] || !navRef.current) return;
    const el = btnRefs.current[idx];
    const nav = navRef.current;
    const elR = el.getBoundingClientRect();
    const navR = nav.getBoundingClientRect();
    setPill({ left: elR.left - navR.left, width: elR.width });
    if (!ready) {
      setReady(true);
    } else {
      setAnimate(true);
    }
  }, [activeTab]);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    navigate("/");
  };

  return (
    <div className="glass-shell">
      <div className="glass-app">
        <header
          style={{
            minHeight: 64,
            display: "grid",
            gridTemplateColumns: "minmax(150px,1fr) auto minmax(150px,1fr)",
            alignItems: "center",
            gap: 18,
            marginBottom: 24,
          }}
        >
          {/* 브랜드 */}
          <button
            onClick={() => navigate("/pm/dashboard")}
            type="button"
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 11,
            }}
          >
            <span
              style={{
                ...ICON_STYLE,
                borderRadius: 12,
                background: "rgba(20,20,30,0.88)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 300,
              }}
            >
              ✚
            </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 550,
                color: "rgba(7,7,7,0.85)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Project Management System
            </span>
          </button>

          {/* 슬라이딩 네비 */}
          <nav
            ref={navRef}
            aria-label="주요 메뉴"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "4px",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            {ready && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  left: pill.left,
                  width: pill.width,
                  background: "rgba(20,20,30,0.88)",
                  borderRadius: 999,
                  transition: animate
                    ? "left 0.38s cubic-bezier(0.34,1.4,0.64,1), width 0.38s cubic-bezier(0.34,1.4,0.64,1)"
                    : "none",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}
            {TABS.map((tab, idx) => (
              <button
                key={tab.path}
                ref={(el) => {
                  btnRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => navigate(tab.path)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: 34,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 0,
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "transparent",
                  color: activeTab === tab.path ? "#fff" : "rgba(20,20,30,0.5)",
                  fontSize: 13,
                  fontWeight: activeTab === tab.path ? 550 : 400,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "color 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 우측 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            {/*<button
              type="button"
              title="알림"
              style={{
                ...ICON_STYLE,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#fff",
                color: "rgba(20,20,30,0.55)",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ♧
            </button>*/}

            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    ...ICON_STYLE,
                    background: "linear-gradient(135deg, #232323, #ffcb82)",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 300,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "rgba(20,20,30,0.85)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {user.이름 || "사용자"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "rgba(0,0,0,0.4)",
                      marginTop: 1,
                    }}
                  >
                    {user.직무 || "PM"}
                  </div>
                </div>
              </div>

              {showProfile && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: 280,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(48px)",
                    WebkitBackdropFilter: "blur(48px)",
                    border: "0.5px solid rgba(255,255,255,0.9)",
                    borderRadius: 20,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    overflow: "hidden",
                    animation: "fadeSlideDown 0.2s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div
                    style={{
                      padding: "24px 22px 18px",
                      borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #232323, #ffcb82)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 22,
                          fontWeight: 300,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 500,
                            color: "rgba(20,20,30,0.9)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {user.이름 || "사용자"}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 300,
                            color: "rgba(0,0,0,0.45)",
                            marginTop: 2,
                          }}
                        >
                          {user.직무 || "PM"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {[
                        { label: "직원 ID", value: user.직원ID || "-" },
                        { label: "이메일", value: user.이메일 || "-" },
                        { label: "부서", value: user.부서 || "-" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              color: "rgba(0,0,0,0.38)",
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: "rgba(20,20,30,0.75)",
                            }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    type="button"
                    style={{
                      width: "100%",
                      padding: "14px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(185,28,28,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: 16 }}>↗</span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#b91c1c",
                      }}
                    >
                      로그아웃
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          {STATIC_CONTENT[activeTab] || <PMDashboard />}
        </main>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
