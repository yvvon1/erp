import React, { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "../../api/employees";

const glass = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.95)",
  borderRadius: 18,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
};

const inputStyle = {
  width: "100%",
  height: 40,
  border: "0.5px solid rgba(0,0,0,0.12)",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 13,
  fontWeight: 300,
  color: "rgba(20,20,30,0.85)",
  background: "rgba(255,255,255,0.8)",
  outline: "none",
  boxSizing: "border-box",
};

const DEPARTMENTS = [
  "1사업부",
  "2사업부",
  "3사업부",
  "기획팀",
  "디자인팀",
  "경영지원",
];

const avatarColors = [
  { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8" },
  { bg: "rgba(22,163,74,0.12)", color: "#15803d" },
  { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  { bg: "rgba(8,145,178,0.12)", color: "#0891b2" },
  { bg: "rgba(180,83,9,0.12)", color: "#b45309" },
];

const emptyForm = {
  직원ID: "",
  이름: "",
  이메일: "",
  비밀번호: "1234",
  직무: "",
  부서: "1사업부",
};

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(0,0,0,0.5)",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        style={inputStyle}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function PMEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState("재직중"); // 재직중 | 퇴사자
  const [filterDept, setFilterDept] = useState("전체");

  const refresh = () => getEmployees().then((res) => setEmployees(res.data));
  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async () => {
    if (!form.직원ID || !form.이름 || !form.직무) return;
    await createEmployee(form);
    setShowModal(false);
    setForm(emptyForm);
    refresh();
  };

  const handleResign = async (employee) => {
    if (!window.confirm(`${employee.이름} 직원을 퇴사 처리하시겠습니까?`))
      return;
    await updateEmployee(employee.직원ID, {
      ...employee,
      재직여부: "RESIGNED",
    });
    refresh();
  };

  const handleRestore = async (employee) => {
    if (!window.confirm(`${employee.이름} 직원을 재직 처리하시겠습니까?`))
      return;
    await updateEmployee(employee.직원ID, { ...employee, 재직여부: "ACTIVE" });
    refresh();
  };

  const active = employees.filter((e) => e.재직여부 === "ACTIVE");
  const resigned = employees.filter((e) => e.재직여부 === "RESIGNED");

  const deptList = ["전체", ...DEPARTMENTS];
  const filteredActive =
    filterDept === "전체"
      ? active
      : active.filter((e) => e.부서 === filterDept);

  // 부서별 그룹핑
  const deptGroups = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = active.filter((e) => e.부서 === dept);
    return acc;
  }, {});

  return (
    <>
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(23px,3vw,34px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            직원 관리
          </h1>
          <div
            style={{
              marginTop: 6,
              color: "rgba(0,0,0,0.4)",
              fontSize: 12,
              fontWeight: 300,
            }}
          >
            계정, 직무, 재직 상태를 관리합니다.
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          type="button"
          style={{
            minHeight: 34,
            border: "1px solid rgba(20,20,30,0.85)",
            borderRadius: 999,
            padding: "0 16px",
            background: "rgba(20,20,30,0.85)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + 직원 등록
        </button>
      </div>

      {/* 탭 */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          background: "rgba(255,255,255,0.6)",
          borderRadius: 999,
          padding: 4,
          width: "fit-content",
          border: "0.5px solid rgba(0,0,0,0.08)",
        }}
      >
        {["재직중", "퇴사자"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            type="button"
            style={{
              minHeight: 32,
              border: "none",
              borderRadius: 999,
              padding: "0 18px",
              fontSize: 12,
              fontWeight: activeTab === t ? 600 : 400,
              cursor: "pointer",
              background:
                activeTab === t ? "rgba(20,20,30,0.88)" : "transparent",
              color: activeTab === t ? "#fff" : "rgba(0,0,0,0.5)",
              transition: "all 0.2s",
            }}
          >
            {t} {t === "재직중" ? active.length : resigned.length}명
          </button>
        ))}
      </div>

      {activeTab === "재직중" && (
        <>
          {/* 부서 필터 */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {deptList.map((d) => (
              <button
                key={d}
                onClick={() => setFilterDept(d)}
                type="button"
                style={{
                  minHeight: 28,
                  border:
                    filterDept === d ? "none" : "0.5px solid rgba(0,0,0,0.12)",
                  borderRadius: 999,
                  padding: "0 12px",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: filterDept === d ? "rgba(20,20,30,0.85)" : "#fff",
                  color: filterDept === d ? "#fff" : "rgba(0,0,0,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {d}{" "}
                {d !== "전체"
                  ? `${deptGroups[d]?.length || 0}명`
                  : `${active.length}명`}
              </button>
            ))}
          </div>

          {/* 부서별 섹션 or 전체 */}
          {filterDept === "전체" ? (
            DEPARTMENTS.filter((d) => deptGroups[d]?.length > 0).map((dept) => (
              <div key={dept} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(20,20,30,0.6)",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{dept}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: "rgba(0,0,0,0.35)",
                    }}
                  >
                    {deptGroups[dept].length}명
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
                    gap: 10,
                  }}
                >
                  {deptGroups[dept].map((e, i) => (
                    <EmployeeCard
                      key={e.직원ID}
                      employee={e}
                      idx={i}
                      onResign={handleResign}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
                gap: 10,
              }}
            >
              {filteredActive.map((e, i) => (
                <EmployeeCard
                  key={e.직원ID}
                  employee={e}
                  idx={i}
                  onResign={handleResign}
                />
              ))}
              {filteredActive.length === 0 && (
                <div
                  style={{
                    ...glass,
                    padding: 32,
                    textAlign: "center",
                    color: "rgba(0,0,0,0.28)",
                    fontSize: 13,
                  }}
                >
                  해당 부서에 직원이 없습니다.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "퇴사자" && (
        <>
          <div style={{ ...glass, padding: "20px 24px", marginBottom: 16 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(0,0,0,0.5)",
                marginBottom: 4,
              }}
            >
              퇴사자 명단
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 300,
                color: "rgba(0,0,0,0.38)",
              }}
            >
              총 {resigned.length}명
            </div>
          </div>
          {resigned.length === 0 ? (
            <div
              style={{
                ...glass,
                padding: 48,
                textAlign: "center",
                color: "rgba(0,0,0,0.28)",
                fontSize: 13,
                fontWeight: 300,
              }}
            >
              퇴사자가 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
                gap: 10,
              }}
            >
              {resigned.map((e, i) => (
                <div
                  key={e.직원ID}
                  style={{ ...glass, padding: "18px 20px", opacity: 0.75 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.4)",
                        flexShrink: 0,
                      }}
                    >
                      {e.이름?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "rgba(20,20,30,0.6)",
                        }}
                      >
                        {e.이름}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 300,
                          color: "rgba(0,0,0,0.35)",
                          marginTop: 1,
                        }}
                      >
                        {e.직무} · {e.부서 || "-"}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "rgba(185,28,28,0.08)",
                        color: "#b91c1c",
                      }}
                    >
                      퇴사
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 300,
                      color: "rgba(0,0,0,0.38)",
                      marginBottom: 12,
                    }}
                  >
                    {e.직원ID} · {e.이메일 || "-"}
                  </div>
                  <button
                    onClick={() => handleRestore(e)}
                    type="button"
                    style={{
                      width: "100%",
                      minHeight: 32,
                      border: "0.5px solid rgba(22,163,74,0.3)",
                      borderRadius: 10,
                      background: "rgba(22,163,74,0.06)",
                      color: "#15803d",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    재직 복구
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 등록 모달 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "min(480px,100%)",
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              직원 등록
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="직원ID"
                value={form.직원ID}
                onChange={(v) => setForm({ ...form, 직원ID: v })}
                placeholder="EMP-001"
              />
              <Field
                label="초기 비밀번호"
                value={form.비밀번호}
                onChange={(v) => setForm({ ...form, 비밀번호: v })}
                type="password"
              />
            </div>
            <Field
              label="이름"
              value={form.이름}
              onChange={(v) => setForm({ ...form, 이름: v })}
            />
            <Field
              label="이메일"
              value={form.이메일}
              onChange={(v) => setForm({ ...form, 이메일: v })}
              placeholder="email@company.com"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="직무"
                value={form.직무}
                onChange={(v) => setForm({ ...form, 직무: v })}
                placeholder="PM, 프론트엔드"
              />
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.5)",
                    marginBottom: 5,
                  }}
                >
                  부서
                </label>
                <select
                  style={inputStyle}
                  value={form.부서}
                  onChange={(e) => setForm({ ...form, 부서: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 4,
              }}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                }}
                type="button"
                style={{
                  minHeight: 36,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                style={{
                  minHeight: 36,
                  border: "none",
                  borderRadius: 999,
                  padding: "0 16px",
                  background: "rgba(20,20,30,0.85)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeCard({ employee: e, idx, onResign }) {
  const av = avatarColors[idx % avatarColors.length];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(40px)",
        border: "0.5px solid rgba(255,255,255,0.95)",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: av.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: av.color,
            flexShrink: 0,
          }}
        >
          {e.이름?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(20,20,30,0.88)",
            }}
          >
            {e.이름}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 300,
              color: "rgba(0,0,0,0.4)",
              marginTop: 1,
            }}
          >
            {e.직무} · {e.부서 || "-"}
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.1)",
            color: "#15803d",
          }}
        >
          재직중
        </span>
      </div>
      <div
        style={{
          height: "0.5px",
          background: "rgba(0,0,0,0.06)",
          marginBottom: 10,
        }}
      />
      <div
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: "rgba(20,20,30,0.7)",
          marginBottom: 2,
        }}
      >
        {e.직원ID}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 300,
          color: "rgba(0,0,0,0.4)",
          marginBottom: 12,
        }}
      >
        {e.이메일 || "-"}
      </div>
      <button
        onClick={() => onResign(e)}
        type="button"
        style={{
          width: "100%",
          minHeight: 32,
          border: "0.5px solid rgba(185,28,28,0.2)",
          borderRadius: 10,
          background: "rgba(185,28,28,0.06)",
          color: "#b91c1c",
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        퇴사 처리
      </button>
    </div>
  );
}
