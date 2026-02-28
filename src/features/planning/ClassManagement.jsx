import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/NavBar';
import Sidebar from '../../layouts/Sidebar';

// 1. Queries e Mutations
const GET_STRUCTURE_DATA = gql`
  query GetStructureData($courseId: ID!) {
    me { 
      id username firstName lastName userType profileImage 
      institution { id name } 
    }
    classesByCourse(courseId: $courseId) { 
      id 
      name 
    }
    allSubjects { id name }
    usersByInstitution { 
      id firstName lastName username userType 
    }
  }
`;

const CREATE_CLASS_COMPLETE = gql`
  mutation CreateClass($name: String!, $courseId: ID!, $assignments: [AssignmentInput]) {
    createClassGroup(name: $name, courseId: $courseId, assignments: $assignments) {
      classGroup { id name }
    }
  }
`;

export default function ClassManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const { data, loading, refetch, error } = useQuery(GET_STRUCTURE_DATA, {
    variables: { courseId }
  });
  
  const [createClass] = useMutation(CREATE_CLASS_COMPLETE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [tempAssignments, setTempAssignments] = useState([]);
  const [currentAssign, setCurrentAssign] = useState({ subjectId: '', teacherId: '' });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse text-xl">EPTEA: CARREGANDO TURMAS...</div>;
  if (error) return <p className="p-20 text-center text-red-500">Erro: {error.message}</p>;

  const user = data.me;
  const isManagement = ['management', 'aee'].includes(user.userType);
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

  const handleFinalSave = async () => {
    if (!className.trim()) return Swal.fire('Atenção', 'Dê um nome para a turma.', 'warning');
    try {
      await createClass({
        variables: {
          name: className,
          courseId: courseId,
          assignments: tempAssignments.map(a => ({ subjectId: a.subjectId, teacherId: a.teacherId }))
        }
      });
      Swal.fire('Sucesso!', 'Turma cadastrada.', 'success');
      setIsModalOpen(false); setClassName(''); setTempAssignments([]); refetch();
    } catch (e) { Swal.fire('Erro', e.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/courses')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">🔙</button>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight italic">Turmas do Curso</h2>
                <p className="text-slate-500 font-medium">Gerencie as turmas e as grades curriculares.</p>
              </div>
            </div>
            {isManagement && (
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><span>🏫</span> Nova Turma</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.classesByCourse.map(c => (
              <div key={c.id} onClick={() => navigate(`/classes/${c.id}`)} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer transition-all duration-300 group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform text-indigo-600 shadow-inner">🏫</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{c.name}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{isManagement ? 'Configurar Grade' : 'Ver Matérias'}</p>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-3xl font-black mb-8 text-slate-800 italic">Nova Unidade</h3>
                <div className="mb-8">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2">Identificação</label>
                  <input className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Ex: 1º Ano A" value={className} onChange={e => setClassName(e.target.value)} />
                </div>
                {/* ... Restante do Modal de criação igual ao anterior ... */}
                <div className="flex gap-4">
                  <button onClick={handleFinalSave} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-lg hover:bg-indigo-700">Confirmar Criação</button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-bold">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}