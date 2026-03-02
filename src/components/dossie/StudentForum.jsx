import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import Swal from "sweetalert2";

const GET_OBSERVATIONS = gql`
  query GetObs($studentId: ID!, $subjectId: ID, $teacherId: ID) {
    studentObservations(studentId: $studentId, subjectId: $subjectId, teacherId: $teacherId) {
      id
      content
      createdAt
      fileUrl
      sender {
        id
        firstName
        userType
      }
    }
  }
`;

const POST_OBS = gql`
  mutation PostObs(
    $studentId: ID!
    $subjectId: ID
    $teacherId: ID
    $content: String!
    $file: Upload
  ) {
    postObservation(
      studentId: $studentId
      subjectId: $subjectId
      teacherId: $teacherId
      content: $content
      file: $file
    ) {
      success
    }
  }
`;

export default function StudentForum({ studentId, subjectId, teacherId, userType }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data, loading, refetch } = useQuery(GET_OBSERVATIONS, {
    variables: { studentId, subjectId, teacherId },
    pollInterval: 3000,
    fetchPolicy: "network-only",
  });

  const [postObs] = useMutation(POST_OBS);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.studentObservations]);

  const handleSend = async () => {
    if (!text.trim() && !file) return;

    try {
      await postObs({
        variables: {
          studentId,
          subjectId,
          teacherId,
          content: text || "",
          file,
        },
      });

      setText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      refetch();
    } catch (e) {
      Swal.fire("Erro", e.message, "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        Carregando fórum...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[400px] max-h-[600px] overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-slate-800">💬 Fórum Pedagógico</h3>
        {/* <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">
          Tempo Real
        </span> */}
      </div>

      {/* TIMELINE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
        {data?.studentObservations
          ?.slice()
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((obs) => {
            const isMe = obs.sender.userType === userType;

            return (
              <div
                key={obs.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[75%] ${
                    isMe ? "flex-row-reverse" : ""
                  }`}
                >
                  {!isMe && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 flex-none">
                      {obs.sender.firstName.charAt(0)}
                    </div>
                  )}

                  <div
                    className={`px-5 py-3 rounded-2xl text-sm shadow-sm relative ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    <div
                      className={`text-[9px] font-bold uppercase mb-1 tracking-wide ${
                        isMe ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {isMe
                        ? "Você"
                        : `${obs.sender.firstName} • ${obs.sender.userType}`}
                    </div>

                    {obs.content && (
                      <p className="leading-relaxed">{obs.content}</p>
                    )}

                    {obs.fileUrl && (
                      <a
                        href={obs.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
      mt-3 flex items-center gap-3 p-3 rounded-xl border transition
      ${
        isMe
          ? "bg-indigo-500/20 border-indigo-300 text-white"
          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
      }
    `}
                      >
                        <div
                          className={`
        w-10 h-10 rounded-lg flex items-center justify-center text-lg
        ${isMe ? "bg-indigo-400 text-white" : "bg-white text-indigo-600"}
      `}
                        >
                          📄
                        </div>

                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold truncate max-w-[160px]">
                            {obs.fileUrl.split("/").pop()}
                          </span>
                          <span className="text-[10px] opacity-70">
                            Clique para abrir
                          </span>
                        </div>
                      </a>
                    )}

                    <div
                      className={`text-[8px] mt-2 ${
                        isMe ? "text-indigo-200" : "text-slate-300"
                      }`}
                    >
                      {new Date(obs.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT ESTILO APP */}
      <div className="p-4 bg-white border-t">
        <div className="relative">
          {/* Botão clipe */}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
          >
            📎
          </button>

          <textarea
            className="w-full pl-12 pr-14 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
            placeholder="Escreva uma mensagem..."
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Botão enviar */}
          <button
            onClick={handleSend}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm hover:bg-indigo-700 transition shadow-md"
          >
            ➤
          </button>

          {/* Input file escondido */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="text-xs text-slate-500 mt-2">📎 {file.name}</div>
        )}
      </div>
    </div>
  );
}
