import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import logo from '../../assets/logo.png'; // <-- Importação da logo
import olhoAberto from '../../assets/olho-aberto.png';
import olhoFechado from '../../assets/olho-vermelho (1).png'

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      mustChangePassword
      userType
      success
      message
    }
  }
`;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: form });
      
      if (data.login.success) {
        localStorage.setItem('token', data.login.token);
        if (data.login.mustChangePassword && data.login.userType !== 'management' && data.login.userType !== 'superuser') {
          navigate('/change-password');
        } else {
          navigate('/dashboard');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: data.login.message,
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro de Conexão', text: 'Não foi possível contatar o servidor.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          {/* LOGO + NOME NO LOGIN */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={logo} alt="EPTEA Logo" className="w-12 h-12 object-contain" />
            <h2 className="text-4xl font-black text-blue-600 tracking-tighter italic">EPTEA</h2>
          </div>
          <p className="text-slate-500 font-medium">Bem-vindo ao portal educacional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Usuário ou Matrícula</label>
            <input 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
              placeholder="Digite seu username" 
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} 
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 pr-14"
                placeholder="••••••••" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"
              >
                <img src={showPassword ? olhoFechado : olhoAberto} className="w-6 h-6 object-contain opacity-70" alt="Toggle visibility" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-blue-300 uppercase text-xs tracking-widest"
          >
            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-center text-red-500 text-xs font-black uppercase tracking-tighter">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}