import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dish } from "@/lib/zayqa-data";
export type CartItem = { dish: Dish; quantity: number; addOns: {name:string;price:number}[] };
type CartValue = { items: CartItem[]; count:number; subtotal:number; add:(dish:Dish, quantity?:number, addOns?:CartItem["addOns"])=>void; update:(key:string,quantity:number)=>void; remove:(key:string)=>void; clear:()=>void };
/** The same dish with different add-ons is a separate line, so lines are identified by dish + sorted add-on names. */
export const lineKey=(i:Pick<CartItem,"dish"|"addOns">)=>[i.dish.slug,...i.addOns.map(a=>a.name).sort()].join("|");
const CartContext = createContext<CartValue | null>(null);
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]); const [ready,setReady]=useState(false);
 useEffect(()=>{ try{const saved=JSON.parse(localStorage.getItem("zayqa-cart")||"[]"); if(Array.isArray(saved))setItems(saved.filter(i=>i?.dish?.slug&&i.quantity>0).map(i=>({...i,addOns:i.addOns??[]})));}catch{/* ignore corrupt storage */} setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("zayqa-cart",JSON.stringify(items))},[items,ready]);
 const value=useMemo(()=>({items,count:items.reduce((a,i)=>a+i.quantity,0),subtotal:items.reduce((a,i)=>a+(i.dish.price+i.addOns.reduce((s,x)=>s+x.price,0))*i.quantity,0),add:(dish:Dish,quantity=1,addOns:CartItem["addOns"]=[])=>setItems(v=>{const key=lineKey({dish,addOns}); const at=v.findIndex(i=>lineKey(i)===key); if(at<0)return [...v,{dish,quantity,addOns}]; return v.map((i,n)=>n===at?{...i,quantity:i.quantity+quantity}:i)}),update:(key:string,quantity:number)=>setItems(v=>v.map(i=>lineKey(i)===key?{...i,quantity}:i).filter(i=>i.quantity>0)),remove:(key:string)=>setItems(v=>v.filter(i=>lineKey(i)!==key)),clear:()=>setItems([])}),[items]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart(){const value=useContext(CartContext); if(!value)throw new Error("CartProvider missing"); return value}
