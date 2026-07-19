/* ===================================================================
   FIRMGROVE — CLIENT PITCH STUDIO
   A block-based, preset-driven B2B SALES deck builder.
   Grounded in Raskin / Dunford / Challenger / StoryBrand / Gong / JOLT.
   Zero dependencies, self-contained. Sibling of the investor deck studio.
=================================================================== */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------------- THEMES (font pairings + palettes) ---------------- */
const F={
  newsreader:"'Newsreader',Georgia,serif", sora:"'Sora',system-ui,sans-serif",
  inter:"'Inter',system-ui,sans-serif", space:"'Space Grotesk',system-ui,sans-serif",
  fraunces:"'Fraunces',Georgia,serif", mono:"'IBM Plex Mono',ui-monospace,monospace",
  manrope:"'Manrope',system-ui,sans-serif"
};
const THEMES={
  editorial:{name:"Editorial Rose",head:F.newsreader,body:F.sora,mode:'light',
    primary:'#b23a5c',accent:'#e58ca6',ink:'#171b25',slate:'#5c6473',faint:'#8b92a0',line:'#e2e5eb',paper:'#f6f4f2',surface:'#ffffff',headw:500,upper:.12},
  mono:{name:"Minimal Mono",head:F.inter,body:F.inter,mode:'light',
    primary:'#171b25',accent:'#b23a5c',ink:'#0f1115',slate:'#565b66',faint:'#9298a3',line:'#e7e8ec',paper:'#ffffff',surface:'#fafafb',headw:700,upper:.14},
  gradient:{name:"Bold Gradient",head:F.space,body:F.space,mode:'light',
    primary:'#7c3aed',accent:'#ec4899',ink:'#1a1035',slate:'#5b5170',faint:'#9890ad',line:'#ece7f6',paper:'#faf8ff',surface:'#ffffff',headw:600,upper:.1,grad:'linear-gradient(120deg,#7c3aed,#ec4899)'},
  analyst:{name:"Analyst Data",head:F.inter,body:F.inter,mono:F.mono,mode:'light',
    primary:'#1d4ed8',accent:'#06b6d4',ink:'#0f172a',slate:'#475569',faint:'#94a3b8',line:'#e2e8f0',paper:'#f8fafc',surface:'#ffffff',headw:700,upper:.1},
  dark:{name:"Dark Neon",head:F.space,body:F.inter,mode:'dark',
    primary:'#34d399',accent:'#22d3ee',ink:'#f1f5f9',slate:'#a7b1c2',faint:'#6b7686',line:'#242b3a',paper:'#0d1017',surface:'#141925',headw:600,upper:.12},
  consumer:{name:"Consumer Warm",head:F.fraunces,body:F.manrope,mode:'light',
    primary:'#ea580c',accent:'#f59e0b',ink:'#1c1512',slate:'#6b5d54',faint:'#a79a8f',line:'#efe7de',paper:'#fdf9f3',surface:'#ffffff',headw:500,upper:.1},
  enterprise:{name:"Enterprise Blue",head:F.inter,body:F.inter,mode:'light',
    primary:'#0e4f8b',accent:'#2563eb',ink:'#101828',slate:'#475467',faint:'#98a2b3',line:'#e4e7ec',paper:'#f7f9fc',surface:'#ffffff',headw:700,upper:.11},
  deeptech:{name:"Deeptech Slate",head:F.space,body:F.inter,mono:F.mono,mode:'dark',
    primary:'#38bdf8',accent:'#818cf8',ink:'#e6edf5',slate:'#9fb0c3',faint:'#61728a',line:'#20293b',paper:'#0b1220',surface:'#111a2b',headw:600,upper:.12},
  fintech:{name:"Fintech Emerald",head:F.manrope,body:F.manrope,mode:'light',
    primary:'#047857',accent:'#10b981',ink:'#0f1e18',slate:'#4b5f56',faint:'#8fa39a',line:'#e0eae5',paper:'#f4faf7',surface:'#ffffff',headw:700,upper:.1},
  biotech:{name:"Biotech Clinical",head:F.newsreader,body:F.inter,mode:'light',
    primary:'#0891b2',accent:'#0d9488',ink:'#0f2027',slate:'#42606a',faint:'#8aa1a8',line:'#dceaed',paper:'#f5fafb',surface:'#ffffff',headw:500,upper:.11},
  climate:{name:"Climate Lime",head:F.manrope,body:F.manrope,mode:'light',
    primary:'#4d7c0f',accent:'#84cc16',ink:'#16210c',slate:'#4e5b3f',faint:'#93a082',line:'#e6ecdb',paper:'#f7faf0',surface:'#ffffff',headw:700,upper:.1},
  crypto:{name:"Crypto Violet",head:F.space,body:F.inter,mode:'dark',
    primary:'#a78bfa',accent:'#f472b6',ink:'#ede9fe',slate:'#b0a7c8',faint:'#6f6690',line:'#221a33',paper:'#0c0916',surface:'#150f22',headw:600,upper:.12},
  ai:{name:"AI Indigo",head:F.space,body:F.inter,mode:'light',
    primary:'#4f46e5',accent:'#8b5cf6',ink:'#14132b',slate:'#4c4a63',faint:'#918ea8',line:'#e7e6f2',paper:'#f8f8fe',surface:'#ffffff',headw:600,upper:.1,grad:'linear-gradient(120deg,#4f46e5,#8b5cf6)'},
  narrative:{name:"Narrative Serif",head:F.fraunces,body:F.inter,mode:'light',
    primary:'#9f1239',accent:'#e11d48',ink:'#1c1417',slate:'#5e5158',faint:'#9c8f95',line:'#ece4e6',paper:'#faf6f5',surface:'#ffffff',headw:500,upper:.1},
  slate:{name:"Neutral Slate",head:F.inter,body:F.inter,mode:'light',
    primary:'#334155',accent:'#0ea5e9',ink:'#0f172a',slate:'#475569',faint:'#94a3b8',line:'#e5e9ef',paper:'#f8fafc',surface:'#ffffff',headw:700,upper:.12}
};

/* ---------------- BLOCK LIBRARY ----------------
   render(d, ed) returns HTML. ed=editable flag.
   `ce(field, val, tag, cls, opts)` emits an editable node.        */
let EDIT=true;
function ceAttr(){return EDIT?' contenteditable="true" spellcheck="false"':'';}
// disp() resolves {{tokens}} at RENDER time against the live brand, so a field
// that still holds a token (never edited) tracks brand changes; once the user
// edits it, harvestField stores literal text and it stops tracking.
function disp(v){return (typeof D!=='undefined'&&D&&D.brand)?fillTokens(v,D.brand):String(v==null?'':v);}
function ce(f,val,tag='div',cls='',ph=''){
  return `<${tag} class="ce ${cls}" data-f="${f}"${ceAttr()}${ph?` data-ph="${esc(ph)}"`:''}>${esc(disp(val))}</${tag}>`;}
function cei(f,i,val,tag='span',cls='',k=''){ // array item
  return `<${tag} class="ce ${cls}" data-f="${f}" data-i="${i}"${k?` data-k="${k}"`:''}${ceAttr()}>${esc(disp(val))}</${tag}>`;}

