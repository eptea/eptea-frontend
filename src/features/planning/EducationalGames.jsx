import React, { useState, useMemo } from 'react';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';
import { useAuth } from "../../context/AuthContext";

// --- MAPEAMENTO VISUAL (ÍCONES) ---
const COURSE_ICONS = {
  'TODOS': '🌐',
  'Adm': '💼',
  'Agroindustria': '🏭',
  'Agropecuária': '🚜',
  'Zootecnia': '🐄'
};

const CATEGORY_ICONS = {
  'TODAS': '🎯',
  'ORGANIZAÇÃO': '📅',
  'HABILIDADES SOCIAIS': '🤝',
  'MATEMÁTICA': '🧮',
  'LINGUAGENS': '📚'
};

const STATIC_GAMES = [
  {
    id: 1,
    title: "Desafio da Rotina",
    description: "Jogo de arrastar e soltar para organizar as tarefas do dia a dia escolar, auxiliando na previsibilidade.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
    category: "ORGANIZAÇÃO",
    courses: ["Adm", "Agropecuária"] 
  },
  {
    id: 2,
    title: "Mestre das Emoções",
    description: "Identifique expressões faciais e situações sociais para ganhar pontos e evoluir o avatar.",
    image: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=400&q=80",
    category: "HABILIDADES SOCIAIS",
    courses: ["Zootecnia"] 
  },
  {
    id: 3,
    title: "Laboratório de Frações",
    description: "Utilize peças visuais como blocos e fatias para entender frações matemáticas de forma concreta.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80",
    category: "MATEMÁTICA",
    courses: ["TODOS"] 
  },
  {
    id: 4,
    title: "Construtor Fônico",
    description: "Forme palavras conectando sílabas em bolhas flutuantes. Focado no método fônico e visual.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    category: "LINGUAGENS",
    courses: ["TODOS"] 
  }
];

export default function EducationalGames() {
  const { user, loading } = useAuth();
  
  const [selectedCourse, setSelectedCourse] = useState('TODOS');
  const [selectedArea, setSelectedArea] = useState('TODAS');

  // 1. Extrai dinamicamente apenas os Cursos que têm jogos cadastrados
  const availableCourses = useMemo(() => {
    const uniqueCourses = new Set();
    STATIC_GAMES.forEach(game => {
      game.courses.forEach(course => {
        if (course !== 'TODOS') uniqueCourses.add(course);
      });
    });
    return ['TODOS', ...Array.from(uniqueCourses).sort()];
  }, []);

  // 2. Extrai dinamicamente as Categorias (Áreas)
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(STATIC_GAMES.map(g => g.category))];
    return ['TODAS', ...uniqueCategories];
  }, []);

  // 3. Filtro Cruzado (Curso + Área)
  const filteredGames = useMemo(() => {
    return STATIC_GAMES.filter(game => {
      const matchArea = selectedArea === 'TODAS' || game.category === selectedArea;
      const matchCourse = selectedCourse === 'TODOS' || game.courses.includes('TODOS') || game.courses.includes(selectedCourse);
      return matchArea && matchCourse;
    });
  }, [selectedArea, selectedCourse]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse">CARREGANDO HUB DE JOGOS...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          
          <header className="mb-8">
            <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">Jogos Educativos</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Implementação Futura</span>
                <p className="text-slate-400 font-bold text-xs">Recursos em fase de design pedagógico</p>
            </div>
          </header>

          {/* PAINEL DE FILTROS DUPLOS COM ÍCONES */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 space-y-5 animate-in fade-in slide-in-from-top-4">
            
            {/* Linha 1: Curso Dinâmico */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Curso:</span>
              <div className="flex flex-wrap gap-2">
                {availableCourses.map(course => (
                  <button
                    key={course}
                    onClick={() => setSelectedCourse(course)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                      selectedCourse === course 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-500'
                    }`}
                  >
                    <span className="text-sm">{COURSE_ICONS[course] || '📌'}</span>
                    {course}
                  </button>
                ))}
              </div>
            </div>

            {/* Linha 2: Área / Disciplina Dinâmica */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Área:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(area => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                      selectedArea === area 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-500'
                    }`}
                  >
                    <span className="text-sm">{CATEGORY_ICONS[area] || '🧩'}</span>
                    {area}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* GRID DE JOGOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map(game => (
              <div key={game.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={game.title} />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur shadow-sm px-4 py-1.5 rounded-2xl text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                        <span>{CATEGORY_ICONS[game.category] || '🧩'}</span>
                        {game.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors italic">{game.title}</h3>
                  <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8 flex-1">
                    {game.description}
                  </p>
                  
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                    🕹️ Iniciar Jogo
                  </button>
                </div>
              </div>
            ))}

            {/* Card de Breve - Só aparece quando estiver vendo todas as opções */}
            {selectedArea === 'TODAS' && selectedCourse === 'TODOS' && (
              <div className="bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">🧩</div>
                  <h4 className="font-black text-slate-400 uppercase text-xs tracking-widest">Novos Jogos</h4>
                  <p className="text-[10px] font-bold text-slate-300 mt-2">Sugira uma mecânica para a Ada!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}