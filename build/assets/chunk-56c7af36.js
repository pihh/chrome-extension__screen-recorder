import"./chunk-1ebdbb1b.js";const v=document.getElementById("header"),u=document.getElementById("input-title"),l=document.getElementById("input-mime"),$=document.querySelector("video"),s={},m="pihhs-screen-recorder-extension",p=["webm","ogg","mp4","x-matroska"],h=["vp9","vp9.0","vp8","vp8.0","avc1","av1","h265","h.265","h264","h.264","opus","pcm","aac","mpeg","mp4a"];function E(){L()}function y(){const t=b("video",p,h);let o=!0;for(let n of p){const i=`video/${n}`;if(t.indexOf(i)>-1&&!s[n]){s[n]={supported:i+";codecs=vp9",fallback:i};const e=document.createElement("option");e.innerText=n,e.value=n,e.selected=o,l.append(e),o=!1}}}function M(){u.value=m}function T(){v.addEventListener("click",E)}function g(){M(),y(),T()}function b(t,o,n){const i=MediaRecorder.isTypeSupported,e=[];return o.forEach(d=>{const c=`${t}/${d}`;n.forEach(a=>[`${c};codecs=${a}`,`${c};codecs=${a.toUpperCase()}`].forEach(r=>{i(r)&&e.push(r)})),i(c)&&e.push(c)}),e}function f(){return l.value}function S(){let t=f();return(u.value||m)+"__"+Date.now()+"."+t}async function L(){try{const t=S(),o=f();let n=await navigator.mediaDevices.getDisplayMedia({video:!0});const i=MediaRecorder.isTypeSupported(s[o].supported)?s[o].supported:s[o].fallback;let e=new MediaRecorder(n,{mimeType:i}),d=[];e.addEventListener("dataavailable",function(c){d.push(c.data)}),e.addEventListener("stop",function(){let c=new Blob(d,{type:d[0].type}),a=URL.createObjectURL(c);$.src=a;let r=document.createElement("a");r.href=a,r.download=t,r.click()}),e.start()}catch(t){console.warn(t)}}g();