// src/features/institutions/CreateInstitution.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CREATE_INSTITUTION = gql`
  mutation CreateInstitution($name: String!, $username: String!, $password: String!) {
    createInstitution(name: $name, username: $username, password: $password) {
      institution { id name }
    }
  }
`;

export default function CreateInstitution() {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [createInstitution, { loading }] = useMutation(CREATE_INSTITUTION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInstitution({ variables: form });
      
      Swal.fire({
        icon: 'success',
        title: 'Tudo pronto!',
        text: 'Instituição e Gestor criados com sucesso.',
        confirmButtonColor: '#10b981'
      });
      
      navigate('/dashboard');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no Cadastro',
        text: err.message
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border-t-8 border-green-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastrar Nova Instituição</h2>
        <p className="text-slate-500 mb-8">Crie o acesso para uma nova unidade de ensino.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Instituição</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Ex: Escola Técnica Municipal" 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username do Gestor</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Ex: GESTAO_CAMPUS_SUL" 
              onChange={e => setForm({...form, username: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Senha Inicial</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Crie uma senha segura" 
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100"
            >
              {loading ? 'Processando...' : 'Finalizar Cadastro'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-transparent text-slate-400 font-medium hover:text-slate-600 transition-colors"
            >
              Voltar ao Painel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}