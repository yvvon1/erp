import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PMShell from "./pages/pm/Shell";
import PMProjectDetail from "./pages/pm/ProjectDetail";
import PMReports from "./pages/pm/Reports";
import PMDeliverables from "./pages/pm/Deliverables";
import MemberDashboard from "./pages/member/Dashboard";
import MemberReportDetail from "./pages/member/ReportDetail";
import { getStoredUser } from "./utils/session";

const PMRoute = ({ children }) => {
  const user = getStoredUser();
  if (!user) return <Navigate to="/" />;
  if (user.직무 !== "PM") return <Navigate to="/member/dashboard" />;
  return children;
};

const MemberRoute = ({ children }) => {
  const user = getStoredUser();
  if (!user) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* PM — 구체적인 경로 먼저 */}
        <Route
          path="/pm/projects/:id"
          element={
            <PMRoute>
              <PMProjectDetail />
            </PMRoute>
          }
        />
        <Route
          path="/pm/reports/:projectId"
          element={
            <PMRoute>
              <PMReports />
            </PMRoute>
          }
        />
        <Route
          path="/pm/deliverables/:projectId"
          element={
            <PMRoute>
              <PMDeliverables />
            </PMRoute>
          }
        />

        {/* PM Shell — 탭 전환 (대시보드/파이프라인/프로젝트목록/클라이언트/직원) */}
        <Route
          path="/pm/*"
          element={
            <PMRoute>
              <PMShell />
            </PMRoute>
          }
        />

        {/* 팀원 */}
        <Route
          path="/member/dashboard"
          element={
            <MemberRoute>
              <MemberDashboard />
            </MemberRoute>
          }
        />
        <Route
          path="/member/reports/:projectId/:round"
          element={
            <MemberRoute>
              <MemberReportDetail />
            </MemberRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
