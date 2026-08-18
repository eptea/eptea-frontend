import React, { useState, useMemo } from 'react';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';
import { useAuth } from "../../context/AuthContext";

const STATIC_GAMES = [
  {
    id: 1,
    title: "Desafio da Rotina",
    description: "Jogo de arrastar e soltar para organizar as tarefas do dia a dia escolar, auxiliando na previsibilidade.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
    category: "ORGANIZAÇÃO"
  },
  {
    id: 2,
    title: "Mestre das Emoções",
    description: "Identifique expressões faciais e situações sociais para ganhar pontos e evoluir o avatar.",
    image: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=400&q=80",
    category: "HABILIDADES SOCIAIS"
  },
  {
    id: 3,
    title: "Laboratório de Frações",
    description: "Utilize peças visuais como blocos e fatias para entender frações matemáticas de forma concreta.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80",
    category: "MATEMÁTICA"
  },
  {
    id: 4,
    title: "Construtor Fônico",
    description: "Forme palavras conectando sílabas em bolhas flutuantes. Focado no método fônico e visual.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    category: "LINGUAGENS"
  }
];

export default function EducationalGames() {
  const { user, loading } = useAuth(); // Usando o contexto otimizado
  const [selectedArea, setSelectedArea] = useState('TODAS');

  // Extrai todas as categorias únicas da lista de jogos automaticamente
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(STATIC_GAMES.map(g => g.category))];
    return ['TODAS', ...uniqueCategories];
  }, []);

  // Filtra os jogos com base na área selecionada
  const filteredGames = useMemo(() => {
    if (selectedArea === 'TODAS') return STATIC_GAMES;
    return STATIC_GAMES.filter(g => g.category === selectedArea);
  }, [selectedArea]);

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

          {/* BARRA DE FILTRO ESTILO GCOMPRIS (Por Área/Disciplina) */}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map(area => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm border ${
                  selectedArea === area 
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-200' 
                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-indigo-400'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map(game => (
              <div key={game.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={game.title} />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur shadow-sm px-4 py-1.5 rounded-2xl text-[9px] font-black text-indigo-600 uppercase tracking-widest">
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

            {/* Card de Breve - Só aparece quando estiver vendo "TODAS" as áreas */}
            {selectedArea === 'TODAS' && (
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