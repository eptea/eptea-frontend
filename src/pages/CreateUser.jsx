// src/pages/CreateUser.jsx
import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const GET_ME = gql`
  query GetMe {
    me {
      userType
      institution { id name }
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($reg: String!, $type: String!, $instId: ID) {
    createUser(registrationNumber: $reg, userType: $type, institutionId: $instId) {
      user { username userType }
    }
  }
`;

export default function CreateUser() {
  const navigate = useNavigate();
  const { data, loading: loadingMe } = useQuery(GET_ME);
  const [form, setForm] = useState({ reg: '', type: 'teacher' });
  const [createUser, { loading: creating }] = useMutation(CREATE_USER_MUTATION);

  if (loadingMe) return <div className="flex justify-center p-20 text-lg">Loading profile...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({ 
        variables: { 
          reg: form.reg, 
          type: form.type, 
          instId: data?.me?.institution?.id 
        } 
      });

      Swal.fire({
        title: 'Success!',
        text: 'Usuário criado! A senha padrão é o mesmo número de matrícula.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });

      navigate('/dashboard');
    } catch (err) { 
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-800 text-center mb-1">Registre um novo usuário</h3>
        <p className="text-sm text-slate-500 text-center mb-8">Instituição: {data?.me?.institution?.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Matrícula</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: 2024001" 
              onChange={e => setForm({...form, reg: e.target.value})} 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Usuário</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
            >
              {data?.me?.userType === 'management' && <option value="aee">Professor AEE</option>}
              <option value="teacher">Professor Regular</option>
              <option value="student">Estudente</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={creating}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-lg shadow-blue-200"
          >
            {creating ? 'Registering...' : 'Register User'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-3 bg-transparent text-slate-500 font-semibold hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}