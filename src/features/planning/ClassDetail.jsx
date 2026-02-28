// src/features/planning/ClassDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

const GET_CLASS_AND_RESOURCES = gql`
  query GetClassResources($id: ID!) {
    me { 
      id username firstName lastName userType profileImage 
      institution { id name } 
    }
    allSubjects { id name }
    usersByInstitution { id firstName lastName userType username }
    classGroupById(id: $id) {
      id name
      teachingassignmentSet { 
        id 
        subject { id name } 
        teacher { id firstName lastName username } 
      }
    }
  }
`;

const UPDATE_CLASS_COMPLETE = gql`
  mutation UpdateClass($id: ID!, $name: String!, $assignments: [AssignmentInput]) {
    updateClassGroup(id: $id, name: $name, assignments: $assignments) {
      classGroup { id name }
    }
  }
`;

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, loading, refetch, error } = useQuery(GET_CLASS_AND_RESOURCES, { variables: { id } });
  const [updateClass] = useMutation(UPDATE_CLASS_COMPLETE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [tempAssignments, setTempAssignments] = useState([]);
  const [currentAssign, setCurrentAssign] = useState({ subjectId: '', teacherId: '' });

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse text-xl">EPTEA: CARREGANDO UNIDADE...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const user = data.me;
  const turma = data.classGroupById;
  const teachers = (data?.usersByInstitution || []).filter(u => u.userType === 'teacher');
  const isManagement = ['management', 'aee'].includes(user.userType);

  const assignments = turma.teachingassignmentSet.filter(a => 
    isManagement || a.teacher.id === user.id
  );

  const openEditModal = () => {
    setClassName(turma.name);
    const initialSpecs = turma.teachingassignmentSet.map(a => ({
      subjectId: a.subject.id,
      subjectName: a.subject.name,
      teacherId: a.teacher.id,
      teacherName: a.teacher.firstName ? `${a.teacher.firstName} ${a.teacher.lastName}` : a.teacher.username
    }));
    setTempAssignments(initialSpecs);
    setIsModalOpen(true);
  };

  const handleAddAssignment = () => {
    if (!currentAssign.subjectId || !currentAssign.teacherId) return;
    
    const sub = data.allSubjects.find(s => s.id === currentAssign.subjectId);
    const tea = teachers.find(t => t.id === currentAssign.teacherId);

    setTempAssignments([...tempAssignments, {
      subjectId: currentAssign.subjectId,
      subjectName: sub.name,
      teacherId: currentAssign.teacherId,
      teacherName: tea.firstName ? `${tea.firstName} ${tea.lastName}` : tea.username
    }]);

    setCurrentAssign({ subjectId: '', teacherId: '' });
  };

  const handleSaveEdit = async () => {
    try {
      const payload = tempAssignments.map(a => ({ subjectId: a.subjectId, teacherId: a.teacherId }));
      await updateClass({ variables: { id, name: className, assignments: payload } });
      Swal.fire('Sucesso!', 'Turma e grade atualizadas.', 'success');
      setIsModalOpen(false);
      refetch();
    } catch (e) { Swal.fire('Erro', e.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">🔙</button>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight italic leading-tight">{turma.name}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Gestão de disciplinas e acessos</p>
              </div>
            </div>
            {isManagement && (
              <button onClick={openEditModal} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg">✏️ Editar Turma</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignments.map(a => (
              <div key={a.id} onClick={() => navigate(`/classes/${id}/subject/${a.subject.id}`)} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">📚</div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Disciplina</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{a.subject.name}</h3>
                <p className="text-slate-400 font-bold text-sm truncate">Docente: {a.teacher.firstName || a.teacher.username}</p>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold text-lg">Nenhuma disciplina vinculada ao seu perfil.</p>
            </div>
          )}

          {/* MODAL DE EDIÇÃO RESTAURADO E INTEGRADO */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <h3 className="text-3xl font-black mb-8 text-slate-800 italic">Ajustar Turma</h3>
                
                <div className="mb-8">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-2">Nome da Unidade/Série</label>
                  <input 
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
                    value={className} 
                    onChange={e => setClassName(e.target.value)} 
                  />
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 mb-8">
                  <p className="text-xs font-black text-slate-400 uppercase mb-5 ml-1">Vincular novo docente</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <select 
                      className="p-4 bg-white rounded-2xl border-none shadow-sm font-bold text-slate-600 outline-none" 
                      value={currentAssign.subjectId} 
                      onChange={e => setCurrentAssign({...currentAssign, subjectId: e.target.value})}
                    >
                      <option value="">Disciplina...</option>
                      {data?.allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select 
                      className="p-4 bg-white rounded-2xl border-none shadow-sm font-bold text-slate-600 outline-none" 
                      value={currentAssign.teacherId} 
                      onChange={e => setCurrentAssign({...currentAssign, teacherId: e.target.value})}
                    >
                      <option value="">Professor...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName ? `${t.firstName} ${t.lastName}` : t.username}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={handleAddAssignment} 
                    className="w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    + Incluir na Grade
                  </button>
                </div>

                <div className="space-y-3 mb-10">
                  {tempAssignments.map((a, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">{a.subjectName}</p>
                        <span className="font-bold text-indigo-900">{a.teacherName}</span>
                      </div>
                      <button 
                        onClick={() => setTempAssignments(tempAssignments.filter((_, idx) => idx !== i))} 
                        className="w-10 h-10 rounded-xl bg-white text-red-500 font-black shadow-sm hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSaveEdit} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-lg">Salvar Tudo</button>
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