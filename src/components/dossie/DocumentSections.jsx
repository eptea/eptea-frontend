import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";

const UPLOAD_DOC = gql`
  mutation UploadDoc($studentId: ID!, $subjectId: ID, $title: String!, $file: Upload!, $category: String) {
    uploadDocument(studentId: $studentId, subjectId: $subjectId, title: $title, file: $file, category: $category) { success }
  }
`;

const DELETE_DOC = gql`
  mutation DeleteDoc($id: ID!) {
    deleteDocument(id: $id) { success }
  }
`;

// Adicionado 'user' (usuário logado) nas props
export function DocumentSection({ title, docs, color, studentId, subjectId, category, refetch, canUpload, user }) {
    const colors = {
        red: "bg-red-50 border-red-100 text-red-800",
        indigo: "bg-indigo-900 text-white shadow-xl",
        slate: "bg-white border-slate-100 shadow-sm"
    };

    return (
        <div className={`p-8 rounded-[3rem] border ${colors[color]} transition-all`}>
            <h3 className={`text-lg font-black mb-6 flex items-center gap-3 ${color === 'indigo' ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
            <div className="space-y-3 mb-6">
                {docs?.map(doc => (
                  <FileCard 
                    key={doc.id} 
                    doc={doc} 
                    theme={color === 'indigo' ? 'dark' : 'light'} 
                    refetch={refetch} 
                    currentUser={user} // Passa o usuário logado para o card
                  />
                ))}
                {docs?.length === 0 && <p className="text-xs opacity-50 italic">Sem anexos.</p>}
            </div>
            {canUpload && <InlineUpload studentId={studentId} subjectId={subjectId} category={category} refetch={refetch} theme={color === 'indigo' ? 'dark' : 'light'} />}
        </div>
    );
}

function FileCard({ doc, theme = "light", refetch, currentUser }) {
  const isDark = theme === "dark";
  const [deleteDoc] = useMutation(DELETE_DOC);

  // Lógica de Propriedade: Verifica se o ID do logado é igual ao ID de quem subiu
  // Também permitimos que a gestão apague em caso de necessidade administrativa
  const isOwner = currentUser?.id === doc.uploader?.id;
  const canDelete = isOwner || currentUser?.userType === 'management';

  const handleDelete = async () => {
    if (!doc.id) return;

    const result = await Swal.fire({
      title: 'Excluir arquivo?',
      text: "Esta ação é irreversível.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc({ 
          variables: { id: doc.id },
          onCompleted: () => refetch() 
        });
        Swal.fire({ title: 'Removido!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } catch (e) {
        Swal.fire('Erro', e.message, 'error');
      }
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? "bg-indigo-800/40 border-indigo-700" : "bg-slate-50 border-slate-100 group"}`}>
      <div className="truncate pr-2 overflow-hidden">
        <p className="text-xs font-bold truncate">{doc.title}</p>
        <p className={`text-[8px] font-black uppercase opacity-60 ${isDark ? 'text-indigo-200' : ''}`}>Por {doc.uploader.firstName}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 transition-colors">Ver</a>
        
        {/* A lixeira só é renderizada se canDelete for true */}
        {canDelete && (
          <button 
            onClick={handleDelete}
            className={`px-3 py-1.5 rounded-lg text-[9px] transition-all ${isDark ? 'bg-indigo-700 text-indigo-200 hover:bg-red-500 hover:text-white' : 'bg-white text-red-500 border border-red-100 hover:bg-red-500 hover:text-white'}`}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

function InlineUpload({ studentId, subjectId, category, refetch, theme="light" }) {
  const [upload] = useMutation(UPLOAD_DOC);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const isDark = theme === "dark";

  const handleAction = async () => {
    if (!file || !title) return;
    try {
      await upload({ variables: { studentId, subjectId, title, file, category } });
      setFile(null); setTitle(""); refetch();
      Swal.fire({ title: "Enviado!", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (e) { Swal.fire("Erro", e.message, "error"); }
  };

  return (
    <div className="space-y-2">
      <input className={`w-full p-2.5 rounded-xl text-[10px] font-bold border outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? "bg-indigo-800 border-indigo-700 text-white" : "bg-white border-slate-200"}`} placeholder="Título do anexo..." value={title} onChange={e => setTitle(e.target.value)} />
      <div className="flex gap-2">
        <input type="file" className="hidden" id={`f-${category}-${subjectId || 'g'}`} onChange={e => setFile(e.target.files[0])} />
        <label htmlFor={`f-${category}-${subjectId || 'g'}`} className="flex-1 p-2 rounded-xl text-[9px] font-bold text-center cursor-pointer border-2 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors truncate">
          {file ? file.name : 'Arquivo'}
        </label>
        <button onClick={handleAction} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-indigo-600 text-white">Subir</button>
      </div>
    </div>
  );
}