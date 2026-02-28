// src/features/planning/ManageAssignments.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';

const GET_STRUCTURE = gql`
  query {
    myClasses { id name }
    allSubjects { id name }
    usersByInstitution { id firstName lastName userType username }
  }
`;

export default function ManageAssignments() {
  const { data, loading } = useQuery(GET_STRUCTURE);
  const [selectedClass, setSelectedClass] = useState('');
  const [rows, setRows] = useState([{ teacherId: '', subjectIds: [] }]);
  const [assign] = useMutation(gql`
    mutation Bulk($t: ID!, $c: ID!, $s: [ID]!) { bulkAssignTeacher(teacherId: $t, classId: $c, subjectIds: $s) { success } }
  `);

  if (loading) return <p className="p-20 text-center">Carregando estrutura...</p>;

  const handleAddRow = () => setRows([...rows, { teacherId: '', subjectIds: [] }]);

  const handleSave = async () => {
    if (!selectedClass) return Swal.fire('Ops', 'Selecione uma turma primeiro.', 'warning');
    try {
      for (const row of rows) {
        if (row.teacherId && row.subjectIds.length > 0) {
          await assign({ variables: { t: row.teacherId, c: selectedClass, s: row.subjectIds } });
        }
      }
      Swal.fire('Sucesso!', 'Grade acadêmica vinculada.', 'success');
    } catch (e) { Swal.fire('Erro', e.message, 'error'); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">🔗 Atribuição de Docentes</h2>
      
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase mb-3 block">1. Selecione a Turma Alvo</label>
        <select onChange={e => setSelectedClass(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-3xl mb-10 font-bold outline-none focus:border-blue-500">
          <option value="">Escolha a Turma...</option>
          {data?.myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label className="text-xs font-black text-slate-400 uppercase mb-4 block">2. Vincular Professores e Matérias</label>
        <div className="space-y-6">
          {rows.map((row, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/50 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-600 mb-2">Professor:</p>
                <select className="w-full p-4 bg-white border rounded-2xl shadow-sm" onChange={e => {
                  const n = [...rows]; n[i].teacherId = e.target.value; setRows(n);
                }}>
                  <option value="">Docente...</option>
                  {data?.usersByInstitution.filter(u => u.userType === 'teacher').map(t => <option key={t.id} value={t.id}>{t.firstName || t.username}</option>)}
                </select>
              </div>
              <div className="flex-[2]">
                <p className="text-sm font-bold text-slate-600 mb-2">Selecione as Disciplinas dele nesta turma:</p>
                <div className="grid grid-cols-2 gap-3">
                  {data?.allSubjects.map(s => (
                    <label key={s.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border hover:bg-blue-50 cursor-pointer transition-all">
                      <input type="checkbox" className="w-5 h-5 rounded-lg" onChange={e => {
                        const n = [...rows];
                        if(e.target.checked) n[i].subjectIds.push(s.id);
                        else n[i].subjectIds = n[i].subjectIds.filter(id => id !== s.id);
                        setRows(n);
                      }} />
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-4">
          <button onClick={handleAddRow} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-all">+ Novo Vínculo</button>
          <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Salvar Grade da Turma</button>
        </div>
      </div>
    </div>
  );
}