import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";

// Componentes de Layout
import NavBar from "../../layouts/Navbar";
import Sidebar from "../../layouts/Sidebar";

// Sub-componentes do Dossiê
import {
  Avatar,
  DossieField,
  PlanField,
} from "../../components/dossie/UIComponents";
import { DocumentSection } from "../../components/dossie/DocumentSections";
import { ModalDossie, ModalSubjectPlan } from "../../components/dossie/Modals";
import StudentForum from "../../components/dossie/StudentForum";
import AdaAssistantModal from "../../components/dossie/AdaAssistantModal";

// --- QUERIES ---
const GET_STUDENT_DOSSIE = gql`
  query GetDossie($id: ID!, $subjectId: ID!, $teacherId: ID) {
    me {
      id
      username
      firstName
      lastName
      userType
      profileImage
      institution { name }
    }

    userById(id: $id) {
      id
      firstName
      lastName
      username
      profileImage
      classGroup { id name }

      documents {
        id
        title
        fileUrl
        createdAt
        category
        subject { id name }
        uploader { id firstName userType }
      }

      teaProfile {
        disabilityDescription
        educationalHistory
        pastAdaptations
        institutionalHistory
        challengesAndTriggers
        strengthsAndInterests
        communicationProfile
        healthAndNutrition
        crisisIntervention
        pedagogicalGuidelines
        certificationType
      }
    }

    subjectAccessibilityPlan(
      studentId: $id
      subjectId: $subjectId
      teacherId: $teacherId
    ) {
      id
      programmaticContent
      objectives
      methodology
      evaluation
    }
  }
`;

// --- MUTATIONS ---
const UPDATE_TEA = gql`
  mutation UpdateTEA($id: ID!, $disabilityDescription: String, $educationalHistory: String, $pastAdaptations: String, $institutionalHistory: String, $challengesAndTriggers: String, $strengthsAndInterests: String, $communicationProfile: String, $healthAndNutrition: String, $crisisIntervention: String, $pedagogicalGuidelines: String, $certificationType: String) {
    updateTeaProfile(studentId: $id, disabilityDescription: $disabilityDescription, educationalHistory: $educationalHistory, pastAdaptations: $pastAdaptations, institutionalHistory: $institutionalHistory, challengesAndTriggers: $challengesAndTriggers, strengthsAndInterests: $strengthsAndInterests, communicationProfile: $communicationProfile, healthAndNutrition: $healthAndNutrition, crisisIntervention: $crisisIntervention, pedagogicalGuidelines: $pedagogicalGuidelines, certificationType: $certificationType) { success }
  }
`;

const UPDATE_SUBJECT_PLAN = gql`
  mutation UpdateSubjectPlan($studentId: ID!, $subjectId: ID!, $programmaticContent: String, $objectives: String, $methodology: String, $evaluation: String) {
    updateSubjectAccessibilityPlan(studentId: $studentId, subjectId: $subjectId, programmaticContent: $programmaticContent, objectives: $objectives, methodology: $methodology, evaluation: $evaluation) { success }
  }
`;

