import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';

// PM 페이지
import PMDashboard    from './pages/pm/Dashboard';
import PMProjects     from './pages/pm/Projects';
import PMProjectDetail from './pages/pm/ProjectDetail';
import PMClients      from './pages/pm/Clients';
import PMEmployees    from './pages/pm/Employees';
import PMReports      from './pages/pm/Reports';
import PMDeliverables from './pages/pm/Deliverables';

// 팀원 페이지
import MemberDashboard from './pages/member/Dashboard';
import MemberReportDetail from './pages/member/ReportDetail';

// 로그인 여부 확인
const getUser = () => JSON.parse(localStorage.getItem('user'));

// 권한별 라우터
const PMRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/" />;
  if (user.직무 !== 'PM') return <Navigate to="/member/dashboard" />;
  return children;
};

const MemberRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* PM 라우터 */}
        <Route path="/pm/dashboard"    element={<PMRoute><PMDashboard /></PMRoute>} />
        <Route path="/pm/projects"     element={<PMRoute><PMProjects /></PMRoute>} />
        <Route path="/pm/projects/:id" element={<PMRoute><PMProjectDetail /></PMRoute>} />
        <Route path="/pm/clients"      element={<PMRoute><PMClients /></PMRoute>} />
        <Route path="/pm/employees"    element={<PMRoute><PMEmployees /></PMRoute>} />
        <Route path="/pm/reports/:projectId" element={<PMRoute><PMReports /></PMRoute>} />
        <Route path="/pm/deliverables/:projectId" element={<PMRoute><PMDeliverables /></PMRoute>} />

        {/* 팀원 라우터 */}
        <Route path="/member/dashboard" element={<MemberRoute><MemberDashboard /></MemberRoute>} />
        <Route path="/member/reports/:projectId/:round" element={<MemberRoute><MemberReportDetail /></MemberRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