function chart(points,unit){
  const w=680,h=260,pad=34,n=points.length,max=Math.max(...points.map(p=>+p.value||0),1);
  const bw=(w-pad*2)/n*0.62, gap=(w-pad*2)/n;
  let bars='',lbls='';
  points.forEach((p,i)=>{
    const bh=(( +p.value||0)/max)*(h-pad*2), x=pad+gap*i+(gap-bw)/2, y=h-pad-bh;
    bars+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="var(--s-primary)" opacity="${.55+.45*(i/(n-1||1))}"/>`;
    bars+=`<text x="${x+bw/2}" y="${y-7}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--s-ink)">${esc(p.value)}</text>`;
    lbls+=`<text x="${x+bw/2}" y="${h-pad+17}" text-anchor="middle" font-size="11" fill="var(--s-faint)">${esc(p.label)}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto"><line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="var(--s-line)" stroke-width="1.5"/>${bars}${lbls}${unit?`<text x="${pad}" y="${pad-12}" font-size="11" fill="var(--s-faint)">${esc(unit)}</text>`:''}</svg>`;
}

const BLOCKS={
  kicker:{group:false,label:'Eyebrow',render:(d)=>`<div class="b-kicker">${ce('text',d.text,'span','','SECTION')}</div>`},
  headline:{group:false,label:'Headline',render:(d)=>`<h2 class="b-head">${ce('text',d.text,'span','','Your one claim')}</h2>`},
  subhead:{group:false,label:'Subhead',render:(d)=>`<p class="b-sub">${ce('text',d.text,'span','','Supporting line')}</p>`},
  text:{group:false,label:'Body text',render:(d)=>`<p class="b-text">${ce('text',d.text,'span','','Write here')}</p>`},
  bullets:{group:false,label:'Bullet list',render:(d,ed)=>`<ul class="b-bullets">${(d.items||[]).map((t,i)=>`<li>${cei('items',i,t)}</li>`).join('')}</ul>${ed?addItem('bullets'):''}`},
  stat:{group:false,label:'Big stat',render:(d)=>`<div class="b-stat"><div class="v">${ce('value',d.value,'span')}</div><div class="l">${ce('label',d.label,'span')}</div>${d.source!=null?`<div class="src">${ce('source',d.source,'span','','source')}</div>`:''}</div>`},
  quote:{group:false,label:'Quote',render:(d)=>`<blockquote class="b-quote">${ce('text',d.text,'span')}<cite>${ce('who',d.who,'span')}</cite></blockquote>`},
  ask:{group:false,label:'The ask',render:(d)=>`<div class="b-ask"><div class="amt">${ce('amount',d.amount,'span')}</div><div class="rd">${ce('round',d.round,'span')}</div><p>${ce('detail',d.detail,'span')}</p></div>`},
  contact:{group:false,label:'Contact',render:(d)=>`<div class="b-contact">${ce('name',d.name,'span','who')}<span>${ce('email',d.email,'span')}</span><span>${ce('url',d.url,'span')}</span></div>`},

  metrics:{group:true,wide:true,label:'Metric row',render:(d,ed)=>`<div class="b-metrics">${(d.items||[]).map((m,i)=>`<div class="mtile"><div class="mv">${cei('items',i,m.value,'span','','value')}</div><div class="ml">${cei('items',i,m.label,'span','','label')}</div>${m.delta!=null?`<div class="md">${cei('items',i,m.delta,'span','','delta')}</div>`:''}</div>`).join('')}</div>`},
  features:{group:true,wide:true,label:'Feature grid',render:(d,ed)=>`<div class="b-features">${(d.items||[]).map((m,i)=>`<div class="ftile"><div class="fdot"></div><b>${cei('items',i,m.title,'span','','title')}</b><span>${cei('items',i,m.desc,'span','','desc')}</span></div>`).join('')}</div>`},
  founders:{group:true,wide:true,label:'Founder cards',render:(d,ed)=>`<div class="b-founders">${(d.items||[]).map((m,i)=>`<div class="fcard"><div class="fav" style="background:var(--s-primary)">${esc((m.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2))}</div><b>${cei('items',i,m.name,'span','','name')}</b><span class="role">${cei('items',i,m.role,'span','','role')}</span><span class="cred">${cei('items',i,m.cred,'span','','credential')}</span></div>`).join('')}</div>`},
  logos:{group:true,wide:true,label:'Logo wall',render:(d,ed)=>`<div class="b-logos">${(d.items||[]).map((t,i)=>`<div class="logo">${cei('items',i,t)}</div>`).join('')}</div>`},
  tamsamsom:{group:true,wide:true,label:'TAM / SAM / SOM',render:(d)=>`<div class="b-market"><div class="rings"><div class="ring r1"><span>${ce('tamv',d.tamv,'b')}</span><em>TAM</em></div><div class="ring r2"><span>${ce('samv',d.samv,'b')}</span><em>SAM</em></div><div class="ring r3"><span>${ce('somv',d.somv,'b')}</span><em>SOM</em></div></div><div class="mnote"><div class="mrow"><i style="background:var(--s-line)"></i>${ce('taml',d.taml,'span')}</div><div class="mrow"><i style="background:var(--s-accent)"></i>${ce('saml',d.saml,'span')}</div><div class="mrow"><i style="background:var(--s-primary)"></i>${ce('soml',d.soml,'span')}</div><p>${ce('note',d.note,'span')}</p></div></div>`},
  chart:{group:true,wide:true,label:'Growth chart',render:(d,ed)=>`<div class="b-chart"><div class="ctitle">${ce('title',d.title,'span')}</div>${chart(d.points||[],d.unit)}${ed?`<div class="chart-edit">${(d.points||[]).map((p,i)=>`<span class="cpt">${cei('points',i,p.label,'span','','label')}:${cei('points',i,p.value,'span','','value')}</span>`).join('')} ${addItem('chart')}</div>`:''}</div>`},
  comptable:{group:true,wide:true,label:'Why-us comparison',render:(d,ed)=>{
    const cols=d.cols||[];return `<div class="b-comp"><table><thead><tr><th></th>${cols.map((c,i)=>`<th class="${i===0?'us':''}">${cei('cols',i,c)}</th>`).join('')}</tr></thead><tbody>${(d.rows||[]).map((r,ri)=>`<tr><td class="rl">${cei('rows',ri,r.name,'span','','name')}</td>${(r.vals||[]).map((v,vi)=>`<td class="${vi===0?'us':''}">${v==='●'||v==='○'?`<span class="dot ${v==='●'?'on':''}"></span>`:cei2(ri,vi,v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}},
  matrix:{group:true,wide:true,label:'2×2 positioning',render:(d)=>`<div class="b-matrix"><div class="ylab">${ce('ytop',d.ytop,'span')}</div><div class="mgrid"><div class="quad q1"></div><div class="quad q2"></div><div class="quad q3"></div><div class="quad q4 win"><span class="us">${ce('us',d.us,'span')}</span></div><div class="axis-x"></div><div class="axis-y"></div>${(d.items||[]).map((m,i)=>`<span class="mdot" style="left:${m.x}%;top:${m.y}%">${cei('items',i,m.name,'span','','name')}</span>`).join('')}</div><div class="ylab bot">${ce('ybot',d.ybot,'span')}</div><div class="xrow"><span>${ce('xleft',d.xleft,'span')}</span><span>${ce('xright',d.xright,'span')}</span></div></div>`},
  funds:{group:true,wide:true,label:'Use of funds',render:(d)=>{const items=d.items||[];return `<div class="b-funds">${items.map((m,i)=>`<div class="frow"><div class="fl">${cei('items',i,m.label,'span','','label')}<b>${cei('items',i,m.pct,'span','','pct')}%</b></div><div class="fbar"><i style="width:${Math.min(100,+m.pct||0)}%"></i></div></div>`).join('')}</div>`;}},
  roadmap:{group:true,wide:true,label:'Roadmap',render:(d,ed)=>`<div class="b-road">${(d.items||[]).map((m,i)=>`<div class="rstep"><div class="rdot"></div><b>${cei('items',i,m.when,'span','','when')}</b><span>${cei('items',i,m.what,'span','','milestone')}</span></div>`).join('')}</div>`},
  image:{group:false,wide:true,label:'Image / screenshot',render:(d,ed)=>`<figure class="b-image ${d.src?'has':''}"><div class="imgbox up-img" data-f="src">${d.src?`<img src="${d.src}" alt="">`:`<div class="imgph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>${ed?'Click to add image':''}</span></div>`}</div><figcaption>${ce('caption',d.caption,'span','','Caption')}</figcaption></figure>`},

  /* ---- SALES-SPECIFIC BLOCKS ---- */
  winloss:{group:true,wide:true,label:'Winners & losers',render:(d,ed)=>`<div class="b-winloss">${(d.items||[]).map((m,i)=>`<div class="wl ${m.win?'won':'lost'}"><span class="wl-ic">${m.win?'▲':'▼'}</span><b>${cei('items',i,m.who,'span','','who')}</b><span>${cei('items',i,m.outcome,'span','','outcome')}</span><button class="wl-toggle" data-wl="${i}" title="Flip winner/loser">${m.win?'winning':'losing'}</button></div>`).join('')}${ed?addItem('winloss'):''}</div>`},
  costtable:{group:true,wide:true,label:'Cost of inaction',render:(d,ed)=>`<div class="b-cost"><div class="ct-rows">${(d.items||[]).map((m,i)=>`<div class="ct-row">${cei('items',i,m.label,'span','ct-l','label')}<span class="ct-a">${cei('items',i,m.amount,'span','','amount')}</span></div>`).join('')}${ed?addItem('costtable'):''}</div><div class="ct-total"><span>Cost of doing nothing</span><b>${ce('total',d.total,'span')}</b></div></div>`},
  contrast:{group:true,wide:true,label:'Before → after',render:(d,ed)=>`<div class="b-contrast"><div class="cn-head"><span class="cn-before">Today</span><span class="cn-arrow">→</span><span class="cn-after">With ${esc(disp('{{company}}'))}</span></div>${(d.items||[]).map((m,i)=>`<div class="cn-row"><span class="cn-dim">${cei('items',i,m.dim,'span','','dimension')}</span><span class="cn-b">${cei('items',i,m.before,'span','','before')}</span><span class="cn-a">${cei('items',i,m.after,'span','','after')}</span></div>`).join('')}${ed?addItem('contrast'):''}</div>`},
  alternatives:{group:true,wide:true,label:'Alternatives',render:(d,ed)=>`<div class="b-alts">${(d.items||[]).map((m,i)=>`<div class="alt"><b>${cei('items',i,m.name,'span','','approach')}</b><span class="alt-how">${cei('items',i,m.how,'span','','how it works')}</span><span class="alt-flaw"><i>Falls short:</i> ${cei('items',i,m.flaw,'span','','the flaw')}</span></div>`).join('')}${ed?addItem('alternatives'):''}</div>`},
  casestudy:{group:true,wide:true,label:'Case-study card',render:(d,ed)=>`<div class="b-cases">${(d.items||[]).map((m,i)=>`<div class="case"><div class="case-top"><span class="case-logo">${cei('items',i,m.logo,'span','','LOGO')}</span><span class="case-ind">${cei('items',i,m.industry,'span','','industry')}</span></div><div class="case-metric">${cei('items',i,m.metric,'span','','+42% conversion')}</div><blockquote>${cei('items',i,m.quote,'span','','A one-line outcome quote.')}</blockquote><cite>${cei('items',i,m.who,'span','','Name, Title')}</cite></div>`).join('')}${ed?addItem('casestudy'):''}</div>`},
  roi:{group:true,wide:true,label:'ROI / business case',render:(d,ed)=>`<div class="b-roi"><div class="roi-inputs">${(d.inputs||[]).map((m,i)=>`<div class="roi-in"><span>${cei('inputs',i,m.label,'span','','driver')}</span><b>${cei('inputs',i,m.value,'span','','value')}</b></div>`).join('')}${ed?addItem('roi'):''}</div><div class="roi-out"><div class="roi-net"><span>Net annual value</span><b>${ce('net',d.net,'span')}</b></div><div class="roi-pay"><span>Payback</span><b>${ce('payback',d.payback,'span')}</b></div><div class="roi-cost"><span>Investment</span>${ce('cost',d.cost,'span')}</div></div></div>`},
  pricing:{group:true,wide:true,label:'Pricing & packaging',render:(d,ed)=>`<div class="b-pricing">${(d.tiers||[]).map((m,i)=>`<div class="tier ${m.rec?'rec':''}">${m.rec?'<span class="tier-flag">Recommended</span>':''}<div class="tier-name">${cei('tiers',i,m.name,'span','','Tier')}</div><div class="tier-price">${cei('tiers',i,m.price,'span','','$—')}<em>${cei('tiers',i,m.per,'span','','/mo')}</em></div><div class="tier-feats">${cei('tiers',i,m.features,'div','','What is included')}</div><div class="tier-best">${cei('tiers',i,m.best,'span','','best for')}</div></div>`).join('')}</div>`},
  nextsteps:{group:true,wide:true,label:'Mutual action plan',render:(d,ed)=>`<div class="b-map"><div class="map-steps">${(d.steps||[]).map((m,i)=>`<div class="map-step"><span class="map-n">${i+1}</span><b>${cei('steps',i,m.step,'span','','Next step')}</b><span class="map-meta">${cei('steps',i,m.owner,'span','','owner')} · ${cei('steps',i,m.when,'span','','date')}</span></div>`).join('')}${ed?addItem('nextsteps'):''}</div>${(d.stakeholders&&d.stakeholders.length)?`<div class="map-stake"><div class="ms-t">Who needs to be in the room</div>${(d.stakeholders||[]).map((m,i)=>`<div class="ms-row"><span class="ms-role">${cei('stakeholders',i,m.role,'span','','role')}</span><span class="ms-name">${cei('stakeholders',i,m.name,'span','','name')}</span><span class="ms-st ms-${(m.status||'').toLowerCase()}">${cei('stakeholders',i,m.status,'span','','status')}</span></div>`).join('')}</div>`:''}</div>`},
  faq:{group:true,wide:true,label:'Objection FAQ',render:(d,ed)=>`<div class="b-faq">${(d.items||[]).map((m,i)=>`<div class="faq-q"><b>${cei('items',i,m.q,'span','','Their objection')}</b><span>${cei('items',i,m.a,'span','','Your answer')}</span></div>`).join('')}${ed?addItem('faq'):''}</div>`},
  spacer:{group:false,label:'Spacer',render:()=>`<div class="b-spacer"></div>`}
};
function cei2(ri,vi,v){return `<span class="ce" data-f="rowvals" data-i="${ri}" data-k="${vi}"${ceAttr()}>${esc(v)}</span>`;}
function addItem(t){return `<button class="blk-add btn sm" data-additem="${t}">+ add</button>`;}

/* ---------------- SLIDE DEFINITIONS (canonical + coach) ---------------- */
const B=(type,data={})=>({type,data});
const SLIDES={
  title:{label:"Cover",lay:"center",icon:"M4 4h16v16H4zM22 6l-10 7L2 6",
    coach:{purpose:"A prepared-for cover. Put the buyer's name on it. This is a working session about THEIR outcome, not a company intro.",words:16,secs:12,attn:"High",
    tips:["Their name (and logo) on the cover","Lead with their outcome, not your product","One line a stranger understands"]},
    blocks:()=>[B("kicker",{text:"Prepared for {{account}} · {{industry}}"}),B("headline",{text:"How to {{outcome}}"}),B("subhead",{text:"A working session with {{company}}"}),B("contact",{name:"{{founder}}",email:"{{email}}",url:"{{url}}"})]},
  discovery:{label:"Discovery recap",lay:"lead",icon:"M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    coach:{purpose:"'Here's what you told us.' Reflecting their words back proves you listened and earns the right to prescribe. In the app this auto-fills from the CRM account and call notes.",words:22,secs:14,attn:"Med",
    tips:["Use their exact words","Prove you listened before you pitch","Confirm the problem before prescribing"]},
    blocks:()=>[B("kicker",{text:"What you told us"}),B("headline",{text:"Here is what we heard."}),B("bullets",{items:["The problem, in {{account}}'s words","What they have already tried","What a win looks like for them"]})]},
  change:{label:"The change / why now",lay:"split",icon:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
    coach:{purpose:"Andy Raskin's rule: open on a shift in THEIR world, not your logo. The change creates the stakes that make acting feel urgent.",words:28,secs:20,attn:"High",
    tips:["Name a shift that is undeniably true","Make it about their industry","Show the trend, do not just assert it"]},
    blocks:()=>[B("kicker",{text:"Why now"}),B("headline",{text:"The ground is shifting under {{industry}}."}),B("bullets",{items:["The shift that changes the game","What just became possible","Why the window is closing"]}),B("stat",{value:"—%",label:"of {{industry}} teams already feel it",source:"add a real source"})]},
  winloss:{label:"Winners & losers",lay:"lead",icon:"M23 6l-9.5 9.5-5-5L1 18M1 6l9.5 9.5",
    coach:{purpose:"Who is pulling ahead by adapting, and who is falling behind by standing still. Frames the decision as loss-aversion, not just upside.",words:22,secs:16,attn:"Med",
    tips:["Contrast adapters vs laggards","Make standing still the risky choice","Keep it about their peer set"]},
    blocks:()=>[B("kicker",{text:"Winners and losers"}),B("headline",{text:"The gap is widening."}),B("winloss",{items:[{who:"Teams that adapted",win:true,outcome:"growing share, lower cost to serve"},{who:"Teams that waited",win:false,outcome:"losing ground every quarter"}]}),B("text",{text:"Which side of this line does {{account}} want to be on in 12 months?"})]},
  costinaction:{label:"Cost of inaction",lay:"lead",icon:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v5M12 16h.01",
    coach:{purpose:"The reframe. Name a cost they have not fully priced in. Corporate Visions: an 'unconsidered need' breaks status-quo bias better than upside alone.",words:22,secs:20,attn:"High",
    tips:["Quantify what doing nothing costs","Use their numbers where you can","This is the tension that moves the deal"]},
    blocks:()=>[B("kicker",{text:"The hidden cost"}),B("headline",{text:"Standing still is not free."}),B("costtable",{items:[{label:"Lost revenue per quarter",amount:"$—"},{label:"Wasted spend",amount:"$—"},{label:"Team hours burned",amount:"$—"}],total:"$— / year"}),B("text",{text:"Every month this waits, the number above keeps running."})]},
  promised:{label:"The promised land",lay:"lead",icon:"M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
    coach:{purpose:"Paint the better future as THEIR outcome, in their words, not a feature list. Duarte: the audience is the hero; you are the mentor.",words:24,secs:16,attn:"Med",
    tips:["Describe their outcome, not your features","Make it vivid and specific","This is the thing they actually buy"]},
    blocks:()=>[B("kicker",{text:"The opportunity"}),B("headline",{text:"Where {{account}} could be."}),B("features",{items:[{title:"Outcome one",desc:"The result they most want."},{title:"Outcome two",desc:"The second-order win it unlocks."},{title:"Outcome three",desc:"What it makes possible next."}]})]},
  alternatives:{label:"Alternatives",lay:"lead",icon:"M4 6h16M4 12h16M4 18h16M8 3L4 6l4 3",
    coach:{purpose:"Bucket the ways this gets solved today (do nothing / in-house / incumbent) and each one's flaw. April Dunford: do not name-bash rivals, bucket the approaches.",words:24,secs:18,attn:"Med",
    tips:["Group approaches, do not attack rivals","Include 'do nothing' as an option","Name the structural flaw in each"]},
    blocks:()=>[B("kicker",{text:"How teams solve this today"}),B("headline",{text:"Three paths, each with a catch."}),B("alternatives",{items:[{name:"Do nothing",how:"Keep the status quo",flaw:"The cost of inaction keeps compounding."},{name:"Build in-house",how:"Ask engineering to own it",flaw:"Slow, expensive, never the priority."},{name:"The incumbent tool",how:"Bolt on a legacy vendor",flaw:"Rigid, generic, not built for {{industry}}."}]})]},
  approach:{label:"Our approach",lay:"center",icon:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7l3 5-3 5-3-5z",
    coach:{purpose:"Your big idea in one sentence, the bridge to the promised land. This is a differentiated point of view, not a feature.",words:18,secs:12,attn:"Med",
    tips:["One sentence a buyer repeats internally","Say what you replace","A point of view, not a feature list"]},
    blocks:()=>[B("kicker",{text:"Our approach"}),B("headline",{text:"A better way to {{outcome}}."}),B("subhead",{text:"The one-sentence idea that makes the promised land reachable."})]},
  gifts:{label:"Capabilities",lay:"lead",icon:"M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z",
    coach:{purpose:"Product as 'magic gifts' (Raskin). 3-4 capabilities, each mapped to the power it gives THEM. Features tied to outcomes, never a feature dump. Investors skim this least of all slides.",words:24,secs:14,attn:"Low",
    tips:["Feature to the outcome it unlocks","Three or four, the ones that matter","Show it in their context"]},
    blocks:()=>[B("kicker",{text:"What you get"}),B("headline",{text:"Built to get you there."}),B("features",{items:[{title:"Capability",desc:"The outcome it gives {{account}}."},{title:"Capability",desc:"The power it unlocks."},{title:"Capability",desc:"Why it compounds over time."}]})]},
  beforeafter:{label:"Before → after",lay:"lead",icon:"M4 12h16M14 6l6 6-6 6M4 6v12",
    coach:{purpose:"The contrast slide, in THEIR context. Anchor the demo here. Gong: show the biggest outcome first ('last slide first') to roughly double your odds.",words:20,secs:18,attn:"Med",
    tips:["Their world today vs with you","Biggest outcome first","Anchor the live demo to this"]},
    blocks:()=>[B("kicker",{text:"Before and after"}),B("headline",{text:"Your world, with {{company}}."}),B("contrast",{items:[{dim:"Speed",before:"weeks of manual work",after:"minutes, automated"},{dim:"Cost",before:"high and rising",after:"lower per unit"},{dim:"Visibility",before:"guesswork",after:"real-time and clear"}]})]},
  proof:{label:"Proof",lay:"lead",icon:"M9 12l2 2 4-4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    coach:{purpose:"73% of B2B buyers use a case study to decide, and proof lands hardest in the final 30% of the cycle. A named logo + a number + a quote beats any adjective.",words:22,secs:18,attn:"High",
    tips:["Match the case study to their industry","Lead with the number","Real names and logos, always"]},
    blocks:()=>[B("kicker",{text:"Proof"}),B("headline",{text:"Teams like {{account}} already did it."}),B("casestudy",{items:[{logo:"LOGO",industry:"{{industry}}",metric:"+42% conversion",quote:"The one-line outcome, in their words.",who:"Name, Title"}]}),B("logos",{items:["Logo","Logo","Logo","Logo","Logo"]})]},
  roi:{label:"ROI / business case",lay:"lead",icon:"M3 3v18h18M7 15l3-3 3 3 5-6",
    coach:{purpose:"The business case in THEIR numbers. 57% of buyers expect ROI within 3 months, so quantified near-term payback beats abstract value. In the app this computes from the CRM account.",words:20,secs:22,attn:"High",
    tips:["Use their volume and size, not a generic example","Show payback in months","List assumptions so it is defensible"]},
    blocks:()=>[B("kicker",{text:"The business case"}),B("headline",{text:"The math for {{account}}."}),B("roi",{inputs:[{label:"Annual revenue at stake",value:"$—"},{label:"Expected lift",value:"—%"},{label:"Hours saved / month",value:"—"}],net:"$— / year",payback:"— months",cost:"$— / year"}),B("text",{text:"Assumptions: the two or three inputs this rests on."})]},
  pricing:{label:"Pricing",lay:"lead",icon:"M2 7h20v10H2zM2 11h20M6 15h4",
    coach:{purpose:"Pricing to anchor value, not a full quote. Gong: reps who introduce price deliberately (not scattered) win more. Show tiers and highlight the recommended fit.",words:18,secs:16,attn:"Med",
    tips:["Anchor with clear tiers","Highlight the recommended fit","Enough to frame value, not a contract"]},
    blocks:()=>[B("kicker",{text:"Pricing"}),B("headline",{text:"Simple, and it scales with value."}),B("pricing",{tiers:[{name:"Starter",price:"$—",per:"/mo",features:"Core features\nEmail support",best:"Getting started",rec:false},{name:"Growth",price:"$—",per:"/mo",features:"Everything in Starter\nAdvanced analytics\nPriority support",best:"Best for {{account}}",rec:true},{name:"Enterprise",price:"Custom",per:"",features:"SSO and security review\nDedicated CSM\nSLA",best:"At scale",rec:false}]})]},
  nextsteps:{label:"Mutual action plan",lay:"lead",icon:"M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    coach:{purpose:"Indecision kills 40-60% of qualified deals (JOLT), and 56% of those buyers wanted to buy but could not commit. De-risk with a clear path and a stakeholder map, not more fear.",words:20,secs:16,attn:"High",
    tips:["One clear next action","Name who else needs to be in the room","A path to a decision, not 'think it over'"]},
    blocks:()=>[B("kicker",{text:"Next steps"}),B("headline",{text:"The path from here."}),B("nextsteps",{steps:[{step:"Technical validation",owner:"both teams",when:"this week"},{step:"Business case review",owner:"{{contact}}",when:"next week"},{step:"Decision and start",owner:"{{account}}",when:"in 3 weeks"}],stakeholders:[{role:"Champion",name:"{{contact}}",status:"Engaged"},{role:"Economic buyer",name:"—",status:"To meet"},{role:"Technical",name:"—",status:"To meet"}]})]},
  objections:{label:"Objection FAQ",lay:"lead",icon:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
    coach:{purpose:"Pre-empt the two or three real concerns. Answering the unspoken objection builds trust and removes friction to a yes. This usually lives in the appendix.",words:20,secs:14,attn:"Low",
    tips:["Pre-empt the real objections","Answer honestly, not defensively","Use it to de-risk, not to argue"]},
    blocks:()=>[B("kicker",{text:"Common questions"}),B("headline",{text:"You might be wondering."}),B("faq",{items:[{q:"What about switching cost?",a:"Migration is handled by us in — weeks."},{q:"Will it work with our stack?",a:"Native integrations for the tools you already use."},{q:"What if it does not land?",a:"A —-day pilot with success criteria you set."}]})]},
  comparison:{label:"Why-us comparison",lay:"lead",icon:"M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M15 3v18",
    coach:{purpose:"Why you vs the alternatives, only if they ask. A criteria matrix that shows where you win the dimensions that matter to them. Let them draw the conclusion.",words:18,secs:16,attn:"Low",
    tips:["Pick criteria where you win","Include 'do nothing' and in-house","Let them reach the conclusion"]},
    blocks:()=>[B("kicker",{text:"Why {{company}}"}),B("headline",{text:"How we compare."}),B("comptable",{cols:["{{company}}","Incumbent","In-house"],rows:[{name:"Built for {{industry}}",vals:["●","○","○"]},{name:"Live in weeks",vals:["●","○","○"]},{name:"Scales with you",vals:["●","●","○"]}]})]},
  security:{label:"Security & procurement",lay:"lead",icon:"M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z",
    coach:{purpose:"For enterprise. Keep it in the appendix unless they raise it, but have it ready: it unblocks the buying committee and procurement.",words:18,secs:12,attn:"Low",
    tips:["Lead with the certs they need","Answer the procurement checklist","Appendix unless asked"]},
    blocks:()=>[B("kicker",{text:"Security and compliance"}),B("headline",{text:"Enterprise-ready."}),B("features",{items:[{title:"SOC 2 · GDPR",desc:"Audited, compliant, documented."},{title:"SSO and RBAC",desc:"Your identity provider, your roles."},{title:"99.9% uptime",desc:"SLA-backed reliability."}]})]},
  timeline:{label:"Implementation",lay:"lead",icon:"M2 12h20M6 8v8M12 6v12M18 8v8",
    coach:{purpose:"Show how fast they get value. A short, credible path to live reduces perceived risk and helps the buyer picture the win.",words:18,secs:14,attn:"Low",
    tips:["Show time-to-value, not just tasks","Make the first win fast","Name what you handle vs what they do"]},
    blocks:()=>[B("kicker",{text:"Getting live"}),B("headline",{text:"Live in weeks, not quarters."}),B("roadmap",{items:[{when:"Week 1",what:"Kickoff and setup."},{when:"Week 2",what:"Integration and data."},{when:"Week 4",what:"First value, measured."},{when:"Week 8",what:"Full rollout."}]})]},
  closing:{label:"Close",lay:"center",icon:"M4 4h16v16H4zM22 6l-10 7L2 6",
    coach:{purpose:"Restate their outcome and the one next step. Leave them with the point, not a 'thank you' slide.",words:14,secs:10,attn:"Low",
    tips:["Restate their outcome","Leave the next step on screen","Make it easy to say yes"]},
    blocks:()=>[B("kicker",{text:"Let us go"}),B("headline",{text:"Ready when you are."}),B("subhead",{text:"The next step, and how to reach {{company}}."}),B("contact",{name:"{{founder}}",email:"{{email}}",url:"{{url}}"})]}
};

/* ---------------- CONTEXT PRESETS ---------------- */
const CORE=["title","change","winloss","costinaction","promised","alternatives","approach","gifts","beforeafter","proof","roi","pricing","nextsteps"];
function T(id,name,bestFor,stage,sector,style,theme,slides){return {id,name,bestFor,stage,sector,style,theme,slides};}
const TEMPLATES=[
  T("strategic","Strategic Narrative","Andy Raskin's full arc: change, stakes, promised land, proof","Proposal","Any","Narrative","narrative",CORE),
  T("discovery-first","Discovery Deck","First meeting: lead with their world, stay light, end on a next step","Discovery","Any","Editorial","editorial",["title","discovery","change","costinaction","promised","approach","nextsteps"]),
  T("demo","Demo Deck","Best-outcome-first, product in their context, then the close","Demo","SaaS","Enterprise","enterprise",["title","beforeafter","gifts","proof","roi","pricing","nextsteps"]),
  T("proposal","Proposal / RFP","The full business case with ROI, security and a mutual action plan","Proposal","Enterprise","Enterprise","enterprise",["title","discovery","change","costinaction","promised","approach","gifts","beforeafter","proof","roi","comparison","pricing","security","timeline","nextsteps"]),
  T("challenger","Challenger / Reframe","Teach a surprising insight and reframe the problem","Discovery","Enterprise","Data","analyst",["title","change","winloss","costinaction","alternatives","approach","gifts","beforeafter","proof","roi","nextsteps"]),
  T("exec-brief","Executive Brief","The 3-minute rule: the core case in six tight slides","Demo","Enterprise","Minimal","mono",["title","costinaction","promised","proof","roi","nextsteps"]),
  T("storybrand","StoryBrand","Customer as hero, you as the guide, one clear call to action","Discovery","Any","Consumer","consumer",["title","change","costinaction","promised","approach","gifts","proof","nextsteps"]),
  T("renewal","Renewal","Reinforce the status quo, recap realized value, expand","Renewal","Any","Fintech","fintech",["title","proof","roi","promised","timeline","pricing","nextsteps"]),
  T("upsell","Upsell / Expansion","Value delivered, a new unconsidered need, incremental ROI","Upsell","SaaS","Bold","ai",["title","proof","change","costinaction","gifts","roi","pricing","nextsteps"]),
  T("partnership","Partnership Pitch","Mutual value and winners/losers for both sides","Partnership","Any","Bold","gradient",["title","change","winloss","promised","approach","gifts","proof","nextsteps"]),
  T("saas-plg","SaaS Product-Led","Front-load the aha, light on narrative, self-serve close","Demo","SaaS","Bold","ai",["title","beforeafter","gifts","proof","pricing","nextsteps"]),
  T("services","Services / Agency","Case-study narratives, process and credibility lead","Proposal","Services","Editorial","editorial",["title","discovery","change","promised","approach","proof","timeline","pricing","nextsteps"]),
  T("enterprise","Enterprise Complex","Long-cycle, multi-threaded, security and procurement ready","Proposal","Enterprise","Neutral","slate",["title","change","costinaction","promised","alternatives","approach","gifts","beforeafter","proof","roi","comparison","security","pricing","nextsteps"]),
  T("dark-demo","Dark Demo","Technical / dev-tools demo on a dark canvas","Demo","SaaS","Dark","dark",["title","beforeafter","gifts","proof","comparison","pricing","nextsteps"])
];

/* ---------------- STATE ---------------- */
const LS='fg.clientpitch.v1';
let D=null, cur=0, sel=null, zoom='fit', palTab='slides', inspTab='coach';

function defaultBrand(){return {company:'Northwind',tagline:'Revenue infrastructure for modern commerce',
  founder:'Your Name',email:'you@northwind.co',url:'northwind.co',
  account:'Acme Retail',industry:'Retail',contact:'Their Champion',outcome:'cut checkout drop-off and lift revenue per visit',
  sector:'SaaS',stage:'Sales',logo:null,themeKey:'enterprise'};}

// {{company}} = you (the seller). {{account}}/{{industry}}/{{contact}} = the buyer (personalization).
function fillTokens(str,brand){
  const b=brand||{};
  return String(str==null?'':str)
    .replace(/\{\{company\}\}/g,b.company||'').replace(/\{\{tagline\}\}/g,b.tagline||'')
    .replace(/\{\{founder\}\}/g,b.founder||'').replace(/\{\{email\}\}/g,b.email||'')
    .replace(/\{\{url\}\}/g,b.url||'').replace(/\{\{account\}\}/g,b.account||'')
    .replace(/\{\{industry\}\}/g,b.industry||'').replace(/\{\{contact\}\}/g,b.contact||'')
    .replace(/\{\{outcome\}\}/g,b.outcome||'')
    .replace(/\{\{milestone\}\}/g,b.milestone||'')
    .replace(/\{\{stage\}\}/g,b.stage||'').replace(/\{\{sector\}\}/g,b.sector||'');
}
function deepFill(o,brand){
  if(typeof o==='string')return fillTokens(o,brand);
  if(Array.isArray(o))return o.map(x=>deepFill(x,brand));
  if(o&&typeof o==='object'){const r={};for(const k in o)r[k]=deepFill(o[k],brand);return r;}
  return o;
}
function buildDeck(tpl,brand){
  brand=brand||defaultBrand();
  const th=THEMES[tpl.theme]?tpl.theme:'editorial';
  brand.themeKey=th; brand.stage=tpl.stage!=='Any'?tpl.stage:brand.stage; brand.sector=tpl.sector!=='Any'?tpl.sector:brand.sector;
  const slides=tpl.slides.map(type=>{
    const def=SLIDES[type];
    return {id:uid(),type,name:def.label,lay:def.lay,blocks:def.blocks().map(b=>({id:uid(),type:b.type,data:clone(b.data)}))};
  });
  return {name:brand.company+' — '+tpl.name,template:tpl.id,brand,slides};
}

/* ---------------- THEME APPLY ---------------- */
function applyTheme(el){
  const t=THEMES[D.brand.themeKey]||THEMES.editorial;
  const p=D.brand;
  const map={'--s-head':t.head,'--s-body':t.body,'--s-mono':t.mono||F.mono,
    '--s-ink':t.ink,'--s-slate':t.slate,'--s-faint':t.faint,'--s-line':t.line,
    '--s-paper':t.paper,'--s-surface':t.surface,'--s-primary':p.primary||t.primary,
    '--s-accent':p.accent||t.accent,'--s-headw':t.headw,'--s-upper':t.upper+'em',
    '--s-grad':t.grad||`linear-gradient(120deg,${p.primary||t.primary},${p.accent||t.accent})`};
  for(const k in map)el.style.setProperty(k,map[k]);
  el.dataset.mode=t.mode;
}

/* ---------------- SLIDE RENDER ---------------- */
function renderSlideInner(slide,editable){
  EDIT=editable;
  const b=D.brand;
  const blocks=slide.blocks.map(bl=>{
    const def=BLOCKS[bl.type]; if(!def)return '';
    const wide=def.wide?'wide':'';
    const ctl=editable?`<div class="blk-ctl"><button data-act="up" title="Move up">↑</button><button data-act="down" title="Move down">↓</button><button data-act="dup" title="Duplicate">⧉</button><button data-act="del" title="Delete">✕</button></div>`:'';
    return `<div class="blk ${wide} ${sel===bl.id&&editable?'sel':''}" data-bid="${bl.id}" data-type="${bl.type}">${ctl}${def.render(bl.data,editable)}</div>`;
  }).join('');
  const logo=b.logo?`<img src="${b.logo}" class="sl-logo" alt="">`:`<span class="sl-logomk"><svg viewBox="11 6 34 42" width="16" height="20" fill="none"><path d="M28 47 V25" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M28 31 C15 31 12 18 14.5 11 C24 11 30.5 19 28 31 Z" fill="currentColor" opacity=".55"/><path d="M28 27 C41 27 44 14 41.5 7 C32 7 25.5 15 28 27 Z" fill="currentColor"/></svg><b>${esc(b.company)}</b></span>`;
  const pageNo=D.slides.indexOf(slide)+1;
  return `<div class="sl-accent"></div><div class="sl-pad lay-${slide.lay}"><div class="sl-body">${blocks}</div></div>
    <div class="sl-foot"><span class="sl-brand">${logo}</span><span class="sl-page">${pageNo} / ${D.slides.length}</span></div>`;
}

function renderCanvas(){
  const c=$('#canvas'); const slide=D.slides[cur];
  c.className='slide editing'; c.innerHTML=renderSlideInner(slide,true);
  applyTheme(c);
  fitZoom();
  // layout picker state
  $$('#layoutPick button').forEach(b=>b.classList.toggle('on',b.dataset.lay===slide.lay));
  $('#spos').textContent=cur+1; $('#stot').textContent=D.slides.length;
}

/* ---------------- REEL ---------------- */
function miniScale(container,slideEl,w){
  const s=w/1120; slideEl.style.transform=`scale(${s})`; slideEl.style.width='1120px'; slideEl.style.height='630px';
}
function renderReel(){
  const reel=$('#reel'); reel.innerHTML='';
  D.slides.forEach((slide,i)=>{
    const item=document.createElement('div'); item.className='reel-item'+(i===cur?' on':'');
    item.dataset.i=i;
    item.innerHTML=`<span class="reel-num">${i+1}</span>
      <div class="reel-acts"><button data-ract="dup" title="Duplicate">⧉</button><button data-ract="del" title="Delete">✕</button></div>
      <div class="reel-thumb"><div class="slide mini"></div></div>
      <div class="reel-cap">${esc(slide.name)}</div>`;
    reel.appendChild(item);
    const mini=item.querySelector('.mini');
    mini.innerHTML=renderSlideInner(slide,false); applyTheme(mini);
    requestAnimationFrame(()=>{const w=item.querySelector('.reel-thumb').clientWidth; miniScale(null,mini,w);});
  });
}

/* ---------------- PALETTE (left) ---------------- */
const SLIDE_GROUPS=[
  {g:'The narrative spine',items:['title','change','winloss','costinaction','promised','alternatives','approach','gifts','beforeafter','proof','roi','pricing','nextsteps']},
  {g:'When it fits',items:['discovery','objections','comparison','security','timeline','closing']}
];
const BLOCK_GROUPS=[
  {g:'Text',items:['kicker','headline','subhead','text','bullets','quote','stat']},
  {g:'The sale',items:['winloss','costtable','contrast','alternatives','casestudy','roi','pricing','nextsteps']},
  {g:'Proof & compare',items:['features','logos','casestudy','comptable','faq','image']},
  {g:'Utility',items:['metrics','roadmap','contact','spacer']}
];
function svgIcon(path){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;}
function renderPalette(){
  const p=$('#palette'); p.innerHTML='';
  if(palTab==='slides'){
    SLIDE_GROUPS.forEach(gr=>{
      const g=document.createElement('div'); g.className='pal-group';
      g.innerHTML=`<div class="gl">${gr.g}</div>`+gr.items.map(t=>{
        const s=SLIDES[t];
        return `<button class="pal-item is-slide" data-addslide="${t}"><span class="ic">${svgIcon(s.icon)}</span><span class="tx"><b>${s.label}</b><span>${s.coach.attn} attention · ~${s.coach.secs}s</span></span></button>`;
      }).join('');
      p.appendChild(g);
    });
  }else{
    BLOCK_GROUPS.forEach(gr=>{
      const g=document.createElement('div'); g.className='pal-group';
      g.innerHTML=`<div class="gl">${gr.g}</div>`+gr.items.map(t=>{
        const bd=BLOCKS[t];
        return `<button class="pal-item is-block" data-addblock="${t}"><span class="ic">${blockIcon(t)}</span><span class="tx"><b>${bd.label}</b><span>${bd.group?'block group':'single block'}</span></span></button>`;
      }).join('');
      p.appendChild(g);
    });
  }
}
function blockIcon(t){
  const m={kicker:'M4 7h16M4 12h10',headline:'M4 7h16M4 12h16M4 17h9',subhead:'M4 8h16M4 13h11',text:'M4 6h16M4 10h16M4 14h16M4 18h10',
    bullets:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',quote:'M6 17h3l2-4V7H5v6h3zM14 17h3l2-4V7h-6v6h3z',stat:'M12 20V10M18 20V4M6 20v-4',
    metrics:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',features:'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    founders:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',logos:'M3 5h6v6H3zM15 5h6v6h-6zM3 15h6v4H3zM15 15h6v4h-6z',
    roadmap:'M2 12h20M6 8v8M12 6v12M18 8v8',funds:'M4 6h16M4 12h11M4 18h7',chart:'M3 3v18h18M7 14l3-4 3 3 5-7',tamsamsom:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    comptable:'M3 3h18v18H3zM3 9h18M9 3v18',matrix:'M3 3v18h18M12 3v18M3 12h18',image:'M3 3h18v18H3zM8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    ask:'M12 2v20M2 12h20',contact:'M4 4h16v16H4zM22 6l-10 7L2 6',spacer:'M4 9h16M4 15h16'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${m[t]||m.text}"/></svg>`;
}

/* ---------------- INSPECTOR (right) ---------------- */
function renderInspector(){
  const el=$('#inspBody');
  if(inspTab==='coach')el.innerHTML=coachHTML();
  else if(inspTab==='brand')el.innerHTML=brandHTML();
  else el.innerHTML=deckHTML();
  $$('.insp-tab').forEach(t=>t.classList.toggle('on',t.dataset.insp===inspTab));
}
function deckWords(){return D.slides.reduce((n,s)=>n+slideWords(s),0);}
function slideWords(s){let n=0;s.blocks.forEach(b=>{n+=countText(b.data);});return n;}
// Count real words; resolve tokens, skip image data-URIs so a base64 src never inflates the meter.
function countText(o){let n=0;const walk=(v,key)=>{
  if(typeof v==='string'){if(key==='src'||v.slice(0,5)==='data:')return;
    n+=fillTokens(v,D.brand).split(/\s+/).filter(w=>w.replace(/[^a-zA-Z0-9]/g,'').length>1).length;}
  else if(Array.isArray(v))v.forEach(x=>walk(x,key));
  else if(v&&typeof v==='object')for(const k in v)walk(v[k],k);};
  walk(o,''); return n;}
function coachHTML(){
  const slide=D.slides[cur], def=SLIDES[slide.type], c=def.coach;
  const w=slideWords(slide), over=w>def.coach.words*1.6;
  const totalW=deckWords(), readSec=Math.round(totalW/3.3); // ~3.3 words/sec skim
  const nS=D.slides.length, band=nS>=6&&nS<=15;
  return `<div class="coach">
    <div class="ck">Slide coach · ${esc(def.label)}</div>
    <p class="cp">${esc(c.purpose)}</p>
    <div class="cm">
      <div class="cmt"><div class="v">${c.attn}</div><div class="k">Buyer attention</div></div>
      <div class="cmt"><div class="v">~${c.secs}s</div><div class="k">Time on slide</div></div>
    </div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--faint);margin:4px 0 8px">What to nail</div>
    ${c.tips.map(t=>`<div class="tip">${esc(t)}</div>`).join('')}
    <div class="meter" style="margin-top:16px">
      <div class="mt"><span>Words on this slide</span><span style="color:${over?'var(--rose)':'var(--sage)'}">${w} ${over?'· trim it':'· good'}</span></div>
      <div class="bar"><i style="width:${Math.min(100,w/(def.coach.words*2)*100)}%;${over?'background:linear-gradient(90deg,#8f2c49,#b23a5c)':''}"></i></div>
    </div>
    <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:14px">
      <div class="ck">Deck health</div>
      <div class="meter">
        <div class="mt"><span>Length</span><span style="color:${band?'var(--sage)':'var(--rose)'}">${nS} slides ${band?'· a tight 8–15 lands':'· aim for a tight 8–15'}</span></div>
        <div class="bar"><i style="width:${Math.min(100,nS/16*100)}%"></i></div>
      </div>
      <div class="cm">
        <div class="cmt"><div class="v">${Math.floor(readSec/60)}m ${readSec%60}s</div><div class="k">Est. skim time</div></div>
        <div class="cmt"><div class="v">${totalW}</div><div class="k">Total words</div></div>
      </div>
      <div class="tip" style="margin-top:4px">Buyers skim sales decks in under 3 minutes, ~15s a page (DocSend). The real enemy is "no decision" (JOLT) — end on a clear next step, not more pressure.</div>
    </div>
  </div>`;
}
function brandHTML(){
  const b=D.brand, t=THEMES[b.themeKey];
  return `<div class="insp-body">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--rose);margin-bottom:10px">You — the seller</div>
    <div class="field"><label>Your company</label><input type="text" data-brand="company" value="${esc(b.company)}"></div>
    <div class="field"><label>Your one-line value prop</label><textarea data-brand="tagline">${esc(b.tagline)}</textarea></div>
    <div class="field"><label>Your logo</label>
      <div style="display:flex;gap:9px;align-items:center">
        <div class="up-logo" style="width:44px;height:44px;border:1px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;background:var(--paper)">${b.logo?`<img src="${b.logo}" style="width:100%;height:100%;object-fit:contain">`:`<svg viewBox="0 0 24 24" width="18" fill="none" stroke="var(--faint)" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg>`}</div>
        <button class="btn sm" id="logoUpBtn">Upload</button>${b.logo?`<button class="btn ghost sm" id="logoClr">Clear</button>`:''}
      </div><input type="file" id="logoFile" accept="image/*" class="hide">
    </div>
    <div style="border-top:1px solid var(--line);margin:6px 0 14px"></div>
    <div class="field"><label>Style / theme</label>
      <div class="swatches" id="themeSw">${Object.keys(THEMES).map(k=>{const th=THEMES[k];return `<div class="sw ${k===b.themeKey?'on':''}" data-theme="${k}" title="${th.name}" style="background:linear-gradient(135deg,${th.primary},${th.accent})"></div>`;}).join('')}</div>
      <div style="font-size:11px;color:var(--faint);margin-top:7px">${esc(t.name)} · ${headFontName(t.head)} + ${headFontName(t.body)}</div>
    </div>
    <div class="field"><label>Brand colors</label>
      <div class="colorrow"><input type="color" data-color="primary" value="${b.primary||t.primary}"><span class="cl">Primary</span><span class="cv">${b.primary||t.primary}</span></div>
      <div class="colorrow"><input type="color" data-color="accent" value="${b.accent||t.accent}"><span class="cl">Accent</span><span class="cv">${b.accent||t.accent}</span></div>
    </div>
  </div>`;
}
function headFontName(f){return f.split("'")[1]||f.split(',')[0];}
function deckHTML(){
  const b=D.brand;
  return `<div class="insp-body">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--rose);margin-bottom:4px">The account — who you're selling to</div>
    <p style="font-size:11.5px;color:var(--faint);line-height:1.5;margin:0 0 12px">This is the personalization layer. In Firmgrove it pulls from the CRM account and call notes; here you set it by hand. It flows into the cover, the change slide, the case study and the ROI.</p>
    <div class="field"><label>Account name (the buyer)</label><input type="text" data-brand="account" value="${esc(b.account)}"></div>
    <div class="field"><label>Their industry</label><input type="text" data-brand="industry" value="${esc(b.industry)}"></div>
    <div class="field"><label>Their champion / your contact there</label><input type="text" data-brand="contact" value="${esc(b.contact)}"></div>
    <div class="field"><label>The outcome they want</label><textarea data-brand="outcome">${esc(b.outcome)}</textarea></div>
    <div style="border-top:1px solid var(--line);margin:6px 0 14px"></div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--faint);margin-bottom:10px">Your contact details (cover + close)</div>
    <div class="field"><label>Your name</label><input type="text" data-brand="founder" value="${esc(b.founder)}"></div>
    <div class="field"><label>Email</label><input type="text" data-brand="email" value="${esc(b.email)}"></div>
    <div class="field"><label>Website</label><input type="text" data-brand="url" value="${esc(b.url)}"></div>
    <p style="font-size:11.5px;color:var(--faint);line-height:1.5">Every field flows live into any slide that still uses its placeholder. Edit text directly on a slide and your wording is kept.</p>
  </div>`;
}

/* ---------------- ZOOM ---------------- */
function fitZoom(){
  const wrap=$('#canvasWrap'), scroll=$('#canvasScroll');
  let s;
  if(zoom==='fit'){const avail=scroll.clientWidth-68; s=Math.min(1,avail/1120);}
  else s=parseFloat(zoom);
  wrap.style.transform=`scale(${s})`;
  wrap.style.height=(630*s+0)+'px';
  wrap.style.width='1120px';
  $('#zLabel').textContent=zoom==='fit'?'Fit':Math.round(s*100)+'%';
}

/* ---------------- EDIT: harvest DOM -> model ---------------- */
let harvestTimer=null;
// Harvest ONLY the edited element's field. Untouched fields keep whatever they
// held (including {{tokens}}), so brand changes still propagate to them.
function harvestField(el){
  if(!el||el.classList.contains('up-img'))return;
  const bEl=el.closest('.blk[data-bid]'); if(!bEl)return;
  const b=(D.slides[cur].blocks||[]).find(x=>x.id===bEl.dataset.bid); if(!b)return;
  const key=el.dataset.f, i=el.dataset.i, k=el.dataset.k, val=el.innerText.replace(/\u00a0/g,' ').trim();
  if(i!==undefined){
    if(key==='rowvals'){ const ri=+i; b.data.rows=b.data.rows||[]; b.data.rows[ri]=b.data.rows[ri]||{vals:[]}; b.data.rows[ri].vals[+k]=val; }
    else { if(!Array.isArray(b.data[key]))b.data[key]=[];
      if(k){ b.data[key][+i]=Object.assign({},b.data[key][+i]); b.data[key][+i][k]=val; }
      else b.data[key][+i]=val; }
  } else b.data[key]=val;
  saveSoon(); updateReelThumb(cur);
}
function updateReelThumb(i){
  const item=$(`.reel-item[data-i="${i}"]`); if(!item)return;
  const mini=item.querySelector('.mini'); mini.innerHTML=renderSlideInner(D.slides[i],false); applyTheme(mini);
  const w=item.querySelector('.reel-thumb').clientWidth; miniScale(null,mini,w);
  item.querySelector('.reel-cap').textContent=D.slides[i].name;
}

/* ---------------- ACTIONS ---------------- */
function addBlock(type,at){
  const data=defaultBlockData(type);
  const blk={id:uid(),type,data};
  const s=D.slides[cur];
  if(at==null)s.blocks.push(blk); else s.blocks.splice(at,0,blk);
  sel=blk.id; renderCanvas(); updateReelThumb(cur); saveSoon();
}
function defaultBlockData(type){
  // pull sample content from a slide that showcases this block, else minimal
  const samples={
    kicker:{text:'SECTION'},headline:{text:'Your one claim'},subhead:{text:'Supporting line'},
    text:{text:'Write your point here.'},bullets:{items:['First point','Second point','Third point']},
    quote:{text:'"A real, outcome-focused customer quote."',who:'— Name, Company'},
    stat:{value:'—%',label:'the metric that matters',source:'source'},
    metrics:{items:[{value:'—',label:'metric',delta:''},{value:'—',label:'metric',delta:''},{value:'—',label:'metric',delta:''}]},
    features:{items:[{title:'Pillar',desc:'What it does.'},{title:'Pillar',desc:'What it does.'},{title:'Pillar',desc:'What it does.'}]},
    founders:{items:[{name:'Founder One',role:'CEO',cred:'The unfair credential.'},{name:'Founder Two',role:'CTO',cred:'Shipped it before.'}]},
    logos:{items:['Logo','Logo','Logo','Logo']},
    roadmap:{items:[{when:'Now',what:'Today.'},{when:'6 mo',what:'Next proof.'},{when:'12 mo',what:'Next round.'}]},
    funds:{items:[{label:'Product',pct:'45'},{label:'Go-to-market',pct:'35'},{label:'Operations',pct:'20'}]},
    chart:{title:'Growth',unit:'$K',points:[{label:'Q1',value:'10'},{label:'Q2',value:'22'},{label:'Q3',value:'41'},{label:'Q4',value:'78'}]},
    tamsamsom:{tamv:'$—B',taml:'Total market',samv:'$—B',saml:'Serviceable',somv:'$—M',soml:'Beachhead',note:'Bottoms-up.'},
    comptable:{cols:['{{company}}','Incumbent','Legacy'],rows:[{name:'Real-time',vals:['●','○','○']},{name:'Purpose-built',vals:['●','○','○']},{name:'Self-serve',vals:['●','●','○']}]},
    matrix:{ytop:'Real-time',ybot:'Batch',xleft:'Generic',xright:'Purpose-built',us:'{{company}}',items:[{name:'Incumbent',x:25,y:65},{name:'Legacy',x:20,y:25}]},
    image:{src:null,caption:'Caption'},
    contact:{name:'{{founder}}',email:'{{email}}',url:'{{url}}'},spacer:{},
    winloss:{items:[{who:'Teams that adapted',win:true,outcome:'pulling ahead'},{who:'Teams that waited',win:false,outcome:'falling behind'}]},
    costtable:{items:[{label:'Lost revenue',amount:'$—'},{label:'Wasted spend',amount:'$—'}],total:'$— / year'},
    contrast:{items:[{dim:'Speed',before:'weeks',after:'minutes'},{dim:'Cost',before:'high',after:'lower'}]},
    alternatives:{items:[{name:'Do nothing',how:'Status quo',flaw:'Cost keeps compounding.'},{name:'Build in-house',how:'Ask engineering',flaw:'Slow and never the priority.'}]},
    casestudy:{items:[{logo:'LOGO',industry:'{{industry}}',metric:'+42% conversion',quote:'The outcome in their words.',who:'Name, Title'}]},
    roi:{inputs:[{label:'Revenue at stake',value:'$—'},{label:'Expected lift',value:'—%'}],net:'$— / year',payback:'— months',cost:'$— / year'},
    pricing:{tiers:[{name:'Starter',price:'$—',per:'/mo',features:'Core features',best:'Getting started',rec:false},{name:'Growth',price:'$—',per:'/mo',features:'Everything in Starter\nAdvanced analytics',best:'Best for {{account}}',rec:true},{name:'Enterprise',price:'Custom',per:'',features:'SSO\nDedicated CSM',best:'At scale',rec:false}]},
    nextsteps:{steps:[{step:'Technical validation',owner:'both teams',when:'this week'},{step:'Decision and start',owner:'{{account}}',when:'in 3 weeks'}],stakeholders:[{role:'Champion',name:'{{contact}}',status:'Engaged'},{role:'Economic buyer',name:'—',status:'To meet'}]},
    faq:{items:[{q:'Their objection?',a:'Your honest answer.'},{q:'Another concern?',a:'How you de-risk it.'}]}
  };
  return clone(samples[type]||{text:''});
}
function addSlide(type,at){
  const def=SLIDES[type];
  const s={id:uid(),type,name:def.label,lay:def.lay,blocks:def.blocks().map(b=>({id:uid(),type:b.type,data:clone(b.data)}))};
  at=at==null?cur+1:at;
  D.slides.splice(at,0,s); cur=at; sel=null;
  fullRender(); saveSoon(); toast(def.label+' slide added');
}
function delSlide(i){
  if(D.slides.length<=1)return toast('A deck needs at least one slide');
  D.slides.splice(i,1); if(cur>=D.slides.length)cur=D.slides.length-1; sel=null; fullRender(); saveSoon();
}
function dupSlide(i){
  const c=clone(D.slides[i]); c.id=uid(); c.blocks.forEach(b=>b.id=uid());
  D.slides.splice(i+1,0,c); cur=i+1; sel=null; fullRender(); saveSoon();
}
function moveBlock(bid,dir){
  const s=D.slides[cur], idx=s.blocks.findIndex(b=>b.id===bid); if(idx<0)return;
  const ni=idx+dir; if(ni<0||ni>=s.blocks.length)return;
  [s.blocks[idx],s.blocks[ni]]=[s.blocks[ni],s.blocks[idx]];
  renderCanvas(); updateReelThumb(cur); saveSoon();
}
function dupBlock(bid){
  const s=D.slides[cur], idx=s.blocks.findIndex(b=>b.id===bid); if(idx<0)return;
  const c=clone(s.blocks[idx]); c.id=uid(); s.blocks.splice(idx+1,0,c); sel=c.id;
  renderCanvas(); updateReelThumb(cur); saveSoon();
}
function delBlock(bid){
  const s=D.slides[cur]; s.blocks=s.blocks.filter(b=>b.id!==bid); if(sel===bid)sel=null;
  renderCanvas(); updateReelThumb(cur); saveSoon();
}
const ITEM_ADD={
  bullets:d=>d.items.push('New point'),
  chart:d=>d.points.push({label:'Q'+((d.points||[]).length+1),value:'0'}),
  winloss:d=>d.items.push({who:'Another group',win:false,outcome:'their outcome'}),
  costtable:d=>d.items.push({label:'Another cost',amount:'$—'}),
  contrast:d=>d.items.push({dim:'Dimension',before:'today',after:'with us'}),
  alternatives:d=>d.items.push({name:'Another approach',how:'how it works',flaw:'the flaw'}),
  casestudy:d=>d.items.push({logo:'LOGO',industry:'{{industry}}',metric:'+—%',quote:'Their outcome.',who:'Name, Title'}),
  roi:d=>(d.inputs=d.inputs||[]).push({label:'Another driver',value:'—'}),
  nextsteps:d=>(d.steps=d.steps||[]).push({step:'Next step',owner:'owner',when:'date'}),
  faq:d=>d.items.push({q:'Their question?',a:'Your answer.'})
};
function addArrayItem(type){
  const s=D.slides[cur], bl=s.blocks.find(b=>b.id===sel)||s.blocks.slice().reverse().find(b=>b.type===type);
  if(!bl||!ITEM_ADD[type])return;
  ITEM_ADD[type](bl.data);
  renderCanvas(); updateReelThumb(cur); saveSoon();
}

/* ---------------- PERSISTENCE ---------------- */
let saveTimer=null;
function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(save,600);}
function save(){try{localStorage.setItem(LS,JSON.stringify({D,cur}));}catch(e){}}
function load(){try{const r=JSON.parse(localStorage.getItem(LS));if(r&&r.D&&r.D.slides&&r.D.slides.length){D=r.D;cur=Math.min(r.cur||0,D.slides.length-1);return true;}}catch(e){}return false;}

/* ---------------- FULL RENDER ---------------- */
function fullRender(){renderCanvas();renderReel();renderInspector();$('#deckName').textContent=D.name;}

/* ---------------- GALLERY ---------------- */
let galFilter={stage:'All',sector:'All',style:'All'};
function buildFilters(){
  const el=$('#galFilters');
  const F=k=>['All',...new Set(TEMPLATES.map(t=>t[k]).filter(v=>v!=='Any'))];
  const stages=F('stage'), sectors=F('sector'), styles=F('style');
  el.innerHTML=
    `<span class="chip-lbl">Context</span>`+stages.map(s=>`<button class="chip ${galFilter.stage===s?'on':''}" data-fstage="${s}">${s}</button>`).join('')+
    `<span class="chip-lbl" style="margin-left:10px">Motion</span>`+sectors.map(s=>`<button class="chip ${galFilter.sector===s?'on':''}" data-fsector="${s}">${s}</button>`).join('')+
    `<span class="chip-lbl" style="margin-left:10px">Look</span>`+styles.map(s=>`<button class="chip ${galFilter.style===s?'on':''}" data-fstyle="${s}">${s}</button>`).join('');
}
function renderGallery(){
  buildFilters();
  const grid=$('#galGrid'); grid.innerHTML='';
  const brand=D?D.brand:defaultBrand();
  const M=(f,v)=>f==='All'||v===f||v==='Any';
  const list=TEMPLATES.filter(t=>M(galFilter.stage,t.stage)&&M(galFilter.sector,t.sector)&&M(galFilter.style,t.style));
  $('#galCount').textContent=`${list.length} of ${TEMPLATES.length} presets`;
  list.forEach(tpl=>{
    const th=THEMES[tpl.theme];
    const card=document.createElement('div'); card.className='tpl'; card.dataset.tpl=tpl.id;
    card.innerHTML=`<div class="tpl-prev"><span class="tpl-badge">${tpl.slides.length} slides</span><div class="slide mini"></div></div>
      <div class="tpl-body"><h3>${esc(tpl.name)}</h3><p class="bf">${esc(tpl.bestFor)}</p>
      <div class="tpl-tags"><span>${tpl.stage}</span><span>${tpl.sector}</span><span>${tpl.style}</span></div>
      <button class="btn primary tpl-use" data-use="${tpl.id}">Use this template</button></div>`;
    grid.appendChild(card);
    // mini preview = title slide
    const previewDeck={brand:Object.assign({},brand,{themeKey:tpl.theme,stage:tpl.stage!=='Any'?tpl.stage:brand.stage,sector:tpl.sector!=='Any'?tpl.sector:brand.sector}),slides:[{id:'x',type:'title',lay:'center',name:'Title',
      blocks:SLIDES.title.blocks().map(b=>({id:uid(),type:b.type,data:clone(b.data)}))}]};
    const mini=card.querySelector('.mini');
    const savedD=D; D=previewDeck; mini.innerHTML=renderSlideInner(previewDeck.slides[0],false); applyThemeTo(mini,tpl.theme,brand); D=savedD;
    requestAnimationFrame(()=>{const w=card.querySelector('.tpl-prev').clientWidth; miniScale(null,mini,w);});
  });
}
function applyThemeTo(el,themeKey,brand){
  const t=THEMES[themeKey];
  const map={'--s-head':t.head,'--s-body':t.body,'--s-mono':t.mono||F.mono,'--s-ink':t.ink,'--s-slate':t.slate,'--s-faint':t.faint,'--s-line':t.line,'--s-paper':t.paper,'--s-surface':t.surface,'--s-primary':(brand&&brand.primary)||t.primary,'--s-accent':(brand&&brand.accent)||t.accent,'--s-headw':t.headw,'--s-upper':t.upper+'em','--s-grad':t.grad||`linear-gradient(120deg,${t.primary},${t.accent})`};
  for(const k in map)el.style.setProperty(k,map[k]); el.dataset.mode=t.mode;
}
function chooseTemplate(id){
  const tpl=TEMPLATES.find(t=>t.id===id); if(!tpl)return;
  const brand=D?clone(D.brand):defaultBrand();
  delete brand.primary; delete brand.accent; // let template theme set colors fresh
  D=buildDeck(tpl,brand); cur=0; sel=null;
  $('#gallery').classList.remove('show');
  fullRender(); save(); toast('Loaded "'+tpl.name+'" — edit any slide');
}

/* ---------------- PRESENT ---------------- */
let pIdx=0;
function openPresent(){
  pIdx=cur; $('#present').classList.add('show'); $('#pTot').textContent=D.slides.length;
  renderPresent();
  if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
}
function renderPresent(){
  const el=$('#presentSlide'); el.innerHTML=renderSlideInner(D.slides[pIdx],false); applyTheme(el);
  const box=$('#present .stagebox'); const vw=window.innerWidth*0.92, vh=window.innerHeight*0.86;
  const s=Math.min(vw/1120,vh/630); el.style.transform=`scale(${s})`; el.style.transformOrigin='center';
  box.style.width=1120*s+'px'; box.style.height=630*s+'px';
  el.style.position='absolute'; el.style.top='50%'; el.style.left='50%'; el.style.margin=`${-315}px 0 0 ${-560}px`;
  $('#pNum').textContent=pIdx+1;
}
function closePresent(){$('#present').classList.remove('show');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}

/* ---------------- EXPORT ---------------- */
function exportPDF(){
  const w=window.open('','_blank');
  const css=$$('style').map(s=>s.textContent).join('\n');
  const slidesHTML=D.slides.map(s=>{
    const tmp=document.createElement('div'); tmp.className='slide'; tmp.innerHTML=renderSlideInner(s,false);
    applyTheme(tmp);
    return `<div class="psl" style="${tmp.getAttribute('style')}" data-mode="${tmp.dataset.mode}">${tmp.innerHTML}</div>`;
  }).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(D.name)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>${css}
    @page{size:1120px 630px;margin:0}
    body{margin:0;background:#fff}
    .psl{width:1120px;height:630px;position:relative;overflow:hidden;page-break-after:always;box-shadow:none;border-radius:0}
    .psl .blk-ctl{display:none!important}
    </style></head><body>${slidesHTML}
    <script>window.onload=function(){setTimeout(function(){window.print();},600);}<\/script>
    </body></html>`);
  w.document.close();
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(D,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=(D.name||'deck').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json'; a.click();
}
function importJSON(file){
  const r=new FileReader(); r.onload=()=>{try{const o=JSON.parse(r.result);if(o&&o.slides){D=o;cur=0;sel=null;$('#exportModal').classList.remove('show');fullRender();save();toast('Project opened');}else toast('Not a valid project file');}catch(e){toast('Could not read file');}};
  r.readAsText(file);
}

/* ---------------- TOAST ---------------- */
let toastT=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);}

/* ---------------- EVENTS ---------------- */
function bind(){
  // top bar
  $('#btnGallery').onclick=()=>{renderGallery();$('#gallery').classList.add('show');};
  $('#btnSave').onclick=()=>{save();toast('Saved');};
  $('#btnPresent').onclick=openPresent;
  $('#btnExport').onclick=()=>$('#exportModal').classList.add('show');
  $('#deckName').onblur=()=>{D.name=$('#deckName').innerText.trim()||'Untitled deck';save();};

  // palette tabs
  $$('.pal-tab').forEach(t=>t.onclick=()=>{palTab=t.dataset.paltab;$$('.pal-tab').forEach(x=>x.classList.toggle('on',x===t));renderPalette();});
  $('#palette').onclick=e=>{
    const s=e.target.closest('[data-addslide]'); if(s){addSlide(s.dataset.addslide);return;}
    const b=e.target.closest('[data-addblock]'); if(b){addBlock(b.dataset.addblock);renderInspector();toast(BLOCKS[b.dataset.addblock].label+' added');}
  };

  // inspector tabs
  $$('.insp-tab').forEach(t=>t.onclick=()=>{inspTab=t.dataset.insp;renderInspector();});
  $('#btnCoachToggle').onclick=()=>{inspTab='coach';renderInspector();};

  // layout picker
  const layouts=[['lead','M3 4h18M3 9h11M3 14h18M3 19h9'],['split','M3 4h18v16H3zM12 4v16'],['center','M6 6h12M4 12h16M6 18h12'],['grid','M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],['statement','M4 9h16M4 15h9']];
  $('#layoutPick').innerHTML=layouts.map(([k,p])=>`<button data-lay="${k}" title="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="${p}"/></svg></button>`).join('');
  $('#layoutPick').onclick=e=>{const b=e.target.closest('[data-lay]');if(!b)return;D.slides[cur].lay=b.dataset.lay;renderCanvas();updateReelThumb(cur);saveSoon();};

  // zoom
  const zl=['fit','0.5','0.75','1','1.25'];
  $('#zIn').onclick=()=>{let i=zl.indexOf(zoom);zoom=zl[Math.min(zl.length-1,i+1)]||'1';fitZoom();};
  $('#zOut').onclick=()=>{let i=zl.indexOf(zoom);zoom=zl[Math.max(0,i-1)]||'fit';fitZoom();};

  // canvas editing (delegated)
  const c=$('#canvas');
  c.addEventListener('input',e=>{if(e.target.classList.contains('ce')){const el=e.target;clearTimeout(harvestTimer);harvestTimer=setTimeout(()=>harvestField(el),250);}});
  c.addEventListener('click',e=>{
    const add=e.target.closest('[data-additem]'); if(add){e.preventDefault();addArrayItem(add.dataset.additem);return;}
    const wl=e.target.closest('[data-wl]'); if(wl){e.preventDefault();const bl=D.slides[cur].blocks.find(x=>x.id===wl.closest('.blk').dataset.bid);if(bl){const it=bl.data.items[+wl.dataset.wl];it.win=!it.win;renderCanvas();updateReelThumb(cur);saveSoon();}return;}
    const upi=e.target.closest('.up-img'); if(upi){pickImageFor(upi.closest('.blk').dataset.bid,'src');return;}
    const ctl=e.target.closest('.blk-ctl button'); if(ctl){e.stopPropagation();const bid=ctl.closest('.blk').dataset.bid;const a=ctl.dataset.act;if(a==='up')moveBlock(bid,-1);else if(a==='down')moveBlock(bid,1);else if(a==='dup')dupBlock(bid);else if(a==='del')delBlock(bid);return;}
    const blk=e.target.closest('.blk'); if(blk){sel=blk.dataset.bid;$$('.blk',c).forEach(x=>x.classList.toggle('sel',x===blk));}
  });

  // reel
  $('#reel').addEventListener('click',e=>{
    const ract=e.target.closest('[data-ract]'); if(ract){e.stopPropagation();const i=+ract.closest('.reel-item').dataset.i;if(ract.dataset.ract==='dup')dupSlide(i);else delSlide(i);return;}
    const item=e.target.closest('.reel-item'); if(item){cur=+item.dataset.i;sel=null;renderCanvas();renderInspector();$$('.reel-item').forEach(x=>x.classList.toggle('on',x===item));}
  });
  $('#reelAdd').onclick=()=>{palTab='slides';$$('.pal-tab').forEach(x=>x.classList.toggle('on',x.dataset.paltab==='slides'));renderPalette();toast('Pick a slide type on the left');};

  // inspector delegated (brand/deck)
  $('#inspBody').addEventListener('input',e=>{
    const bf=e.target.dataset.brand; if(bf){D.brand[bf]=e.target.value;renderCanvas();renderReel();saveSoon();}
    const col=e.target.dataset.color; if(col){D.brand[col]=e.target.value;const row=e.target.closest('.colorrow');if(row)row.querySelector('.cv').textContent=e.target.value;renderCanvas();renderReel();saveSoon();}
  });
  $('#inspBody').addEventListener('change',e=>{const bf=e.target.dataset.brand;if(bf&&e.target.tagName==='SELECT'){D.brand[bf]=e.target.value;renderCanvas();saveSoon();}});
  $('#inspBody').addEventListener('click',e=>{
    const sw=e.target.closest('[data-theme]'); if(sw){D.brand.themeKey=sw.dataset.theme;delete D.brand.primary;delete D.brand.accent;renderCanvas();renderReel();renderInspector();saveSoon();toast(THEMES[sw.dataset.theme].name);return;}
    if(e.target.id==='logoUpBtn'){$('#logoFile').click();}
    if(e.target.id==='logoClr'){D.brand.logo=null;renderCanvas();renderReel();renderInspector();saveSoon();}
    if(e.target.closest('.up-logo')){$('#logoFile').click();}
    if(e.target.id==='applyBrandAll'){reapplyBrand();}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='logoFile'&&e.target.files[0]){readImage(e.target.files[0],src=>{D.brand.logo=src;renderCanvas();renderReel();renderInspector();saveSoon();});}
  });

  // gallery
  $('#galFilters').onclick=e=>{
    const b=e.target.closest('[data-fstage],[data-fsector],[data-fstyle]'); if(!b)return;
    if(b.dataset.fstage!=null)galFilter.stage=b.dataset.fstage;
    if(b.dataset.fsector!=null)galFilter.sector=b.dataset.fsector;
    if(b.dataset.fstyle!=null)galFilter.style=b.dataset.fstyle;
    renderGallery();
  };
  $('#galGrid').onclick=e=>{const u=e.target.closest('[data-use]');const card=e.target.closest('[data-tpl]');const id=u?u.dataset.use:(card?card.dataset.tpl:null);if(id)chooseTemplate(id);};

  // export modal
  $('#expClose').onclick=()=>$('#exportModal').classList.remove('show');
  $('#expPdf').onclick=exportPDF; $('#expJson').onclick=exportJSON;
  $('#expOpen').onclick=()=>$('#fileOpen').click();
  $('#fileOpen').onchange=e=>{if(e.target.files[0])importJSON(e.target.files[0]);};

  // present
  $('#pNext').onclick=()=>{if(pIdx<D.slides.length-1){pIdx++;renderPresent();}};
  $('#pPrev').onclick=()=>{if(pIdx>0){pIdx--;renderPresent();}};
  $('#pExit').onclick=closePresent;

  // keyboard
  document.addEventListener('keydown',e=>{
    if($('#present').classList.contains('show')){
      if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();if(pIdx<D.slides.length-1){pIdx++;renderPresent();}}
      if(e.key==='ArrowLeft'){if(pIdx>0){pIdx--;renderPresent();}}
      if(e.key==='Escape')closePresent();
      return;
    }
    if($('#gallery').classList.contains('show')){if(e.key==='Escape')$('#gallery').classList.remove('show');return;}
    if(e.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(e.key==='ArrowDown'||e.key==='j'){if(cur<D.slides.length-1){cur++;sel=null;renderCanvas();renderInspector();renderReel();}}
    if(e.key==='ArrowUp'||e.key==='k'){if(cur>0){cur--;sel=null;renderCanvas();renderInspector();renderReel();}}
    if((e.metaKey||e.ctrlKey)&&e.key==='s'){e.preventDefault();save();toast('Saved');}
  });

  window.addEventListener('resize',()=>{fitZoom();if($('#present').classList.contains('show'))renderPresent();});
}
function pickImageFor(bid,field){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=()=>{if(inp.files[0])readImage(inp.files[0],src=>{const b=D.slides[cur].blocks.find(x=>x.id===bid);if(b){b.data[field]=src;renderCanvas();updateReelThumb(cur);saveSoon();}});};
  inp.click();
}
function readImage(file,cb){const r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file);}
function refreshTokenFields(){/* company/sector text is only in title/contact placeholders; re-render already reflects footer. */}
function reapplyBrand(){
  // Re-fill any field still equal to its template default token-resolved value would be complex;
  // Simplest safe behavior: refresh footer + title/contact name/url/email that match brand.
  renderCanvas();renderReel();toast('Brand re-applied');
}

/* ---------------- BOOT ---------------- */
function boot(){
  bind();
  if(!load()){
    // first run — open gallery, seed a default deck behind it
    D=buildDeck(TEMPLATES.find(t=>t.id==='strategic'),defaultBrand());
    fullRender();
    renderGallery(); $('#gallery').classList.add('show');
  }else{
    fullRender();
  }
  renderPalette();
}
document.addEventListener('DOMContentLoaded',boot);
})();
