import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUp, ArrowUpRight, LockKeyhole, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider, useCart } from "@/components/cart-context";
import { useRestaurant } from "@/hooks/use-restaurant";
const nav=[{to:"/menu",label:"Menu"},{to:"/experience",label:"Experience"},{to:"/about",label:"About"},{to:"/gallery",label:"Gallery"},{to:"/private-dining",label:"Private Dining"},{to:"/location",label:"Location"}] as const;
const scrollToTop=()=>scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
// Linking to the current route is a no-op in the router, so on the homepage the logo scrolls back to the top instead.
function HomeLink({className,children,onClick}:{className?:string;children:ReactNode;onClick?:()=>void}){const path=useRouterState({select:s=>s.location.pathname});
 return <Link to="/" className={className} aria-label="Zayqa Lounge home" onClick={e=>{onClick?.();if(path==="/"){e.preventDefault();scrollToTop()}}}>{children}</Link>}
function Header(){const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false); const path=useRouterState({select:s=>s.location.pathname}); const {count}=useCart(); const home=path==="/";
 useEffect(()=>{const on=()=>setScrolled(scrollY>40); on();addEventListener("scroll",on,{passive:true});return()=>removeEventListener("scroll",on)},[]);
 useEffect(()=>setOpen(false),[path]); const dark=home&&!scrolled;
 return <><header className={`site-header ${dark?"site-header-over":"site-header-solid"}`}><HomeLink className="wordmark">ZAYQA</HomeLink><nav className="desktop-nav" aria-label="Main navigation">{nav.slice(0,5).map(n=><Link key={n.to} to={n.to}>{n.label}</Link>)}</nav><div className="header-actions"><Link className="location-link" to="/location">Location</Link><Button asChild variant={dark?"lightOutline":"outline"} size="sm"><Link to="/reserve">Reserve</Link></Button><Link to="/cart" className="icon-link" aria-label={`Cart with ${count} items`}><ShoppingBag/><span>{count}</span></Link><Button className="menu-trigger" variant="ghost" size="icon" aria-label="Open menu" onClick={()=>setOpen(true)}><Menu/></Button></div></header>
 <div className={`mobile-menu ${open?"is-open":""}`} aria-hidden={!open}><div className="mobile-menu-top"><HomeLink className="wordmark" onClick={()=>setOpen(false)}>ZAYQA</HomeLink><Button variant="ghost" size="icon" aria-label="Close menu" onClick={()=>setOpen(false)}><X/></Button></div><nav>{nav.map(n=><Link key={n.to} to={n.to}>{n.label}</Link>)}</nav><div className="mobile-menu-actions"><Button asChild variant="cream"><Link to="/reserve">Reserve a table</Link></Button><Button asChild variant="creamOutline"><Link to="/menu">Order online</Link></Button></div></div></>}
function Footer(){const path=useRouterState({select:s=>s.location.pathname}); const restaurant=useRestaurant(); const [street,...city]=restaurant.address.split(", ");
 return <footer className="site-footer">
  <div className="footer-top"><HomeLink className="footer-brand">ZAYQA<small>LOUNGE</small></HomeLink><p className="footer-tagline">{restaurant.tagline}.</p>{path!=="/"&&<Button asChild variant="cream"><Link to="/reserve">Reserve a table</Link></Button>}</div>
  <div className="footer-grid">
   <div className="footer-col"><p className="footer-heading">Explore</p>{nav.map(n=><Link key={n.to} to={n.to}>{n.label}</Link>)}</div>
   <div className="footer-col"><p className="footer-heading">Dine with us</p><Link to="/reserve">Reservations</Link><Link to="/menu">Order online</Link><Link to="/contact">Contact</Link><Link to="/account">My account</Link></div>
   <div className="footer-col"><p className="footer-heading">Visit</p><address>{street}<br/>{city.join(", ")}</address><Link to="/location" className="footer-arrow-link">Get directions <ArrowUpRight/></Link></div>
   <div className="footer-col"><p className="footer-heading">Hours &amp; contact</p><p>Open daily<br/>{restaurant.hours}</p><a href={`tel:${restaurant.phone.replace(/[^+\d]/g,"")}`}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></div>
  </div>
  <div className="footer-bottom"><span>© 2026 Zayqa Lounge</span><div className="footer-legal"><span>Instagram</span><span>Privacy</span><span>Terms</span></div><div className="footer-actions"><Link to="/admin" className="footer-admin"><LockKeyhole/>Admin</Link><button type="button" className="back-to-top" onClick={scrollToTop}>Back to top <ArrowUp/></button></div></div>
 </footer>}
function ShellInner({children}:{children:ReactNode}){const path=useRouterState({select:s=>s.location.pathname});
 const signIn=path==="/auth",management=path.startsWith("/admin");
 return <><Header/><main>{children}</main>{path!=="/reserve"&&!signIn&&!management&&<Link className="mobile-reserve-pill" to="/reserve">Reserve a table</Link>}{!signIn&&<Footer/>}<Toaster position="bottom-center" duration={3500} mobileOffset={{bottom:76}} className="zayqa-toaster"/></>}
export function SiteShell({children}:{children:ReactNode}){return <CartProvider><ShellInner>{children}</ShellInner></CartProvider>}