export default function StudentDossie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentSubjectId = new URLSearchParams(location.search).get("subjectId");
  const currentTeacherId = searchParams.get("teacherId");

  const { data, loading, refetch, error } = useQuery(GET_STUDENT_DOSSIE, {
  variables: {
    id,
    subjectId: currentSubjectId,
    teacherId: currentTeacherId, // só será usado se backend precisar
  },
  skip: !id || !currentSubjectId,
  fetchPolicy: "network-only",
});

  const [updateTEA] = useMutation(UPDATE_TEA);
  const [updateSubjectPlan] = useMutation(UPDATE_SUBJECT_PLAN);

  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isAdaOpen, setIsAdaOpen] = useState(false);
  const [form, setForm] = useState({});
  const [subjectForm, setSubjectForm] = useState({});

  useEffect(() => {
    if (data?.userById?.teaProfile) {
      const { __typename, ...clean } = data.userById.teaProfile;
      setForm(clean);
    }
    if (data?.subjectAccessibilityPlan) {
      const { __typename, id: planId, ...clean } = data.subjectAccessibilityPlan;
      setSubjectForm(clean);
    }
  }, [data]);

  const handleSaveGlobal = async () => {
    try {
      await updateTEA({ variables: { id, ...form } });
      Swal.fire("Sucesso!", "Dossiê atualizado.", "success");
      setIsEditingGlobal(false); refetch();
    } catch (e) { Swal.fire("Erro", e.message, "error"); }
  };

  const handleSaveSubject = async () => {
    try {
      await updateSubjectPlan({ variables: { studentId: id, subjectId: currentSubjectId, ...subjectForm } });
      Swal.fire("Sucesso!", "Plano de aula adaptado.", "success");
      setIsEditingSubject(false); refetch();
    } catch (e) { Swal.fire("Erro", e.message, "error"); }
  };

  const getInitials = (f, l) => {
    if (!f && !l) return "🎓";
    return `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-300 animate-pulse">CARREGANDO...</div>;
  if (error) return <p className="p-20 text-center text-red-500 font-bold">Erro: {error.message}</p>;

  const student = data?.userById;
  const user = data?.me;
  const plan = data?.subjectAccessibilityPlan;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          {/* IDENTIDADE DO ALUNO */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 mb-10 relative overflow-hidden">
            <div className="relative z-10">
              {student?.profileImage ? <img src={student.profileImage} alt="Perfil" className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-slate-50 shadow-lg" /> : <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">{getInitials(student?.firstName, student?.lastName)}</div>}
              <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase">{student?.classGroup?.name || 'S/ Turma'}</div>
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic">{student?.firstName} {student?.lastName}</h1>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-[0.2em] mt-2">Dossiê Pedagógico Ativo</p>
            </div>
            {["aee", "management"].includes(user?.userType) && <button onClick={() => setIsEditingGlobal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-600 transition-all z-10">✏️ Ajustar Dossiê</button>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              {currentSubjectId && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
                  <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
                    <div><h2 className="text-lg font-black italic">Plano de Acessibilidade</h2><p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Contexto da Disciplina</p></div>
                    {user?.userType === "teacher" && <button onClick={() => setIsEditingSubject(true)} className="bg-white/20 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-white/30 transition-all uppercase">✏️ Ajustar</button>}
                  </div>
                  <div className="p-8 grid md:grid-cols-2 gap-8">
                    <PlanField label="Conteúdos" value={plan?.programmaticContent} />
                    <PlanField label="Objetivos" value={plan?.objectives} />
                    <PlanField label="Metodologia" value={plan?.methodology} />
                    <PlanField label="Avaliação" value={plan?.evaluation} />
                  </div>
                </div>
              )}

              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">Perfil de Desenvolvimento Individual</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <DossieField title="Caracterização" icon="🏥" value={form.disabilityDescription} />
                  <DossieField title="Histórico" icon="📜" value={form.educationalHistory} />
                  <DossieField title="Gatilhos" icon="⚡" value={form.challengesAndTriggers} />
                  <DossieField title="Habilidades" icon="🚀" value={form.strengthsAndInterests} />
                  <DossieField title="Comunicação" icon="🗣️" value={form.communicationProfile} />
                  <DossieField title="Saúde" icon="🍎" value={form.healthAndNutrition} />
                </div>
              </div>

              {currentSubjectId && <StudentForum studentId={id} subjectId={currentSubjectId} userType={user?.userType} />}
            </div>

            {/* SIDEBAR DE DOCUMENTOS ATUALIZADA */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                  <h2 className="font-black text-xs uppercase text-slate-800 tracking-widest flex items-center gap-2"><span>📄</span> Documentação</h2>
                  
                  

                  

                  {/* 3. PDIs e PLANOS (Gerais) */}
                  <DocumentSection
                    title="PDIs e Planos"
                    user={user}
                    docs={student?.documents?.filter((d) => d.subject === null && d.category !== "MEDICAL")}
                    color="indigo"
                    studentId={id}
                    category="PDI"
                    refetch={refetch}
                    canUpload={["aee", "management"].includes(user?.userType) && !currentSubjectId}
                  />

                  {/* 1. MATERIAIS DA DISCIPLINA (Restaura os arquivos do professor) */}
                  {currentSubjectId && (
                    <DocumentSection
                      title="Materiais da Aula"
                      user={user}
                      docs={student?.documents?.filter((d) => d.subject?.id === currentSubjectId)}
                      color="slate"
                      studentId={id}
                      subjectId={currentSubjectId}
                      category="MATERIAL"
                      refetch={refetch}
                      canUpload={user?.userType === "teacher" || user?.userType === "aee"}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* BOTÃO ADA E MODAIS (Abaixo) */}
      {currentSubjectId && ["teacher", "aee"].includes(user?.userType) && <button onClick={() => setIsAdaOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 text-2xl">✨</button>}
      {isEditingGlobal && <ModalDossie form={form} setForm={setForm} onClose={() => setIsEditingGlobal(false)} onSave={handleSaveGlobal} />}
      {isEditingSubject && <ModalSubjectPlan form={subjectForm} setForm={setSubjectForm} onClose={() => setIsEditingSubject(false)} onSave={handleSaveSubject} />}
      {currentSubjectId && <AdaAssistantModal isOpen={isAdaOpen} onClose={() => setIsAdaOpen(false)} studentId={id} subjectId={currentSubjectId} />}
    </div>
  );
}