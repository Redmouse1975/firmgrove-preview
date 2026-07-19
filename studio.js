/* ===================================================================
   FIRMGROVE — PITCH DECK STUDIO
   A block-based, template-driven investor deck builder.
   Grounded in DocSend / Sequoia / YC / Kawasaki research.
   Zero dependencies, self-contained, works offline.
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
  comptable:{group:true,wide:true,label:'Competition table',render:(d,ed)=>{
    const cols=d.cols||[];return `<div class="b-comp"><table><thead><tr><th></th>${cols.map((c,i)=>`<th class="${i===0?'us':''}">${cei('cols',i,c)}</th>`).join('')}</tr></thead><tbody>${(d.rows||[]).map((r,ri)=>`<tr><td class="rl">${cei('rows',ri,r.name,'span','','name')}</td>${(r.vals||[]).map((v,vi)=>`<td class="${vi===0?'us':''}">${v==='●'||v==='○'?`<span class="dot ${v==='●'?'on':''}"></span>`:cei2(ri,vi,v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}},
  matrix:{group:true,wide:true,label:'2×2 positioning',render:(d)=>`<div class="b-matrix"><div class="ylab">${ce('ytop',d.ytop,'span')}</div><div class="mgrid"><div class="quad q1"></div><div class="quad q2"></div><div class="quad q3"></div><div class="quad q4 win"><span class="us">${ce('us',d.us,'span')}</span></div><div class="axis-x"></div><div class="axis-y"></div>${(d.items||[]).map((m,i)=>`<span class="mdot" style="left:${m.x}%;top:${m.y}%">${cei('items',i,m.name,'span','','name')}</span>`).join('')}</div><div class="ylab bot">${ce('ybot',d.ybot,'span')}</div><div class="xrow"><span>${ce('xleft',d.xleft,'span')}</span><span>${ce('xright',d.xright,'span')}</span></div></div>`},
  funds:{group:true,wide:true,label:'Use of funds',render:(d)=>{const items=d.items||[];return `<div class="b-funds">${items.map((m,i)=>`<div class="frow"><div class="fl">${cei('items',i,m.label,'span','','label')}<b>${cei('items',i,m.pct,'span','','pct')}%</b></div><div class="fbar"><i style="width:${Math.min(100,+m.pct||0)}%"></i></div></div>`).join('')}</div>`;}},
  roadmap:{group:true,wide:true,label:'Roadmap',render:(d,ed)=>`<div class="b-road">${(d.items||[]).map((m,i)=>`<div class="rstep"><div class="rdot"></div><b>${cei('items',i,m.when,'span','','when')}</b><span>${cei('items',i,m.what,'span','','milestone')}</span></div>`).join('')}</div>`},
  image:{group:false,wide:true,label:'Image / screenshot',render:(d,ed)=>`<figure class="b-image ${d.src?'has':''}"><div class="imgbox up-img" data-f="src">${d.src?`<img src="${d.src}" alt="">`:`<div class="imgph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>${ed?'Click to add image':''}</span></div>`}</div><figcaption>${ce('caption',d.caption,'span','','Caption')}</figcaption></figure>`},
  spacer:{group:false,label:'Spacer',render:()=>`<div class="b-spacer"></div>`}
};
function cei2(ri,vi,v){return `<span class="ce" data-f="rowvals" data-i="${ri}" data-k="${vi}"${ceAttr()}>${esc(v)}</span>`;}
function addItem(t){return `<button class="blk-add btn sm" data-additem="${t}">+ add</button>`;}

/* ---------------- SLIDE DEFINITIONS (canonical + coach) ---------------- */
const B=(type,data={})=>({type,data});
const SLIDES={
  title:{label:'Title',lay:'center',icon:'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    coach:{purpose:'Name, one-line tagline, and what you do in plain words. This is the filter slide — investors who clear the first three pages are far likelier to finish.',words:16,secs:15,attn:'High',
    tips:['One tagline a stranger understands in 5 seconds','No jargon, no mission-speak — say what you do','Add contact + round so it can travel']},
    blocks:()=>[B('kicker',{text:'{{sector}} · {{stage}}'}),B('headline',{text:'{{company}}'}),B('subhead',{text:'{{tagline}}'}),B('contact',{name:'{{founder}}',email:'{{email}}',url:'{{url}}'})]},
  purpose:{label:'Purpose',lay:'center',icon:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8',
    coach:{purpose:'Sequoia\'s "company purpose": a single declarative sentence for why the company exists. Ground the whole deck.',words:20,secs:12,attn:'Med',
    tips:['One sentence, present tense','Aspirational but concrete','This is the line they repeat to their partners']},
    blocks:()=>[B('kicker',{text:'Our purpose'}),B('headline',{text:'{{company}} exists to ______.'}),B('subhead',{text:'The single reason we get out of bed.'})]},
  problem:{label:'Problem',lay:'split',icon:'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    coach:{purpose:'The pain, who has it, and what it costs. Concrete and specific — Airbnb led with this. Make the reader feel it before you pitch.',words:32,secs:24,attn:'High',
    tips:['Name the exact moment the pain is felt','Quantify the cost of the status quo','Avoid strawman problems no one pays to fix']},
    blocks:()=>[B('kicker',{text:'The problem'}),B('headline',{text:'Today, this is broken — and it costs real money.'}),B('bullets',{items:['Who feels the pain, and when','Why the current workarounds fail','What it costs them every month']}),B('stat',{value:'$—B',label:'lost every year to the status quo',source:'add your source'})]},
  solution:{label:'Solution',lay:'split',icon:'M9 21h6M12 3a6 6 0 0 0-4 10.5c.7.8 1 1.3 1 2.5h6c0-1.2.3-1.7 1-2.5A6 6 0 0 0 12 3z',
    coach:{purpose:'How you solve it and why it is 10× better. Reframe the behavior. Pair it visually against the problem.',words:30,secs:20,attn:'Med',
    tips:['State the "aha" in one sentence','Show the 10× — not 10% — improvement','Map each pillar back to a pain point']},
    blocks:()=>[B('kicker',{text:'The solution'}),B('headline',{text:'{{company}} makes it effortless.'}),B('features',{items:[{title:'Pillar one',desc:'The core capability that removes the pain.'},{title:'Pillar two',desc:'What makes it 10× better, not 10%.'},{title:'Pillar three',desc:'Why it compounds over time.'}]})]},
  whynow:{label:'Why now',lay:'lead',icon:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
    coach:{purpose:'The market, tech, or regulatory shift that makes this possible today. Sequoia weighs this heavily — it separates a good idea from a timely one.',words:28,secs:18,attn:'High',
    tips:['Name the shift that opened the window','Explain why it could not be built 5 years ago','Show the trend line, not just the claim']},
    blocks:()=>[B('kicker',{text:'Why now'}),B('headline',{text:'A shift just made this inevitable.'}),B('bullets',{items:['The technology / cost curve that flipped','The behavior or regulation that changed','Why the window is open now — and closing']})]},
  market:{label:'Market size',lay:'split',icon:'M3 3v18h18M7 14l4-4 4 4 5-6',
    coach:{purpose:'TAM / SAM / SOM — ideally bottoms-up. Airbnb used concrete comparables, not abstract billions. Build it from unit economics, not a McKinsey chart.',words:26,secs:20,attn:'Med',
    tips:['Bottoms-up: # customers × price beats top-down','Be honest about SOM — the beachhead you can win','Show the path from SOM to SAM']},
    blocks:()=>[B('kicker',{text:'Market'}),B('headline',{text:'Large, growing, and reachable.'}),B('tamsamsom',{tamv:'$—B',taml:'Total addressable market',samv:'$—B',saml:'Serviceable market',somv:'$—M',soml:'What we win first',note:'Built bottoms-up: target customers × annual contract value.'})]},
  product:{label:'Product',lay:'split',icon:'M2 3h20v14H2zM8 21h8M12 17v4',
    coach:{purpose:'How it works — demo or screenshots. Investors spend the least time here, so keep it visual and show the product doing the job.',words:22,secs:14,attn:'Low',
    tips:['Show, don\'t describe — real screens','One workflow, start to finish','Cut feature lists; keep the money shot']},
    blocks:()=>[B('kicker',{text:'Product'}),B('headline',{text:'See it work.'}),B('image',{src:null,caption:'The core workflow, end to end.'})]},
  model:{label:'Business model',lay:'split',icon:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    coach:{purpose:'How you make money: pricing, take rate, and a unit-economics primer. Make the revenue mechanism obvious.',words:24,secs:18,attn:'Med',
    tips:['One clear pricing unit','Show contribution margin, not just price','Tie revenue to a metric that scales']},
    blocks:()=>[B('kicker',{text:'Business model'}),B('headline',{text:'How we make money.'}),B('metrics',{items:[{value:'$—',label:'per unit / seat / mo',delta:''},{value:'—%',label:'gross margin',delta:''},{value:'$—',label:'ACV',delta:''}]}),B('text',{text:'Pricing logic in one line: what the customer pays, and why it scales with their value.'})]},
  traction:{label:'Traction',lay:'split',icon:'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
    coach:{purpose:'Revenue / user growth, key metrics, logos, retention. The proof slide. Lead with it if it is your strongest asset (Buffer did).',words:24,secs:22,attn:'High',
    tips:['A chart that goes up and to the right','Growth rate + retention beat raw totals','Name-brand logos earn trust fast']},
    blocks:()=>[B('kicker',{text:'Traction'}),B('headline',{text:'It\'s working.'}),B('chart',{title:'Revenue, last 6 periods',unit:'$K MRR',points:[{label:'Q1',value:'12'},{label:'Q2',value:'21'},{label:'Q3',value:'34'},{label:'Q4',value:'58'},{label:'Q5',value:'92'},{label:'Q6',value:'140'}]}),B('metrics',{items:[{value:'—%',label:'MoM growth',delta:''},{value:'—%',label:'net retention',delta:''},{value:'—',label:'paying customers',delta:''}]})]},
  gtm:{label:'Go-to-market',lay:'lead',icon:'M4 4h16v4H4zM4 12h16v8H4zM8 8v4',
    coach:{purpose:'How you acquire customers: channels, funnel, CAC and payback. Often merged with business model at seed.',words:26,secs:16,attn:'Med',
    tips:['One repeatable channel that works today','CAC and payback, if you have them','Show the wedge, then the expansion']},
    blocks:()=>[B('kicker',{text:'Go-to-market'}),B('headline',{text:'A repeatable path to customers.'}),B('features',{items:[{title:'Wedge',desc:'The first channel that reliably converts.'},{title:'Motion',desc:'Self-serve, sales-led, or hybrid — and why.'},{title:'Expansion',desc:'How accounts grow after landing.'}]})]},
  competition:{label:'Competition',lay:'split',icon:'M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7',
    coach:{purpose:'The landscape (2×2 or matrix) plus your defensibility. Never say "no competition" — show why you win the quadrant that matters.',words:22,secs:18,attn:'Med',
    tips:['Pick axes where you own the top-right','Name real alternatives, including "do nothing"','End on the moat that compounds']},
    blocks:()=>[B('kicker',{text:'Competition'}),B('headline',{text:'Why we win.'}),B('matrix',{ytop:'Real-time',ybot:'Batch',xleft:'Generic',xright:'Purpose-built',us:'{{company}}',items:[{name:'Incumbent A',x:22,y:70},{name:'Incumbent B',x:60,y:30},{name:'Legacy',x:18,y:24}]})]},
  team:{label:'Team',lay:'grid',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    coach:{purpose:'Why THIS team wins. DocSend: investors spend more time here than any other slide. Sell founder-market fit.',words:24,secs:26,attn:'Highest',
    tips:['Lead with the unfair, specific advantage','One credential per founder — the relevant one','Advisors only if they truly move the needle']},
    blocks:()=>[B('kicker',{text:'Team'}),B('headline',{text:'Built by the people who should build this.'}),B('founders',{items:[{name:'Founder One',role:'CEO',cred:'The relevant, unfair credential.'},{name:'Founder Two',role:'CTO',cred:'Shipped the hard thing before.'}]})]},
  financials:{label:'Financials',lay:'split',icon:'M3 3v18h18M7 15l3-3 3 3 5-6',
    coach:{purpose:'3–5 year projections and key assumptions. Second-highest attention slide — make the assumptions legible and defensible.',words:20,secs:24,attn:'High',
    tips:['Show the assumptions, not just the hockey stick','Tie growth to a driver you can influence','Know your burn and your runway cold']},
    blocks:()=>[B('kicker',{text:'Financials'}),B('headline',{text:'The model, and what drives it.'}),B('chart',{title:'Revenue projection',unit:'$M ARR',points:[{label:'Y1',value:'0.4'},{label:'Y2',value:'1.8'},{label:'Y3',value:'6'},{label:'Y4',value:'16'},{label:'Y5',value:'38'}]}),B('text',{text:'Key assumption: the one input the whole model turns on.'})]},
  ask:{label:'The ask',lay:'split',icon:'M12 2v20M2 12h20',
    coach:{purpose:'Amount raising, use-of-funds split, and the 18–24 month milestone it buys. Be specific — this is the call to action.',words:22,secs:18,attn:'High',
    tips:['State the number and the round','Tie funds to the milestone they unlock','Show the metric you\'ll hit before the next round']},
    blocks:()=>[B('kicker',{text:'The ask'}),B('ask',{amount:'$—M',round:'Seed round',detail:'To reach {{milestone}} over the next 18–24 months.'}),B('funds',{items:[{label:'Product & engineering',pct:'45'},{label:'Go-to-market',pct:'35'},{label:'Operations',pct:'20'}]})]},
  unit:{label:'Unit economics',lay:'grid',icon:'M4 4h16v16H4zM4 10h16M10 10v10',
    coach:{purpose:'CAC, LTV, payback, gross margin. The engine investors underwrite at Series A. Show the machine is efficient.',words:18,secs:18,attn:'High',
    tips:['LTV:CAC and payback in months','Margins by cohort if you have them','Prove the model improves with scale']},
    blocks:()=>[B('kicker',{text:'Unit economics'}),B('headline',{text:'The engine is efficient.'}),B('metrics',{items:[{value:'—:1',label:'LTV : CAC',delta:''},{value:'— mo',label:'CAC payback',delta:''},{value:'—%',label:'gross margin',delta:''},{value:'—%',label:'net revenue retention',delta:''}]})]},
  roadmap:{label:'Roadmap',lay:'lead',icon:'M2 12h20M2 12l4-4M2 12l4 4M22 6v12',
    coach:{purpose:'Phased milestones on a timeline. Show you know what you\'ll prove next, and when.',words:20,secs:16,attn:'Med',
    tips:['Milestones, not features','Tie each phase to a metric','Make the next-round proof point obvious']},
    blocks:()=>[B('kicker',{text:'Roadmap'}),B('headline',{text:'What we prove next.'}),B('roadmap',{items:[{when:'Now',what:'Where we are today.'},{when:'6 mo',what:'The next proof point.'},{when:'12 mo',what:'What unlocks the next round.'},{when:'24 mo',what:'The scale milestone.'}]})]},
  testimonials:{label:'Proof / press',lay:'grid',icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    coach:{purpose:'Customer quotes, press, or design partners. Third-party proof that others already believe.',words:20,secs:14,attn:'Med',
    tips:['Real names and logos beat anonymous praise','Quote the outcome, not the compliment','One strong quote > three weak ones']},
    blocks:()=>[B('kicker',{text:'What they say'}),B('quote',{text:'"The specific, outcome-focused thing a real customer said."',who:'— Name, Title, Company'}),B('logos',{items:['Logo','Logo','Logo','Logo']})]},
  partners:{label:'Partners',lay:'grid',icon:'M20 6 9 17l-5-5',
    coach:{purpose:'Distribution, integration, or channel partners that de-risk go-to-market.',words:18,secs:12,attn:'Low',
    tips:['Signed beats "in conversation"','Explain what each partner unlocks','Only include partners that change the story']},
    blocks:()=>[B('kicker',{text:'Partners'}),B('headline',{text:'We don\'t go alone.'}),B('logos',{items:['Partner','Partner','Partner','Partner','Partner','Partner']})]},
  vision:{label:'Vision',lay:'center',icon:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    coach:{purpose:'The aspirational end-state. Zoom out and leave them with where this goes if it works.',words:20,secs:12,attn:'Med',
    tips:['Paint the world once you\'ve won','Ambitious but earned by the deck','End on a line they remember']},
    blocks:()=>[B('kicker',{text:'The vision'}),B('headline',{text:'Where this goes.'}),B('subhead',{text:'The category we build if this works.'})]},
  contact:{label:'Closing',lay:'center',icon:'M4 4h16v16H4zM22 6l-10 7L2 6',
    coach:{purpose:'Thank-you and how to reach you. Repeat the one-liner and the ask so the last thing they see is the point.',words:14,secs:10,attn:'Low',
    tips:['Restate the one-liner','Make contact effortless','Leave the ask on screen']},
    blocks:()=>[B('kicker',{text:'Let\'s talk'}),B('headline',{text:'{{company}}'}),B('subhead',{text:'{{tagline}}'}),B('contact',{name:'{{founder}}',email:'{{email}}',url:'{{url}}'})]}
};

