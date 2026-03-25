import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';
import { useAuth } from "../../context/AuthContext";

// --- QUERY OTIMIZADA ---
const GET_STAFF_DATA = gql`
  query GetStaffData {
    usersByInstitution { id firstName lastName userType username profileImage }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($reg: String!, $type: String!, $instId: ID) {
    createUser(registrationNumber: $reg, userType: $type, institutionId: $instId) {
      user { id username }
    }
  }
`;

export default function StaffList() {
  const { user: me, loading: authLoading } = useAuth(); // Usuário global
  const { data, loading, refetch, error } = useQuery(GET_STAFF_DATA);
  const [createUser] = useMutation(CREATE_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ reg: '', type: 'teacher' });

  if (loading || authLoading) return <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse text-xl">EPTEA: CARREGANDO DOCENTES...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const staff = (data?.usersByInstitution || []).filter(u => {
    if (me?.userType === 'management') return u.userType === 'teacher' || u.userType === 'aee';
    if (me?.userType === 'aee') return u.userType === 'teacher';
    return false;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser({ variables: { reg: form.reg, type: form.type, instId: me.institution.id } });
      Swal.fire('Sucesso!', 'Profissional cadastrado.', 'success');
      setIsModalOpen(false); setForm({ reg: '', type: 'teacher' }); refetch();
    } catch (err) { Swal.fire('Erro', err.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={me} />
      <div className="flex">
        <Sidebar user={me} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">Corpo Docente</h2>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">➕ Novo Profissional</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                <div className="flex items-center gap-5">
                  {u.profileImage ? (
                    <img src={u.profileImage} className="w-20 h-20 rounded-3xl object-cover shadow-sm" alt="Staff" />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black">{u.firstName?.charAt(0) || u.username.charAt(0)}</div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl leading-tight">{u.firstName ? `${u.firstName} ${u.lastName}` : u.username}</h3>
                    <p className="text-xs text-slate-400 font-mono italic">@{u.username}</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Função</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${u.userType === 'aee' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {u.userType === 'aee' ? 'Especialista AEE' : 'Prof. Regular'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black mb-2 text-slate-800">Cadastrar Docente</h3>
                <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Controle Institucional</p>
                <form onSubmit={handleCreate} className="space-y-6">
                  <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" value={form.reg} onChange={e => setForm({...form, reg: e.target.value})} placeholder="Matrícula / Usuário" required />
                  <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="teacher">Professor Regular</option>
                    {me?.userType === 'management' && <option value="aee">Especialista AEE</option>}
                  </select>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">Confirmar</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Cancelar</button>
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