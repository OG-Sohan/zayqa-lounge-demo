import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
export function MotionExperience(){const path=useRouterState({select:s=>s.location.pathname});const progress=useRef<HTMLDivElement>(null),evening=useRef<HTMLDivElement>(null),halo=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");let cleanup=()=>{};
  const updateBar=()=>{const mobile=document.querySelector<HTMLElement>(".mobile-hospitality");if(!mobile)return;const footer=document.querySelector(".site-footer")?.getBoundingClientRect();const hero=document.querySelector(".hero");const afterHero=hero?hero.getBoundingClientRect().bottom<innerHeight*.45:scrollY>180;mobile.classList.toggle("is-visible",afterHero&&(!footer||footer.top>innerHeight)&&!document.activeElement?.matches("input,textarea,[role=combobox]"))};
  const setup=()=>{cleanup();if(reduced.matches){document.querySelectorAll(".motion-pending").forEach(el=>el.classList.remove("motion-pending"));updateBar();addEventListener("scroll",updateBar,{passive:true});addEventListener("focusin",updateBar);addEventListener("focusout",updateBar);cleanup=()=>{removeEventListener("scroll",updateBar);removeEventListener("focusin",updateBar);removeEventListener("focusout",updateBar)};return}
   const main=document.querySelector("main");if(!main)return;
   let frame=0,last=scrollY,lastTick=0,slow=0,pointerFrame=0;let px=0,py=0,hx=0,hy=0;
   const active=new Set<Element>();const linked=[...document.querySelectorAll(".hero,.atmosphere,.signature-scroll,.review-marquee")];
   const near=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)active.add(e.target);else {active.delete(e.target);e.target.querySelectorAll<HTMLElement>("[data-scrub]").forEach(el=>el.style.willChange="")} });schedule()},{rootMargin:"100% 0px"});linked.forEach(el=>near.observe(el));
   const pending=new Set<Element>();const reveal=(el:Element)=>{el.classList.remove("motion-pending");el.classList.add("motion-visible");pending.delete(el);setTimeout(()=>{(el as HTMLElement).style.willChange=""},1300)};
   const normal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);normal.unobserve(e.target)}}),{threshold:.08,rootMargin:"0px 0px -8% 0px"});
   const tall=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);tall.unobserve(e.target)}}),{threshold:.01,rootMargin:"0px 0px -8% 0px"});
   main.querySelectorAll<HTMLElement>("h2:not(.control-room h2):not(.atmosphere h2), img:not(.hero img):not(.signature-track img):not(.atmosphere img), .menu-category .dish-card").forEach((el,index)=>{
    if(el.closest(".control-room,.lightbox,[role=dialog]")||el.classList.contains("motion-ready"))return;
    el.classList.add("motion-ready");

    if(el.classList.contains("dish-card"))el.style.transitionDelay=`${(index%6)*50}ms`;
    el.classList.add("motion-pending");pending.add(el);(el.getBoundingClientRect().height>innerHeight?tall:normal).observe(el);
   });
   const safety=setTimeout(()=>pending.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)reveal(el)}),1500);
   const set=(el:HTMLElement|null,transform:string,opacity?:number)=>{if(!el)return;el.style.willChange="transform, opacity";el.style.transform=transform;if(opacity!==undefined)el.style.opacity=String(opacity)};
   const update=(time:number)=>{frame=0;const y=scrollY,range=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.min(1,y/range);if(progress.current)progress.current.style.transform=`scaleX(${p})`;if(evening.current)evening.current.style.opacity=String(p*.35);
    const header=document.querySelector<HTMLElement>(".site-header");if(header){header.classList.toggle("nav-away",y>150&&y>last+3);if(y<last-3||y<150)header.classList.remove("nav-away")}last=y;
    active.forEach(section=>{const r=section.getBoundingClientRect();if(section.matches(".hero")){const amount=Math.max(0,Math.min(y,innerHeight*.7));set(section.querySelector(".hero-image-scroll"),`translateY(${amount*.18}px)`);set(section.querySelector(".hero-copy-scroll"),`translateY(${-amount*.12}px)`,1-.65*Math.min(1,amount/(innerHeight*.7)))}
     if(section.matches(".signature-scroll")){const track=section.querySelector<HTMLElement>(".signature-track");const viewport=section.querySelector<HTMLElement>(".signature-viewport");if(track&&viewport){const distance=track.scrollWidth-viewport.clientWidth;const travel=Math.max(1,r.height-innerHeight);const value=Math.max(0,Math.min(1,-r.top/travel));set(track,`translateX(${-distance*value}px)`);const line=section.querySelector<HTMLElement>(".signature-progress span");set(line,`scaleX(${value})`);const counter=section.querySelector("[data-signature-counter]");if(counter)counter.textContent=`${String(Math.min(6,Math.floor(value*6)+1)).padStart(2,"0")} / 06`}}
     if(section.matches(".atmosphere")){const amount=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));set(section.querySelector("img"),`scale(${1.15-.15*amount})`);section.querySelectorAll<HTMLElement>(".atmosphere-word").forEach((word,i)=>{const v=Math.max(0,Math.min(1,(amount-.18-i*.045)*4));set(word,`translateY(${(1-v)*65}px)`,v)})}
    });
    const mobile=document.querySelector<HTMLElement>(".mobile-hospitality");if(mobile){const footer=document.querySelector(".site-footer")?.getBoundingClientRect();const hero=document.querySelector(".hero");const afterHero=hero?hero.getBoundingClientRect().bottom<innerHeight*.45:y>180;const keyboard=document.activeElement?.matches("input,textarea,[role=combobox]");mobile.classList.toggle("is-visible",afterHero&&(!footer||footer.top>innerHeight)&&!keyboard)}
    if(lastTick&&time-lastTick>35){slow++}else slow=Math.max(0,slow-1);lastTick=time;if(slow>5&&halo.current){halo.current.style.opacity="0";cancelAnimationFrame(pointerFrame)}
   };
   function schedule(){if(!frame)frame=requestAnimationFrame(update)}
   const pointer=(e:PointerEvent)=>{if(e.pointerType!=="mouse"||!matchMedia("(hover:hover) and (pointer:fine)").matches||slow>5)return;px=e.clientX;py=e.clientY;const dark=(e.target as Element).closest(".hero,.kitchen,.room,.quote-band,.private-home,.reserve-home,.site-footer,.signature-scroll,.atmosphere");if(halo.current)halo.current.style.opacity=dark?".22":"0";if(!pointerFrame)pointerFrame=requestAnimationFrame(follow)};
   function follow(){pointerFrame=0;hx+=(px-hx)*.12;hy+=(py-hy)*.12;if(halo.current)halo.current.style.transform=`translate(${hx-160}px,${hy-160}px)`;if(Math.abs(px-hx)+Math.abs(py-hy)>1)pointerFrame=requestAnimationFrame(follow)}
   addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule);addEventListener("pointermove",pointer,{passive:true});addEventListener("focusin",schedule);addEventListener("focusout",schedule);schedule();
   cleanup=()=>{cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);clearTimeout(safety);normal.disconnect();tall.disconnect();near.disconnect();pending.forEach(reveal);removeEventListener("scroll",schedule);removeEventListener("resize",schedule);removeEventListener("pointermove",pointer);removeEventListener("focusin",schedule);removeEventListener("focusout",schedule)};
  };const ready=setTimeout(setup,350);reduced.addEventListener("change",setup);return()=>{clearTimeout(ready);cleanup();reduced.removeEventListener("change",setup)};
 },[path]);
 return <><div className="page-scroll-progress" ref={progress} aria-hidden="true"/><div className="evening-overlay" ref={evening} aria-hidden="true"/><svg className="film-grain" aria-hidden="true"><filter id="zayqa-grain"><feTurbulence type="fractalNoise" baseFrequency=".88" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#zayqa-grain)"/></svg><div className="pointer-halo" ref={halo} aria-hidden="true"/></>;
}