/* ---------------- TEMPLATE CATALOG (50) ---------------- */
const SPINE=['title','purpose','problem','solution','whynow','market','product','model','traction','competition','team','financials','ask'];
function T(id,name,bestFor,stage,sector,style,theme,slides){return {id,name,bestFor,stage,sector,style,theme,slides};}
const TEMPLATES=[
  // --- Real / famous decks ---
  T('airbnb','Airbnb Seed','Problem-led narrative with concrete market comparables','Seed','Marketplace','Narrative','narrative',['title','problem','solution','market','product','model','traction','competition','team','ask']),
  T('sequoia','Sequoia Template','The canonical 10-section VC checklist','Seed','Any','Minimal','mono',['title','purpose','problem','solution','whynow','market','competition','product','model','team','financials','ask']),
  T('yc','YC Standard Seed','One claim per slide, built for fast reading','Seed','Any','Minimal','slate',['title','problem','solution','market','product','traction','model','team','ask','vision']),
  T('buffer','Buffer','Traction-led — proof on slide two','Seed','SaaS','Data','analyst',['title','traction','problem','solution','market','model','competition','team','ask']),
  T('front','Front','Clean B2B SaaS narrative','Series A','SaaS','Enterprise','enterprise',['title','problem','solution','product','market','model','traction','unit','competition','team','financials','ask']),
  T('linkedin','LinkedIn Series B','Analytical, pre-empts the revenue question','Series B','Consumer','Data','analyst',['title','purpose','problem','solution','market','product','traction','model','competition','financials','team','ask']),
  T('intercom','Intercom 8-Slide','Extreme economy — eight slides, no filler','Seed','SaaS','Minimal','mono',['title','problem','solution','product','model','traction','team','ask']),
  T('mixpanel','Mixpanel','Opens on a hard data insight; metrics-forward','Series B','SaaS','Data','analyst',['title','whynow','problem','solution','product','traction','unit','market','competition','team','financials','ask']),
  T('coinbase','Coinbase Seed','Thesis-driven, simple, crypto-native','Seed','Crypto','Dark','crypto',['title','purpose','whynow','problem','solution','product','market','model','traction','team','ask']),
  T('brex','Brex Series B','Show-don\'t-tell problem, growth & retention','Series B','Fintech','Fintech','fintech',['title','problem','solution','product','traction','unit','market','model','competition','team','financials','ask']),
  T('snapchat','Snapchat','Consumer, visual, product-first, minimal text','Seed','Consumer','Consumer','consumer',['title','problem','solution','product','traction','market','model','competition','team','ask']),
  T('uber','Uber Early','Vision-heavy, city-by-city expansion logic','Seed','Marketplace','Bold','gradient',['title','purpose','problem','solution','whynow','market','product','model','traction','competition','team','ask','vision']),
  T('dropbox','Dropbox','Freemium, bottom-up adoption thesis','Seed','SaaS','Minimal','slate',['title','problem','solution','product','whynow','market','model','traction','competition','team','ask']),
  T('revolut','Revolut Seed','Pre-product traction hook, challenger fintech','Seed','Fintech','Fintech','fintech',['title','problem','solution','product','traction','market','model','whynow','competition','team','ask']),
  T('canva','Canva Seed','Product-led, "better than offline" framing','Seed','SaaS','Bold','gradient',['title','problem','solution','product','whynow','market','model','traction','competition','team','ask']),
  T('wealthsimple','Wealthsimple','Mission-led, democratize-access fintech','Seed','Fintech','Consumer','consumer',['title','purpose','problem','solution','product','market','model','traction','team','ask']),
  T('doordash','DoorDash','Marketplace liquidity + logistics thesis','Series A','Marketplace','Enterprise','enterprise',['title','problem','solution','market','product','model','traction','unit','competition','team','financials','ask']),
  T('peloton','Peloton','Hardware + subscription, connected experience','Series C','Hardware','Consumer','consumer',['title','problem','solution','product','whynow','market','model','traction','roadmap','competition','team','financials','ask']),
  T('snyk','Snyk Seed','Open-source, bottom-up developer motion','Seed','Deeptech','Deeptech','deeptech',['title','problem','solution','product','whynow','market','model','traction','competition','team','ask']),
  T('youtube','YouTube Series A','Small users, explosive view-growth trajectory','Series A','Consumer','Bold','gradient',['title','problem','solution','product','traction','market','model','competition','team','ask']),

  // --- Stylistic / structural archetypes ---
  T('mono-min','Minimalist Mono','Single accent, whitespace, one claim per slide','Any','Any','Minimal','mono',SPINE),
  T('editorial','Editorial Serif','Magazine typography, narrative captions','Any','Consumer','Narrative','editorial',['title','purpose','problem','solution','whynow','market','product','model','traction','competition','team','financials','ask','vision']),
  T('bold-grad','Bold Gradient','Vibrant gradients, large type, high energy','Seed','Consumer','Bold','gradient',SPINE),
  T('analyst','Analyst Data-Room','Chart-forward, dense metrics, Series A+','Series A','SaaS','Data','analyst',['title','problem','solution','market','product','model','traction','unit','financials','competition','team','roadmap','ask']),
  T('darkneon','Dark Mode','Dark canvas, neon accents, dev-tools & crypto','Seed','Deeptech','Dark','dark',SPINE),
  T('narrative','Deck-as-Story','Problem→proof argument that reads in sequence','Seed','Any','Narrative','narrative',['title','problem','whynow','solution','product','market','traction','model','competition','team','ask','vision']),
  T('plg','Product-Led','Hero product visuals dominate every slide','Seed','SaaS','Bold','ai',['title','problem','solution','product','traction','market','model','unit','competition','team','ask']),
  T('b2b','Enterprise B2B','Logo walls, ROI, security, procurement-ready','Series A','SaaS','Enterprise','enterprise',['title','problem','solution','product','model','traction','testimonials','partners','competition','unit','team','financials','ask']),
  T('consumer','Consumer Lifestyle','Lifestyle imagery, emotional hook, brand-forward','Seed','Consumer','Consumer','consumer',['title','problem','solution','product','whynow','market','traction','model','competition','team','ask']),
  T('deeptech','Deeptech Scientific','Problem+market first, technical validation, IP','Seed','Deeptech','Deeptech','deeptech',['title','problem','whynow','solution','product','market','roadmap','model','competition','team','ask']),
  T('marketplace','Marketplace Two-Sided','Supply/demand liquidity, GMV, take rate','Seed','Marketplace','Data','analyst',['title','problem','solution','market','product','model','traction','unit','competition','team','ask']),
  T('saas','SaaS Metrics','ARR, NRR, CAC/LTV, cohort retention','Series A','SaaS','Data','slate',['title','problem','solution','product','model','traction','unit','financials','competition','team','roadmap','ask']),
  T('fintech','Fintech Regulated','Take-rate model + compliance posture up front','Seed','Fintech','Fintech','fintech',['title','problem','solution','product','whynow','model','traction','market','competition','team','ask']),
  T('biotech','Biotech Pipeline','Pipeline chart, regulatory timeline, IP, science team','Seed','Biotech','Clinical','biotech',['title','problem','whynow','solution','product','roadmap','market','model','competition','team','ask']),
  T('climate','Climate & Energy','Cost curve vs incumbents, policy tailwinds, scale','Seed','Climate','Climate','climate',['title','problem','whynow','solution','product','market','model','roadmap','traction','competition','team','ask']),
  T('hardware','Hardware','BOM cost-down, manufacturing, hardware+SaaS mix','Seed','Hardware','Enterprise','enterprise',['title','problem','solution','product','whynow','market','model','roadmap','traction','competition','team','ask']),
  T('ai-native','AI-Native','Model/data moat, why-now compute shift, evals','Seed','AI','Bold','ai',['title','problem','whynow','solution','product','market','model','traction','competition','team','ask']),
  T('demoday','Demo Day','Punchy 8-slide, single metric forward','Pre-seed','Any','Bold','gradient',['title','problem','solution','traction','market','model','team','ask']),
  T('kawasaki','Kawasaki 10/20/30','Strict 10 slides, big type, timing-disciplined','Any','Any','Minimal','mono',['title','problem','solution','model','whynow','competition','gtm','traction','team','ask']),
  T('preseed','Pre-Seed Story','Team + vision + why-now; light on numbers','Pre-seed','Any','Narrative','editorial',['title','purpose','problem','solution','whynow','market','product','team','roadmap','ask']),

  T('seriesa','Series A Standard','Traction-heavy with unit economics & retention','Series A','SaaS','Data','analyst',['title','problem','solution','product','market','model','traction','unit','financials','competition','gtm','team','ask']),
  T('seriesb','Series B Scale','Scale metrics, efficiency, market expansion','Series B','SaaS','Enterprise','enterprise',['title','purpose','traction','unit','financials','model','market','product','competition','roadmap','team','ask']),
  T('vision-first','Vision-First','Opens on the big vision, then earns it back','Seed','Any','Bold','ai',['title','vision','problem','solution','whynow','market','product','traction','model','team','ask']),
  T('proof','Proof-Heavy','Traction, testimonials, and logos throughout','Series A','SaaS','Enterprise','slate',['title','problem','solution','traction','testimonials','product','model','unit','market','competition','team','ask']),
  T('clean-b2b','Clean Enterprise','Restrained, ROI-driven, buyer-committee friendly','Series A','SaaS','Enterprise','enterprise',['title','problem','solution','product','model','unit','traction','testimonials','competition','team','financials','ask']),
  T('flywheel','Marketplace Flywheel','Network-effect flywheel and cold-start solve','Seed','Marketplace','Bold','gradient',['title','problem','solution','whynow','market','product','model','traction','competition','team','ask','vision']),
  T('data-story','Data Storyteller','Every claim backed by a chart','Series A','Data/AI','Data','analyst',['title','whynow','problem','solution','market','product','traction','unit','financials','competition','team','ask']),
  T('mono-dark','Mono Dark','Monochrome dark, restrained, technical','Seed','Deeptech','Dark','deeptech',SPINE),
  T('brandforward','Brand-Forward','Type-led, opinionated, consumer brand','Seed','Consumer','Consumer','consumer',['title','purpose','problem','solution','product','market','traction','model','competition','team','ask','vision']),
  T('classic','Classic VC','The safe, complete, no-surprises deck','Seed','Any','Minimal','slate',SPINE)
];

