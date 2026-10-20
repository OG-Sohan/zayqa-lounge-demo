import arancini from "@/assets/dishes/dish-arancini-768.webp";
import biryani from "@/assets/dishes/dish-biryani-768.webp";
import seabass from "@/assets/dishes/dish-seabass-768.webp";
import lamb from "@/assets/dishes/dish-lamb-768.webp";
import tart from "@/assets/dishes/dish-tart-768.webp";
import chai from "@/assets/dishes/dish-chai-768.webp";
import aranciniSmall from "@/assets/dishes/dish-arancini-480.webp";
import biryaniSmall from "@/assets/dishes/dish-biryani-480.webp";
import seabassSmall from "@/assets/dishes/dish-seabass-480.webp";
import lambSmall from "@/assets/dishes/dish-lamb-480.webp";
import tartSmall from "@/assets/dishes/dish-tart-480.webp";
import chaiSmall from "@/assets/dishes/dish-chai-480.webp";
export const prominentSlugs=["signature-clay-pot-biryani","smoke-infused-lamb-chops","pan-seared-sea-bass","truffle-saffron-arancini","pistachio-rose-tart","royal-saffron-chai"];
export const dishPhotos:Record<string,string>={"truffle-saffron-arancini":arancini,"signature-clay-pot-biryani":biryani,"pan-seared-sea-bass":seabass,"smoke-infused-lamb-chops":lamb,"pistachio-rose-tart":tart,"royal-saffron-chai":chai};
const small:Record<string,string>={[arancini]:aranciniSmall,[biryani]:biryaniSmall,[seabass]:seabassSmall,[lamb]:lambSmall,[tart]:tartSmall,[chai]:chaiSmall};
export const photoSrcSet=(url:string)=>small[url]?`${small[url]} 480w, ${url} 768w`:undefined;
/** Uploaded photos remain authoritative; repeated URLs are assigned to only one dish. */
export function assignUniquePhotos<T extends {slug:string;image:string}>(items:T[]):T[]{const used=new Set<string>();return items.map(item=>{const image=item.image||dishPhotos[item.slug]||"";if(!image||used.has(image))return {...item,image:""};used.add(image);return {...item,image}})}