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
import aubergine768 from "@/assets/dishes/dish-charred-aubergine-768.webp";
import aubergine1280 from "@/assets/dishes/dish-charred-aubergine-1280.webp";
import samosa768 from "@/assets/dishes/dish-crispy-samosa-chaat-768.webp";
import samosa1280 from "@/assets/dishes/dish-crispy-samosa-chaat-1280.webp";
import butterChicken768 from "@/assets/dishes/dish-zayqa-butter-chicken-768.webp";
import butterChicken1280 from "@/assets/dishes/dish-zayqa-butter-chicken-1280.webp";
import raan768 from "@/assets/dishes/dish-raan-e-zayqa-768.webp";
import raan1280 from "@/assets/dishes/dish-raan-e-zayqa-1280.webp";
import beef768 from "@/assets/dishes/dish-slow-braised-beef-768.webp";
import beef1280 from "@/assets/dishes/dish-slow-braised-beef-1280.webp";
import prawn768 from "@/assets/dishes/dish-malabar-prawn-curry-768.webp";
import prawn1280 from "@/assets/dishes/dish-malabar-prawn-curry-1280.webp";
import pullao768 from "@/assets/dishes/dish-wild-mushroom-pullao-768.webp";
import pullao1280 from "@/assets/dishes/dish-wild-mushroom-pullao-1280.webp";
import tandoor768 from "@/assets/dishes/dish-tandoor-chicken-768.webp";
import tandoor1280 from "@/assets/dishes/dish-tandoor-chicken-1280.webp";
import seekh768 from "@/assets/dishes/dish-charcoal-seekh-kebab-768.webp";
import seekh1280 from "@/assets/dishes/dish-charcoal-seekh-kebab-1280.webp";
import salmon768 from "@/assets/dishes/dish-ajwaini-salmon-tikka-768.webp";
import salmon1280 from "@/assets/dishes/dish-ajwaini-salmon-tikka-1280.webp";
import milkCake768 from "@/assets/dishes/dish-saffron-milk-cake-768.webp";
import milkCake1280 from "@/assets/dishes/dish-saffron-milk-cake-1280.webp";
import mousse768 from "@/assets/dishes/dish-dark-chocolate-cardamom-mousse-768.webp";
import mousse1280 from "@/assets/dishes/dish-dark-chocolate-cardamom-mousse-1280.webp";
import fizz768 from "@/assets/dishes/dish-pomegranate-fizz-768.webp";
import fizz1280 from "@/assets/dishes/dish-pomegranate-fizz-1280.webp";
import oldFashioned768 from "@/assets/dishes/dish-smoked-old-fashioned-768.webp";
import oldFashioned1280 from "@/assets/dishes/dish-smoked-old-fashioned-1280.webp";
import lassi768 from "@/assets/dishes/dish-alphonso-mango-lassi-768.webp";
import lassi1280 from "@/assets/dishes/dish-alphonso-mango-lassi-1280.webp";

/** Six slides of the homepage Signatures carousel — every slug must exist in the live menu. */
export const prominentSlugs = ["signature-clay-pot-biryani", "smoke-infused-lamb-chops", "raan-e-zayqa", "truffle-saffron-arancini", "pistachio-rose-tart", "royal-saffron-chai"];

/** Single source of truth for dish photography: one unique photo per menu slug. */
export const dishPhotos: Record<string, string> = {
  "truffle-saffron-arancini": arancini,
  "charred-aubergine": aubergine768,
  "crispy-samosa-chaat": samosa768,
  "signature-clay-pot-biryani": biryani,
  "zayqa-butter-chicken": butterChicken768,
  "raan-e-zayqa": raan768,
  "pan-seared-sea-bass": seabass,
  "slow-braised-beef": beef768,
  "malabar-prawn-curry": prawn768,
  "wild-mushroom-pullao": pullao768,
  "smoke-infused-lamb-chops": lamb,
  "tandoor-chicken": tandoor768,
  "charcoal-seekh-kebab": seekh768,
  "ajwaini-salmon-tikka": salmon768,
  "pistachio-rose-tart": tart,
  "saffron-milk-cake": milkCake768,
  "dark-chocolate-cardamom-mousse": mousse768,
  "royal-saffron-chai": chai,
  "pomegranate-fizz": fizz768,
  "smoked-old-fashioned": oldFashioned768,
  "alphonso-mango-lassi": lassi768,
};

const variants: Record<string, string> = {
  [arancini]: `${aranciniSmall} 480w, ${arancini} 768w`,
  [biryani]: `${biryaniSmall} 480w, ${biryani} 768w`,
  [seabass]: `${seabassSmall} 480w, ${seabass} 768w`,
  [lamb]: `${lambSmall} 480w, ${lamb} 768w`,
  [tart]: `${tartSmall} 480w, ${tart} 768w`,
  [chai]: `${chaiSmall} 480w, ${chai} 768w`,
  [aubergine768]: `${aubergine768} 768w, ${aubergine1280} 1280w`,
  [samosa768]: `${samosa768} 768w, ${samosa1280} 1280w`,
  [butterChicken768]: `${butterChicken768} 768w, ${butterChicken1280} 1280w`,
  [raan768]: `${raan768} 768w, ${raan1280} 1280w`,
  [beef768]: `${beef768} 768w, ${beef1280} 1280w`,
  [prawn768]: `${prawn768} 768w, ${prawn1280} 1280w`,
  [pullao768]: `${pullao768} 768w, ${pullao1280} 1280w`,
  [tandoor768]: `${tandoor768} 768w, ${tandoor1280} 1280w`,
  [seekh768]: `${seekh768} 768w, ${seekh1280} 1280w`,
  [salmon768]: `${salmon768} 768w, ${salmon1280} 1280w`,
  [milkCake768]: `${milkCake768} 768w, ${milkCake1280} 1280w`,
  [mousse768]: `${mousse768} 768w, ${mousse1280} 1280w`,
  [fizz768]: `${fizz768} 768w, ${fizz1280} 1280w`,
  [oldFashioned768]: `${oldFashioned768} 768w, ${oldFashioned1280} 1280w`,
  [lassi768]: `${lassi768} 768w, ${lassi1280} 1280w`,
};

export const photoSrcSet = (url: string) => variants[url];

/** Uploaded photos remain authoritative; repeated URLs are assigned to only one dish. */
export function assignUniquePhotos<T extends { slug: string; image: string }>(items: T[]): T[] {
  const used = new Set<string>();
  return items.map((item) => {
    const image = item.image || dishPhotos[item.slug] || "";
    if (!image || used.has(image)) return { ...item, image: "" };
    used.add(image);
    return { ...item, image };
  });
}
