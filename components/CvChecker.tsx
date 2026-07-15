"use client";
import { useMemo, useRef, useState } from "react";

const STOP = new Set("a an and are as at be been by for from has have in into is it its of on or that the this to was were will with you your our we they their job role candidate required preferred looking work working using including strong excellent ability skills experience years".split(" "));
const words=(v:string)=>v.toLowerCase().replace(/[^a-z0-9+#.\- ]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w));
function keywords(v:string){const counts=new Map<string,number>();words(v).forEach(w=>counts.set(w,(counts.get(w)||0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,24).map(([w])=>w)}

async function extractFile(file:File){
 if(file.name.toLowerCase().endsWith(".pdf")){
  const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc="/pdf.worker.min.mjs";
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
  const pages:string[]=[];
  for(let n=1;n<=pdf.numPages;n++){const content=await(await pdf.getPage(n)).getTextContent();pages.push(content.items.map(item=>"str" in item?item.str:"").join(" "))}
  return pages.join("\n");
 }
 if(file.name.toLowerCase().endsWith(".docx")){const mammoth=await import("mammoth/mammoth.browser");return(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value}
 return file.text();
}

export default function CvChecker(){
 const[cv,setCv]=useState(""),[job,setJob]=useState(""),[fileName,setFileName]=useState(""),[status,setStatus]=useState("");
 const inputRef=useRef<HTMLInputElement>(null);
 const analysis=useMemo(()=>{const lower=cv.toLowerCase(),jobKeys=keywords(job),matched=jobKeys.filter(w=>lower.includes(w)),missing=jobKeys.filter(w=>!lower.includes(w)),sections=["experience","education","skills","summary","projects"].filter(s=>lower.includes(s)),contact=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(cv)&&/(?:\+?\d[\d ()-]{7,}\d)/.test(cv),lengthScore=Math.min(25,Math.round(words(cv).length/12)),ats=cv?Math.min(100,lengthScore+sections.length*10+(contact?20:0)+(/linkedin|github|portfolio/i.test(cv)?5:0)):0,match=jobKeys.length?Math.round(matched.length/jobKeys.length*100):0;return{ats,match,matched,missing,sections,contact}},[cv,job]);
 async function upload(file?:File){if(!file)return;setFileName(file.name);setStatus("Reading your CV locally…");try{const text=await extractFile(file);setCv(text);setStatus(text.trim()?"CV ready to check":"No readable text found. Try pasting the CV text.")}catch{setStatus("This file could not be read. Try another file or paste the CV text.")}}
 return <section className="checker-section" id="cv-checker"><div className="wrap">
  <div className="checker-heading"><div><p className="section-kicker">FREE CV CHECK</p><h2>See how your CV measures up.</h2><p>Upload your CV, then paste the job description to estimate ATS readiness and keyword alignment.</p></div><span>PRIVATE - Files stay in your browser</span></div>
  <div className="checker-shell"><div className="checker-inputs">
   <div className="upload-box" onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files[0])}}><input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={e=>upload(e.target.files?.[0])}/><b>{fileName||"Upload your CV"}</b><p>Drop a PDF, DOCX, or TXT file here, or click to browse.</p><button type="button">Browse files</button>{status&&<small>{status}</small>}</div>
   <label><span>Or paste your CV text</span><textarea value={cv} onChange={e=>setCv(e.target.value)} placeholder="Paste your CV text here…"/></label>
   <label><span>Paste the job description</span><textarea value={job} onChange={e=>setJob(e.target.value)} placeholder="Paste the role requirements here to compare important keywords…"/></label>
  </div><div className="checker-results">
   <div className="score-grid"><Score label="ATS readiness" value={analysis.ats}/><Score label="Job match" value={analysis.match}/></div>
   {!cv?<div className="checker-empty"><b>Your report will appear here</b><p>Upload or paste a CV to begin. Add a job description for keyword matching.</p></div>:<>
    <div className="result-card"><b>ATS checklist</b><p className={analysis.contact?"pass":"warn"}>{analysis.contact?"?":"!"} Email and phone number</p><p className={analysis.sections.length>=3?"pass":"warn"}>{analysis.sections.length>=3?"?":"!"} Clear standard section headings</p><p className={words(cv).length>=250?"pass":"warn"}>{words(cv).length>=250?"?":"!"} Enough detail for recruiters</p></div>
    <KeywordList title="Matched keywords" items={analysis.matched} empty="Paste a job description to see matches."/><KeywordList title="Potentially missing" items={analysis.missing} empty="No missing keywords detected yet." missing/><p className="checker-disclaimer">Estimates only. Add keywords only when they truthfully reflect your experience.</p>
   </>}<a className="btn btn-dark checker-cta" href="/builder">Improve it in the CV builder ?</a>
  </div></div>
 </div></section>
}
function Score({label,value}:{label:string;value:number}){return <div className="big-score"><span>{label}</span><strong>{value}<small>/100</small></strong><i><b style={{width:value+"%"}}/></i></div>}
function KeywordList({title,items,empty,missing=false}:{title:string;items:string[];empty:string;missing?:boolean}){return <div className={"checker-keywords"+(missing?" missing":"")}><b>{title}</b>{items.length?<div>{items.slice(0,12).map(item=><span key={item}>{item}</span>)}</div>:<p>{empty}</p>}</div>}
