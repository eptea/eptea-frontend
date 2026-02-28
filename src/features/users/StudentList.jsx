import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import NavBar from '../../layouts/Navbar';
import Sidebar from '../../layouts/Sidebar';

// --- QUERIES ---
const GET_STUDENT_PAGE_DATA = gql`
  query GetStudentData {
    me { 
      id username firstName lastName userType profileImage 
      institution { id name } 
    }
    myCourses { id name }
    myClasses { id name course { id name } }
    usersByInstitution { 
      id firstName lastName username userType profileImage 
      classGroup { id name course { id name } } 
    }
  }
`;

// --- MUTATIONS ---
const CREATE_STUDENT = gql`
  mutation CreateStudent($reg: String!, $type: String!, $instId: ID, $classId: ID, $fName: String, $lName: String, $img: Upload) {
    createUser(registrationNumber: $reg, userType: $type, institutionId: $instId, classGroupId: $classId, firstName: $fName, lastName: $lName, profileImage: $img) {
      user { id username }
    }
  }
`;

const UPDATE_STUDENT_BASIC = gql`
  mutation UpdateStudent($id: ID!, $fName: String, $lName: String, $img: Upload, $classId: ID) {
    updateStudentInfo(id: $id, firstName: $fName, lastName: $lName, profileImage: $img, classGroupId: $classId) {
      success
    }
  }
`;

