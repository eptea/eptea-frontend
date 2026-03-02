// src/features/planning/ClassDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

const GET_CLASS_DATA = gql`
  query GetClass($id: ID!) {
    me { 
      id username firstName lastName userType profileImage 
      institution { id name } 
    }
    classGroupById(id: $id) {
      id name
      course { id } # Adicionado para saber para onde voltar
      teachingassignmentSet {
        id
        subject { id name }
        teacher { id firstName lastName }
      }
    }
  }
`;

const CREATE_SUBJECT = gql`
  mutation CreateSub($name: String!, $classId: ID!) {
    createSubject(name: $name, classGroupId: $classId) {
      subject { id name }
    }
  }
`;

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subName, setSubName] = useState('');

  const { data, loading, refetch, error } = useQuery(GET_CLASS_DATA, { variables: { id } });
  const [createSub] = useMutation(CREATE_SUBJECT);

  if (loading) return <div className="h-screen animate-pulse flex items-center justify-center bg-slate-50 font-black text-slate-300 text-xl uppercase tracking-widest">Sincronizando Grade...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const user = data?.me;
  const turma = data?.classGroupById;
  const isTeacher = user?.userType === 'teacher';

  const hasSubjectInClass = turma?.teachingassignmentSet?.some(a => a.teacher.id === user?.id);

  const handleCreate = async () => {
    try {
      await createSub({ variables: { name: subName, classId: id } });
      Swal.fire('Sucesso!', 'Disciplina criada nesta turma.', 'success');
      setIsModalOpen(false); setSubName(''); refetch();
    } catch (e) { Swal.fire('Erro', e.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            {/* BOTÃO DE VOLTAR E TÍTULO INTEGRADOS */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(turma?.course?.id ? `/courses/${turma.course.id}/classes` : '/courses')} 
                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all active:scale-90"
              >
                🔙
              </button>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight italic leading-tight">{turma?.name}</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Disciplinas Ativas na Unidade</p>
              </div>
            </div>

            {isTeacher && !hasSubjectInClass && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <span>➕</span> Atuar nesta Turma
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {turma?.teachingassignmentSet.map(a => (
              <div 
                key={a.id} 
                onClick={() => navigate(`/classes/${id}/subject/${a.subject.id}?teacherId=${a.teacher.id}`)}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">📚</div>
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Ativa</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{a.subject.name}</h3>
                <p className="text-slate-400 font-bold text-sm">
                   {user?.id === a.teacher.id ? "Minha Disciplina" : `Prof. ${a.teacher.firstName}`}
                </p>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.02] font-black italic -rotate-12 select-none">SUBJECT</div>
              </div>
            ))}

            {isTeacher && turma?.teachingassignmentSet.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">Nenhuma disciplina cadastrada por você nesta turma.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 font-black uppercase text-xs hover:underline">Começar agora</button>
              </div>
            )}
          </div>

          {/* Modal de Criação */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black mb-1 text-slate-800 italic">Sua Disciplina</h3>
                <p className="text-slate-400 text-[10px] mb-8 uppercase font-black tracking-widest">Identificação Pedagógica</p>
                <div className="space-y-6">
                  <input 
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
                    placeholder="Ex: Língua Portuguesa" 
                    value={subName} 
                    onChange={e => setSubName(e.target.value)} 
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={handleCreate} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">Confirmar</button>
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}