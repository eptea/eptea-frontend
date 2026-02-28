import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

const GET_INSTITUTIONS = gql`
  query GetInstitutions {
    me { id userType }
    allInstitutions { id name username }
  }
`;

const CREATE_INSTITUTION = gql`
  mutation CreateInst($name: String!, $user: String!, $pass: String!) {
    createInstitution(name: $name, username: $user, password: $pass) {
      institution { id name }
    }
  }
`;

export default function InstitutionList() {
  const { data, loading, refetch, error } = useQuery(GET_INSTITUTIONS);
  const [createInst] = useMutation(CREATE_INSTITUTION);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', user: '', pass: '' });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse text-xl">EPTEA: CARREGANDO UNIDADES...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createInst({ 
        variables: { name: form.name, user: form.user.toUpperCase(), pass: form.pass } 
      });
      Swal.fire('Sucesso!', 'Instituição criada com usuário administrativo.', 'success');
      setIsModalOpen(false); setForm({ name: '', user: '', pass: '' }); refetch();
    } catch (err) { Swal.fire('Erro', err.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={data.me} />
      <div className="flex">
        <Sidebar user={data.me} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">Instituições</h2>
              <p className="text-slate-400 font-bold text-sm uppercase mt-1">Gerenciamento de Unidades Parceiras</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
              ➕ Nova Instituição
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.allInstitutions?.map(inst => (
              <div key={inst.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl font-black">🏢</div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl leading-tight">{inst.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">ADM: {inst.username}</p>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.03] font-black italic -rotate-12">UNIDADE</div>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black mb-1 text-slate-800 italic">Nova Unidade</h3>
                <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Configuração Inicial</p>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome da Unidade (Ex: IF Baiano - Campus Bonfim)</label>
                    <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Username Administrativo</label>
                    <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" value={form.user} onChange={e => setForm({...form, user: e.target.value})} placeholder="Ex: ADM_BONFIM" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Senha Master</label>
                    <input type="password" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} required />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Confirmar Cadastro</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Sair</button>
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