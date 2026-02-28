import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Ajustamos o path de Turmas para /courses, que é a porta de entrada agora
  const menuItems = [
    { label: 'Início', icon: '📊', path: '/dashboard', roles: ['management', 'aee', 'teacher'] },
    { label: 'Alunos TEA', icon: '🎓', path: '/students', roles: ['management', 'aee'] },
    { label: 'Cursos e Turmas', icon: '🏫', path: '/courses', roles: ['management', 'aee', 'teacher'] },
    { label: 'Corpo Docente', icon: '👥', path: '/staff', roles: ['management', 'aee'] },
    { label: 'Disciplinas', icon: '📚', path: '/subjects', roles: ['management', 'aee'] },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-[calc(100vh-4.5rem)] sticky top-[4.5rem] z-30">
      <div className="p-6 space-y-2 flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Menu Principal</p>
        
        {menuItems
          .filter(item => item.roles.includes(user?.userType))
          .map((item) => {
            // Mudamos para startsWith para que o ícone continue aceso quando você entrar em uma turma específica
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`text-xl ${isActive ? 'scale-110' : 'opacity-70'}`}>{item.icon}</span>
                {item.label}
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-white/40"></div>}
              </button>
            );
          })}
      </div>
    </aside>
  );
}