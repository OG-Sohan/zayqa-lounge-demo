import { createFileRoute } from "@tanstack/react-router";
import { CategoryNav, MenuCategory } from "@/components/menu-ui";
import { categories } from "@/lib/zayqa-data";
export const Route=createFileRoute("/menu")({head:()=>({meta:[{title:"Menu — Zayqa Lounge"},{name:"description",content:"Browse Zayqa Lounge starters, signatures, mains, grills, desserts and drinks."},{property:"og:title",content:"Menu — Zayqa Lounge"},{property:"og:description",content:"Food for sharing, lingering and returning to."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:MenuPage});
function MenuPage(){return <div className="page menu-page"><header className="page-hero compact"><p className="eyebrow">Taste · Connect · Unwind</p><h1>The menu</h1><p>Food for sharing, lingering and returning to.</p></header><div className="menu-nav-wrap"><span>Browse menu</span><CategoryNav/></div>{categories.map(c=><MenuCategory key={c.slug} slug={c.slug}/>)}</div>}
