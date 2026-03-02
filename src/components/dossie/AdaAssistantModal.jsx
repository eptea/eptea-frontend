import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import Swal from "sweetalert2";

// --- QUERIES & MUTATIONS ---
const GET_ADA_HISTORY = gql`
  query GetAda($studentId: ID!, $subjectId: ID) {
    adaHistory(studentId: $studentId, subjectId: $subjectId) {
      id question response createdAt
    }
  }
`;

const ASK_ADA = gql`
  mutation AskAda($sid: ID!, $subid: ID, $tid: ID, $q: String!) {
    askAda(studentId: $sid, subjectId: $subid, teacherId: $tid, question: $q) {
      success
      interaction { id response }
    }
  }
`;

export default function AdaAssistantModal({ isOpen, onClose, studentId, subjectId, teacherId }) {
  const [question, setQuestion] = useState("");
  const bottomRef = useRef(null);

  const { data, refetch } = useQuery(GET_ADA_HISTORY, {
    variables: { studentId, subjectId },
    skip: !isOpen,
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
      await askAda({ 
        variables: { 
          sid: studentId, 
          subid: subjectId, 
          tid: teacherId, // Passando o ID do professor para contextar o plano
          q: currentQ 
        } 
      });
      refetch();
    } catch (e) {
      Swal.fire("Erro na Ada", e.message, "error");
    }
  };

  const handlePrint = (content) => {
    // Cria um iframe temporário para imprimir apenas o conteúdo da resposta
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>EPTEA - Relatório Pedagógico</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #334155; }
            h1, h2, h3 { color: #1e293b; }
            p { margin-bottom: 15px; }
            ul, ol { margin-bottom: 15px; padding-left: 20px; }
            .header { border-bottom: 2px solid #6366f1; margin-bottom: 30px; padding-bottom: 10px; }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Adaptação Curricular</h1>
            <p>Gerado pela Assistente Ada - Plataforma EPTEA</p>
          </div>
          ${content}
          <div class="footer">
            Este documento é uma sugestão de adaptação baseada no dossiê do aluno e deve ser validado pelo professor e equipe AEE.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg">
              <span className="animate-pulse text-white">✨</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800">Assistente Ada</h3>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Inclusão Inteligente</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-200 text-slate-400 flex items-center justify-center font-bold">✕</button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
          {data?.adaHistory.map((item) => (
            <div key={item.id} className="space-y-4">
              {/* Pergunta */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-br-md max-w-[85%] text-sm shadow-md">
                  {item.question}
                </div>
              </div>
              
              {/* Resposta da Ada */}
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-700 p-5 rounded-2xl rounded-tl-md shadow-sm w-full max-w-[95%]">
                  <div className="text-[9px] font-bold uppercase mb-2 text-indigo-600">Ada</div>
                  <div id={`ada-response-${item.id}`} className="text-sm prose prose-slate max-w-none">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        // LINKS CLICÁVEIS
                        a: ({node, ...props}) => (
                          <a 
                            className="text-indigo-600 font-black underline hover:text-indigo-800 decoration-2 decoration-indigo-200" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props} 
                          />
                        ),
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3 space-y-1" {...props} />,
                        strong: ({node, ...props}) => <b className="font-black text-slate-900" {...props} />,
                      }}
                    >
                      {item.response}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Botão de Exportar - Aparece em respostas longas */}
                  {(item.response.length > 300 || item.response.toLowerCase().includes('pdi') || item.response.toLowerCase().includes('pei')) && (
                    <button 
                      onClick={() => handlePrint(document.getElementById(`ada-response-${item.id}`).innerHTML)}
                      className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase transition-colors pt-4 border-t border-slate-50 w-full"
                    >
                      <span>🖨️</span> Gerar PDF / Imprimir Plano
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-5 bg-white border-t border-slate-100">
          <div className="relative">
            <textarea
              className="w-full pl-6 pr-12 py-4 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 resize-none shadow-inner"
              placeholder="Ex: Gere um PEI baseado neste plano..."
              rows="1"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleAsk}
              disabled={thinking || !question.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:bg-slate-200"
            >
              {thinking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}