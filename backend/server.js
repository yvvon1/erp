const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터
const clientRoutes      = require('./routes/clients');
const employeeRoutes    = require('./routes/employees');
const projectRoutes     = require('./routes/projects');
const memberRoutes      = require('./routes/members');
const reportRoutes      = require('./routes/reports');
const deliverableRoutes = require('./routes/deliverables');
const resultRoutes      = require('./routes/results');
const authRoutes        = require('./routes/auth');

app.use('/api/clients',      clientRoutes);
app.use('/api/employees',    employeeRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/members',      memberRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/results',      resultRoutes);
app.use('/api/auth',         authRoutes);

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버 실행중: http://localhost:${PORT}`);
});
