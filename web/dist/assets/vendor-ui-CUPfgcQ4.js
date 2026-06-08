import{f as M,R as b}from"./vendor-react-vF6CuWvG.js";let Ne={data:""},Ie=t=>{if(typeof window=="object"){let s=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return s.nonce=window.__nonce__,s.parentNode||(t||document.head).appendChild(s),s.firstChild}return t||Ne},Oe=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,He=/\/\*[^]*?\*\/|  +/g,ie=/\n+/g,I=(t,s)=>{let o="",c="",d="";for(let h in t){let y=t[h];h[0]=="@"?h[1]=="i"?o=h+" "+y+";":c+=h[1]=="f"?I(y,h):h+"{"+I(y,h[1]=="k"?"":s)+"}":typeof y=="object"?c+=I(y,s?s.replace(/([^,])+/g,f=>h.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,e=>/&/.test(e)?e.replace(/&/g,f):f?f+" "+e:e)):h):y!=null&&(h=h[1]=="-"?h:h.replace(/[A-Z]/g,"-$&").toLowerCase(),d+=I.p?I.p(h,y):h+":"+y+";")}return o+(s&&d?s+"{"+d+"}":d)+c},N={},ce=t=>{if(typeof t=="object"){let s="";for(let o in t)s+=o+ce(t[o]);return s}return t},Te=(t,s,o,c,d)=>{let h=ce(t),y=N[h]||(N[h]=(e=>{let r=0,a=11;for(;r<e.length;)a=101*a+e.charCodeAt(r++)>>>0;return"go"+a})(h));if(!N[y]){let e=h!==t?t:(r=>{let a,n,l=[{}];for(;a=Oe.exec(r.replace(He,""));)a[4]?l.shift():a[3]?(n=a[3].replace(ie," ").trim(),l.unshift(l[0][n]=l[0][n]||{})):l[0][a[1]]=a[2].replace(ie," ").trim();return l[0]})(t);N[y]=I(d?{["@keyframes "+y]:e}:e,o?"":"."+y)}let f=o&&N.g;return o&&(N.g=N[y]),((e,r,a,n)=>{n?r.data=r.data.replace(n,e):r.data.indexOf(e)===-1&&(r.data=a?e+r.data:r.data+e)})(N[y],s,c,f),y},De=(t,s,o)=>t.reduce((c,d,h)=>{let y=s[h];if(y&&y.call){let f=y(o),e=f&&f.props&&f.props.className||/^go/.test(f)&&f;y=e?"."+e:f&&typeof f=="object"?f.props?"":I(f,""):f===!1?"":f}return c+d+(y??"")},"");function Q(t){let s=this||{},o=t.call?t(s.p):t;return Te(o.unshift?o.raw?De(o,[].slice.call(arguments,1),s.p):o.reduce((c,d)=>Object.assign(c,d&&d.call?d(s.p):d),{}):o,Ie(s.target),s.g,s.o,s.k)}let he,X,W;Q.bind({g:1});let L=Q.bind({k:1});function Fe(t,s,o,c){I.p=s,he=t,X=o,W=c}function O(t,s){let o=this||{};return function(){let c=arguments;function d(h,y){let f=Object.assign({},h),e=f.className||d.className;o.p=Object.assign({theme:X&&X()},f),o.o=/go\d/.test(e),f.className=Q.apply(o,c)+(e?" "+e:"");let r=t;return t[0]&&(r=f.as||t,delete f.as),W&&r[0]&&W(f),he(r,f)}return d}}var qe=t=>typeof t=="function",V=(t,s)=>qe(t)?t(s):t,Ue=(()=>{let t=0;return()=>(++t).toString()})(),ye=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let s=matchMedia("(prefers-reduced-motion: reduce)");t=!s||s.matches}return t}})(),Be=20,ee="default",de=(t,s)=>{let{toastLimit:o}=t.settings;switch(s.type){case 0:return{...t,toasts:[s.toast,...t.toasts].slice(0,o)};case 1:return{...t,toasts:t.toasts.map(y=>y.id===s.toast.id?{...y,...s.toast}:y)};case 2:let{toast:c}=s;return de(t,{type:t.toasts.find(y=>y.id===c.id)?1:0,toast:c});case 3:let{toastId:d}=s;return{...t,toasts:t.toasts.map(y=>y.id===d||d===void 0?{...y,dismissed:!0,visible:!1}:y)};case 4:return s.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(y=>y.id!==s.toastId)};case 5:return{...t,pausedAt:s.time};case 6:let h=s.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(y=>({...y,pauseDuration:y.pauseDuration+h}))}}},$=[],pe={toasts:[],pausedAt:void 0,settings:{toastLimit:Be}},S={},ue=(t,s=ee)=>{S[s]=de(S[s]||pe,t),$.forEach(([o,c])=>{o===s&&c(S[s])})},fe=t=>Object.keys(S).forEach(s=>ue(t,s)),je=t=>Object.keys(S).find(s=>S[s].toasts.some(o=>o.id===t)),Z=(t=ee)=>s=>{ue(s,t)},$e={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},Ve=(t={},s=ee)=>{let[o,c]=M.useState(S[s]||pe),d=M.useRef(S[s]);M.useEffect(()=>(d.current!==S[s]&&c(S[s]),$.push([s,c]),()=>{let y=$.findIndex(([f])=>f===s);y>-1&&$.splice(y,1)}),[s]);let h=o.toasts.map(y=>{var f,e,r;return{...t,...t[y.type],...y,removeDelay:y.removeDelay||((f=t[y.type])==null?void 0:f.removeDelay)||(t==null?void 0:t.removeDelay),duration:y.duration||((e=t[y.type])==null?void 0:e.duration)||(t==null?void 0:t.duration)||$e[y.type],style:{...t.style,...(r=t[y.type])==null?void 0:r.style,...y.style}}});return{...o,toasts:h}},_e=(t,s="blank",o)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:s,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...o,id:(o==null?void 0:o.id)||Ue()}),U=t=>(s,o)=>{let c=_e(s,t,o);return Z(c.toasterId||je(c.id))({type:2,toast:c}),c.id},E=(t,s)=>U("blank")(t,s);E.error=U("error");E.success=U("success");E.loading=U("loading");E.custom=U("custom");E.dismiss=(t,s)=>{let o={type:3,toastId:t};s?Z(s)(o):fe(o)};E.dismissAll=t=>E.dismiss(void 0,t);E.remove=(t,s)=>{let o={type:4,toastId:t};s?Z(s)(o):fe(o)};E.removeAll=t=>E.remove(void 0,t);E.promise=(t,s,o)=>{let c=E.loading(s.loading,{...o,...o==null?void 0:o.loading});return typeof t=="function"&&(t=t()),t.then(d=>{let h=s.success?V(s.success,d):void 0;return h?E.success(h,{id:c,...o,...o==null?void 0:o.success}):E.dismiss(c),d}).catch(d=>{let h=s.error?V(s.error,d):void 0;h?E.error(h,{id:c,...o,...o==null?void 0:o.error}):E.dismiss(c)}),t};var Qe=1e3,Ze=(t,s="default")=>{let{toasts:o,pausedAt:c}=Ve(t,s),d=M.useRef(new Map).current,h=M.useCallback((n,l=Qe)=>{if(d.has(n))return;let p=setTimeout(()=>{d.delete(n),y({type:4,toastId:n})},l);d.set(n,p)},[]);M.useEffect(()=>{if(c)return;let n=Date.now(),l=o.map(p=>{if(p.duration===1/0)return;let u=(p.duration||0)+p.pauseDuration-(n-p.createdAt);if(u<0){p.visible&&E.dismiss(p.id);return}return setTimeout(()=>E.dismiss(p.id,s),u)});return()=>{l.forEach(p=>p&&clearTimeout(p))}},[o,c,s]);let y=M.useCallback(Z(s),[s]),f=M.useCallback(()=>{y({type:5,time:Date.now()})},[y]),e=M.useCallback((n,l)=>{y({type:1,toast:{id:n,height:l}})},[y]),r=M.useCallback(()=>{c&&y({type:6,time:Date.now()})},[c,y]),a=M.useCallback((n,l)=>{let{reverseOrder:p=!1,gutter:u=8,defaultPosition:g}=l||{},m=o.filter(k=>(k.position||g)===(n.position||g)&&k.height),A=m.findIndex(k=>k.id===n.id),C=m.filter((k,x)=>x<A&&k.visible).length;return m.filter(k=>k.visible).slice(...p?[C+1]:[0,C]).reduce((k,x)=>k+(x.height||0)+u,0)},[o]);return M.useEffect(()=>{o.forEach(n=>{if(n.dismissed)h(n.id,n.removeDelay);else{let l=d.get(n.id);l&&(clearTimeout(l),d.delete(n.id))}})},[o,h]),{toasts:o,handlers:{updateHeight:e,startPause:f,endPause:r,calculateOffset:a}}},Ge=L`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Ye=L`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Xe=L`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,We=O("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Ye} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Xe} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Ke=L`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Je=O("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${Ke} 1s linear infinite;
`,et=L`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,tt=L`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,at=O("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${et} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${tt} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,rt=O("div")`
  position: absolute;
`,st=O("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ot=L`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,nt=O("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ot} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,it=({toast:t})=>{let{icon:s,type:o,iconTheme:c}=t;return s!==void 0?typeof s=="string"?M.createElement(nt,null,s):s:o==="blank"?null:M.createElement(st,null,M.createElement(Je,{...c}),o!=="loading"&&M.createElement(rt,null,o==="error"?M.createElement(We,{...c}):M.createElement(at,{...c})))},lt=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ct=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,ht="0%{opacity:0;} 100%{opacity:1;}",yt="0%{opacity:1;} 100%{opacity:0;}",dt=O("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,pt=O("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ut=(t,s)=>{let o=t.includes("top")?1:-1,[c,d]=ye()?[ht,yt]:[lt(o),ct(o)];return{animation:s?`${L(c)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${L(d)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ft=M.memo(({toast:t,position:s,style:o,children:c})=>{let d=t.height?ut(t.position||s||"top-center",t.visible):{opacity:0},h=M.createElement(it,{toast:t}),y=M.createElement(pt,{...t.ariaProps},V(t.message,t));return M.createElement(dt,{className:t.className,style:{...d,...o,...t.style}},typeof c=="function"?c({icon:h,message:y}):M.createElement(M.Fragment,null,h,y))});Fe(M.createElement);var kt=({id:t,className:s,style:o,onHeightUpdate:c,children:d})=>{let h=M.useCallback(y=>{if(y){let f=()=>{let e=y.getBoundingClientRect().height;c(t,e)};f(),new MutationObserver(f).observe(y,{subtree:!0,childList:!0,characterData:!0})}},[t,c]);return M.createElement("div",{ref:h,className:s,style:o},d)},mt=(t,s)=>{let o=t.includes("top"),c=o?{top:0}:{bottom:0},d=t.includes("center")?{justifyContent:"center"}:t.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:ye()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${s*(o?1:-1)}px)`,...c,...d}},gt=Q`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,j=16,Nt=({reverseOrder:t,position:s="top-center",toastOptions:o,gutter:c,children:d,toasterId:h,containerStyle:y,containerClassName:f})=>{let{toasts:e,handlers:r}=Ze(o,h);return M.createElement("div",{"data-rht-toaster":h||"",style:{position:"fixed",zIndex:9999,top:j,left:j,right:j,bottom:j,pointerEvents:"none",...y},className:f,onMouseEnter:r.startPause,onMouseLeave:r.endPause},e.map(a=>{let n=a.position||s,l=r.calculateOffset(a,{reverseOrder:t,gutter:c,defaultPosition:s}),p=mt(n,l);return M.createElement(kt,{id:a.id,key:a.id,onHeightUpdate:r.updateHeight,className:a.visible?gt:"",style:p},a.type==="custom"?V(a.message,a):d?d(a):M.createElement(ft,{toast:a,position:n}))}))},It=E;/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var vt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),i=(t,s)=>{const o=M.forwardRef(({color:c="currentColor",size:d=24,strokeWidth:h=2,absoluteStrokeWidth:y,className:f="",children:e,...r},a)=>M.createElement("svg",{ref:a,...vt,width:d,height:d,stroke:c,strokeWidth:y?Number(h)*24/Number(d):h,className:["lucide",`lucide-${Mt(t)}`,f].join(" "),...r},[...s.map(([n,l])=>M.createElement(n,l)),...Array.isArray(e)?e:[e]]));return o.displayName=`${t}`,o};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=i("Accessibility",[["circle",{cx:"16",cy:"4",r:"1",key:"1grugj"}],["path",{d:"m18 19 1-7-6 1",key:"r0i19z"}],["path",{d:"m5 8 3-3 5.5 3-2.36 3.5",key:"9ptxx2"}],["path",{d:"M4.24 14.5a5 5 0 0 0 6.88 6",key:"10kmtu"}],["path",{d:"M13.76 17.5a5 5 0 0 0-6.88-6",key:"2qq6rc"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=i("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=i("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=i("ArrowDownLeft",[["path",{d:"M17 7 7 17",key:"15tmo1"}],["path",{d:"M17 17H7V7",key:"1org7z"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=i("ArrowLeftRight",[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=i("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=i("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=i("ArrowUpDown",[["path",{d:"m21 16-4 4-4-4",key:"f6ql7i"}],["path",{d:"M17 20V4",key:"1ejh1v"}],["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=i("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=i("Award",[["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}],["path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",key:"em7aur"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=i("Ban",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.9 4.9 14.2 14.2",key:"1m5liu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=i("BarChart2",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt=i("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=i("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=i("BookmarkCheck",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z",key:"169p4p"}],["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=i("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xt=i("Bus",[["path",{d:"M8 6v6",key:"18i7km"}],["path",{d:"M15 6v6",key:"1sg6z9"}],["path",{d:"M2 12h19.6",key:"de5uta"}],["path",{d:"M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3",key:"1wwztk"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}],["path",{d:"M9 18h5",key:"lrx6i"}],["circle",{cx:"16",cy:"18",r:"2",key:"1v4tcr"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=i("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=i("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=i("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const e1=i("Car",[["path",{d:"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",key:"5owen"}],["circle",{cx:"7",cy:"17",r:"2",key:"u2ysq9"}],["path",{d:"M9 17h6",key:"r8uit2"}],["circle",{cx:"17",cy:"17",r:"2",key:"axvx0g"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t1=i("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a1=i("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r1=i("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s1=i("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o1=i("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n1=i("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i1=i("Cigarette",[["path",{d:"M18 12H2v4h16",key:"2rt1hm"}],["path",{d:"M22 12v4",key:"142cbu"}],["path",{d:"M7 12v4",key:"jqww69"}],["path",{d:"M18 8c0-2.5-2-2.5-2-5",key:"1il607"}],["path",{d:"M22 8c0-2.5-2-2.5-2-5",key:"1gah44"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l1=i("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c1=i("Contrast",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 18a6 6 0 0 0 0-12v12z",key:"j4l70d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h1=i("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y1=i("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d1=i("Crown",[["path",{d:"m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14",key:"zkxr6b"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p1=i("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u1=i("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f1=i("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k1=i("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m1=i("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g1=i("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v1=i("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M1=i("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x1=i("Flag",[["path",{d:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",key:"i9b6wo"}],["line",{x1:"4",x2:"4",y1:"22",y2:"15",key:"1cm3nv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w1=i("Gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C1=i("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b1=i("Hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E1=i("Headphones",[["path",{d:"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",key:"1xhozi"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A1=i("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R1=i("HelpCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z1=i("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S1=i("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P1=i("Leaf",[["path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",key:"nnexq3"}],["path",{d:"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",key:"mt58a7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L1=i("List",[["line",{x1:"8",x2:"21",y1:"6",y2:"6",key:"7ey8pc"}],["line",{x1:"8",x2:"21",y1:"12",y2:"12",key:"rjfblc"}],["line",{x1:"8",x2:"21",y1:"18",y2:"18",key:"c3b1m8"}],["line",{x1:"3",x2:"3.01",y1:"6",y2:"6",key:"1g7gq3"}],["line",{x1:"3",x2:"3.01",y1:"12",y2:"12",key:"1pjlvk"}],["line",{x1:"3",x2:"3.01",y1:"18",y2:"18",key:"28t2mc"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N1=i("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I1=i("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O1=i("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H1=i("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T1=i("Map",[["polygon",{points:"3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21",key:"ok2ie8"}],["line",{x1:"9",x2:"9",y1:"3",y2:"18",key:"w34qz5"}],["line",{x1:"15",x2:"15",y1:"6",y2:"21",key:"volv9a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D1=i("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F1=i("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q1=i("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U1=i("MicOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2",key:"80xlxr"}],["path",{d:"M5 10v2a7 7 0 0 0 12 5",key:"p2k8kg"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B1=i("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j1=i("Monitor",[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $1=i("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V1=i("Music",[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _1=i("Navigation",[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q1=i("PawPrint",[["circle",{cx:"11",cy:"4",r:"2",key:"vol9p0"}],["circle",{cx:"18",cy:"8",r:"2",key:"17gozi"}],["circle",{cx:"20",cy:"16",r:"2",key:"1v9bxh"}],["path",{d:"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z",key:"1ydw1z"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z1=i("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G1=i("Pin",[["line",{x1:"12",x2:"12",y1:"17",y2:"22",key:"1jrz49"}],["path",{d:"M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z",key:"13yl11"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y1=i("Play",[["polygon",{points:"5 3 19 12 5 21 5 3",key:"191637"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X1=i("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W1=i("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K1=i("Route",[["circle",{cx:"6",cy:"19",r:"3",key:"1kj8tv"}],["path",{d:"M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15",key:"1d8sl"}],["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J1=i("Rss",[["path",{d:"M4 11a9 9 0 0 1 9 9",key:"pv89mb"}],["path",{d:"M4 4a16 16 0 0 1 16 16",key:"k0647b"}],["circle",{cx:"5",cy:"19",r:"1",key:"bfqh0e"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ea=i("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ta=i("ScanLine",[["path",{d:"M3 7V5a2 2 0 0 1 2-2h2",key:"aa7l1z"}],["path",{d:"M17 3h2a2 2 0 0 1 2 2v2",key:"4qcy5o"}],["path",{d:"M21 17v2a2 2 0 0 1-2 2h-2",key:"6vwrx8"}],["path",{d:"M7 21H5a2 2 0 0 1-2-2v-2",key:"ioqczr"}],["path",{d:"M7 12h10",key:"b7w52i"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const aa=i("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ra=i("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sa=i("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oa=i("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const na=i("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ia=i("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const la=i("SlidersHorizontal",[["line",{x1:"21",x2:"14",y1:"4",y2:"4",key:"obuewd"}],["line",{x1:"10",x2:"3",y1:"4",y2:"4",key:"1q6298"}],["line",{x1:"21",x2:"12",y1:"12",y2:"12",key:"1iu8h1"}],["line",{x1:"8",x2:"3",y1:"12",y2:"12",key:"ntss68"}],["line",{x1:"21",x2:"16",y1:"20",y2:"20",key:"14d8ph"}],["line",{x1:"12",x2:"3",y1:"20",y2:"20",key:"m0wm8r"}],["line",{x1:"14",x2:"14",y1:"2",y2:"6",key:"14e1ph"}],["line",{x1:"8",x2:"8",y1:"10",y2:"14",key:"1i6ji0"}],["line",{x1:"16",x2:"16",y1:"18",y2:"22",key:"1lctlv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ca=i("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ha=i("Smile",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 14s1.5 2 4 2 4-2 4-2",key:"1y1vjs"}],["line",{x1:"9",x2:"9.01",y1:"9",y2:"9",key:"yxxnd0"}],["line",{x1:"15",x2:"15.01",y1:"9",y2:"9",key:"1p4y9e"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ya=i("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const da=i("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z",key:"1lpok0"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pa=i("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ua=i("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fa=i("Tablet",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["line",{x1:"12",x2:"12.01",y1:"18",y2:"18",key:"1dp563"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ka=i("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z",key:"y3tblf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ma=i("ToggleLeft",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"6",ry:"6",key:"f2vt7d"}],["circle",{cx:"8",cy:"12",r:"2",key:"1nvbw3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ga=i("ToggleRight",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"6",ry:"6",key:"f2vt7d"}],["circle",{cx:"16",cy:"12",r:"2",key:"4ma0v8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const va=i("TramFront",[["rect",{width:"16",height:"16",x:"4",y:"3",rx:"2",key:"1wxw4b"}],["path",{d:"M4 11h16",key:"mpoxn0"}],["path",{d:"M12 3v8",key:"1h2ygw"}],["path",{d:"m8 19-2 3",key:"13i0xs"}],["path",{d:"m18 22-2-3",key:"1p0ohu"}],["path",{d:"M8 15h0",key:"q9eq1f"}],["path",{d:"M16 15h0",key:"pzrbjg"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ma=i("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xa=i("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wa=i("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ca=i("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ba=i("Type",[["polyline",{points:"4 7 4 4 20 4 20 7",key:"1nosan"}],["line",{x1:"9",x2:"15",y1:"20",y2:"20",key:"swin9y"}],["line",{x1:"12",x2:"12",y1:"4",y2:"20",key:"1tx1rr"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ea=i("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Aa=i("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ra=i("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const za=i("UserX",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sa=i("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=i("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const La=i("Wallet",[["path",{d:"M21 12V7H5a2 2 0 0 1 0-4h14v4",key:"195gfw"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h16v-5",key:"195n9w"}],["path",{d:"M18 12a2 2 0 0 0 0 4h4v-4Z",key:"vllfpd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Na=i("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ia=i("Wifi",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oa=i("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ha=i("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ta=i("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]]);var xt=Object.defineProperty,_=Object.getOwnPropertySymbols,ke=Object.prototype.hasOwnProperty,me=Object.prototype.propertyIsEnumerable,le=(t,s,o)=>s in t?xt(t,s,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[s]=o,K=(t,s)=>{for(var o in s||(s={}))ke.call(s,o)&&le(t,o,s[o]);if(_)for(var o of _(s))me.call(s,o)&&le(t,o,s[o]);return t},J=(t,s)=>{var o={};for(var c in t)ke.call(t,c)&&s.indexOf(c)<0&&(o[c]=t[c]);if(t!=null&&_)for(var c of _(t))s.indexOf(c)<0&&me.call(t,c)&&(o[c]=t[c]);return o};/**
 * @license QR Code generator library (TypeScript)
 * Copyright (c) Project Nayuki.
 * SPDX-License-Identifier: MIT
 */var T;(t=>{const s=class v{constructor(e,r,a,n){if(this.version=e,this.errorCorrectionLevel=r,this.modules=[],this.isFunction=[],e<v.MIN_VERSION||e>v.MAX_VERSION)throw new RangeError("Version value out of range");if(n<-1||n>7)throw new RangeError("Mask value out of range");this.size=e*4+17;let l=[];for(let u=0;u<this.size;u++)l.push(!1);for(let u=0;u<this.size;u++)this.modules.push(l.slice()),this.isFunction.push(l.slice());this.drawFunctionPatterns();const p=this.addEccAndInterleave(a);if(this.drawCodewords(p),n==-1){let u=1e9;for(let g=0;g<8;g++){this.applyMask(g),this.drawFormatBits(g);const m=this.getPenaltyScore();m<u&&(n=g,u=m),this.applyMask(g)}}d(0<=n&&n<=7),this.mask=n,this.applyMask(n),this.drawFormatBits(n),this.isFunction=[]}static encodeText(e,r){const a=t.QrSegment.makeSegments(e);return v.encodeSegments(a,r)}static encodeBinary(e,r){const a=t.QrSegment.makeBytes(e);return v.encodeSegments([a],r)}static encodeSegments(e,r,a=1,n=40,l=-1,p=!0){if(!(v.MIN_VERSION<=a&&a<=n&&n<=v.MAX_VERSION)||l<-1||l>7)throw new RangeError("Invalid value");let u,g;for(u=a;;u++){const k=v.getNumDataCodewords(u,r)*8,x=y.getTotalBits(e,u);if(x<=k){g=x;break}if(u>=n)throw new RangeError("Data too long")}for(const k of[v.Ecc.MEDIUM,v.Ecc.QUARTILE,v.Ecc.HIGH])p&&g<=v.getNumDataCodewords(u,k)*8&&(r=k);let m=[];for(const k of e){o(k.mode.modeBits,4,m),o(k.numChars,k.mode.numCharCountBits(u),m);for(const x of k.getData())m.push(x)}d(m.length==g);const A=v.getNumDataCodewords(u,r)*8;d(m.length<=A),o(0,Math.min(4,A-m.length),m),o(0,(8-m.length%8)%8,m),d(m.length%8==0);for(let k=236;m.length<A;k^=253)o(k,8,m);let C=[];for(;C.length*8<m.length;)C.push(0);return m.forEach((k,x)=>C[x>>>3]|=k<<7-(x&7)),new v(u,r,C,l)}getModule(e,r){return 0<=e&&e<this.size&&0<=r&&r<this.size&&this.modules[r][e]}getModules(){return this.modules}drawFunctionPatterns(){for(let a=0;a<this.size;a++)this.setFunctionModule(6,a,a%2==0),this.setFunctionModule(a,6,a%2==0);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);const e=this.getAlignmentPatternPositions(),r=e.length;for(let a=0;a<r;a++)for(let n=0;n<r;n++)a==0&&n==0||a==0&&n==r-1||a==r-1&&n==0||this.drawAlignmentPattern(e[a],e[n]);this.drawFormatBits(0),this.drawVersion()}drawFormatBits(e){const r=this.errorCorrectionLevel.formatBits<<3|e;let a=r;for(let l=0;l<10;l++)a=a<<1^(a>>>9)*1335;const n=(r<<10|a)^21522;d(n>>>15==0);for(let l=0;l<=5;l++)this.setFunctionModule(8,l,c(n,l));this.setFunctionModule(8,7,c(n,6)),this.setFunctionModule(8,8,c(n,7)),this.setFunctionModule(7,8,c(n,8));for(let l=9;l<15;l++)this.setFunctionModule(14-l,8,c(n,l));for(let l=0;l<8;l++)this.setFunctionModule(this.size-1-l,8,c(n,l));for(let l=8;l<15;l++)this.setFunctionModule(8,this.size-15+l,c(n,l));this.setFunctionModule(8,this.size-8,!0)}drawVersion(){if(this.version<7)return;let e=this.version;for(let a=0;a<12;a++)e=e<<1^(e>>>11)*7973;const r=this.version<<12|e;d(r>>>18==0);for(let a=0;a<18;a++){const n=c(r,a),l=this.size-11+a%3,p=Math.floor(a/3);this.setFunctionModule(l,p,n),this.setFunctionModule(p,l,n)}}drawFinderPattern(e,r){for(let a=-4;a<=4;a++)for(let n=-4;n<=4;n++){const l=Math.max(Math.abs(n),Math.abs(a)),p=e+n,u=r+a;0<=p&&p<this.size&&0<=u&&u<this.size&&this.setFunctionModule(p,u,l!=2&&l!=4)}}drawAlignmentPattern(e,r){for(let a=-2;a<=2;a++)for(let n=-2;n<=2;n++)this.setFunctionModule(e+n,r+a,Math.max(Math.abs(n),Math.abs(a))!=1)}setFunctionModule(e,r,a){this.modules[r][e]=a,this.isFunction[r][e]=!0}addEccAndInterleave(e){const r=this.version,a=this.errorCorrectionLevel;if(e.length!=v.getNumDataCodewords(r,a))throw new RangeError("Invalid argument");const n=v.NUM_ERROR_CORRECTION_BLOCKS[a.ordinal][r],l=v.ECC_CODEWORDS_PER_BLOCK[a.ordinal][r],p=Math.floor(v.getNumRawDataModules(r)/8),u=n-p%n,g=Math.floor(p/n);let m=[];const A=v.reedSolomonComputeDivisor(l);for(let k=0,x=0;k<n;k++){let R=e.slice(x,x+g-l+(k<u?0:1));x+=R.length;const B=v.reedSolomonComputeRemainder(R,A);k<u&&R.push(0),m.push(R.concat(B))}let C=[];for(let k=0;k<m[0].length;k++)m.forEach((x,R)=>{(k!=g-l||R>=u)&&C.push(x[k])});return d(C.length==p),C}drawCodewords(e){if(e.length!=Math.floor(v.getNumRawDataModules(this.version)/8))throw new RangeError("Invalid argument");let r=0;for(let a=this.size-1;a>=1;a-=2){a==6&&(a=5);for(let n=0;n<this.size;n++)for(let l=0;l<2;l++){const p=a-l,g=(a+1&2)==0?this.size-1-n:n;!this.isFunction[g][p]&&r<e.length*8&&(this.modules[g][p]=c(e[r>>>3],7-(r&7)),r++)}}d(r==e.length*8)}applyMask(e){if(e<0||e>7)throw new RangeError("Mask value out of range");for(let r=0;r<this.size;r++)for(let a=0;a<this.size;a++){let n;switch(e){case 0:n=(a+r)%2==0;break;case 1:n=r%2==0;break;case 2:n=a%3==0;break;case 3:n=(a+r)%3==0;break;case 4:n=(Math.floor(a/3)+Math.floor(r/2))%2==0;break;case 5:n=a*r%2+a*r%3==0;break;case 6:n=(a*r%2+a*r%3)%2==0;break;case 7:n=((a+r)%2+a*r%3)%2==0;break;default:throw new Error("Unreachable")}!this.isFunction[r][a]&&n&&(this.modules[r][a]=!this.modules[r][a])}}getPenaltyScore(){let e=0;for(let l=0;l<this.size;l++){let p=!1,u=0,g=[0,0,0,0,0,0,0];for(let m=0;m<this.size;m++)this.modules[l][m]==p?(u++,u==5?e+=v.PENALTY_N1:u>5&&e++):(this.finderPenaltyAddHistory(u,g),p||(e+=this.finderPenaltyCountPatterns(g)*v.PENALTY_N3),p=this.modules[l][m],u=1);e+=this.finderPenaltyTerminateAndCount(p,u,g)*v.PENALTY_N3}for(let l=0;l<this.size;l++){let p=!1,u=0,g=[0,0,0,0,0,0,0];for(let m=0;m<this.size;m++)this.modules[m][l]==p?(u++,u==5?e+=v.PENALTY_N1:u>5&&e++):(this.finderPenaltyAddHistory(u,g),p||(e+=this.finderPenaltyCountPatterns(g)*v.PENALTY_N3),p=this.modules[m][l],u=1);e+=this.finderPenaltyTerminateAndCount(p,u,g)*v.PENALTY_N3}for(let l=0;l<this.size-1;l++)for(let p=0;p<this.size-1;p++){const u=this.modules[l][p];u==this.modules[l][p+1]&&u==this.modules[l+1][p]&&u==this.modules[l+1][p+1]&&(e+=v.PENALTY_N2)}let r=0;for(const l of this.modules)r=l.reduce((p,u)=>p+(u?1:0),r);const a=this.size*this.size,n=Math.ceil(Math.abs(r*20-a*10)/a)-1;return d(0<=n&&n<=9),e+=n*v.PENALTY_N4,d(0<=e&&e<=2568888),e}getAlignmentPatternPositions(){if(this.version==1)return[];{const e=Math.floor(this.version/7)+2,r=this.version==32?26:Math.ceil((this.version*4+4)/(e*2-2))*2;let a=[6];for(let n=this.size-7;a.length<e;n-=r)a.splice(1,0,n);return a}}static getNumRawDataModules(e){if(e<v.MIN_VERSION||e>v.MAX_VERSION)throw new RangeError("Version number out of range");let r=(16*e+128)*e+64;if(e>=2){const a=Math.floor(e/7)+2;r-=(25*a-10)*a-55,e>=7&&(r-=36)}return d(208<=r&&r<=29648),r}static getNumDataCodewords(e,r){return Math.floor(v.getNumRawDataModules(e)/8)-v.ECC_CODEWORDS_PER_BLOCK[r.ordinal][e]*v.NUM_ERROR_CORRECTION_BLOCKS[r.ordinal][e]}static reedSolomonComputeDivisor(e){if(e<1||e>255)throw new RangeError("Degree out of range");let r=[];for(let n=0;n<e-1;n++)r.push(0);r.push(1);let a=1;for(let n=0;n<e;n++){for(let l=0;l<r.length;l++)r[l]=v.reedSolomonMultiply(r[l],a),l+1<r.length&&(r[l]^=r[l+1]);a=v.reedSolomonMultiply(a,2)}return r}static reedSolomonComputeRemainder(e,r){let a=r.map(n=>0);for(const n of e){const l=n^a.shift();a.push(0),r.forEach((p,u)=>a[u]^=v.reedSolomonMultiply(p,l))}return a}static reedSolomonMultiply(e,r){if(e>>>8||r>>>8)throw new RangeError("Byte out of range");let a=0;for(let n=7;n>=0;n--)a=a<<1^(a>>>7)*285,a^=(r>>>n&1)*e;return d(a>>>8==0),a}finderPenaltyCountPatterns(e){const r=e[1];d(r<=this.size*3);const a=r>0&&e[2]==r&&e[3]==r*3&&e[4]==r&&e[5]==r;return(a&&e[0]>=r*4&&e[6]>=r?1:0)+(a&&e[6]>=r*4&&e[0]>=r?1:0)}finderPenaltyTerminateAndCount(e,r,a){return e&&(this.finderPenaltyAddHistory(r,a),r=0),r+=this.size,this.finderPenaltyAddHistory(r,a),this.finderPenaltyCountPatterns(a)}finderPenaltyAddHistory(e,r){r[0]==0&&(e+=this.size),r.pop(),r.unshift(e)}};s.MIN_VERSION=1,s.MAX_VERSION=40,s.PENALTY_N1=3,s.PENALTY_N2=3,s.PENALTY_N3=40,s.PENALTY_N4=10,s.ECC_CODEWORDS_PER_BLOCK=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],s.NUM_ERROR_CORRECTION_BLOCKS=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]],t.QrCode=s;function o(f,e,r){if(e<0||e>31||f>>>e)throw new RangeError("Value out of range");for(let a=e-1;a>=0;a--)r.push(f>>>a&1)}function c(f,e){return(f>>>e&1)!=0}function d(f){if(!f)throw new Error("Assertion error")}const h=class w{constructor(e,r,a){if(this.mode=e,this.numChars=r,this.bitData=a,r<0)throw new RangeError("Invalid argument");this.bitData=a.slice()}static makeBytes(e){let r=[];for(const a of e)o(a,8,r);return new w(w.Mode.BYTE,e.length,r)}static makeNumeric(e){if(!w.isNumeric(e))throw new RangeError("String contains non-numeric characters");let r=[];for(let a=0;a<e.length;){const n=Math.min(e.length-a,3);o(parseInt(e.substring(a,a+n),10),n*3+1,r),a+=n}return new w(w.Mode.NUMERIC,e.length,r)}static makeAlphanumeric(e){if(!w.isAlphanumeric(e))throw new RangeError("String contains unencodable characters in alphanumeric mode");let r=[],a;for(a=0;a+2<=e.length;a+=2){let n=w.ALPHANUMERIC_CHARSET.indexOf(e.charAt(a))*45;n+=w.ALPHANUMERIC_CHARSET.indexOf(e.charAt(a+1)),o(n,11,r)}return a<e.length&&o(w.ALPHANUMERIC_CHARSET.indexOf(e.charAt(a)),6,r),new w(w.Mode.ALPHANUMERIC,e.length,r)}static makeSegments(e){return e==""?[]:w.isNumeric(e)?[w.makeNumeric(e)]:w.isAlphanumeric(e)?[w.makeAlphanumeric(e)]:[w.makeBytes(w.toUtf8ByteArray(e))]}static makeEci(e){let r=[];if(e<0)throw new RangeError("ECI assignment value out of range");if(e<128)o(e,8,r);else if(e<16384)o(2,2,r),o(e,14,r);else if(e<1e6)o(6,3,r),o(e,21,r);else throw new RangeError("ECI assignment value out of range");return new w(w.Mode.ECI,0,r)}static isNumeric(e){return w.NUMERIC_REGEX.test(e)}static isAlphanumeric(e){return w.ALPHANUMERIC_REGEX.test(e)}getData(){return this.bitData.slice()}static getTotalBits(e,r){let a=0;for(const n of e){const l=n.mode.numCharCountBits(r);if(n.numChars>=1<<l)return 1/0;a+=4+l+n.bitData.length}return a}static toUtf8ByteArray(e){e=encodeURI(e);let r=[];for(let a=0;a<e.length;a++)e.charAt(a)!="%"?r.push(e.charCodeAt(a)):(r.push(parseInt(e.substring(a+1,a+3),16)),a+=2);return r}};h.NUMERIC_REGEX=/^[0-9]*$/,h.ALPHANUMERIC_REGEX=/^[A-Z0-9 $%*+.\/:-]*$/,h.ALPHANUMERIC_CHARSET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";let y=h;t.QrSegment=h})(T||(T={}));(t=>{(s=>{const o=class{constructor(d,h){this.ordinal=d,this.formatBits=h}};o.LOW=new o(0,1),o.MEDIUM=new o(1,0),o.QUARTILE=new o(2,3),o.HIGH=new o(3,2),s.Ecc=o})(t.QrCode||(t.QrCode={}))})(T||(T={}));(t=>{(s=>{const o=class{constructor(d,h){this.modeBits=d,this.numBitsCharCount=h}numCharCountBits(d){return this.numBitsCharCount[Math.floor((d+7)/17)]}};o.NUMERIC=new o(1,[10,12,14]),o.ALPHANUMERIC=new o(2,[9,11,13]),o.BYTE=new o(4,[8,16,16]),o.KANJI=new o(8,[8,10,12]),o.ECI=new o(7,[0,0,0]),s.Mode=o})(t.QrSegment||(t.QrSegment={}))})(T||(T={}));var D=T;/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */var wt={L:D.QrCode.Ecc.LOW,M:D.QrCode.Ecc.MEDIUM,Q:D.QrCode.Ecc.QUARTILE,H:D.QrCode.Ecc.HIGH},ge=128,ve="L",Me="#FFFFFF",xe="#000000",we=!1,Ce=1,Ct=4,bt=0,Et=.1;function be(t,s=0){const o=[];return t.forEach(function(c,d){let h=null;c.forEach(function(y,f){if(!y&&h!==null){o.push(`M${h+s} ${d+s}h${f-h}v1H${h+s}z`),h=null;return}if(f===c.length-1){if(!y)return;h===null?o.push(`M${f+s},${d+s} h1v1H${f+s}z`):o.push(`M${h+s},${d+s} h${f+1-h}v1H${h+s}z`);return}y&&h===null&&(h=f)})}),o.join("")}function Ee(t,s){return t.slice().map((o,c)=>c<s.y||c>=s.y+s.h?o:o.map((d,h)=>h<s.x||h>=s.x+s.w?d:!1))}function At(t,s,o,c){if(c==null)return null;const d=t.length+o*2,h=Math.floor(s*Et),y=d/s,f=(c.width||h)*y,e=(c.height||h)*y,r=c.x==null?t.length/2-f/2:c.x*y,a=c.y==null?t.length/2-e/2:c.y*y,n=c.opacity==null?1:c.opacity;let l=null;if(c.excavate){let u=Math.floor(r),g=Math.floor(a),m=Math.ceil(f+r-u),A=Math.ceil(e+a-g);l={x:u,y:g,w:m,h:A}}const p=c.crossOrigin;return{x:r,y:a,h:e,w:f,excavation:l,opacity:n,crossOrigin:p}}function Rt(t,s){return s!=null?Math.max(Math.floor(s),0):t?Ct:bt}function Ae({value:t,level:s,minVersion:o,includeMargin:c,marginSize:d,imageSettings:h,size:y,boostLevel:f}){let e=b.useMemo(()=>{const u=(Array.isArray(t)?t:[t]).reduce((g,m)=>(g.push(...D.QrSegment.makeSegments(m)),g),[]);return D.QrCode.encodeSegments(u,wt[s],o,void 0,void 0,f)},[t,s,o,f]);const{cells:r,margin:a,numCells:n,calculatedImageSettings:l}=b.useMemo(()=>{let p=e.getModules();const u=Rt(c,d),g=p.length+u*2,m=At(p,y,u,h);return{cells:p,margin:u,numCells:g,calculatedImageSettings:m}},[e,y,h,c,d]);return{qrcode:e,margin:a,cells:r,numCells:n,calculatedImageSettings:l}}var zt=function(){try{new Path2D().addPath(new Path2D)}catch{return!1}return!0}(),St=b.forwardRef(function(s,o){const c=s,{value:d,size:h=ge,level:y=ve,bgColor:f=Me,fgColor:e=xe,includeMargin:r=we,minVersion:a=Ce,boostLevel:n,marginSize:l,imageSettings:p}=c,g=J(c,["value","size","level","bgColor","fgColor","includeMargin","minVersion","boostLevel","marginSize","imageSettings"]),{style:m}=g,A=J(g,["style"]),C=p==null?void 0:p.src,k=b.useRef(null),x=b.useRef(null),R=b.useCallback(H=>{k.current=H,typeof o=="function"?o(H):o&&(o.current=H)},[o]),[B,te]=b.useState(!1),{margin:F,cells:G,numCells:Y,calculatedImageSettings:z}=Ae({value:d,level:y,minVersion:a,boostLevel:n,includeMargin:r,marginSize:l,imageSettings:p,size:h});b.useEffect(()=>{if(k.current!=null){const H=k.current,P=H.getContext("2d");if(!P)return;let re=G;const q=x.current,se=z!=null&&q!==null&&q.complete&&q.naturalHeight!==0&&q.naturalWidth!==0;se&&z.excavation!=null&&(re=Ee(G,z.excavation));const oe=window.devicePixelRatio||1;H.height=H.width=h*oe;const ne=h/Y*oe;P.scale(ne,ne),P.fillStyle=f,P.fillRect(0,0,Y,Y),P.fillStyle=e,zt?P.fill(new Path2D(be(re,F))):G.forEach(function(ze,Se){ze.forEach(function(Pe,Le){Pe&&P.fillRect(Le+F,Se+F,1,1)})}),z&&(P.globalAlpha=z.opacity),se&&P.drawImage(q,z.x+F,z.y+F,z.w,z.h)}}),b.useEffect(()=>{te(!1)},[C]);const Re=K({height:h,width:h},m);let ae=null;return C!=null&&(ae=b.createElement("img",{src:C,key:C,style:{display:"none"},onLoad:()=>{te(!0)},ref:x,crossOrigin:z==null?void 0:z.crossOrigin})),b.createElement(b.Fragment,null,b.createElement("canvas",K({style:Re,height:h,width:h,ref:R,role:"img"},A)),ae)});St.displayName="QRCodeCanvas";var Pt=b.forwardRef(function(s,o){const c=s,{value:d,size:h=ge,level:y=ve,bgColor:f=Me,fgColor:e=xe,includeMargin:r=we,minVersion:a=Ce,boostLevel:n,title:l,marginSize:p,imageSettings:u}=c,g=J(c,["value","size","level","bgColor","fgColor","includeMargin","minVersion","boostLevel","title","marginSize","imageSettings"]),{margin:m,cells:A,numCells:C,calculatedImageSettings:k}=Ae({value:d,level:y,minVersion:a,boostLevel:n,includeMargin:r,marginSize:p,imageSettings:u,size:h});let x=A,R=null;u!=null&&k!=null&&(k.excavation!=null&&(x=Ee(A,k.excavation)),R=b.createElement("image",{href:u.src,height:k.h,width:k.w,x:k.x+m,y:k.y+m,preserveAspectRatio:"none",opacity:k.opacity,crossOrigin:k.crossOrigin}));const B=be(x,m);return b.createElement("svg",K({height:h,width:h,viewBox:`0 0 ${C} ${C}`,ref:o,role:"img"},g),!!l&&b.createElement("title",null,l),b.createElement("path",{fill:f,d:`M0,0 h${C}v${C}H0z`,shapeRendering:"crispEdges"}),b.createElement("path",{fill:e,d:B,shapeRendering:"crispEdges"}),R)});Pt.displayName="QRCodeSVG";export{N1 as $,Ot as A,Vt as B,Kt as C,c1 as D,h1 as E,y1 as F,d1 as G,p1 as H,u1 as I,f1 as J,m1 as K,k1 as L,Nt as M,g1 as N,v1 as O,M1 as P,x1 as Q,w1 as R,C1 as S,b1 as T,E1 as U,A1 as V,R1 as W,z1 as X,S1 as Y,P1 as Z,L1 as _,Ht as a,I1 as a0,O1 as a1,T1 as a2,H1 as a3,D1 as a4,F1 as a5,q1 as a6,B1 as a7,U1 as a8,j1 as a9,ua as aA,fa as aB,ka as aC,ma as aD,ga as aE,va as aF,Ma as aG,xa as aH,wa as aI,Ca as aJ,ba as aK,Ea as aL,Sa as aM,Aa as aN,Ra as aO,za as aP,Pa as aQ,La as aR,Ia as aS,Na as aT,Ha as aU,Oa as aV,Ta as aW,It as aX,$1 as aa,V1 as ab,_1 as ac,Q1 as ad,Z1 as ae,G1 as af,Y1 as ag,X1 as ah,Pt as ai,W1 as aj,K1 as ak,J1 as al,ea as am,ta as an,aa as ao,ra as ap,sa as aq,oa as ar,ia as as,na as at,la as au,ca as av,ha as aw,ya as ax,da as ay,pa as az,Tt as b,Dt as c,qt as d,Ft as e,Ut as f,Bt as g,jt as h,$t as i,_t as j,Qt as k,Zt as l,Yt as m,Gt as n,Xt as o,Wt as p,Jt as q,e1 as r,a1 as s,t1 as t,r1 as u,s1 as v,o1 as w,n1 as x,i1 as y,l1 as z};
