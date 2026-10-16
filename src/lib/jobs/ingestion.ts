import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getJobProviders } from "./providers/config";
import { jobSearchQuerySchema, normalizedJobSchema } from "./schema";
import type { JobProvider } from "./provider";

type Counts={received:number;inserted:number;updated:number;skipped:number};
export type ProviderIngestionResult=Counts&{providerKey:string;status:"succeeded"|"partial"|"failed";error?:string};
export type JobIngestionResult={providers:ProviderIngestionResult[];totals:Counts&{errors:number}};
type RpcClient={rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:{message:string}|null}>};

function createIngestionClient():RpcClient {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SECRET_KEY;
 if(!url||!key) throw new Error("Supabase ingestion configuration is missing.");
 return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}}) as unknown as RpcClient;
}
function errorMessage(error:unknown){return error instanceof Error?error.message.slice(0,2000):"Unknown provider error";}
function emptyCounts():Counts{return {received:0,inserted:0,updated:0,skipped:0};}
function parseCounts(value:unknown):Counts {
 if(typeof value!=="object"||value===null) throw new Error("Database returned invalid ingestion counts.");
 const r=value as Record<string,unknown>;
 for(const k of ["received","inserted","updated","skipped"] as const) if(typeof r[k]!=="number"||!Number.isInteger(r[k])||r[k]<0) throw new Error("Database returned invalid ingestion counts.");
 return {received:r.received as number,inserted:r.inserted as number,updated:r.updated as number,skipped:r.skipped as number};
}
async function rpc(client:RpcClient,name:string,args:Record<string,unknown>){
 const result=await client.rpc(name,args); if(result.error) throw new Error(result.error.message); return result.data;
}
async function ingestProvider(client:RpcClient,provider:JobProvider):Promise<ProviderIngestionResult>{
 let runId:string|null=null; const counts=emptyCounts();
 try {
  const started=await rpc(client,"start_job_ingestion_run",{p_provider_key:provider.key,p_provider_kind:provider.kind});
  if(typeof started!=="string"||!started) throw new Error("Database did not return an ingestion run ID.");
  runId=started;
  const received=await provider.searchJobs(jobSearchQuerySchema.parse({page:1,pageSize:100}));
  counts.received=received.length; const valid=[]; let invalid=0;
  for(const item of received){const parsed=normalizedJobSchema.safeParse(item);
   if(!parsed.success||parsed.data.providerKey!==provider.key||parsed.data.providerKind!==provider.kind) invalid++;
   else valid.push(parsed.data);
  }
  if(valid.length){
   const saved=parseCounts(await rpc(client,"persist_job_ingestion_batch",{p_run_id:runId,p_jobs:valid}));
   counts.inserted=saved.inserted;counts.updated=saved.updated;counts.skipped=saved.skipped+invalid;
  }else counts.skipped=invalid;
  const status=invalid||counts.skipped?"partial":"succeeded";
  await rpc(client,"finish_job_ingestion_run",{p_run_id:runId,p_status:status,p_error_count:invalid,p_error_message:invalid?String(invalid)+" provider records failed schema validation.":null});
  return {providerKey:provider.key,status,...counts};
 }catch(error){
  const message=errorMessage(error);
  if(runId) try{await rpc(client,"finish_job_ingestion_run",{p_run_id:runId,p_status:"failed",p_error_count:1,p_error_message:message});}catch{/* Preserve original failure and never overwrite a terminal run. */}
  return {providerKey:provider.key,status:"failed",...counts,error:message};
 }
}
/** Ingest one bounded page per provider. Outages never mark stored listings unavailable. */
export async function ingestJobs():Promise<JobIngestionResult>{
 const providers=getJobProviders();if(!providers.length)throw new Error("No job providers are configured.");
 const client=createIngestionClient();
 const results=await Promise.all(providers.map(p=>ingestProvider(client,p)));
 const totals=results.reduce((s,r)=>({received:s.received+r.received,inserted:s.inserted+r.inserted,updated:s.updated+r.updated,skipped:s.skipped+r.skipped,errors:s.errors+(r.status==="succeeded"?0:1)}),{...emptyCounts(),errors:0});
 return {providers:results,totals};
}
