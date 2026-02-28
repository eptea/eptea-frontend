import React from "react";

export function Avatar({ student }) {
  return student?.profileImage ? (
    <img src={student.profileImage} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-indigo-50 shadow-md" alt="" />
  ) : (
    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-lg">
      {student?.firstName?.charAt(0)}
    </div>
  );
}

export function PlanField({ label, value }) {
  return (
    <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10">
      <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{label}</p>
      <p className="text-sm leading-relaxed">{value || "Não informado."}</p>
    </div>
  );
}

export function DossieField({ title, icon, value }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-3">
        <span className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">{icon}</span>
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed italic bg-slate-50/50 p-4 rounded-2xl border border-slate-50 min-h-[60px]">
        {value || "Aguardando preenchimento."}
      </p>
    </div>
  );
}