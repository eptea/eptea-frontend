// src/components/dossie/AEEAttendanceModal.jsx

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";
import IF_LOGO from "../../assets/if.png";

// ============================================================
// QUERY - BUSCAR FREQUÊNCIAS
// ============================================================

const GET_ATTENDANCES = gql`
  query GetAttendances($studentId: ID!) {
    aeeAttendancesByStudent(studentId: $studentId) {
      id
      date
      workedSkills
      methodology
      performance
      aeeSpecialist {
        id
        firstName
        lastName
      }
    }
  }
`;

// ============================================================
// MUTATION - CRIAR FREQUÊNCIA
// ============================================================

const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance(
    $studentId: ID!
    $date: Date!
    $skills: String!
    $meth: String!
    $perf: String!
  ) {
    createAeeAttendance(
      studentId: $studentId
      date: $date
      workedSkills: $skills
      methodology: $meth
      performance: $perf
    ) {
      success
    }
  }
`;

// ============================================================
// MUTATION - EXCLUIR FREQUÊNCIA
// ============================================================

const DELETE_ATTENDANCE = gql`
  mutation DeleteAttendance($attendanceId: ID!) {
    deleteAeeAttendance(attendanceId: $attendanceId) {
      success
    }
  }
`;

export default function AEEAttendanceModal({
  isOpen,
  onClose,
  studentId,
  studentName,

  // Usuário atualmente logado
  // Deve conter pelo menos:
  // {
  //   id: "123",
  //   userType: "aee" ou "management"
  // }
  currentUser,
}) {
  // ============================================================
  // BUSCAR FREQUÊNCIAS
  // ============================================================

  const { data, loading, refetch } = useQuery(GET_ATTENDANCES, {
    variables: { studentId },
    skip: !isOpen,
    fetchPolicy: "network-only",
  });

  // ============================================================
  // MUTATION - CRIAR
  // ============================================================

  const [createAttendance, { loading: saving }] =
    useMutation(CREATE_ATTENDANCE);

  // ============================================================
  // MUTATION - EXCLUIR
  // ============================================================

  const [deleteAttendance, { loading: deleting }] =
    useMutation(DELETE_ATTENDANCE);

  // ============================================================
  // FORMULÁRIO
  // ============================================================

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    skills: "",
    meth: "",
    perf: "",
  });

  // ============================================================
  // DADOS
  // ============================================================

  const attendances = data?.aeeAttendancesByStudent || [];

  // ============================================================
  // AGRUPAR POR MÊS
  // ============================================================

  const groupedByMonth = useMemo(() => {
    return attendances.reduce((acc, curr) => {
      const monthYear = new Date(curr.date).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }

      acc[monthYear].push(curr);

      return acc;
    }, {});
  }, [attendances]);

  // ============================================================
  // CADASTRAR FREQUÊNCIA
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createAttendance({
        variables: {
          studentId,
          ...form,
        },
      });

      await Swal.fire({
        title: "Registrado!",
        text: "Frequência salva com sucesso.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      setForm({
        date: new Date().toISOString().split("T")[0],
        skills: "",
        meth: "",
        perf: "",
      });

      await refetch();
    } catch (err) {
      Swal.fire("Erro", err.message, "error");
    }
  };

  // ============================================================
  // EXCLUIR FREQUÊNCIA
  // ============================================================

  const handleDelete = async (record) => {
    // ----------------------------------------------------------
    // Verificação adicional no FRONTEND
    // ----------------------------------------------------------
    //
    // O BACKEND também faz essa validação.
    // O frontend apenas esconde o botão para quem não é dono.
    //

    if (
      !currentUser?.id ||
      String(record.aeeSpecialist?.id) !== String(currentUser.id)
    ) {
      Swal.fire({
        title: "Acesso negado",
        text: "Você só pode excluir registros que você mesmo criou.",
        icon: "warning",
      });

      return;
    }

    // ----------------------------------------------------------
    // Nome do responsável
    // ----------------------------------------------------------

    const specialistName = record.aeeSpecialist
      ? `${record.aeeSpecialist.firstName || ""} ${
          record.aeeSpecialist.lastName || ""
        }`.trim()
      : "NÃO IDENTIFICADO";

    // ----------------------------------------------------------
    // CONFIRMAÇÃO
    // ----------------------------------------------------------

    const result = await Swal.fire({
      title: "Excluir registro?",

      html: `
        <div style="font-size: 14px; line-height: 1.6;">

          <p>
            Você está prestes a excluir o registro do dia:
          </p>

          <strong style="font-size: 18px;">
            ${new Date(record.date).toLocaleDateString("pt-BR")}
          </strong>

          <br><br>

          <p>
            Registrado por:
            <strong>${specialistName}</strong>
          </p>

          <br>

          <p style="color: #dc2626; font-weight: bold;">
            Esta ação não poderá ser desfeita.
          </p>

        </div>
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      confirmButtonText: "Sim, excluir",

      cancelButtonText: "Cancelar",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    // ----------------------------------------------------------
    // EXCLUIR
    // ----------------------------------------------------------

    try {
      await deleteAttendance({
        variables: {
          attendanceId: record.id,
        },
      });

      await Swal.fire({
        title: "Excluído!",
        text: "O registro foi removido com sucesso.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      // Atualiza a lista
      await refetch();
    } catch (err) {
      Swal.fire({
        title: "Erro",
        text: err.message,
        icon: "error",
      });
    }
  };

  // ============================================================
  // IMPRIMIR PDF
  // ============================================================

  const handlePrintPDF = (monthYear, monthData) => {
    const printWindow = window.open("", "_blank");

    // ----------------------------------------------------------
    // LINHAS DA TABELA
    // ----------------------------------------------------------

    const tableRows = monthData
      .map((record) => {
        const specialistName = record.aeeSpecialist
          ? `${record.aeeSpecialist.firstName || ""} ${
              record.aeeSpecialist.lastName || ""
            }`.trim()
          : "NÃO IDENTIFICADO";

        return `
          <tr>

            <td
              style="
                text-align: center;
                font-weight: bold;
              "
            >
              ${new Date(record.date).toLocaleDateString("pt-BR")}
            </td>


            <td>
              ${record.workedSkills || ""}
            </td>


            <td>
              ${record.methodology || ""}
            </td>


            <td>
              ${record.performance || ""}
            </td>


            <td
              style="
                font-weight: bold;
              "
            >
              ${specialistName.toUpperCase()}
            </td>


            <td>

              <div
                style="
                  border-bottom: 1px solid #ccc;
                  height: 30px;
                  margin-top: 10px;
                "
              >
              </div>

            </td>

          </tr>
        `;
      })
      .join("");

    // ----------------------------------------------------------
    // DOCUMENTO
    // ----------------------------------------------------------

    printWindow.document.write(`

      <html>

        <head>

          <title>
            Frequência AEE -
            ${studentName} -
            ${monthYear}
          </title>


          <style>

            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }


            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
              border-bottom: 2px solid #00913f;
              padding-bottom: 10px;
            }


            .logo {
              height: 60px;
            }


            h2 {
              text-align: center;
              text-transform: uppercase;
              font-size: 16px;
              margin-bottom: 5px;
            }


            h3 {
              text-align: center;
              text-transform: uppercase;
              font-size: 14px;
              margin-top: 0;
              color: #555;
            }


            .info-box {
              border: 1px solid #000;
              padding: 10px;
              margin-bottom: 20px;
              font-size: 12px;
            }


            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }


            th {
              background-color: #f2f2f2;
              font-size: 11px;
              text-transform: uppercase;
              padding: 8px;
              border: 1px solid #000;
            }


            td {
              border: 1px solid #000;
              padding: 8px;
              font-size: 11px;
              vertical-align: top;
            }


            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              text-align: center;
              font-size: 10px;
            }


            .sig-box {
              width: 22%;
              border-top: 1px solid #000;
              padding-top: 5px;
            }


            @media print {

              @page {
                size: landscape;
              }

            }

          </style>

        </head>


        <body>


          <div class="header">

            <img
              src="${IF_LOGO}"
              class="logo"
            >


            <div
              style="
                text-align: right;
                font-size: 10px;
                font-weight: bold;
              "
            >

              INSTITUTO FEDERAL BAIANO

              <br>

              NÚCLEO DE ATENDIMENTO ÀS PESSOAS
              COM NECESSIDADES ESPECÍFICAS
              (NAPNE)

            </div>

          </div>


          <h2>
            REGISTRO DE ATENDIMENTO
            EDUCACIONAL ESPECIALIZADO (AEE)
          </h2>


          <h3>
            Referência: ${monthYear}
          </h3>


          <div class="info-box">

            <strong>
              ESTUDANTE:
            </strong>

            ${studentName.toUpperCase()}

          </div>


          <table>

            <thead>

              <tr>

                <th width="8%">
                  Data
                </th>

                <th width="22%">
                  Habilidades Trabalhadas
                </th>

                <th width="22%">
                  Metodologia
                </th>

                <th width="18%">
                  Desempenho
                </th>

                <th width="15%">
                  Registrado por
                </th>

                <th width="15%">
                  Assinatura do Estudante
                </th>

              </tr>

            </thead>


            <tbody>

              ${tableRows}

            </tbody>

          </table>


          <div class="signatures">

            <div class="sig-box">
              Assinatura do AEE
            </div>


            <div class="sig-box">
              Assinatura do Responsável
            </div>


            <div class="sig-box">
              Assinatura NAPNE
            </div>

          </div>


        </body>

      </html>

    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ============================================================
  // SE MODAL FECHADO
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        fixed
        inset-0
        bg-slate-900/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-[110]
        p-4
      "
    >
      <div
        className="
          bg-white
          w-full
          max-w-5xl
          rounded-[3rem]
          shadow-2xl
          flex
          flex-col
          overflow-hidden
          max-h-[90vh]
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            bg-indigo-600
            p-6
            flex
            justify-between
            items-center
            text-white
          "
        >
          <div>
            <h3 className="text-2xl font-black italic">
              Frequência e Atendimentos AEE
            </h3>

            <p
              className="
                text-[10px]
                font-bold
                tracking-widest
                uppercase
                opacity-80
              "
            >
              Estudante:
              {studentName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10
              h-10
              bg-white/20
              rounded-full
              font-black
              hover:bg-white/40
              transition-colors
            "
          >
            ✕
          </button>
        </div>

        <div
          className="
            flex
            flex-col
            md:flex-row
            flex-1
            overflow-hidden
          "
        >
          {/* ===================================================
              FORMULÁRIO
          ==================================================== */}

          <div
            className="
              w-full
              md:w-1/3
              bg-slate-50
              p-6
              border-r
              border-slate-100
              overflow-y-auto
            "
          >
            <h4
              className="
                text-xs
                font-black
                text-slate-400
                uppercase
                tracking-widest
                mb-4
              "
            >
              Novo Registro
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DATA */}

              <div>
                <label
                  className="
                    text-[10px]
                    font-bold
                    text-slate-500
                    uppercase
                    ml-2
                  "
                >
                  Data do Atendimento
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border-none
                    shadow-inner
                    focus:ring-2
                    focus:ring-indigo-500
                    font-bold
                    text-slate-700
                  "
                  required
                />
              </div>

              {/* HABILIDADES */}

              <div>
                <label
                  className="
                    text-[10px]
                    font-bold
                    text-slate-500
                    uppercase
                    ml-2
                  "
                >
                  Habilidades Trabalhadas
                </label>

                <textarea
                  rows="2"
                  value={form.skills}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      skills: e.target.value,
                    })
                  }
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border-none
                    shadow-inner
                    focus:ring-2
                    focus:ring-indigo-500
                    text-sm
                    resize-none
                  "
                  required
                />
              </div>

              {/* METODOLOGIA */}

              <div>
                <label
                  className="
                    text-[10px]
                    font-bold
                    text-slate-500
                    uppercase
                    ml-2
                  "
                >
                  Metodologia Utilizada
                </label>

                <textarea
                  rows="2"
                  value={form.meth}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meth: e.target.value,
                    })
                  }
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border-none
                    shadow-inner
                    focus:ring-2
                    focus:ring-indigo-500
                    text-sm
                    resize-none
                  "
                  required
                />
              </div>

              {/* DESEMPENHO */}

              <div>
                <label
                  className="
                    text-[10px]
                    font-bold
                    text-slate-500
                    uppercase
                    ml-2
                  "
                >
                  Desempenho Observado
                </label>

                <textarea
                  rows="2"
                  value={form.perf}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      perf: e.target.value,
                    })
                  }
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border-none
                    shadow-inner
                    focus:ring-2
                    focus:ring-indigo-500
                    text-sm
                    resize-none
                  "
                  required
                />
              </div>

              {/* BOTÃO SALVAR */}

              <button
                type="submit"
                disabled={saving}
                className="
                  w-full
                  py-4
                  bg-indigo-600
                  text-white
                  font-black
                  rounded-2xl
                  shadow-lg
                  hover:bg-indigo-700
                  disabled:bg-slate-300
                "
              >
                {saving ? "Salvando..." : "💾 Registrar Presença"}
              </button>
            </form>
          </div>

          {/* ===================================================
              HISTÓRICO
          ==================================================== */}

          <div
            className="
              w-full
              md:w-2/3
              p-6
              overflow-y-auto
              bg-white
            "
          >
            <h4
              className="
                text-xs
                font-black
                text-slate-400
                uppercase
                tracking-widest
                mb-6
              "
            >
              Histórico Mensal
            </h4>

            {/* CARREGANDO */}

            {loading ? (
              <p
                className="
                  text-center
                  text-slate-400
                  font-bold
                  animate-pulse
                "
              >
                Carregando registros...
              </p>
            ) : Object.keys(groupedByMonth).length === 0 ? (
              /* SEM REGISTROS */

              <div
                className="
                  text-center
                  py-20
                  border-2
                  border-dashed
                  border-slate-100
                  rounded-3xl
                "
              >
                <p
                  className="
                    text-slate-400
                    font-bold
                  "
                >
                  Nenhum atendimento registrado.
                </p>
              </div>
            ) : (
              /* REGISTROS */

              <div className="space-y-8">
                {Object.entries(groupedByMonth).map(([monthYear, records]) => (
                  <div
                    key={monthYear}
                    className="
                        bg-slate-50
                        rounded-3xl
                        p-6
                        border
                        border-slate-100
                      "
                  >
                    {/* CABEÇALHO DO MÊS */}

                    <div
                      className="
                          flex
                          justify-between
                          items-center
                          mb-4
                          border-b
                          border-slate-200
                          pb-4
                        "
                    >
                      <h5
                        className="
                            font-black
                            text-slate-700
                            uppercase
                            tracking-widest
                          "
                      >
                        {monthYear}
                      </h5>

                      <button
                        onClick={() => handlePrintPDF(monthYear, records)}
                        className="
                            bg-slate-900
                            text-white
                            px-4
                            py-2
                            rounded-xl
                            text-[10px]
                            font-black
                            uppercase
                            flex
                            items-center
                            gap-2
                            hover:scale-105
                            transition-transform
                          "
                      >
                        🖨️ Imprimir Folha
                      </button>
                    </div>

                    {/* LISTA DE REGISTROS */}

                    <div className="space-y-3">
                      {records.map((record) => {
                        // ------------------------------------------------
                        // Verifica se o registro pertence ao usuário logado
                        // ------------------------------------------------

                        const isOwner =
                          currentUser?.id &&
                          record.aeeSpecialist?.id &&
                          String(record.aeeSpecialist.id) ===
                            String(currentUser.id);

                        // ------------------------------------------------
                        // Nome completo do responsável
                        // ------------------------------------------------

                        const specialistName = record.aeeSpecialist
                          ? `${record.aeeSpecialist.firstName || ""} ${
                              record.aeeSpecialist.lastName || ""
                            }`.trim()
                          : "Não identificado";

                        return (
                          <div
                            key={record.id}
                            className="
                                bg-white
                                p-4
                                rounded-2xl
                                shadow-sm
                                flex
                                items-start
                                gap-4
                              "
                          >
                            {/* DATA */}

                            <div
                              className="
                                  bg-indigo-100
                                  text-indigo-600
                                  font-black
                                  text-xs
                                  px-3
                                  py-2
                                  rounded-xl
                                  text-center
                                  min-w-[70px]
                                "
                            >
                              {new Date(record.date).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                },
                              )}
                            </div>

                            {/* INFORMAÇÕES */}

                            <div className="flex-1 min-w-0">
                              <p
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    line-clamp-1
                                  "
                              >
                                <span
                                  className="
                                      text-slate-400
                                    "
                                >
                                  Hab:
                                </span>{" "}
                                {record.workedSkills}
                              </p>

                              <p
                                className="
                                    text-[10px]
                                    text-slate-500
                                    mt-1
                                  "
                              >
                                Resp:{" "}
                                <span className="font-bold">
                                  {specialistName}
                                </span>
                              </p>
                            </div>

                            {/* =================================================
                                  BOTÃO EXCLUIR
                                  Só aparece para o DONO do registro
                              ================================================== */}

                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleDelete(record)}
                                disabled={deleting}
                                title="Excluir meu registro"
                                className="
                                    w-10
                                    h-10
                                    flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    text-red-600
                                    hover:bg-red-600
                                    hover:text-white
                                    transition-all
                                    duration-200
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    shrink-0
                                  "
                              >
                                {deleting ? "..." : "🗑️"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
