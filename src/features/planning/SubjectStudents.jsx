// src/features/planning/SubjectStudents.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import NavBar from '../../layouts/NavBar';
import Sidebar from '../../layouts/Sidebar';

const GET_SUBJECT_DETAILS = gql`
  query GetSubjectDetails($classId: ID!) {
    me { 
      id username firstName lastName userType profileImage 
      institution { name } 
    }
    classGroupById(id: $classId) {
      id name
      students { id firstName lastName username profileImage }
    }
  }
`;

export default function SubjectStudents() {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_SUBJECT_DETAILS, { variables: { classId } });

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse text-xl">EPTEA: GERANDO LISTA DE CHAMADA...</div>;
  if (error) return <p className="p-20 text-center text-red-500">Erro: {error.message}</p>;

  const user = data.me;
  const turma = data.classGroupById;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">🔙</button>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight italic leading-tight">{turma?.name}</h2>
              <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Alunos TEA vinculados a esta disciplina</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {turma?.students.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <div className="flex items-center gap-5 mb-8 relative z-10">
                   {s.profileImage ? (
                     <img src={s.profileImage} className="w-20 h-20 rounded-[1.8rem] object-cover border-4 border-slate-50 shadow-sm" alt="Student" />
                   ) : (
                     <div className="w-20 h-20 rounded-[1.8rem] bg-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-300 group-hover:rotate-6 transition-transform">🎓</div>
                   )}
                   <div>
                     <h3 className="font-black text-xl text-slate-800 leading-tight">{s.firstName ? `${s.firstName} ${s.lastName}` : s.username}</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">@{s.username}</p>
                   </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/students/${s.id}/dossie?subjectId=${subjectId}`)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 transition-all shadow-lg relative z-10"
                >
                  Abrir Dossiê & Plano
                </button>

                <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] font-black italic -rotate-12 select-none">TEA</div>
              </div>
            ))}

            {turma?.students.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">Nenhum estudante TEA matriculado nesta unidade.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}