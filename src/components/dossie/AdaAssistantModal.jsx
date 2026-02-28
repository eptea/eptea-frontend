import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import Swal from "sweetalert2";

const GET_ADA_HISTORY = gql`
  query GetAda($studentId: ID!, $subjectId: ID) {
    adaHistory(studentId: $studentId, subjectId: $subjectId) {
      id question response createdAt
    }
  }
`;

const ASK_ADA = gql`
  mutation AskAda($sid: ID!, $subid: ID, $q: String!) {
    askAda(studentId: $sid, subjectId: $subid, question: $q) {
      success
      interaction { id response }
    }
  }
`;

export default function AdaAssistantModal({ isOpen, onClose, studentId, subjectId }) {
  const [question, setQuestion] = useState("");
  const bottomRef = useRef(null);

  const { data, refetch } = useQuery(GET_ADA_HISTORY, {
    variables: { studentId, subjectId },
    skip: !isOpen,
    // pollInterval: 5000,
  });

  const [askAda, { loading: thinking }] = useMutation(ASK_ADA);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, thinking]);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!question.trim() || thinking) return;
    const currentQ = question;
    setQuestion("");
    try {
      await askAda({ variables: { sid: studentId, subid: subjectId, q: currentQ } });
      refetch();
    } catch (e) {
      Swal.fire("Erro na Ada", e.message, "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end p-4 md:p-10 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* HEADER - Estilo Fórum */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
              <span className="animate-pulse">✨</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">Assistente Ada</h3>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">IA Pedagógica Especializada</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full hover:bg-slate-200 text-slate-400 transition-colors flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* CHAT AREA - Estilo Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
          {/* Mensagem de Boas-vindas */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-[11px] text-indigo-700 leading-relaxed italic shadow-sm">
            Olá! Analisei os dados pedagógicos deste aluno. <b>Como posso auxiliar nas adaptações curriculares hoje?</b>
          </div>

          {data?.adaHistory.map((item) => (
            <div key={item.id} className="space-y-4">
              {/* Pergunta do Professor (Estilo "isMe" do Fórum) */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-br-md max-w-[85%] text-sm shadow-md shadow-indigo-100">
                  <div className="text-[9px] font-bold uppercase mb-1 opacity-70 tracking-wide text-right">Você</div>
                  {item.question}
                </div>
              </div>
              
              {/* Resposta da Ada (Estilo "Outros" do Fórum) */}
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[90%]">
                  <div className="bg-white border border-slate-200 text-slate-700 p-5 rounded-2xl rounded-tl-md shadow-sm leading-relaxed">
                    <div className="text-[9px] font-bold uppercase mb-2 tracking-wide text-indigo-600">Ada</div>
                    <div className="text-sm prose prose-slate max-w-none">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 border-l-2 border-indigo-50 pl-3" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 border-l-2 border-indigo-50 pl-3" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1 marker:text-indigo-400" {...props} />,
                          strong: ({node, ...props}) => <b className="font-black text-slate-900" {...props} />,
                        }}
                      >
                        {item.response}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {thinking && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-widest italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                Ada está elaborando sugestões...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT - Estilo App do Fórum */}
        <div className="p-5 bg-white border-t border-slate-100">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <textarea
                className="w-full pl-6 pr-12 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 resize-none placeholder:text-slate-400 transition-all shadow-inner"
                placeholder="Peça uma sugestão de adaptação..."
                rows="1"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleAsk}
                disabled={thinking || !question.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-md shadow-indigo-100"
              >
                {thinking ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "➤"
                )}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-center text-slate-300 mt-3 font-bold uppercase tracking-tighter">
            Ada utiliza inteligência artificial para auxiliar na inclusão escolar
          </p>
        </div>
      </div>
    </div>
  );
}