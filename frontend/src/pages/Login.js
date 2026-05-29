import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setStoredUser } from "../utils/session";

const LINES = ["Project", "Management", "System"];

export default function Login() {
  const [직원ID, set직원ID] = useState("");
  const [비밀번호, set비밀번호] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState(["", "", ""]);
  const [showForm, setShowForm] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let current = ["", "", ""];

    const type = () => {
      if (lineIdx >= LINES.length) {
        setTimeout(() => {
          setShowForm(true);
          setTimeout(() => setFormVisible(true), 50);
        }, 700);
        return;
      }
      if (charIdx < LINES[lineIdx].length) {
        current = [...current];
        current[lineIdx] = LINES[lineIdx].slice(0, charIdx + 1);
        setTyped([...current]);
        charIdx++;
        setTimeout(type, 80);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(type, 180);
      }
    };
    setTimeout(type, 400);
  }, []);

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 20% 20%, #e8eef8 0%, #f0f4fc 30%, #fdf6e8 60%, #f5f0ea 100%)",
        fontFamily:
          "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "32px",
        gap: "52px",
      }}
    >
      {/* 배경 블러 오브 */}
      <div
        style={{
          position: "fixed",
          top: "5%",
          left: "10%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "rgba(180,200,240,0.35)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "5%",
          right: "5%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "rgba(240,220,180,0.3)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* 타이핑 타이틀 */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {LINES.map((line, i) => (
          <div
            key={line}
            style={{
              fontSize: "64px",
              fontWeight: "200",
              color: "rgba(20,20,30,0.82)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              minHeight: "74px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>{typed[i]}</span>
            {typed[i].length > 0 && typed[i].length < line.length && (
              <span
                style={{
                  display: "inline-block",
                  width: "1.5px",
                  height: "52px",
                  background: "rgba(20,20,30,0.5)",
                  marginLeft: "3px",
                  verticalAlign: "middle",
                  borderRadius: "1px",
                  animation: "blink 0.9s step-end infinite",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 로그인 폼 */}
      {showForm && (
        <div
          style={{
            width: "min(100%, 480px)",
            opacity: formVisible ? 1 : 0,
            transform: formVisible ? "translateY(0)" : "translateY(16px)",
            transition:
              "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* 입력 그룹 */}
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
              borderRadius: "22px",
              border: "0.5px solid rgba(255,255,255,0.9)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "64px",
                borderBottom: "0.5px solid rgba(0,0,0,0.07)",
              }}
            >
              <label
                style={{
                  fontSize: "17px",
                  fontWeight: "300",
                  color: "rgba(20,20,30,0.8)",
                  width: "110px",
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                직원 ID
              </label>
              <input
                value={직원ID}
                onChange={(e) => set직원ID(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="EMP-2025-001"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "17px",
                  fontWeight: "300",
                  color: "rgba(20,20,30,0.85)",
                  textAlign: "right",
                  letterSpacing: "-0.01em",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "64px",
              }}
            >
              <label
                style={{
                  fontSize: "17px",
                  fontWeight: "300",
                  color: "rgba(20,20,30,0.8)",
                  width: "110px",
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                비밀번호
              </label>
              <input
                type="password"
                value={비밀번호}
                onChange={(e) => set비밀번호(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "17px",
                  fontWeight: "300",
                  color: "rgba(20,20,30,0.85)",
                  textAlign: "right",
                  letterSpacing: "0.08em",
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255,60,60,0.08)",
                border: "0.5px solid rgba(255,80,80,0.2)",
                borderRadius: "16px",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: "300",
                color: "rgba(180,30,30,0.9)",
                marginBottom: "14px",
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={loading}
            type="button"
            style={{
              width: "100%",
              height: "64px",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
              border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: "22px",
              fontSize: "17px",
              fontWeight: "300",
              color: "rgba(20,20,30,0.85)",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em",
              opacity: loading ? 0.55 : 1,
              transition: "background 0.15s, box-shadow 0.15s",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(255,255,255,0.9)";
                e.target.style.boxShadow =
                  "0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.72)";
              e.target.style.boxShadow =
                "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)";
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <p
            style={{
              fontSize: "13px",
              fontWeight: "300",
              color: "rgba(20,20,30,0.35)",
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            초기 비밀번호 1234 · 계정 문의는 담당 PM에게
          </p>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        input::placeholder { color: rgba(20,20,30,0.25); }
      `}</style>
    </div>
  );
}
