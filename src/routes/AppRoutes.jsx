import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../layouts/ProtectedRoute';

// --- AUTH & USER ---
import Login from '../features/auth/Login';
import Profile from '../features/auth/Profile';
import ChangePassword from '../features/auth/ChangePassword';
import CompleteProfile from '../features/auth/CompleteProfile';
import StaffList from '../features/users/StaffList';

// --- ACADEMIC STRUCTURE ---
import CourseManagement from '../features/planning/CourseManagement';
import ClassManagement from '../features/planning/ClassManagement';
import ClassDetail from '../features/planning/ClassDetail';
import SubjectManagement from '../features/planning/SubjectManagement';
import ManageAssignments from '../features/planning/ManageAssignments';
import CourseDetail from '../features/planning/CourseDetail';

// --- STUDENT & PEDAGOGICAL ---
import StudentList from '../features/users/StudentList';
import StudentDossie from '../features/planning/StudentDossie';
import SubjectStudents from '../features/planning/SubjectStudents';

// --- DASHBOARD ---
import Dashboard from '../pages/Dashboard';
import CreateInstitution from '../features/institutions/CreateInstitution';

export const AppRoutes = () => (
  <Routes>
    {/* Rota Pública */}
    <Route path="/" element={<Login />} />

    {/* Rotas Protegidas (Requer Login) */}
    <Route element={<ProtectedRoute />}>
      
      {/* 📊 Principal */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* 🏫 Fluxo Acadêmico Hierárquico */}
      <Route path="/courses" element={<CourseManagement />} />
      <Route path="/courses/:courseId/classes" element={<CourseDetail />} />
      <Route path="/classes/:id" element={<ClassDetail />} />
      <Route path="/classes/:classId/subject/:subjectId" element={<SubjectStudents />} />
      
      {/* 📚 Gestão de Componentes (AEE/Gestor) */}
      <Route path="/subjects" element={<SubjectManagement />} />
      <Route path="/manage-assignments" element={<ManageAssignments />} />

      {/* 🎓 Gestão de Alunos e Dossiês */}
      <Route path="/students" element={<StudentList />} />
      <Route path="/students/:id/dossie" element={<StudentDossie />} />
      
      {/* 👥 Gestão Administrativa */}
      <Route path="/staff" element={<StaffList />} />
      <Route path="/create-institution" element={<CreateInstitution />} />
      
      {/* 🔒 Segurança */}
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);