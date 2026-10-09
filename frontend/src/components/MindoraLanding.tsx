"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type IconName = "shield" | "layers" | "chart" | "key" | "spark" | "store" | "code" | "compass" | "check" | "arrow" | "users" | "search";
type CodeTab = "JavaScript" | "Python" | "cURL";

const iconPaths: Record<IconName, ReactNode> = {
  shield: <><path d="M12 3 20 6v5c0 5-3.5 8.3-8 10-4.5-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
  chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M15 7h4v4"/></>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9"/><path d="M16 7l3 3"/><path d="M13 10l3 3"/></>,
  spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></>,
  store: <><path d="M4 10v10h16V10"/><path d="m3 6 2-3h14l2 3v2a3 3 0 0 1-5 2 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-5-2V6Z"/><path d="M9 20v-5h6v5"/></>,
  code: <><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 5-4 14"/></>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.4 5.1-5.1 2.4 2.4-5.1 5.1-2.4Z"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <path d="M5 12h13m-5-5 5 5-5 5"/>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.5-3.4 2.5-5 6-5s5.5 1.6 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.3.4 3.6 2 4 5"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 5 5"/></>,
};

function Icon({name,className=""}:{name:IconName;className?:string}){return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>}
function Arrow({diagonal=false}:{diagonal?:boolean}){return <svg className="sd-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d={diagonal?"M5 15 15 5M6 5h9v9":"M3 10h13m-5-5 5 5-5 5"}/></svg>}
function Brand(){return <a className="sd-brand" href="#top"><span className="sd-brand-mark"><i/><i/><b/></span><span>mindora<span>.ai</span></span></a>}

type LiveData = {
 health: "checking" | "online" | "offline";
 usage: any | null;
 logs: any[];
 services: any[];
 fraud: any | null;
 lastUpdated: number | null;
};

function useMindoraLiveData(){
 const { token } = useAuth();
 const [data,setData]=useState<LiveData>({health:"checking",usage:null,logs:[],services:[],fraud:null,lastUpdated:null});
 useEffect(()=>{
   let alive=true;
   const base=process.env.NEXT_PUBLIC_API_URL;
   const load=async()=>{
     if(!base)return;
     try{const r=await fetch(`${base}/health`,{cache:"no-store"});if(!r.ok)throw new Error();if(alive)setData(v=>({...v,health:"online",lastUpdated:Date.now()}));}
     catch{if(alive)setData(v=>({...v,health:"offline"}));}
     try{const r=await fetch(`${base}/services`,{cache:"no-store"});if(r.ok){const services=await r.json();if(alive)setData(v=>({...v,services:Array.isArray(services)?services:(services?.items||[])}));}}catch{}
     if(token){
       try{const usage=await api.get<any>("/usage",token);if(alive)setData(v=>({...v,usage,lastUpdated:Date.now()}));}catch{}
       try{const logs=await api.get<any>("/logs?page=1&page_size=8",token);if(alive)setData(v=>({...v,logs:logs?.items||[]}));}catch{}
       try{const fraud=await api.post<any>("/fraud/test",{amount:842.5,transaction_hour:new Date().getHours(),merchant_category:"electronics",customer_age:29,previous_transactions:47},token);if(alive)setData(v=>({...v,fraud,lastUpdated:Date.now()}));}catch{}
     }
   };
   load();
   const id=window.setInterval(load, token?12000:30000);
   return()=>{alive=false;window.clearInterval(id)};
 },[token]);
 return data;
}

function Status({health}:{health?:LiveData["health"]}){const [s,setS]=useState<LiveData["health"]>(health||"checking");useEffect(()=>{setS(health||"checking")},[health]);return <span className="sd-status"><i className={s}/>{s==="online"?"All systems operational":s==="offline"?"API unavailable":"Checking API"}</span>}

function AnimatedGraph({variant=0}:{variant?:number}){return <div className={`sd-graph graph-${variant}`}><div className="sd-graph-grid"><i/><i/><i/><i/></div><svg viewBox="0 0 600 170" preserveAspectRatio="none"><path className="graph-shadow" d="M0 145 C40 135 55 110 88 125 S140 150 170 105 S215 72 245 103 S285 130 320 70 S370 42 402 86 S445 112 478 58 S535 82 600 20"/><path className="graph-path" d="M0 145 C40 135 55 110 88 125 S140 150 170 105 S215 72 245 103 S285 130 320 70 S370 42 402 86 S445 112 478 58 S535 82 600 20"/></svg><span className="graph-dot"/></div>}

function HeroProduct({live}:{live:LiveData}){
 const [scene,setScene]=useState(0);
 const scenes=[
  {name:"Risk Monitor",title:"Real-time transaction risk",metric:"98.4%",label:"approved",accent:"lime"},
  {name:"Decision Engine",title:"AI decisions at machine speed",metric:"84ms",label:"avg latency",accent:"purple"},
  {name:"Agent Analyst",title:"Signals turned into action",metric:"7,431",label:"decisions today",accent:"blue"},
 ];
 useEffect(()=>{const id=setInterval(()=>setScene(v=>(v+1)%3),3600);return()=>clearInterval(id)},[]);
 const c=scenes[scene];
 const requests=live.usage?.total_requests ?? live.usage?.requests ?? null;
 const latency=live.usage?.avg_latency_ms ?? live.usage?.average_latency_ms ?? live.fraud?.latency_ms ?? null;
 const probability=live.fraud?.fraud_probability;
 const decision=live.fraud?.prediction;
 return <div className="sd-hero-product">
   <div className="sd-product-browser"><div className="sd-browser-top"><span><i/><i/><i/></span><small>app.mindora.ai / risk</small><b><i/> LIVE</b></div>
   <div className="sd-browser-body"><aside><strong>mindora</strong><span className="on">Overview</span><span>Risk</span><span>Agents</span><span>Services</span><span>Logs</span><span>Usage</span><small>WORKSPACE</small><span>Acme Labs</span></aside>
   <main><div className="sd-product-title"><div><small>{c.name.toUpperCase()}</small><h3>{c.title}</h3></div><button>Live view⌄</button></div>
   <div className="sd-kpi-row"><div><small>REQUESTS</small><strong>{requests==null?"—":Number(requests).toLocaleString()}</strong><em>{live.usage?"LIVE":"SIGN IN"}</em></div><div><small>RISK SCORE</small><strong>{probability==null?"—":`${(Number(probability)*100).toFixed(1)}%`}</strong><em>{probability==null?"WAITING":"LIVE"}</em></div><div><small>LATENCY</small><strong>{latency==null?"—":`${Number(latency).toFixed(0)}ms`}</strong><em>{live.health==="online"?"ONLINE":"OFFLINE"}</em></div></div>
   <AnimatedGraph variant={scene}/>
   <div className="sd-product-bottom"><div className="sd-mini-list"><small>LIVE TRANSACTIONS</small>{["txn_92814","txn_92815","txn_92816","txn_92817"].map((x,i)=><div key={x}><i className={i===scene?"risk":"ok"}/><span>{x}</span><b>{["LOW","LOW","REVIEW","LOW"][i]}</b><em>{72+i*7}ms</em></div>)}</div><div className="sd-decision-card"><small>AI DECISION</small><strong>{decision ? String(decision).toUpperCase() : "WAITING"}</strong><span>Risk score <b>{probability==null?"—":Number(probability).toFixed(3)}</b></span><div><i/><i/><i/><i/><i/></div></div></div>
   </main></div></div>
   <div className="sd-float-card float-a"><span className="float-icon"><Icon name="spark"/></span><div><b>{c.name}</b><small>Analyzing live signals</small></div><i/></div>
   <div className="sd-float-card float-b"><span className="float-check">✓</span><div><b>Decision ready</b><small>Risk score updated</small></div></div>
   <div className="sd-orbit orbit-1"/><div className="sd-orbit orbit-2"/>
 </div>
}

function FraudScene({live}:{live:LiveData}){
 const probability=typeof live.fraud?.fraud_probability==="number"?live.fraud.fraud_probability:null;
 const score=probability==null?null:probability*100;
 const prediction=live.fraud?.prediction;
 return <div className="sd-scene-card fraud-scene"><div className="scene-header"><span>fraud / transaction</span><b><i/>LIVE BACKEND</b></div><div className="fraud-scene-grid"><div className="fraud-big"><small>FRAUD PROBABILITY</small><strong>{score==null?"—":`${score.toFixed(1)}%`}</strong><div className="risk-meter"><i style={{width:`${score==null?4:Math.min(score,100)}%`}}/></div><span>{prediction?String(prediction):live.health==="online"?"Waiting for authenticated demo":"API unavailable"}</span></div><div className="signal-list"><small>LIVE TRANSACTION</small>{[["Amount","$842.50"],["Merchant","Electronics"],["Customer age","29"],["Previous txns","47"],["Transaction hour",new Date().getHours().toString().padStart(2,"0")]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div><div className="scene-footer"><span><i/>{live.fraud?"Authenticated test":"Sign in for live scoring"}</span><span>POST /fraud/test</span><span>{live.fraud?.latency_ms?`${Number(live.fraud.latency_ms).toFixed(0)}ms`:"—"}</span></div></div>}

function AgentScene(){const [active,setActive]=useState(0);const items=["Data Analyst","Rule Assistant","Transaction Monitor","Graph Analyst"];useEffect(()=>{const id=setInterval(()=>setActive(v=>(v+1)%items.length),1800);return()=>clearInterval(id)},[]);return <div className="sd-scene-card agent-scene"><div className="scene-header"><span>mindora / agent center</span><b>RUNNING</b></div><div className="agent-scene-body"><div className="agent-orb"><span>✦</span><i/><i/><i/></div><div className="agent-chat"><small>ACTIVE AGENT</small><h4>{items[active]}</h4><p>{["Analyzing transaction behavior and linked signals…","Optimizing decision rules from recent patterns…","Reviewing incoming transaction queue…","Mapping connected users, devices and events…"][active]}</p><div className="agent-progress"><i style={{width:`${38+active*17}%`}}/></div><span>Processing <b>{284+active*41}</b> events</span></div></div><div className="agent-nodes"><span>INPUT</span><i/><span>AGENT</span><i/><span>ACTION</span></div></div>}

function PlatformScene({live}:{live:LiveData}){return <div className="sd-scene-card platform-scene"><div className="scene-header"><span>platform / orchestration</span><b>{live.health==="online"?"CONNECTED":"WAITING"}</b></div><div className="platform-flow"><div className="pf-node"><Icon name="code"/><b>Your app</b><small>API request</small></div><div className="pf-line"><i/><i/><i/></div><div className="pf-node main"><Icon name="key"/><b>Mindora</b><small>Auth + route</small></div><div className="pf-line"><i/><i/><i/></div><div className="pf-node"><Icon name="spark"/><b>AI service</b><small>Infer + score</small></div><div className="pf-line"><i/><i/><i/></div><div className="pf-node"><Icon name="chart"/><b>Decision</b><small>Log + response</small></div></div><div className="platform-pills"><span>API keys</span><span>{live.services.length||"—"} services</span><span>{live.logs.length||"—"} recent logs</span><span>{live.usage?"LIVE USAGE":"SIGN IN FOR USAGE"}</span></div></div>}

const codeSamples:Record<CodeTab,string>={JavaScript:`const result = await fetch("https://aiaas-backend.onrender.com/fraud/predict", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer YOUR_TOKEN",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    amount: 842.50,\n    transaction_hour: 14,\n    merchant_category: "electronics",\n    customer_age: 29,\n    previous_transactions: 47\n  })\n});`,Python:`import requests\n\nresponse = requests.post(\n    "https://aiaas-backend.onrender.com/fraud/predict",\n    headers={"Authorization": "Bearer YOUR_TOKEN"},\n    json={"amount": 842.50, "transaction_hour": 14,\n          "merchant_category": "electronics",\n          "customer_age": 29, "previous_transactions": 47}\n)\n\nresult = response.json()`,"cURL":`curl -X POST \\\n  https://aiaas-backend.onrender.com/fraud/predict \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount":842.50,"transaction_hour":14,"merchant_category":"electronics","customer_age":29,"previous_transactions":47}'`};

const productCopy=[
 {eyebrow:"AGENTIC FRAUD OPS",title:"Risk operations at machine speed",text:"Turn fraud detection, data analysis and investigation into a continuous product workflow."},
 {eyebrow:"FRAUD DETECTION",title:"Protect every transaction from fraud",text:"Score transactions in real time and turn model output into a clear, explainable decision."},
 {eyebrow:"PLATFORM",title:"Connect data, services and decisions",text:"One operational layer for API keys, organizations, independent inference services, logs and usage."},
];
function ProductScene({index,live}:{index:number;live:LiveData}){if(index===0)return <AgentScene/>;if(index===1)return <FraudScene live={live}/>;return <PlatformScene live={live}/>;}

function ScrollStory({live}:{live:LiveData}){
 const [active,setActive]=useState(0);
 useEffect(()=>{
   const cards=Array.from(document.querySelectorAll<HTMLElement>("[data-mindora-story]"));
   if(!cards.length)return;
   const observer=new IntersectionObserver((entries)=>{
     const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
     if(visible){setActive(Number((visible.target as HTMLElement).dataset.mindoraStory||0));}
   },{rootMargin:"-35% 0px -45% 0px",threshold:[0,.2,.5,.8,1]});
   cards.forEach(card=>observer.observe(card));
   return()=>observer.disconnect();
 },[]);
 const current=productCopy[active];
 return <section className="sd-scroll-story" id="products">
   <div className="sd-container sd-scroll-grid">
     <div className="sd-scroll-visual-wrap">
       <div className="sd-scroll-visual-sticky">
         <div className="sd-scroll-counter"><span>0{active+1}</span><i/> <small>03</small></div>
         <div key={current.title} className="sd-scroll-scene sd-scene-enter"><ProductScene index={active} live={live}/></div>
       </div>
     </div>
     <div className="sd-scroll-copy">
       <div className="sd-scroll-intro sd-reveal">
         <p className="sd-eyebrow">MINDORA PRODUCTS</p>
         <h2>Risk operations at <span>machine speed.</span></h2>
         <p>Scroll through the platform. The product experience stays in motion while each capability takes over the screen.</p>
       </div>
       {productCopy.map((p,i)=><article key={p.title} data-mindora-story={i} className={`sd-scroll-card ${active===i?"is-active":""}`}>
         <div className="sd-scroll-card-top"><span>0{i+1}</span><small>{p.eyebrow}</small></div>
         <h3>{p.title}</h3>
         <p>{p.text}</p>
         <a className="sd-link" href={i===1?"/services/fraud":"#developers"}>Learn more <Arrow diagonal/></a>
       </article>)}
     </div>
   </div>
 </section>
}

export default function MindoraLanding(){
 const live=useMindoraLiveData();
 const [menu,setMenu]=useState(false);const [scrolled,setScrolled]=useState(false);const [tab,setTab]=useState<CodeTab>("JavaScript");const [copied,setCopied]=useState(false);
 useEffect(()=>{const f=()=>setScrolled(window.scrollY>12);f();window.addEventListener("scroll",f,{passive:true});const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.08});document.querySelectorAll(".sd-reveal").forEach(x=>obs.observe(x));return()=>{window.removeEventListener("scroll",f);obs.disconnect()}},[]);
 const copy=async()=>{try{await navigator.clipboard.writeText(codeSamples[tab]);setCopied(true);setTimeout(()=>setCopied(false),1400)}catch{}};
 return <div className="mindora-sardine" id="top">
  <div className="sd-announcement"><span>NEW</span> Mindora is now connected to production inference <a href="#platform">Explore platform <Arrow/></a></div>
  <header className={`sd-header ${scrolled?"scrolled":""}`}><div className="sd-container sd-nav"><Brand/><button className="sd-menu" onClick={()=>setMenu(v=>!v)} aria-label="Menu"><i/><i/></button><nav className={menu?"open":""}><a href="#products">Products</a><a href="#platform">Platform</a><a href="#developers">Developers</a><a href="#solutions">Use cases</a><a className="sd-nav-button" href="/register">Get started <Arrow diagonal/></a></nav></div></header>
  <main>
   <section className="sd-hero"><div className="sd-container sd-hero-grid"><div className="sd-hero-copy sd-reveal"><p className="sd-eyebrow"><i/>THE AI DECISION PLATFORM</p><h1>The AI platform for <span>decisions that matter.</span></h1><p>Mindora gives product teams one intelligent layer for fraud detection, prediction, classification and real-time decisioning.</p><div className="sd-hero-actions"><a className="sd-primary" href="/register">Start building <Arrow diagonal/></a><a className="sd-link" href="#products">Explore Mindora <Arrow/></a></div><div className="sd-hero-meta"><Status health={live.health}/><span>API-first</span><span>Production ready</span></div></div><div className="sd-hero-art sd-reveal"><HeroProduct live={live}/></div></div><div className="sd-container sd-logo-row"><span>BUILT FOR TEAMS SHIPPING INTELLIGENCE</span><b>FINTECH</b><b>PAYMENTS</b><b>E-COMMERCE</b><b>SAAS</b><b>AI TEAMS</b></div></section>
   <ScrollStory live={live}/>
   <section className="sd-solutions" id="solutions"><div className="sd-container"><div className="sd-centered sd-reveal"><p className="sd-eyebrow">USE CASES</p><h2>One intelligence layer.<br/><span>Every workflow.</span></h2></div><div className="sd-solution-grid"><div className="sd-solution-list"><a className="active"><Icon name="shield"/><span><b>FinTech & payments</b><small>Real-time fraud scoring and transaction decisions.</small></span><Arrow diagonal/></a><a><Icon name="store"/><span><b>E-commerce</b><small>Checkout risk, classification and prediction.</small></span><Arrow diagonal/></a><a><Icon name="layers"/><span><b>SaaS & startups</b><small>Ship intelligent product features faster.</small></span><Arrow diagonal/></a><a><Icon name="code"/><span><b>AI teams</b><small>One API layer across independent services.</small></span><Arrow diagonal/></a></div><div className="sd-network"><div className="network-center"><Icon name="shield"/><b>Mindora</b><small>Decision layer</small></div>{["TXN","DEVICE","USER","MODEL","API","LOG","RISK","ACTION"].map((x,i)=><span key={x} className={`net-node nn${i+1}`}>{x}</span>)}<svg viewBox="0 0 600 500" preserveAspectRatio="none"><path d="M300 250 92 86M300 250 300 65M300 250 510 90M300 250 70 330M300 250 520 330M300 250 165 450M300 250 430 450"/></svg></div></div></div></section>
   <section className="sd-developer" id="developers"><div className="sd-container sd-dev-grid"><div className="sd-dev-copy sd-reveal"><p className="sd-eyebrow">DEVELOPERS</p><h2>One API call.<br/><span>One clear decision.</span></h2><p>Authenticate, send transaction data and receive a production-ready prediction from the same API flow.</p><div className="sd-checks"><span><Icon name="check"/>REST API</span><span><Icon name="check"/>API-key authentication</span><span><Icon name="check"/>Request logs</span></div><a className="sd-primary" href="/api-keys">Create an API key <Arrow diagonal/></a></div><div className="sd-code sd-reveal"><div className="code-head"><span><i/><i/><i/></span><small>fraud-check</small><button onClick={copy}>{copied?"Copied":"Copy"}</button></div><div className="code-tabs">{(Object.keys(codeSamples) as CodeTab[]).map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div><pre>{codeSamples[tab]}</pre><div className="code-result"><span><i/>200 OK</span><b>fraud_probability: 0.084</b><span>84ms</span></div></div></div></section>
   <section className="sd-platform" id="platform"><div className="sd-container"><div className="sd-platform-head sd-reveal"><p className="sd-eyebrow">PLATFORM</p><h2>Built to orchestrate the<br/><span>decisions your product needs.</span></h2><p>Authentication, organizations, inference services, logs and usage are connected around the same API layer.</p></div><div className="sd-platform-grid"><div className="sd-platform-copy sd-reveal"><div><Icon name="key"/><h3>API keys</h3><p>Secure access for applications and services.</p></div><div><Icon name="users"/><h3>Organizations</h3><p>Separate teams, workloads and environments.</p></div><div><Icon name="chart"/><h3>Logs & usage</h3><p>Understand requests, responses and operational activity.</p></div><a className="sd-link" href="/dashboard">Open dashboard <Arrow/></a></div><PlatformScene live={live}/></div></div></section>
   <section className="sd-metrics"><div className="sd-container"><div className="sd-metrics-head"><p className="sd-eyebrow">THE MINDORA FOUNDATION</p><h2>Less infrastructure.<br/><span>More intelligence.</span></h2></div><div className="sd-metric-grid"><div><strong>01</strong><span>AI decision layer</span></div><div><strong>{live.services.length?String(live.services.length).padStart(2,"0"):"—"}</strong><span>services available from backend</span></div><div><strong>{live.usage?.avg_latency_ms!=null?`${Number(live.usage.avg_latency_ms).toFixed(0)}ms`:"—"}</strong><span>average backend latency</span></div><div><strong>{live.logs.length?String(live.logs.length).padStart(2,"0"):"—"}</strong><span>recent backend logs loaded</span></div></div><div className="sd-large-analytics"><div className="analytics-top"><b>Mindora analytics</b><span><i/>LIVE</span></div><div className="analytics-numbers"><div><small>REQUESTS</small><strong>{live.usage?.total_requests==null?"—":Number(live.usage.total_requests).toLocaleString()}</strong></div><div><small>SUCCESS RATE</small><strong>{live.usage?.error_rate==null?"—":`${((1-Number(live.usage.error_rate))*100).toFixed(1)}%`}</strong></div><div><small>AVG LATENCY</small><strong>{live.usage?.avg_latency_ms==null?"—":`${Number(live.usage.avg_latency_ms).toFixed(0)}ms`}</strong></div><div><small>RISK SCORES</small><strong>{live.fraud?.fraud_probability==null?"—":`${(Number(live.fraud.fraud_probability)*100).toFixed(1)}%`}</strong></div></div><AnimatedGraph variant={2}/></div></div></section>
   <section className="sd-resources"><div className="sd-container"><div className="sd-resources-head"><div><p className="sd-eyebrow">EXPLORE MINDORA</p><h2>Everything you need to <span>start building.</span></h2></div><a className="sd-link" href="/dashboard">Open dashboard <Arrow/></a></div><div className="sd-resource-grid"><a href="/services/fraud"><small>01 / PRODUCT</small><h3>Fraud detection</h3><p>Real-time transaction scoring connected to your API.</p><b>Explore service <Arrow/></b></a><a href="/api-keys"><small>02 / DEVELOPER</small><h3>API keys</h3><p>Create authenticated access for your applications.</p><b>Manage keys <Arrow/></b></a><a href="/logs"><small>03 / OPERATIONS</small><h3>Request logs</h3><p>See exactly what your applications send and receive.</p><b>View logs <Arrow/></b></a></div></div></section>
   <section className="sd-final"><div className="sd-container"><div className="final-orbit"><i/><i/><i/></div><p className="sd-eyebrow">READY TO BUILD?</p><h2>Give your product<br/><span>an intelligence layer.</span></h2><p>Start with fraud detection. Add prediction, classification and decision intelligence when you need them.</p><div><a className="sd-primary" href="/register">Start building with Mindora <Arrow diagonal/></a><a className="sd-link" href="/login">Already have an account <Arrow/></a></div></div></section>
  </main>
  <footer className="sd-footer"><div className="sd-container"><div className="footer-top"><div><Brand/><p>AI infrastructure for products that need to make better decisions.</p></div><div><b>PLATFORM</b><a href="#products">Products</a><a href="#platform">Platform</a><a href="#developers">Developers</a></div><div><b>PRODUCT</b><a href="/dashboard">Dashboard</a><a href="/services/fraud">Fraud detection</a><a href="/api-keys">API keys</a></div><div><b>COMPANY</b><a href="#solutions">Use cases</a><a href="/login">Sign in</a><a href="mailto:hello@mindora.ai">Contact</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} MINDORA AI</span><span>FastAPI · PostgreSQL · API-first infrastructure</span><a href="#top">Back to top ↑</a></div></div></footer>
 </div>
}
