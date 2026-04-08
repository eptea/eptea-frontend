// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import NavBar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { useAuth } from "../context/AuthContext";

/* ================= QUERIES ================= */

const GET_DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats
  }
`;

const GET_NOTIFICATIONS = gql`
  query Notifications {
    myNotifications {
      id
      message
      changeLevel
      createdAt
      student {
        id
        firstName
        lastName
      }
      isRead
    }
  }
`;

export default function Dashboard() {
  /* ================= QUERIES ================= */

  const { user, loading: userLoading } = useAuth();

  const { data: statsData } = useQuery(GET_DASHBOARD_STATS);

  const { data: notificationsData } = useQuery(GET_NOTIFICATIONS, {
    pollInterval: 15000,
  });

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse uppercase tracking-widest">
        Sincronizando Dashboard...
      </div>
    );
  }

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    if (!statsData?.dashboardStats) {
      return {
        totalStudents: 0,
        totalTeachers: 0,
        notificationsCount: 0,
        activity: [],
        studentsPerCourse: [],
        totalSubjects: 0,
        totalClasses: 0,
        totalCourses: 0,
      };
    }

    try {
      const parsed =
        typeof statsData.dashboardStats === "string"
          ? JSON.parse(statsData.dashboardStats)
          : statsData.dashboardStats;

      return {
        ...parsed,
        activity:
          parsed.activity?.map((a) => ({
            ...a,
            value: Number(a.value),
          })) || [],
      };
    } catch {
      return {
        totalStudents: 0,
        totalTeachers: 0,
        notificationsCount: 0,
        activity: [],
        studentsPerCourse: [],
        totalSubjects: 0,
        totalClasses: 0,
        totalCourses: 0,
      };
    }
  }, [statsData]);

  const isTeacher = user?.userType === "teacher";

  const chartData = useMemo(() => {
    const rawActivity = stats.activity || [];
    const maxVal = Math.max(...rawActivity.map((a) => a.value), 1);

    return rawActivity.map((item) => ({
      ...item,
      percentage: Math.max((item.value / maxVal) * 100, 5),
    }));
  }, [stats]);

  const notifications = notificationsData?.myNotifications || [];

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />

      <div className="flex">
        <Sidebar user={user} />

        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          {/* HEADER */}
          <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 italic">
              Painel de Controle
            </h1>

            <p className="text-slate-500 font-medium">
              {user?.institution?.name} • Gestão de Inclusão
            </p>
          </header>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {isTeacher ? (
              <>
                <StatCard
                  title="Minhas Turmas"
                  value={stats.totalClasses}
                  detail="Turmas vinculadas"
                  icon="🏫"
                  color="indigo"
                />
                <StatCard
                  title="Minhas Disciplinas"
                  value={stats.totalSubjects}
                  detail="Disciplinas ativas"
                  icon="📘"
                  color="emerald"
                />
                <StatCard
                  title="Meus Cursos"
                  value={stats.totalCourses}
                  detail="Cursos vinculados"
                  icon="🎓"
                  color="blue"
                />
              </>
            ) : (
              <>
                <StatCard
                  title="Alunos TEA"
                  value={stats.totalStudents}
                  detail="Base total de alunos"
                  icon="🎓"
                  color="indigo"
                />
                <StatCard
                  title="Docentes"
                  value={stats.totalTeachers}
                  detail="Profissionais ativos"
                  icon="👥"
                  color="emerald"
                />
                <StatCard
                  title="Alertas"
                  value={notifications.length}
                  detail="Notificações recentes"
                  icon="🔔"
                  color="blue"
                />
              </>
            )}
          </div>

          {/* GRÁFICO DE ATIVIDADE */}
          <div className="bg-white p-6 rounded-3xl shadow-sm mb-10">
            <h2 className="text-lg font-bold mb-4">Atividade Recente</h2>

            <div className="w-full overflow-x-auto">
              <div className="flex items-end gap-6 h-64 px-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    {/* VALOR */}
                    <span className="text-xs font-bold text-slate-500 mb-2">
                      {item.value}
                    </span>

                    {/* BARRA */}
                    <div className="w-full flex justify-center">
                      <div
                        className="w-8 md:w-10 bg-blue-500 rounded-2xl transition-all duration-500 hover:opacity-80"
                        style={{
                          height: `${item.percentage}%`,
                          minHeight: "8px",
                        }}
                      />
                    </div>

                    {/* LABEL */}
                    <span className="text-[10px] md:text-xs text-slate-400 mt-2 text-center font-bold">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEÇÃO DE NOTIFICAÇÕES (MURAL) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 italic">
                Mural de Atualizações
              </h2>
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                Tempo Real
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium">
                  Nenhuma movimentação pedagógica hoje.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border-l-4 transition-all hover:shadow-md ${
                      n.changeLevel === "HIGH"
                        ? "bg-red-50 border-red-500"
                        : n.changeLevel === "MEDIUM"
                          ? "bg-amber-50 border-amber-500"
                          : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()} •{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {n.changeLevel === "HIGH" && (
                        <span className="text-red-500 animate-pulse">⚠️</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      {n.message}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        {n.student?.firstName[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        Aluno: {n.student?.firstName} {n.student?.lastName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function StatCard({ title, value, detail, icon, color }) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="text-4xl font-black text-slate-800">{value}</p>
      <p className="text-xs font-black text-slate-400 uppercase">{title}</p>
      <p className="text-xs text-slate-300 italic">{detail}</p>
    </div>
  );
}
