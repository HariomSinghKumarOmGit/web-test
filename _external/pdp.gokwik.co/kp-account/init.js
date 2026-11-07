const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./mountApp.js","./mountApp.css"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))u(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&u(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function u(e){if(e.ep)return;e.ep=!0;const n=i(e);fetch(e.href,n)}})();const v="modulepreload",b=function(s,t){return new URL(s,t).href},h={},w=function(t,i,u){let e=Promise.resolve();if(i&&i.length>0){let k=function(r){return Promise.all(r.map(a=>Promise.resolve(a).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};const o=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),m=c?.nonce||c?.getAttribute("nonce");e=k(i.map(r=>{if(r=b(r,u),r in h)return;h[r]=!0;const a=r.endsWith(".css"),d=a?'[rel="stylesheet"]':"";if(u)for(let p=o.length-1;p>=0;p--){const f=o[p];if(f.href===r&&(!a||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${d}`))return;const l=document.createElement("link");if(l.rel=a?"stylesheet":v,a||(l.as="script"),l.crossOrigin="",l.href=r,m&&l.setAttribute("nonce",m),document.head.appendChild(l),a)return new Promise((p,f)=>{l.addEventListener("load",p),l.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${r}`)))})}))}function n(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return e.then(o=>{for(const c of o||[])c.status==="rejected"&&n(c.reason);return t().catch(n)})},_=`
.kp-boot-skeleton {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}
.kp-boot-skeleton__inner {
  text-align: center;
}
.kp-boot-skeleton__spinner {
  margin: 0 auto;
  height: 48px;
  width: 48px;
  border-radius: 9999px;
  border-bottom: 2px solid #111827;
  animation: kp-boot-spin 0.6s linear infinite;
}
.kp-boot-skeleton__text {
  margin-top: 16px;
  font-weight: 500;
  color: var(--kp-color-muted, #6A7FA0);
}
@keyframes kp-boot-spin {
  to { transform: rotate(360deg); }
}
`,E=`
<div class="kp-boot-skeleton">
  <div class="kp-boot-skeleton__inner">
    <div class="kp-boot-skeleton__spinner"></div>
    <p class="kp-boot-skeleton__text">Loading account page...</p>
  </div>
</div>
`;function x(s){const t=document.createElement("style");t.textContent=_;const i=document.createElement("div");return i.innerHTML=E,s.appendChild(t),s.appendChild(i),{remove(){t.remove(),i.remove()}}}const g=document.getElementById("kp-account-wrapper")||document.getElementsByTagName("main")[0];if(!g)throw console.error("Mount point #kp-app not found"),window.location.href="/account",new Error("Missing host element");const y=g.attachShadow({mode:"open"}),L=x(y);w(async()=>{const{mountApp:s}=await import("./mountApp.js").then(t=>t.br);return{mountApp:s}},__vite__mapDeps([0,1]),import.meta.url).then(({mountApp:s})=>{const t=s(y);return L.remove(),t});export{w as _};
