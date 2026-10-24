"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
type Props={filename:string;storagePath:string};
type Result={status:"success"|"partial"|"failed";extractedTextLength:number;fields:Record<string,string|string[]|null>;warnings:string[]};
export function ProfileCvExtraction({filename,storagePath}:Props){
 const [result,setResult]=useState<Result|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function extract(){
  setBusy(true);setError("");setResult(null);
  try{
   const response=await fetch("/api/profile/cv-extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename,storagePath})});
   const body=await response.json();if(!response.ok)throw new Error(body.error||"Extraction failed. Please retry.");
   setResult(body.extraction as Result);
  }catch(cause){setError(cause instanceof Error?cause.message:"Extraction failed. Please retry.");}finally{setBusy(false);}
 }
 return <div className="mt-3">
  <Button type="button" disabled={busy} onClick={() => void extract()}>{busy?"Extracting text…":result?"Try extraction again":"Extract profile details"}</Button>
  {error&&<p role="alert" className="mt-3 text-sm text-warn">{error}</p>}
  {result&&<div className="mt-3 rounded-lg border border-line p-3">
   <p role="status" className="text-sm font-medium text-fg">{result.status==="success"?"Text extracted":result.status==="partial"?"Partially extracted":"Extraction failed"}</p>
   <p className="mt-1 text-xs text-fg-muted">{result.extractedTextLength.toLocaleString()} characters read. Extracted values are proposals and have not been saved to your profile.</p>
   {Object.entries(result.fields).filter(([,value])=>Array.isArray(value)?value.length>0:Boolean(value)).map(([key,value])=><p key={key} className="mt-2 break-words text-sm text-fg"><span className="font-medium">{key.replace(/([A-Z])/g," $1")}: </span>{Array.isArray(value)?value.join(", "):value}</p>)}
   {result.warnings.map(warning=><p key={warning} className="mt-2 text-sm text-warn">{warning}</p>)}
  </div>}
 </div>;
}