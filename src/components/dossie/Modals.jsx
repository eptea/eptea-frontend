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

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl p-10 flex flex-col max-h-[90vh]">
                <h2 className="text-3xl font-black mb-8 italic">Editar Dossiê Institucional</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-4 mb-8 custom-scrollbar">
                    {fields.map(f => (
                        <div key={f.id}>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{f.label}</label>
                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium h-28 focus:ring-2 focus:ring-indigo-500 outline-none" value={form[f.id] || ""} onChange={e => setForm({...form, [f.id]: e.target.value})} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 border-t pt-6">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold">Cancelar</button>
                    <button onClick={onSave} className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black">Salvar PEI</button>
                </div>
            </div>
        </div>
    );
}

export function ModalSubjectPlan({ form, setForm, onClose, onSave }) {
    const fields = [
        { id: 'programmaticContent', label: 'Conteúdos Programáticos' },
        { id: 'objectives', label: 'Objetivos de Aprendizagem' },
        { id: 'methodology', label: 'Metodologia e Procedimentos' },
        { id: 'evaluation', label: 'Processo de Avaliação' }
    ];

    return (
        <div className="fixed inset-0 bg-indigo-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl p-10">
                <h2 className="text-3xl font-black mb-8 italic text-indigo-600 text-center">Plano de Acessibilidade Curricular</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {fields.map(f => (
                        <div key={f.id}>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{f.label}</label>
                            <textarea className="w-full p-4 bg-indigo-50/50 rounded-2xl border-none font-medium h-40 focus:ring-2 focus:ring-indigo-500 outline-none" value={form[f.id] || ""} onChange={e => setForm({...form, [f.id]: e.target.value})} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4 border-t pt-6">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold">Voltar</button>
                    <button onClick={onSave} className="px-12 py-4 rounded-2xl bg-indigo-600 text-white font-black">Confirmar Plano</button>
                </div>
            </div>
        </div>
    );
}