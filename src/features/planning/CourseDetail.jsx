import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';
import { useAuth } from "../../context/AuthContext"; // Import novo

// --- QUERY OTIMIZADA (Sem o 'me') ---
const GET_COURSE_CLASSES_DATA = gql`
  query GetCourseDetail($courseId: ID!) {
    classesByCourse(courseId: $courseId) { 
      id 
      name 
    }
    allSubjects { id name }
    usersByInstitution { id firstName lastName username userType }
  }
`;

const CREATE_CLASS_IN_COURSE = gql`
  mutation CreateClass($name: String!, $courseId: ID!, $assignments: [AssignmentInput]) {
    createClassGroup(name: $name, courseId: $courseId, assignments: $assignments) {
      classGroup { id name }
    }
  }
`;

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Usuário global
  
  const { data, loading, refetch, error } = useQuery(GET_COURSE_CLASSES_DATA, {
    variables: { courseId }
  });
  
  const [createClass] = useMutation(CREATE_CLASS_IN_COURSE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [tempAssignments, setTempAssignments] = useState([]);
  const [currentAssign, setCurrentAssign] = useState({ subjectId: '', teacherId: '' });

  if (loading || authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse text-xl">EPTEA: ACESSANDO UNIDADES...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  // Lógica de permissão usando o contexto global
  const isManagement = ['management', 'aee'].includes(user?.userType);
  const teachers = (data?.usersByInstitution || []).filter(u => u.userType === 'teacher');

  const handleAddAssignment = () => {
    if (!currentAssign.subjectId || !currentAssign.teacherId) return;
    const sub = data.allSubjects.find(s => s.id === currentAssign.subjectId);
    const tea = teachers.find(t => t.id === currentAssign.teacherId);
    setTempAssignments([...tempAssignments, {
      subjectId: currentAssign.subjectId,
      subjectName: sub.name,
      teacherId: currentAssign.teacherId,
      teacherName: tea.firstName || tea.username
    }]);
    setCurrentAssign({ subjectId: '', teacherId: '' });
  };

  const handleSave = async () => {
    if (!className.trim()) return;
    try {
      await createClass({
        variables: {
          name: className,
          courseId: courseId,
          assignments: tempAssignments.map(a => ({ subjectId: a.subjectId, teacherId: a.teacherId }))
        }
      });
      Swal.fire('Sucesso!', 'Turma cadastrada.', 'success');
      setIsModalOpen(false); setClassName(''); setTempAssignments([]);
      refetch();
    } catch (e) { Swal.fire('Erro', e.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/courses')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">🔙</button>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight italic leading-tight">Turmas</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Unidades do Curso Selecionado</p>
              </div>
            </div>
            {isManagement && (
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><span>🏫</span> Nova Turma</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.classesByCourse.map(c => (
              <div key={c.id} onClick={() => navigate(`/classes/${c.id}`)} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer transition-all duration-300 group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">🏫</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{c.name}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Gerenciar Grade</p>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <h3 className="text-3xl font-black mb-8 text-slate-800 italic">Configurar Turma</h3>
                <input className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-8 shadow-inner" placeholder="Ex: 2º Ano Informática B" value={className} onChange={e => setClassName(e.target.value)} />
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 mb-8 text-center">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <select className="p-4 bg-white rounded-2xl border-none shadow-sm font-bold text-slate-700" value={currentAssign.subjectId} onChange={e => setCurrentAssign({...currentAssign, subjectId: e.target.value})}>
                      <option value="">Disciplina...</option>
                      {data?.allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="p-4 bg-white rounded-2xl border-none shadow-sm font-bold text-slate-700" value={currentAssign.teacherId} onChange={e => setCurrentAssign({...currentAssign, teacherId: e.target.value})}>
                      <option value="">Professor...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName || t.username}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddAssignment} className="w-full py-4 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-colors">+ Vincular na Grade</button>
                </div>

                <div className="space-y-3 mb-10">
                  {tempAssignments.map((a, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{a.subjectName}</p><p className="font-bold text-indigo-900">{a.teacherName}</p></div>
                      <button onClick={() => setTempAssignments(tempAssignments.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">✕</button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all">Confirmar Tudo</button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-bold">Voltar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}