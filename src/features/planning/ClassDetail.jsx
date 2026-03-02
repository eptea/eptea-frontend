// src/features/planning/ClassDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

const GET_CLASS_DATA = gql`
  query GetClass($id: ID!) {
    me { id username firstName lastName userType profileImage institution { id name } }
    classGroupById(id: $id) {
      id name
      # Buscamos as disciplinas vinculadas a esta turma
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

  const { data, loading, refetch } = useQuery(GET_CLASS_DATA, { variables: { id } });
  const [createSub] = useMutation(CREATE_SUBJECT);

  if (loading) return <div className="h-screen animate-pulse flex items-center justify-center">...</div>;

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
        <main className="flex-1 p-10 max-w-7xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-black text-slate-800 italic">{turma?.name}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase">Disciplinas Ativas</p>
            </div>
            {isTeacher && !hasSubjectInClass && (
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg">
                ➕ Adicionar Minha Disciplina
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {turma?.teachingassignmentSet.map(a => (
              <div 
                key={a.id} 
                onClick={() => navigate(`/classes/${id}/subject/${a.subject.id}?teacherId=${a.teacher.id}`)}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl cursor-pointer group"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📚</div>
                <h3 className="text-2xl font-black text-slate-800 mb-1">{a.subject.name}</h3>
                <p className="text-slate-400 font-bold text-sm">Prof. {a.teacher.firstName}</p>
              </div>
            ))}
          </div>

          {/* Modal Simplificado para o Professor */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
                <h3 className="text-2xl font-black mb-6">Sua Disciplina</h3>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold mb-6 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Ex: Língua Portuguesa" 
                  value={subName} 
                  onChange={e => setSubName(e.target.value)} 
                />
                <div className="flex gap-3">
                  <button onClick={handleCreate} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">Confirmar</button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}