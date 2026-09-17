import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dish } from "@/lib/zayqa-data";
export type CartItem = { dish: Dish; quantity: number; addOns: {name:string;price:number}[] };
type CartValue = { items: CartItem[]; count:number; subtotal:number; add:(dish:Dish, quantity?:number, addOns?:CartItem["addOns"])=>void; update:(slug:string,quantity:number)=>void; remove:(slug:string)=>void; clear:()=>void };
const CartContext = createContext<CartValue | null>(null);
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]); const [ready,setReady]=useState(false);
 useEffect(()=>{ try{const saved=localStorage.getItem("zayqa-cart"); if(saved)setItems(JSON.parse(saved));}catch{} setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("zayqa-cart",JSON.stringify(items))},[items,ready]);
 const value=useMemo(()=>({items,count:items.reduce((a,i)=>a+i.quantity,0),subtotal:items.reduce((a,i)=>a+(i.dish.price+i.addOns.reduce((s,x)=>s+x.price,0))*i.quantity,0),add:(dish:Dish,quantity=1,addOns:CartItem["addOns"]=[])=>setItems(v=>{const key=dish.slug+addOns.map(a=>a.name).join(); const at=v.findIndex(i=>i.dish.slug+i.addOns.map(a=>a.name).join()===key); if(at<0)return [...v,{dish,quantity,addOns}]; return v.map((i,n)=>n===at?{...i,quantity:i.quantity+quantity}:i)}),update:(slug:string,quantity:number)=>setItems(v=>v.map(i=>i.dish.slug===slug?{...i,quantity}:i).filter(i=>i.quantity>0)),remove:(slug:string)=>setItems(v=>v.filter(i=>i.dish.slug!==slug)),clear:()=>setItems([])}),[items]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext); if(!value)throw new Error("CartProvider missing"); return value}
