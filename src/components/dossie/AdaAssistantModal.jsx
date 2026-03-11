import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Swal from "sweetalert2";

import IF_LOGO from "../../assets/if.png"


// --- QUERIES & MUTATIONS ---
const GET_ADA_DATA = gql`
  query GetAda($sid: ID!, $subid: ID, $tid: ID) {
    adaHistory(studentId: $sid, subjectId: $subid, teacherId: $tid) {
      id question response createdAt
    }
    userById(id: $sid) {
      firstName lastName username
      classGroup { name course { name } }
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
  const activeTeacherId = (teacherId === "null" || !teacherId) ? null : teacherId;

  const { data, refetch } = useQuery(GET_ADA_DATA, {
    variables: { sid: studentId, subid: subjectId, tid: activeTeacherId },
    skip: !isOpen,
  });

  const [askAda, { loading: thinking }] = useMutation(ASK_ADA);

  const handlePrint = (contentHTML) => {
    const student = data?.userById;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            .pei-header { background: #92d050; color: #000; padding: 15px; text-align: center; font-weight: 900; border: 2px solid #000; margin-bottom: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            td, th { border: 1px solid #000; padding: 10px; font-size: 12px; }
            .section-title { background: #e2e8f0; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 8px; margin-top: 15px; }
            .logo-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #00913f; margin-bottom: 20px; padding-bottom: 10px; }
            a { color: #00913f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="logo-header">
            <img src="${IF_LOGO}" style="width: 140px;">
            <div style="text-align: right; font-size: 9px;">INSTITUTO FEDERAL BAIANO<br>PLANO DE ENSINO INDIVIDUALIZADO (PEI) </div>
          </div>
          <div class="pei-header">IDENTIFICAÇÃO DO (A) DISCENTE </div>
          <table>
            <tr><td colspan="2"><b>Nome:</b> ${student?.firstName} ${student?.lastName} [cite: 3]</td></tr>
            <tr><td><b>Matrícula:</b> ${student?.username} [cite: 5]</td><td><b>Curso:</b> ${student?.classGroup?.course?.name} [cite: 7]</td></tr>
          </table>
          <div class="content">${contentHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end p-4 md:p-10 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        <div className="p-6 flex justify-between items-center bg-[#00913f] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">✨</div>
            <h3 className="font-black text-sm uppercase tracking-tighter">Ada Assistente</h3>
          </div>
          <button onClick={onClose} className="font-bold text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {data?.adaHistory.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-[#00913f] text-white p-4 rounded-2xl rounded-br-none text-xs shadow-md">{item.question}</div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-sm w-full">
                  <div id={`res-${item.id}`} className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      components={{
                        h3: ({node, ...props}) => <div className="section-title" {...props} />,
                        a: ({node, ...props}) => <a className="text-[#00913f] underline font-black" target="_blank" {...props} />,
                        table: ({node, ...props}) => <table className="w-full border-collapse" {...props} />,
                      }}
                    >
                      {item.response}
                    </ReactMarkdown>
                  </div>
                  <button onClick={() => handlePrint(document.getElementById(`res-${item.id}`).innerHTML)} className="mt-4 text-[10px] font-black text-[#00913f] uppercase border-t pt-3 w-full text-left">🖨️ Exportar PDF Formal [cite: 95]</button>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-5 bg-white border-t">
          <div className="relative">
            <textarea
              className="w-full pl-6 pr-14 py-4 bg-slate-100 rounded-3xl border-none outline-none text-sm resize-none"
              placeholder="Ex: Gere o PEI ou sugira adaptações..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            />
            <button onClick={handleAsk} disabled={thinking || !question.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00913f] text-white w-10 h-10 rounded-2xl flex items-center justify-center">➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}