/* Firmgrove "Too good to be true" carousel — ported from firmgrove-tgtbt-prototype.html (approved 2026-07-05).
   Shadow-DOM isolated so it cannot clash with host page CSS/JS and stays out of the i18n pass.
   Locked feel values preserved: lean 34deg/step, glide 0.085, idle drift 0.06 cards/s (time-based) after 3.5s, flick vel*7, snap.
   Brand fonts (Sora UI / Newsreader serif) come from the host page @font-face; used via --ui/--serif.
   VIDEO SWAP: set the `video` URL on any module in MODULES below. Empty string = animated placeholder vignette. */
(function(){
"use strict";
var CSS=`
  :host{
    --paper:#F3F4F7; --surface:#FFFFFF; --ink:#171B25; --night:#12151D;
    --slate:#5C6473; --faint:#8B92A0; --hairline:#E2E5EB;
    --rose:#B23A5C; --rose-deep:#8F2C49; --rose-soft:#F7E9EE;
    --sage:#3E7C5B; --sage-soft:#E9F2ED; --amber:#A87427; --amber-soft:#F7EFE2;
    --serif:"Newsreader",Georgia,"Times New Roman",serif;
    --ui:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  :host{display:block;color:var(--ink);font-family:var(--ui)}

  .topbar{display:flex;align-items:center;justify-content:space-between;padding:22px clamp(20px,4vw,56px)}
  .lockup{display:flex;align-items:center;gap:9px;font-family:var(--serif);font-size:19px;font-weight:600}
  .lockup svg{width:22px;height:22px}
  .lockup i{color:var(--rose);font-style:normal}
  .topbar .fake{display:flex;gap:26px;font-size:12.5px;color:var(--slate)}
  .topbar .fake span:last-child{color:var(--ink);font-weight:600}

  .hero{text-align:center;padding:clamp(28px,6vh,64px) 20px 8px}
  .eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--rose);font-weight:700}
  h1{font-family:var(--serif);font-weight:500;font-size:clamp(38px,6.4vw,72px);line-height:1.04;letter-spacing:-.015em;margin:16px auto 0;max-width:16ch}
  h1 em{font-style:italic;color:var(--rose);position:relative;white-space:nowrap}
  h1 em::after{content:"";position:absolute;left:0;right:0;bottom:6px;height:2px;background:var(--rose);transform:scaleX(0);transform-origin:left;animation:thread 1.1s .5s cubic-bezier(.7,0,.2,1) forwards;opacity:.55}
  @keyframes thread{to{transform:scaleX(1)}}
  .sub{margin:18px auto 0;max-width:52ch;font-size:15px;line-height:1.65;color:var(--slate)}

  /* ------- the arc stage ------- */
  .stage-wrap{position:relative;margin-top:clamp(8px,3vh,28px)}
  .stage{position:relative;height:clamp(380px,56vh,540px);perspective:1400px;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}
  .stage.dragging{cursor:grabbing}
  .card{position:absolute;left:50%;top:50%;width:min(300px,68vw);aspect-ratio:3/4;margin:calc(min(300px,68vw)/-1.5*2/2) 0 0 calc(min(300px,68vw)/-2);will-change:transform;transform-style:preserve-3d}
  .card-inner{position:absolute;inset:0;background:var(--surface);border:1px solid var(--hairline);border-radius:20px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(18,21,29,.35),0 8px 20px -12px rgba(18,21,29,.18);display:flex;flex-direction:column;transition:box-shadow .35s ease}
  .card.focus .card-inner{box-shadow:0 44px 90px -34px rgba(143,44,73,.42),0 12px 28px -14px rgba(18,21,29,.22)}
  .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px}
  .card-head .mod{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--faint)}
  .card-head .dot{width:8px;height:8px;border-radius:50%}
  .vig{position:relative;flex:1;margin:0 12px;border-radius:12px;overflow:hidden;background:var(--paper);border:1px solid var(--hairline)}
  .vig svg{position:absolute;inset:0;width:100%;height:100%}
  .card-foot{padding:12px 16px 14px}
  .card-foot .name{font-family:var(--serif);font-size:20px;font-weight:500;letter-spacing:-.01em}
  .card-foot .line{font-size:11.5px;color:var(--slate);margin-top:2px;line-height:1.45}
  .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease;background:linear-gradient(180deg,rgba(23,27,37,0) 40%,rgba(23,27,37,.16))}
  .play b{display:flex;align-items:center;gap:8px;background:var(--night);color:#fff;font-size:12px;font-weight:600;padding:10px 18px;border-radius:999px;letter-spacing:.02em;box-shadow:0 10px 24px -8px rgba(18,21,29,.5)}
  .play b svg{width:11px;height:11px}
  .card.focus .play{opacity:1}
  .tag{position:absolute;left:50%;top:calc(50% + min(300px,68vw)*2/3 + 26px);transform:translateX(-50%);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);white-space:nowrap;will-change:transform,opacity}

  .rail{display:flex;align-items:center;justify-content:center;gap:18px;padding:clamp(18px,4vh,40px) 20px 8px}
  .rail .hint{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--faint)}
  .rail .hint .pill{display:flex;align-items:center;gap:7px;border:1px solid var(--hairline);background:var(--surface);border-radius:999px;padding:7px 14px;color:var(--slate);font-weight:600}
  .rail .hint .pill svg{width:13px;height:13px}
  .prog{position:relative;width:min(300px,50vw);height:2px;background:var(--hairline);border-radius:2px}
  .prog i{position:absolute;top:-1px;height:4px;border-radius:4px;background:var(--rose);transition:left .25s cubic-bezier(.4,0,.2,1);width:36px}
  .counter{font-variant-numeric:tabular-nums;font-size:12px;color:var(--slate);min-width:52px}
  .counter b{color:var(--ink)}

  .foot{ text-align:center;padding:26px 20px 60px;font-size:12px;color:var(--faint)}

  /* ------- player overlay ------- */
  .player{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(18,21,29,.66);backdrop-filter:blur(6px)}
  .player.open{display:flex;animation:fadein .25s ease}
  @keyframes fadein{from{opacity:0}to{opacity:1}}
  .screen{width:min(920px,92vw);aspect-ratio:16/9;background:var(--night);border-radius:18px;overflow:hidden;position:relative;box-shadow:0 60px 120px -40px rgba(0,0,0,.6);animation:pop .35s cubic-bezier(.3,1.4,.4,1)}
  @keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
  .screen .vidvig{position:absolute;inset:0}
  .screen .vidvig svg{width:100%;height:100%}
  .chrome{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;display:flex;align-items:center;gap:14px;background:linear-gradient(180deg,transparent,rgba(10,12,18,.85))}
  .chrome .pp{width:34px;height:34px;border-radius:50%;background:var(--rose);display:flex;align-items:center;justify-content:center;flex:none;cursor:pointer}
  .chrome .pp svg{width:12px;height:12px}
  .chrome .bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.22);position:relative;overflow:hidden}
  .chrome .bar i{position:absolute;left:0;top:0;bottom:0;background:var(--rose);width:0%}
  .player.open .chrome .bar i{animation:elapse 12s linear forwards}
  @keyframes elapse{to{width:100%}}
  .chrome .tt{font-size:12px;color:#EDEFF3;font-weight:600;white-space:nowrap}
  .badge{position:absolute;top:14px;left:16px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#EDEFF3;background:rgba(255,255,255,.14);padding:5px 11px;border-radius:999px;font-weight:700}
  .close{position:absolute;top:12px;right:14px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;border:0;font-size:15px;cursor:pointer}

  /* vignette animations */
  .vig .rise{animation:rise 2.6s ease-in-out infinite alternate;transform-origin:bottom}
  @keyframes rise{from{transform:scaleY(.55)}to{transform:scaleY(1)}}
  .vig .drift{animation:drift 3.4s ease-in-out infinite alternate}
  @keyframes drift{from{transform:translateX(0)}to{transform:translateX(26px)}}
  .vig .pulse{animation:pulse 2.2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
  .vig .draw{stroke-dasharray:240;stroke-dashoffset:240;animation:draw 3s ease-out infinite}
  @keyframes draw{40%{stroke-dashoffset:0}100%{stroke-dashoffset:0}}
  .vig .blink{animation:blink 1.9s steps(2) infinite}
  @keyframes blink{50%{opacity:.25}}
  @media (prefers-reduced-motion: reduce){
    .vig *,h1 em::after,.player.open .chrome .bar i{animation:none !important}
  }

  .vidfill{width:100%;height:100%;object-fit:cover;display:block}
`;
var HTML=`<div class="stage-wrap"><div class="stage" id="stage" aria-label="Module showcase carousel" role="listbox" tabindex="0"></div></div><div class="rail"><div class="counter"><b id="cNow">01</b> / <span id="cAll">08</span></div><div class="prog"><i id="prog"></i></div><div class="hint"><span class="pill"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Drag to explore</span></div></div><div class="player" id="player" role="dialog" aria-modal="true"><div class="screen"><div class="vidvig" id="vidvig"></div><span class="badge" id="vBadge">Module</span><button class="close" id="vClose" aria-label="Close">✕</button><div class="chrome"><span class="pp"><svg viewBox="0 0 24 24" fill="#fff"><path d="M7 5v14l12-7z"/></svg></span><div class="bar"><i></i></div><span class="tt" id="vTime">Preview — real capture goes here</span></div></div></div>`;
function init(host){
  if(host.__tg) return; host.__tg=1;
  var root=host.attachShadow({mode:"open"});
  root.innerHTML="<style>"+CSS+"</style>"+HTML;

  var ROSE="#B23A5C", DEEP="#8F2C49", SAGE="#3E7C5B", AMBER="#A87427", SLATE="#5C6473", HAIR="#E2E5EB", SOFT="#F7E9EE", SAGES="#E9F2ED", AMBS="#F7EFE2", INK="#171B25";

  // Living micro-previews: one tiny animated Firmgrove scene per module.
  function vFundraise(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="120" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<g class="rise" style="animation-delay:.1s"><rect x="30" y="150" width="34" height="130" rx="6" fill="'+SOFT+'"/></g>'
    +'<g class="rise" style="animation-delay:.5s"><rect x="76" y="110" width="34" height="170" rx="6" fill="'+ROSE+'" opacity=".55"/></g>'
    +'<g class="rise" style="animation-delay:.9s"><rect x="122" y="70" width="34" height="210" rx="6" fill="'+ROSE+'"/></g>'
    +'<rect x="186" y="70" width="86" height="52" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="196" y="84" width="50" height="7" rx="3.5" fill="'+HAIR+'"/><rect x="196" y="98" width="66" height="9" rx="4.5" fill="'+SAGE+'" class="pulse"/>'
    +'<rect x="186" y="134" width="86" height="52" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="196" y="148" width="50" height="7" rx="3.5" fill="'+HAIR+'"/><rect x="196" y="162" width="54" height="9" rx="4.5" fill="'+AMBER+'" class="pulse" style="animation-delay:.6s"/>'
    +'<rect x="26" y="300" width="248" height="14" rx="7" fill="'+SAGES+'"/><rect x="26" y="300" width="170" height="14" rx="7" fill="'+SAGE+'" class="pulse"/>'
    +'</svg>'}
  function vFinance(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="140" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<polyline class="draw" points="26,220 70,190 110,205 150,150 195,165 240,110 274,120" fill="none" stroke="'+ROSE+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    +'<polyline class="draw" style="animation-delay:.7s" points="26,260 70,250 110,255 150,225 195,235 240,200 274,205" fill="none" stroke="'+SAGE+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    +'<rect x="26" y="70" width="70" height="34" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="34" y="80" width="40" height="6" rx="3" fill="'+HAIR+'"/><rect x="34" y="90" width="52" height="8" rx="4" fill="'+INK+'" opacity=".85"/>'
    +'<rect x="104" y="70" width="70" height="34" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="112" y="80" width="40" height="6" rx="3" fill="'+HAIR+'"/><rect x="112" y="90" width="44" height="8" rx="4" fill="'+SAGE+'"/>'
    +'<rect x="26" y="296" width="248" height="12" rx="6" fill="'+HAIR+'"/><rect x="26" y="296" width="120" height="12" rx="6" fill="'+AMBER+'" class="pulse"/>'
    +'</svg>'}
  function vMarketing(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="110" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<g class="drift"><rect x="20" y="80" width="110" height="140" rx="12" fill="#fff" stroke="'+HAIR+'"/><rect x="32" y="94" width="86" height="52" rx="8" fill="'+SOFT+'"/><rect x="32" y="158" width="70" height="8" rx="4" fill="'+INK+'" opacity=".8"/><rect x="32" y="174" width="86" height="6" rx="3" fill="'+HAIR+'"/><rect x="32" y="186" width="60" height="6" rx="3" fill="'+HAIR+'"/></g>'
    +'<g class="drift" style="animation-delay:.8s"><rect x="150" y="100" width="110" height="140" rx="12" fill="#fff" stroke="'+HAIR+'"/><rect x="162" y="114" width="86" height="52" rx="8" fill="'+SAGES+'"/><rect x="162" y="178" width="66" height="8" rx="4" fill="'+INK+'" opacity=".8"/><rect x="162" y="194" width="86" height="6" rx="3" fill="'+HAIR+'"/></g>'
    +'<rect x="26" y="272" width="150" height="12" rx="6" fill="'+HAIR+'"/><rect x="26" y="294" width="248" height="16" rx="8" fill="'+SOFT+'"/><rect x="30" y="298" width="90" height="8" rx="4" fill="'+ROSE+'" class="pulse"/>'
    +'</svg>'}
  function vSell(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="90" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<rect x="26" y="70" width="76" height="230" rx="10" fill="'+SOFT+'" opacity=".5"/><rect x="112" y="70" width="76" height="230" rx="10" fill="'+AMBS+'" opacity=".6"/><rect x="198" y="70" width="76" height="230" rx="10" fill="'+SAGES+'" opacity=".7"/>'
    +'<g class="drift"><rect x="34" y="86" width="60" height="44" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="42" y="96" width="36" height="6" rx="3" fill="'+HAIR+'"/><rect x="42" y="108" width="44" height="8" rx="4" fill="'+ROSE+'"/></g>'
    +'<rect x="120" y="86" width="60" height="44" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="128" y="96" width="36" height="6" rx="3" fill="'+HAIR+'"/><rect x="128" y="108" width="38" height="8" rx="4" fill="'+AMBER+'"/>'
    +'<rect x="120" y="140" width="60" height="44" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="128" y="150" width="36" height="6" rx="3" fill="'+HAIR+'"/><rect x="128" y="162" width="30" height="8" rx="4" fill="'+AMBER+'"/>'
    +'<rect x="206" y="86" width="60" height="44" rx="8" fill="#fff" stroke="'+HAIR+'"/><rect x="214" y="96" width="36" height="6" rx="3" fill="'+HAIR+'"/><rect x="214" y="108" width="40" height="8" rx="4" fill="'+SAGE+'" class="pulse"/>'
    +'</svg>'}
  function vPeople(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="100" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<circle cx="90" cy="120" r="30" fill="'+SOFT+'" class="pulse"/><circle cx="90" cy="112" r="11" fill="'+ROSE+'"/><path d="M70 138c4-11 36-11 40 0" stroke="'+DEEP+'" stroke-width="5" stroke-linecap="round" fill="none"/>'
    +'<circle cx="180" cy="150" r="26" fill="'+SAGES+'" class="pulse" style="animation-delay:.5s"/><circle cx="180" cy="143" r="9" fill="'+SAGE+'"/><path d="M164 165c3-9 29-9 32 0" stroke="'+SAGE+'" stroke-width="4" stroke-linecap="round" fill="none"/>'
    +'<circle cx="240" cy="100" r="22" fill="'+AMBS+'" class="pulse" style="animation-delay:1s"/><circle cx="240" cy="94" r="8" fill="'+AMBER+'"/><path d="M227 112c3-8 24-8 26 0" stroke="'+AMBER+'" stroke-width="4" stroke-linecap="round" fill="none"/>'
    +'<path d="M112 130 L156 142 M204 142 L222 116" stroke="'+HAIR+'" stroke-width="3"/>'
    +'<rect x="26" y="220" width="248" height="34" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="38" y="231" width="120" height="8" rx="4" fill="'+HAIR+'"/><rect x="222" y="228" width="40" height="16" rx="8" fill="'+SAGE+'" class="blink"/>'
    +'<rect x="26" y="264" width="248" height="34" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="38" y="275" width="90" height="8" rx="4" fill="'+HAIR+'"/><rect x="222" y="272" width="40" height="16" rx="8" fill="'+AMBER+'" class="blink" style="animation-delay:.7s"/>'
    +'</svg>'}
  function vProduct(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="96" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<rect x="26" y="72" width="248" height="18" rx="9" fill="'+HAIR+'" opacity=".6"/><rect x="26" y="72" width="150" height="18" rx="9" fill="'+ROSE+'" opacity=".85" class="pulse"/>'
    +'<rect x="26" y="112" width="118" height="80" rx="12" fill="#fff" stroke="'+HAIR+'"/><rect x="38" y="126" width="70" height="8" rx="4" fill="'+INK+'" opacity=".8"/><rect x="38" y="142" width="94" height="6" rx="3" fill="'+HAIR+'"/><rect x="38" y="166" width="52" height="14" rx="7" fill="'+SOFT+'"/>'
    +'<g class="drift" style="animation-delay:.4s"><rect x="156" y="112" width="118" height="80" rx="12" fill="#fff" stroke="'+HAIR+'"/><rect x="168" y="126" width="70" height="8" rx="4" fill="'+INK+'" opacity=".8"/><rect x="168" y="142" width="94" height="6" rx="3" fill="'+HAIR+'"/><rect x="168" y="166" width="60" height="14" rx="7" fill="'+SAGES+'"/></g>'
    +'<rect x="26" y="212" width="248" height="90" rx="12" fill="'+SOFT+'" opacity=".55"/><polyline class="draw" points="42,282 88,262 128,270 168,240 214,250 258,228" fill="none" stroke="'+DEEP+'" stroke-width="4" stroke-linecap="round"/>'
    +'</svg>'}
  function vLegal(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="60" y="36" width="180" height="240" rx="12" fill="#fff" stroke="'+HAIR+'"/>'
    +'<rect x="78" y="58" width="100" height="10" rx="5" fill="'+INK+'" opacity=".85"/>'
    +'<rect x="78" y="82" width="144" height="6" rx="3" fill="'+HAIR+'"/><rect x="78" y="96" width="144" height="6" rx="3" fill="'+HAIR+'"/><rect x="78" y="110" width="110" height="6" rx="3" fill="'+HAIR+'"/>'
    +'<rect x="78" y="132" width="144" height="6" rx="3" fill="'+HAIR+'"/><rect x="78" y="146" width="126" height="6" rx="3" fill="'+HAIR+'"/>'
    +'<rect x="78" y="168" width="70" height="6" rx="3" fill="'+AMBER+'" class="pulse"/>'
    +'<g class="pulse" style="animation-delay:.5s"><circle cx="196" cy="228" r="26" fill="'+SAGES+'"/><path d="m184 228 8 8 16-16" stroke="'+SAGE+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>'
    +'<rect x="26" y="296" width="248" height="16" rx="8" fill="'+SAGES+'"/><rect x="32" y="300" width="130" height="8" rx="4" fill="'+SAGE+'"/>'
    +'</svg>'}
  function vGovern(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="34" width="86" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<path d="M70 190 A80 80 0 0 1 230 190" fill="none" stroke="'+HAIR+'" stroke-width="16" stroke-linecap="round"/>'
    +'<path class="draw" d="M70 190 A80 80 0 0 1 196 128" fill="none" stroke="'+SAGE+'" stroke-width="16" stroke-linecap="round"/>'
    +'<circle cx="150" cy="190" r="8" fill="'+INK+'"/><rect x="120" y="208" width="60" height="10" rx="5" fill="'+INK+'" opacity=".8"/>'
    +'<rect x="26" y="248" width="118" height="54" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="36" y="262" width="60" height="7" rx="3.5" fill="'+HAIR+'"/><rect x="36" y="278" width="80" height="9" rx="4.5" fill="'+SAGE+'" class="pulse"/>'
    +'<rect x="156" y="248" width="118" height="54" rx="10" fill="#fff" stroke="'+HAIR+'"/><rect x="166" y="262" width="60" height="7" rx="3.5" fill="'+HAIR+'"/><rect x="166" y="278" width="64" height="9" rx="4.5" fill="'+ROSE+'" class="pulse" style="animation-delay:.6s"/>'
    +'</svg>'}

  function vIdea(){return '<svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">'
    +'<rect width="300" height="340" fill="#FDFDFE"/>'
    +'<rect x="26" y="30" width="90" height="10" rx="5" fill="'+HAIR+'"/>'
    +'<g class="pulse"><circle cx="150" cy="118" r="46" fill="'+SOFT+'"/><circle cx="150" cy="118" r="26" fill="'+ROSE+'"/><path d="M150 96v20l13 9" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></g>'
    +'<rect x="132" y="170" width="36" height="10" rx="5" fill="'+DEEP+'"/>'
    +'<rect x="88" y="194" width="124" height="26" rx="13" fill="'+SAGES+'"/><rect x="103" y="203" width="94" height="8" rx="4" fill="'+SAGE+'"/>'
    +'<rect x="26" y="240" width="248" height="12" rx="6" fill="'+HAIR+'" opacity=".55"/><rect x="26" y="240" width="182" height="12" rx="6" fill="'+ROSE+'" class="pulse"/>'
    +'<rect x="26" y="262" width="248" height="12" rx="6" fill="'+HAIR+'" opacity=".55"/><rect x="26" y="262" width="150" height="12" rx="6" fill="'+SAGE+'" class="pulse" style="animation-delay:.4s"/>'
    +'<rect x="26" y="284" width="248" height="12" rx="6" fill="'+HAIR+'" opacity=".55"/><rect x="26" y="284" width="118" height="12" rx="6" fill="'+AMBER+'" class="pulse" style="animation-delay:.8s"/>'
    +'</svg>'}

  var MODULES=[
    {key:"fundraise", name:"Fundraise",  line:"The raise, run end to end. Narrative, cap table, data room.", color:ROSE, video:"", vig:vFundraise},
    {key:"finance",   name:"Finance",    line:"A live three-statement model that always ties to the brain.",  color:SAGE, video:"", vig:vFinance},
    {key:"marketing", name:"Marketing",  line:"Positioning to campaigns, in your voice, audited first.",      color:ROSE, video:"", vig:vMarketing},
    {key:"sell",      name:"Sell",       line:"Pipeline, follow-ups, and the next best move on every deal.",  color:AMBER, video:"", vig:vSell},
    {key:"people",    name:"People",     line:"Hiring to leave requests, one person graph, human decisions.", color:SAGE, video:"", vig:vPeople},
    {key:"product",   name:"Product",    line:"Feedback to roadmap, scored as advice. You set the rank.",     color:ROSE, video:"", vig:vProduct},
    {key:"legal",     name:"Legal",      line:"Contracts read, clauses flagged, obligations tracked.",        color:AMBER, video:"", vig:vLegal},
    {key:"govern",    name:"Govern",     line:"Board packs and the audit trail, always diligence-ready.",     color:SAGE, video:"", vig:vGovern}
  ];
  var __ideaDemo = host.getAttribute("data-idea-demo");
  if(__ideaDemo){ MODULES.unshift({key:"idea", name:"Idea", line:"Your idea, pressure-tested. Fundability scan, honest read, next steps.", color:ROSE, video:"", vig:vIdea, demo:__ideaDemo}); }


  var stage=root.getElementById("stage");
  var cards=[], tags=[];
  MODULES.forEach(function(m,i){
    var el=document.createElement("div"); el.className="card"; el.setAttribute("role","option"); el.setAttribute("aria-label",m.name);
    el.innerHTML='<div class="card-inner">'
      +'<div class="card-head"><span class="mod">Module</span><span class="dot" style="background:'+m.color+'"></span></div>'
      +'<div class="vig">'+(m.video?'<video class="vidfill" src="'+m.video+'" muted loop autoplay playsinline></video>':m.vig())+'</div>'
      +'<div class="card-foot"><div class="name">'+m.name+'</div><div class="line">'+m.line+'</div></div>'
      +'<div class="play"><b><svg viewBox="0 0 24 24" fill="#fff"><path d="M7 5v14l12-7z"/></svg>Watch it run</b></div>'
      +'</div>';
    stage.appendChild(el); cards.push(el);
    var tg=document.createElement("div"); tg.className="tag"; tg.textContent=m.name; stage.appendChild(tg); tags.push(tg);
    el.addEventListener("click",function(){ onCardClick(i); });
  });
  root.getElementById("cAll").textContent=String(MODULES.length).padStart(2,"0");

  // The feel, in four numbers. lean = degrees per step the side cards fall
  // away; drift = cards per second the collection wanders while idle.
  var TUNE={ lean:34, spaceMul:1, glide:0.085, drift:0.06 };
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var current=0, target=0, dragging=false, startX=0, startCur=0, moved=0, lastX=0, lastT=0, vel=0;
  var lastTouch=performance.now(), driftDir=1;
  function touch(){ lastTouch=performance.now(); }
  function SPACING(){ return Math.min(240, window.innerWidth*0.30)*TUNE.spaceMul; }

  function clamp(v,a,b){return v<a?a:(v>b?b:v)}

  var lastFrame=performance.now();
  function render(){
    // Time-based frame delta (clamped), so the drift speed is identical on
    // 60Hz and 120Hz displays and never jumps after a backgrounded tab resumes.
    var now=performance.now(), dt=Math.min(now-lastFrame,50)/1000; lastFrame=now;
    // Idle drift: after 3.5s untouched the collection wanders slowly and
    // bounces at the ends, so the section never sits still until you reach in.
    if(!reduced && !dragging && TUNE.drift>0 && now-lastTouch>3500 && !player.classList.contains("open")){
      target += driftDir*TUNE.drift*dt;
      if(target>=MODULES.length-1){ target=MODULES.length-1; driftDir=-1; }
      if(target<=0){ target=0; driftDir=1; }
    }
    // critically-damped chase for that expensive, weighty glide
    current += (target-current)*TUNE.glide;
    for(var i=0;i<cards.length;i++){
      var d=i-current;
      var ad=Math.abs(d);
      var x=d*SPACING();
      var y=Math.pow(ad,1.6)*16;                 // the arc: edges ride up
      var rz=d*4;                                 // fan tilt
      var ry=clamp(-d*TUNE.lean,-62,62);          // 3D lean away from center
      var z=-ad*90;                               // depth
      var sc=clamp(1-ad*0.06,.8,1);
      cards[i].style.transform="translate3d("+x+"px,"+y+"px,"+z+"px) rotateZ("+rz+"deg) rotateY("+ry+"deg) scale("+sc+")";
      cards[i].style.zIndex=String(100-Math.round(ad*10));
      cards[i].style.opacity=String(clamp(1-ad*0.16,.25,1));
      cards[i].classList.toggle("focus", ad<0.5);
      tags[i].style.transform="translateX(calc(-50% + "+x+"px)) translateY("+(y*0.7)+"px) rotate("+rz+"deg)";
      tags[i].style.opacity=String(clamp(1-ad*0.35,0,1));
    }
    var idx=clamp(Math.round(current),0,MODULES.length-1);
    root.getElementById("cNow").textContent=String(idx+1).padStart(2,"0");
    var prog=root.getElementById("prog");
    var trackW=prog.parentElement.offsetWidth-36;
    prog.style.left=(idx/(MODULES.length-1))*trackW+"px";
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function snap(){ target=clamp(Math.round(target),0,MODULES.length-1); }

  function onDown(e){
    dragging=true; stage.classList.add("dragging"); touch();
    startX=(e.touches?e.touches[0].clientX:e.clientX); startCur=target; moved=0; lastX=startX; lastT=performance.now(); vel=0;
  }
  function onMove(e){
    if(!dragging) return;
    touch();
    var x=(e.touches?e.touches[0].clientX:e.clientX);
    var dx=x-startX; moved=Math.max(moved,Math.abs(dx));
    target=startCur - dx/SPACING();
    target=clamp(target,-0.35,MODULES.length-1+0.35);
    var now=performance.now();
    vel=(x-lastX)/Math.max(now-lastT,1); lastX=x; lastT=now;
    if(e.cancelable && e.touches) e.preventDefault();
  }
  function onUp(){
    if(!dragging) return;
    dragging=false; stage.classList.remove("dragging"); touch();
    target -= vel*7;               // momentum flick
    snap();
  }
  stage.addEventListener("mousedown",onDown);
  window.addEventListener("mousemove",onMove);
  window.addEventListener("mouseup",onUp);
  stage.addEventListener("touchstart",onDown,{passive:true});
  stage.addEventListener("touchmove",onMove,{passive:false});
  stage.addEventListener("touchend",onUp);
  stage.addEventListener("wheel",function(e){
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){ touch(); target=clamp(target+e.deltaX/240,0,MODULES.length-1); e.preventDefault();
      clearTimeout(stage._wt); stage._wt=setTimeout(snap,140);
    }
  },{passive:false});
  stage.addEventListener("keydown",function(e){
    touch();
    if(e.key==="ArrowRight"){ target=clamp(Math.round(target)+1,0,MODULES.length-1); }
    if(e.key==="ArrowLeft"){ target=clamp(Math.round(target)-1,0,MODULES.length-1); }
    if(e.key==="Enter"){ openPlayer(Math.round(target)); }
  });

  function onCardClick(i){
    if(moved>8) return;                        // it was a drag, not a click
    touch();
    if(Math.abs(i-Math.round(target))<0.5){ openPlayer(i); }
    else { target=i; }                          // side card: glide it to center
  }

  var player=root.getElementById("player");
  function openPlayer(i){
    var m=MODULES[i];
    var __vv=root.getElementById("vidvig");
    if(m.demo){ __vv.innerHTML='<iframe class="vidfill" src="'+m.demo+'" title="'+m.name+' demo" allow="autoplay; fullscreen; encrypted-media" style="border:0;width:100%;height:100%"></iframe>'; }
    else { __vv.innerHTML=(m.video?'<video class="vidfill" src="'+m.video+'" autoplay controls playsinline></video>':m.vig()); }
    root.getElementById("vBadge").textContent=m.name+" — Firmgrove";
    player.classList.add("open");
  }
  function closePlayer(){ player.classList.remove("open"); var __v=root.getElementById("vidvig"); if(__v) __v.innerHTML=""; touch(); }
  root.getElementById("vClose").addEventListener("click",closePlayer);
  player.addEventListener("click",function(e){ if(e.target===player) closePlayer(); });
  window.addEventListener("keydown",function(e){ if(e.key==="Escape") closePlayer(); });

}
function boot(){ Array.prototype.forEach.call(document.querySelectorAll(".tgtbt-host"), init); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
