// src/features/planning/CreateClassSubject.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';

const CREATE_CLASS = gql`mutation CreateC($n: String!) { createClassGroup(name: $n) { classGroup { id name } } }`;
const CREATE_SUBJECT = gql`mutation CreateS($n: String!) { createSubject(name: $n) { subject { id name } } }`;

export default function CreateClassSubject() {
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  
  const [addClass] = useMutation(CREATE_CLASS);
  const [addSubject] = useMutation(CREATE_SUBJECT);

  const handleAddClass = async (e) => {
    e.preventDefault();
    await addClass({ variables: { n: className } });
    Swal.fire('Sucesso', 'Turma criada!', 'success');
    setClassName('');
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    await addSubject({ variables: { n: subjectName } });
    Swal.fire('Sucesso', 'Disciplina criada!', 'success');
    setSubjectName('');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border">
        <h3 className="text-xl font-bold mb-4">Nova Turma</h3>
        <form onSubmit={handleAddClass} className="space-y-4">
          <input className="w-full p-3 border rounded-xl" placeholder="Ex: 1º Ano B" value={className} onChange={e => setClassName(e.target.value)} required />
          <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Criar Turma</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border">
        <h3 className="text-xl font-bold mb-4">Nova Disciplina</h3>
        <form onSubmit={handleAddSubject} className="space-y-4">
          <input className="w-full p-3 border rounded-xl" placeholder="Ex: Matemática" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
          <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Criar Disciplina</button>
        </form>
      </div>
    </div>
  );
}