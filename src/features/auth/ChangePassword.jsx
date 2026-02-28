// src/features/auth/ChangePassword.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($old: String!, $new: String!) {
    changePassword(oldPassword: $old, newPassword: $new) {
      success
      message
    }
  }
`;

export default function ChangePassword() {
  const [form, setForm] = useState({ old: '', new: '', confirm: '' });
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de senhas iguais no Front-end
    if (form.new !== form.confirm) {
      Swal.fire({
        icon: 'warning',
        title: 'Senhas diferentes',
        text: 'A nova senha e a confirmação não coincidem.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const { data } = await changePassword({ 
        variables: { old: form.old, new: form.new } 
      });

      if (data.changePassword.success) {
        Swal.fire({
          icon: 'success',
          title: 'Senha Atualizada!',
          text: 'Sua conta está segura. Redirecionando para o painel...',
          showConfirmButton: false,
          timer: 2000
        });
        
        setTimeout(() => navigate('/complete-profile'), 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro na atualização',
          text: data.changePassword.message,
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Falha no servidor',
        text: err.message
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Primeiro Acesso</h2>
          <p className="text-slate-500 mt-2">Por segurança, atualize sua senha padrão para continuar.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha Atual (Sua matrícula)</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Digite a senha atual" 
              onChange={e => setForm({...form, old: e.target.value})}
              required 
            />
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nova Senha</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Mínimo 8 caracteres" 
                onChange={e => setForm({...form, new: e.target.value})}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Repita a nova senha" 
                onChange={e => setForm({...form, confirm: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:bg-blue-300"
          >
            {loading ? 'Processando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}