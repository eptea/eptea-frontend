import React, { useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import NavBar from "../layouts/NavBar";
import Sidebar from "../layouts/Sidebar";

const GET_DASHBOARD_DATA = gql`
  query GetDashboard {
    me {
      id username firstName lastName userType profileImage
      institution { name }
    }
    myNotifications {
      id message changeLevel createdAt
      student { id firstName lastName }
      isRead
    }
    dashboardStats
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_DATA, {
    pollInterval: 10000, 
    fetchPolicy: "network-only",
  });

  const stats = useMemo(() => {
    if (!data?.dashboardStats) return { totalStudents: 0, totalTeachers: 0, notificationsCount: 0, activity: [], studentsPerCourse: [] };
    try {
      const parsed = typeof data.dashboardStats === "string" ? JSON.parse(data.dashboardStats) : data.dashboardStats;
      return {
        ...parsed,
        activity: parsed.activity?.map(a => ({ ...a, value: Number(a.value) })) || []
      };
    } catch (e) { return { totalStudents: 0, totalTeachers: 0, notificationsCount: 0, activity: [], studentsPerCourse: [] }; }
  }, [data]);

  const chartData = useMemo(() => {
    const rawActivity = stats.activity || [];
    const maxVal = Math.max(...rawActivity.map(a => a.value), 1);
    
    return rawActivity.map(item => ({
      ...item,
      percentage: Math.max((item.value / maxVal) * 100, 5) 
    }));
  }, [stats]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse uppercase tracking-widest">Sincronizando Dashboard...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={data.me} />
      <div className="flex">
        <Sidebar user={data.me} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          
          <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic leading-tight">Painel de Controle</h1>
            <p className="text-slate-500 font-medium">{data.me.institution?.name} • Gestão de Inclusão</p>
          </header>

          {/* GRID AJUSTADO PARA 3 COLUNAS (Sem interações redundantes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Alunos TEA" value={stats.totalStudents} detail="Base total de alunos" icon="🎓" color="indigo" />
            <StatCard title="Docentes" value={stats.totalTeachers} detail="Profissionais ativos" icon="👥" color="emerald" />
            {/* Este card reflete os Signals do Dossiê */}
            <StatCard title="Alertas de Dossiê" value={stats.notificationsCount} detail="Atualizações recentes" icon="🔔" color="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* GRÁFICO DE ATIVIDADE COM BARRAS FINAS */}
            <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 italic mb-10">Atividade do Fórum</h2>
              
              <div className="h-64 w-full flex items-end justify-between gap-2 px-4 border-b border-slate-50">
                {chartData.map((day, i) => (
                  <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap shadow-xl">
                        {day.value} interações
                    </div>

                    {/* Barra Ajustada: w-3 para ficar fina e mx-auto para centralizar */}
                    <div 
                      style={{ height: `${day.percentage}%` }} 
                      className={`w-3 mx-auto transition-all duration-1000 ease-out rounded-t-full ${
                          day.value > 0 
                            ? 'bg-indigo-600 shadow-[0_-5px_15px_rgba(79,70,229,0.3)]' 
                            : 'bg-slate-100'
                      } group-hover:bg-indigo-400 group-hover:w-4`} 
                    />
                    
                    <p className="text-[9px] font-black text-slate-300 text-center mt-4 uppercase tracking-tighter">
                        {day.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ALUNOS POR CURSO */}
            <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <h2 className="text-lg font-black text-slate-800 mb-8 italic">Alunos por Curso</h2>
              <div className="flex-1 flex flex-col justify-center gap-6">
                {stats.studentsPerCourse?.map((c, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{c.label}</span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{c.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(c.value / Math.max(stats.totalStudents, 1)) * 100}%` }} 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-sm"
                      />
                    </div>
                  </div>
                ))}
                {stats.studentsPerCourse?.length === 0 && (
                   <p className="text-center text-xs text-slate-300 italic">Nenhum dado de curso.</p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// Subcomponente de Card (Padronizado)
function StatCard({ title, value, detail, icon, color }) {
  const colors = { 
    indigo: "text-indigo-600 bg-indigo-50", 
    emerald: "text-emerald-600 bg-emerald-50", 
    blue: "text-blue-600 bg-blue-50" 
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform ${colors[color]}`}>{icon}</div>
      <p className="text-4xl font-black text-slate-800 leading-none mb-1 tracking-tighter">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-[9px] font-bold text-slate-300 mt-2 italic">{detail}</p>
    </div>
  );
}