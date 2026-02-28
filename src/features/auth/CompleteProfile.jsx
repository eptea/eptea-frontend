// src/features/auth/CompleteProfile.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($first: String!, $last: String!, $img: Upload) {
    updateProfile(firstName: $first, lastName: $last, profileImage: $img) {
      success
      user {
        firstName
        lastName
        profileImage
      }
    }
  }
`;

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState(null);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ 
        variables: { first: firstName, last: lastName, img: image } 
      });
      Swal.fire({
        title: 'Bem-vindo!',
        text: `Perfil de ${firstName} ${lastName} atualizado.`,
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
      navigate('/dashboard');
    } catch (err) {
      Swal.fire('Erro', err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Finalizar Perfil</h2>
        <p className="text-slate-500 mb-8">Conte-nos um pouco mais sobre você.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center">
             <div className="w-24 h-24 bg-slate-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                {image ? (
                  <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <span className="text-slate-400 text-[10px] text-center px-2">Clique abaixo para foto</span>
                )}
             </div>
             <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="text-xs text-slate-500 mb-4" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: João"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sobrenome</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Silva"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            {loading ? 'Salvando...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}