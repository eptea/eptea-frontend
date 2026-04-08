// src/components/Modals.jsx (ou onde estiver seu arquivo de modais)
import React from "react";

export function ModalDossie({ form, setForm, onClose, onSave }) {
    const fields = [
        { id: 'disabilityDescription', label: 'Deficiência (CID)' },
        { id: 'educationalHistory', label: 'Trajetória Escolar' },
        { id: 'pastAdaptations', label: 'Adaptações Anteriores' },
        { id: 'institutionalHistory', label: 'Histórico Institucional' },
        { id: 'challengesAndTriggers', label: 'Gatilhos e Dificuldades' },
        { id: 'strengthsAndInterests', label: 'Hiperfoco e Habilidades' },
        { id: 'communicationProfile', label: 'Perfil de Comunicação' },
        { id: 'healthAndNutrition', label: 'Saúde e Nutrição' },
        { id: 'crisisIntervention', label: 'Manejo de Crises' },
        { id: 'pedagogicalGuidelines', label: 'Diretrizes do AEE' },
        { id: 'certificationType', label: 'Tipo de Certificação' }
    ];

    // Opções de níveis para o seletor
    const levels = [
        { id: 'LOW', label: 'Baixo Porte', color: 'peer-checked:bg-emerald-500 peer-checked:text-white', bg: 'bg-emerald-50' },
        { id: 'MEDIUM', label: 'Médio Porte', color: 'peer-checked:bg-amber-500 peer-checked:text-white', bg: 'bg-amber-50' },
        { id: 'HIGH', label: 'Grande Porte', color: 'peer-checked:bg-red-500 peer-checked:text-white', bg: 'bg-red-50' },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl p-10 flex flex-col max-h-[90vh]">
                <h2 className="text-3xl font-black mb-4 italic">Editar Dossiê Institucional</h2>
                
                {/* --- SELETOR DE NÍVEL DE ADAPTAÇÃO --- */}
                <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-3 block">
                        Nível de Adaptação Exigido (Impacto na IA)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {levels.map((lvl) => (
                            <label key={lvl.id} className="cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="adaptationLevel" 
                                    className="peer hidden" 
                                    checked={form.adaptationLevel === lvl.id}
                                    onChange={() => setForm({...form, adaptationLevel: lvl.id})}
                                />
                                <div className={`py-3 text-center rounded-2xl font-black text-sm transition-all border-2 border-transparent ${lvl.bg} text-slate-600 ${lvl.color}`}>
                                    {lvl.label}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- CAMPOS DE TEXTO --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-4 mb-8 custom-scrollbar">
                    {fields.map(f => (
                        <div key={f.id}>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{f.label}</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium h-28 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={form[f.id] || ""} 
                                onChange={e => setForm({...form, [f.id]: e.target.value})} 
                            />
                        </div>
                    ))}
                </div>

                {/* --- AÇÕES --- */}
                <div className="flex justify-end gap-4 border-t pt-6">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all">
                        Cancelar
                    </button>
                    <button onClick={onSave} className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">
                        Salvar Dossiê
                    </button>
                </div>
            </div>
        </div>
    );
}