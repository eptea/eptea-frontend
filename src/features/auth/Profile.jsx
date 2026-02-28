import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const GET_ME = gql`
  query GetMe {
    me {
      id username firstName lastName userType profileImage
      institution { name }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($first: String!, $last: String!, $img: Upload) {
    updateProfile(firstName: $first, lastName: $last, profileImage: $img) {
      success
      user { firstName lastName profileImage }
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($old: String!, $new: String!) {
    changePassword(oldPassword: $old, newPassword: $new) {
      success
      message
    }
  }
`;

export default function Profile() {
  const navigate = useNavigate();
  const { data, loading, refetch } = useQuery(GET_ME);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const [form, setForm] = useState({ first: '', last: '', img: null });
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);
  const [changePassword, { loading: changingPass }] = useMutation(CHANGE_PASSWORD);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Carregando perfil...</div>;
  
  const user = data.me;

  const handleOpenModal = () => {
    setForm({ first: user.firstName || '', last: user.lastName || '', img: null });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ variables: form });
      Swal.fire('Sucesso!', 'Perfil atualizado com sucesso.', 'success');
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire('Erro', err.message, 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      Swal.fire('Erro', 'As novas senhas não coincidem.', 'error');
      return;
    }

    try {
      const { data: passData } = await changePassword({ 
        variables: { old: passForm.old, new: passForm.new } 
      });

      if (passData.changePassword.success) {
        Swal.fire('Sucesso!', 'Senha alterada com sucesso.', 'success');
        setIsPassModalOpen(false);
        setPassForm({ old: '', new: '', confirm: '' });
      } else {
        Swal.fire('Erro', passData.changePassword.message, 'error');
      }
    } catch (err) {
      Swal.fire('Erro', err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* BOTÃO VOLTAR EXTERNO */}
      <div className="max-w-3xl mx-auto mb-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all"
          title="Voltar para o Painel"
        >
          🔙
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* COR RESTAURADA: bg-blue-600 */}
        <div className="bg-blue-600 h-32 w-full"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            {user.profileImage ? (
              <img src={user.profileImage} className="w-32 h-32 rounded-[2rem] border-4 border-white object-cover shadow-lg" alt="Profile" />
            ) : (
              <div className="w-32 h-32 rounded-[2rem] border-4 border-white bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400 shadow-lg uppercase">
                {user.firstName ? user.firstName.charAt(0) : user.username.charAt(0)}
                {user.lastName ? user.lastName.charAt(0) : ""}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800 italic">
                {user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuário @' + user.username}
              </h2>
              <p className="text-slate-500 font-medium">Conta de acesso • {user.userType}</p>
              {/* COR RESTAURADA: text-blue-600 */}
              <p className="text-blue-600 font-bold mt-1 uppercase text-xs tracking-widest">
                🏫 {user.institution?.name || 'Unidade EPTEA'}
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsPassModalOpen(true)}
                className="flex-1 md:flex-none bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
              >
                🔒 Alterar Senha
              </button>
              {/* HOVER RESTAURADO: hover:bg-blue-600 */}
              <button 
                onClick={handleOpenModal}
                className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm"
              >
                ✏️ Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE PERFIL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Editar Perfil</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Primeiro Nome</label>
                  {/* FOCUS RING RESTAURADO: focus:ring-blue-500 */}
                  <input className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={form.first} onChange={e => setForm({...form, first: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Sobrenome</label>
                  <input className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={form.last} onChange={e => setForm({...form, last: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Trocar Foto de Perfil</label>
                {/* FILE INPUT RESTAURADO PARA AZUL */}
                <input type="file" accept="image/*" onChange={e => setForm({...form, img: e.target.files[0]})} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex gap-3 pt-6">
                {/* BOTÃO RESTAURADO: bg-blue-600 hover:bg-blue-700 */}
                <button type="submit" disabled={updating} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">{updating ? 'Salvando...' : 'Confirmar'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE TROCA DE SENHA */}
      {isPassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Segurança</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Preencha os campos para atualizar sua senha.</p>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {/* FOCUS RING RESTAURADO: focus:ring-blue-500 */}
              <input type="password" placeholder="Senha Atual" className="w-full px-4 py-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} required />
              <div className="pt-4 space-y-4">
                <input type="password" placeholder="Nova Senha" className="w-full px-4 py-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} required />
                <input type="password" placeholder="Confirmar Nova Senha" className="w-full px-4 py-4 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-8">
                {/* BOTÃO RESTAURADO: bg-blue-600 hover:bg-blue-700 */}
                <button type="submit" disabled={changingPass} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">{changingPass ? 'Atualizando...' : 'Alterar Senha'}</button>
                <button type="button" onClick={() => { setIsPassModalOpen(false); setPassForm({old:'', new:'', confirm:''}); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}