export default function StudentList() {
  const navigate = useNavigate();
  const { data, loading, refetch, error } = useQuery(GET_STUDENT_PAGE_DATA);
  const [createStudent] = useMutation(CREATE_STUDENT);
  const [updateStudent] = useMutation(UPDATE_STUDENT_BASIC);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 1. Adicionado courseId ao estado do formulário
  const [form, setForm] = useState({ 
    reg: '', 
    courseId: '', 
    classId: '', 
    firstName: '', 
    lastName: '', 
    photo: null 
  });

  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Lógica de Turmas para o FILTRO da página (Cascata)
  const availableClassesForFilter = useMemo(() => {
    const classes = data?.myClasses || [];
    if (!filterCourseId) return classes;
    return classes.filter(c => c.course?.id === filterCourseId);
  }, [data, filterCourseId]);

  // 2. Lógica de Turmas para o MODAL (Cascata baseada na escolha do curso no form)
  const availableClassesForModal = useMemo(() => {
    const classes = data?.myClasses || [];
    if (!form.courseId) return []; // Retorna vazio se nenhum curso for selecionado no modal
    return classes.filter(c => c.course?.id === form.courseId);
  }, [data, form.courseId]);

  const filteredAndSortedStudents = useMemo(() => {
    let list = (data?.usersByInstitution || []).filter(u => u.userType === 'student');
    if (filterCourseId) list = list.filter(s => s.classGroup?.course?.id === filterCourseId);
    if (filterClassId) list = list.filter(s => s.classGroup?.id === filterClassId);
    return [...list].sort((a, b) => {
      const nameA = (a.firstName || a.username).toLowerCase();
      const nameB = (b.firstName || b.username).toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [data, filterCourseId, filterClassId, sortOrder]);

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    // 3. Preenche o courseId ao editar para que a turma apareça selecionada corretamente
    setForm({ 
      reg: s.username, 
      courseId: s.classGroup?.course?.id || '',
      classId: s.classGroup?.id || '', 
      firstName: s.firstName || '', 
      lastName: s.lastName || '', 
      photo: null 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId) return Swal.fire('Atenção', 'Selecione a turma de destino.', 'warning');
    try {
      if (editingId) {
        await updateStudent({ variables: { id: editingId, fName: form.firstName, lName: form.lastName, img: form.photo, classId: form.classId }});
        Swal.fire('Sucesso', 'Dados atualizados!', 'success');
      } else {
        const { data: resp } = await createStudent({ variables: { 
          reg: form.reg, type: 'student', instId: data?.me?.institution?.id, classId: form.classId, fName: form.firstName, lName: form.lastName, img: form.photo 
        }});
        Swal.fire('Matriculado!', 'Aluno cadastrado.', 'success').then(() => navigate(`/students/${resp.createUser.user.id}/dossie`));
      }
      setIsModalOpen(false); refetch();
    } catch (err) { Swal.fire('Erro', err.message, 'error'); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse text-xl">EPTEA: CARREGANDO...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const user = data.me;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h2 className="text-4xl font-black text-slate-800 italic tracking-tight">Alunos TEA</h2>
            <button onClick={() => { setEditingId(null); setForm({reg:'', courseId: '', classId:'', firstName:'', lastName:'', photo: null}); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">➕ Nova Matrícula</button>
          </div>

          {/* FILTROS DA PÁGINA (Mantidos) */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">1. Curso</label>
              <select value={filterCourseId} onChange={(e) => { setFilterCourseId(e.target.value); setFilterClassId(''); }} className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos</option>
                {data?.myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">2. Turma</label>
              <select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas</option>
                {availableClassesForFilter.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ordem</label>
              <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 flex justify-between px-4 hover:bg-slate-100 transition-colors">{sortOrder === 'asc' ? 'A → Z' : 'Z → A'} <span>{sortOrder === 'asc' ? '🔼' : '🔽'}</span></button>
            </div>
            <button onClick={() => { setFilterCourseId(''); setFilterClassId(''); }} className="p-3 text-[10px] font-black uppercase text-indigo-600">Limpar Tudo</button>
          </div>

          {/* GRID DE CARDS (Mantido) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAndSortedStudents.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
                <div className="flex items-center gap-5 mb-8 relative z-10">
                   {s.profileImage ? <img src={s.profileImage} className="w-20 h-20 rounded-[1.8rem] object-cover border-4 border-slate-50 shadow-sm" alt="Perfil" /> : <div className="w-20 h-20 rounded-[1.8rem] bg-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-300">{s.firstName?.charAt(0) || '🎓'}</div>}
                   <div className="overflow-hidden">
                     <h3 className="font-black text-xl text-slate-800 truncate leading-tight">{s.firstName ? `${s.firstName} ${s.lastName}` : s.username}</h3>
                     <div className="flex flex-col mt-1">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{s.classGroup?.course?.name || 'S/ Curso'}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{s.classGroup?.name || 'S/ Turma'}</span>
                     </div>
                   </div>
                </div>
                <div className="flex flex-col gap-3 relative z-10">
                   <button onClick={() => handleOpenEdit(s)} className="w-full py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-colors">✏️ Editar Cadastro</button>
                   <button onClick={() => navigate(`/students/${s.id}/dossie`)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 transition-all shadow-lg">Abrir Dossiê PDI</button>
                </div>
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] font-black italic -rotate-12 select-none group-hover:scale-110 transition-transform">TEA</div>
              </div>
            ))}
          </div>

          {/* MODAL COM CASCATA: CURSO -> TURMA */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-200">
                <header className="mb-8">
                    <h3 className="text-3xl font-black text-slate-800 italic">{editingId ? 'Ajustar Dados' : 'Novo Aluno'}</h3>
                </header>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!editingId && <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Matrícula/Login" value={form.reg} onChange={e => setForm({...form, reg: e.target.value})} required />}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Nome" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
                    <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Sobrenome" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
                  </div>

                  {/* 4. ESCOLHA DO CURSO (MODAL) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">1. Selecione o Curso</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
                      value={form.courseId} 
                      onChange={e => setForm({...form, courseId: e.target.value, classId: ''})} // Limpa a turma ao mudar o curso
                      required
                    >
                      <option value="">Escolha o curso...</option>
                      {data?.myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* 5. ESCOLHA DA TURMA (FILTRADA) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">2. Selecione a Turma</label>
                    <select 
                      className={`w-full p-4 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all ${!form.courseId ? 'bg-slate-100 opacity-50 cursor-not-allowed' : 'bg-slate-50'}`}
                      value={form.classId} 
                      onChange={e => setForm({...form, classId: e.target.value})} 
                      disabled={!form.courseId}
                      required
                    >
                      <option value="">{form.courseId ? "Agora escolha a turma..." : "Selecione o curso primeiro"}</option>
                      {availableClassesForModal.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-center group hover:border-indigo-200 transition-colors">
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" onChange={e => setForm({...form, photo: e.target.files[0]})} accept="image/*" />
                      <span className="text-indigo-600 text-xs font-black uppercase tracking-widest">{form.photo ? form.photo.name.substring(0, 15) : 'Escolher Foto'}</span>
                    </label>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Salvar</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">Sair</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}