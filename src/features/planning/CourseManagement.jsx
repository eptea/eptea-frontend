import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavBar from "../../layouts/Navbar";
import Sidebar from "../../layouts/Sidebar";

const GET_COURSES = gql`
  query GetCourses {
    me {
      id
      username
      firstName
      lastName
      userType
      profileImage
      institution {
        name
        id
      }
    }
    myCourses {
      id
      name
      isActive
    }
  }
`;
const CREATE_COURSE = gql`
  mutation CreateCourse($name: String!) {
    createCourse(name: $name) {
      course {
        id
        name
      }
    }
  }
`;

const TOGGLE_COURSE = gql`
  mutation ToggleCourse($courseId: ID!, $isActive: Boolean!) {
    toggleCourseStatus(courseId: $courseId, isActive: $isActive) {
      success
    }
  }
`;

export default function CourseManagement() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseName, setCourseName] = useState("");

  const { data, loading, refetch, error } = useQuery(GET_COURSES);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [toggleCourse] = useMutation(TOGGLE_COURSE);

  const activeCourses = data?.myCourses.filter((c) => c.isActive);
  const inactiveCourses = data?.myCourses.filter((c) => !c.isActive);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse text-xl">
        EPTEA: SINCRONIZANDO CURSOS...
      </div>
    );
  if (error)
    return (
      <p className="p-20 text-center text-red-500 font-bold">
        Erro: {error.message}
      </p>
    );

  const user = data?.me;
  const isManagement = ["management", "aee"].includes(user?.userType);

  const handleSave = async () => {
    if (!courseName.trim()) return;
    try {
      await createCourse({ variables: { name: courseName } });
      Swal.fire("Sucesso!", "Curso cadastrado.", "success");
      setCourseName("");
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      Swal.fire("Erro", e.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h2 className="text-4xl font-black text-slate-800 italic tracking-tight">
              Cursos Ofertados
            </h2>
            {isManagement && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <span>📚</span> Novo Curso
              </button>
            )}
            {isManagement && inactiveCourses.length > 0 && (
              <button
                onClick={() => setShowInactive(true)}
                className="bg-slate-200 px-6 py-3 rounded-2xl font-bold"
              >
                Cursos Inativos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.myCourses.map((course) => (
              <div
                key={course.id}
                className="relative bg-white p-10 rounded-[3rem] ..."
              >
                {isManagement && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCourse({
                        variables: { courseId: course.id, isActive: false },
                      }).then(() => {
                        Swal.fire("Curso inativado", "", "success");
                        refetch();
                      });
                    }}
                    className="absolute top-6 right-6 text-red-500 text-xs font-bold"
                  >
                    Inativar
                  </button>
                )}

                <h3 className="text-2xl font-black">{course.name}</h3>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black mb-6 text-slate-800 italic">
                  Cadastrar Curso
                </h3>
                <div className="space-y-6">
                  <input
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                    placeholder="Nome do Curso (Ex: Informática)"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showInactive && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-10 rounded-3xl w-full max-w-lg">
                <h3 className="text-2xl font-black mb-6">Cursos Inativos</h3>

                {inactiveCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex justify-between items-center mb-4"
                  >
                    <span className="font-bold">{course.name}</span>
                    <button
                      onClick={() => {
                        toggleCourse({
                          variables: { courseId: course.id, isActive: true },
                        }).then(() => {
                          Swal.fire("Curso reativado", "", "success");
                          refetch();
                        });
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm"
                    >
                      Ativar
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setShowInactive(false)}
                  className="mt-6 w-full py-3 bg-slate-200 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