/* ---------------- STATE ---------------- */
const LS='fg.deck.v2';
let D=null, cur=0, sel=null, zoom='fit', palTab='slides', inspTab='coach';

function defaultBrand(){return {company:'Northwind',tagline:'The revenue layer for modern commerce',
  founder:'Founder Name',email:'founder@northwind.co',url:'northwind.co',milestone:'$3M ARR and profitability in the first market',
  stage:'Seed',sector:'SaaS',logo:null,themeKey:'editorial'};}

function fillTokens(str,brand){
  const b=brand||{};
  return String(str==null?'':str)
    .replace(/\{\{company\}\}/g,b.company||'').replace(/\{\{tagline\}\}/g,b.tagline||'')
    .replace(/\{\{founder\}\}/g,b.founder||'').replace(/\{\{email\}\}/g,b.email||'')
    .replace(/\{\{url\}\}/g,b.url||'').replace(/\{\{milestone\}\}/g,b.milestone||'')
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
  {g:'Core spine',items:['title','problem','solution','market','product','model','traction','team','ask']},
  {g:'High-signal',items:['purpose','whynow','competition','financials','unit','vision']},
  {g:'Supporting',items:['gtm','roadmap','testimonials','partners','contact']}
];
const BLOCK_GROUPS=[
  {g:'Text',items:['kicker','headline','subhead','text','bullets','quote','stat']},
  {g:'Groups',items:['metrics','features','founders','logos','roadmap','funds']},
  {g:'Data & visuals',items:['chart','tamsamsom','comptable','matrix','image']},
  {g:'Utility',items:['ask','contact','spacer']}
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
  const nS=D.slides.length, band=nS>=11&&nS<=20;
  return `<div class="coach">
    <div class="ck">Slide coach · ${esc(def.label)}</div>
    <p class="cp">${esc(c.purpose)}</p>
    <div class="cm">
      <div class="cmt"><div class="v">${c.attn}</div><div class="k">Investor attention</div></div>
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
        <div class="mt"><span>Length</span><span style="color:${band?'var(--sage)':'var(--rose)'}">${nS} slides ${band?'· in the 11–20 sweet spot':'· aim for 11–20'}</span></div>
        <div class="bar"><i style="width:${Math.min(100,nS/20*100)}%"></i></div>
      </div>
      <div class="cm">
        <div class="cmt"><div class="v">${Math.floor(readSec/60)}m ${readSec%60}s</div><div class="k">Est. read time</div></div>
        <div class="cmt"><div class="v">${totalW}</div><div class="k">Total words</div></div>
      </div>
      <div class="tip" style="margin-top:4px">Investors spend ~3m 44s on a first read (DocSend). Team &amp; Financials get the most attention — Product the least.</div>
    </div>
  </div>`;
}
function brandHTML(){
  const b=D.brand, t=THEMES[b.themeKey];
  return `<div class="insp-body">
    <div class="field"><label>Company name</label><input type="text" data-brand="company" value="${esc(b.company)}"></div>
    <div class="field"><label>Tagline — what you do, plainly</label><textarea data-brand="tagline">${esc(b.tagline)}</textarea></div>
    <div class="field"><label>Logo</label>
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
    <div class="field"><label>Founder / contact name</label><input type="text" data-brand="founder" value="${esc(b.founder)}"></div>
    <div class="field"><label>Email</label><input type="text" data-brand="email" value="${esc(b.email)}"></div>
    <div class="field"><label>Website</label><input type="text" data-brand="url" value="${esc(b.url)}"></div>
    <div class="field"><label>Stage</label><select data-brand="stage">${['Pre-seed','Seed','Series A','Series B'].map(s=>`<option ${b.stage===s?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="field"><label>Sector</label><input type="text" data-brand="sector" value="${esc(b.sector)}"></div>
    <div class="field"><label>18–24 month milestone (for the ask)</label><textarea data-brand="milestone">${esc(b.milestone)}</textarea></div>
    <div style="border-top:1px solid var(--line);margin:4px 0 14px"></div>
    <p style="font-size:11.5px;color:var(--faint);line-height:1.5">These fields flow live into every slide that still uses the matching placeholder — the title, contact, ask and footer update as you type. Once you edit that text directly on a slide, your wording is kept and stops tracking.</p>
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
    image:{src:null,caption:'Caption'},ask:{amount:'$—M',round:'Seed round',detail:'To reach the next milestone.'},
    contact:{name:'{{founder}}',email:'{{email}}',url:'{{url}}'},spacer:{}
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
function addArrayItem(type){
  const s=D.slides[cur], bl=s.blocks.find(b=>b.id===sel)||s.blocks.slice().reverse().find(b=>b.type===type);
  if(!bl)return;
  const d=bl.data;
  if(type==='bullets')d.items.push('New point');
  else if(type==='chart')d.points.push({label:'Q'+(d.points.length+1),value:'0'});
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
  const stages=['All',...new Set(TEMPLATES.map(t=>t.stage))];
  const sectors=['All',...new Set(TEMPLATES.map(t=>t.sector))];
  const styles=['All',...new Set(TEMPLATES.map(t=>t.style))];
  el.innerHTML=
    `<span class="chip-lbl">Stage</span>`+stages.map(s=>`<button class="chip ${galFilter.stage===s?'on':''}" data-fstage="${s}">${s}</button>`).join('')+
    `<span class="chip-lbl" style="margin-left:10px">Sector</span>`+sectors.map(s=>`<button class="chip ${galFilter.sector===s?'on':''}" data-fsector="${s}">${s}</button>`).join('')+
    `<span class="chip-lbl" style="margin-left:10px">Style</span>`+styles.map(s=>`<button class="chip ${galFilter.style===s?'on':''}" data-fstyle="${s}">${s}</button>`).join('');
}
function renderGallery(){
  buildFilters();
  const grid=$('#galGrid'); grid.innerHTML='';
  const brand=D?D.brand:defaultBrand();
  const list=TEMPLATES.filter(t=>
    (galFilter.stage==='All'||t.stage===galFilter.stage)&&
    (galFilter.sector==='All'||t.sector===galFilter.sector)&&
    (galFilter.style==='All'||t.style===galFilter.style));
  $('#galCount').textContent=`${list.length} of ${TEMPLATES.length} templates`;
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
    D=buildDeck(TEMPLATES.find(t=>t.id==='editorial'),defaultBrand());
    fullRender();
    renderGallery(); $('#gallery').classList.add('show');
  }else{
    fullRender();
  }
  renderPalette();
}
document.addEventListener('DOMContentLoaded',boot);
})();
