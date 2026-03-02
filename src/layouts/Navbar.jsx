// src/layouts/NavBar.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function NavBar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Lógica segura para iniciais
  // Se não tiver firstName, usamos a primeira letra do username
  const initialA = user?.firstName ? user.firstName.charAt(0) : user?.username?.charAt(0) || "?";
  const initialB = user?.lastName ? user.lastName.charAt(0) : "";

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-2xl font-black text-blue-600 tracking-tighter">EPTEA</Link>
        <img src={logo} alt="Logo EPTEA" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
        <span className="hidden md:inline bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {user?.institution?.name || 'Admin'}
        </span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
            </p>
            <span className="text-[10px] text-slate-500 uppercase font-bold">{user?.userType || 'Equipe'}</span>
          </div>
          
          {/* Avatar com fallback para iniciais com proteção contra NULL */}
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {(initialA + initialB).toUpperCase()}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
            <button 
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
            >
              👤 Meu Perfil
            </button>
            <hr className="my-1 border-slate-100" />
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              🚪 Sair do Sistema
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}