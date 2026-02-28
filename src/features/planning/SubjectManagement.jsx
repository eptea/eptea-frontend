import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

const GET_SUBJECTS_PAGE = gql`
  query GetSubjectsData {
    me { id username firstName lastName userType profileImage institution { name id } }
    allSubjects { id name }
  }
`;

const CREATE_SUBJECT = gql`
  mutation CreateS($n: String!) {
    createSubject(name: $n) {
      subject { id name }
    }
  }
`;

export default function SubjectManagement() {
  const { data, loading, refetch, error } = useQuery(GET_SUBJECTS_PAGE);
  const [addSubject] = useMutation(CREATE_SUBJECT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse text-xl">EPTEA: SINCRONIZANDO DISCIPLINAS...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const user = data.me;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addSubject({ variables: { n: name } });
      Swal.fire('Sucesso!', 'Disciplina cadastrada.', 'success');
      setIsModalOpen(false); setName(''); refetch();
    } catch (err) { Swal.fire('Erro', err.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-800 italic tracking-tight">Componentes Curriculares</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Repositório Institucional de Disciplinas</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2">
              <span>📚</span> Nova Disciplina
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(data?.allSubjects || []).map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">📖</div>
                <h3 className="font-black text-slate-700 tracking-tight leading-tight">{s.name}</h3>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black mb-2 text-slate-800 italic">Cadastrar Disciplina</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Novo Componente Institucional</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner text-lg" placeholder="Ex: Matemática Aplicada" value={name} onChange={e => setName(e.target.value)} required />
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Confirmar</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Sair</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}