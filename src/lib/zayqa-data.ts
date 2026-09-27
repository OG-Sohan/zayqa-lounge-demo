import biryani from "@/assets/zayqa-biryani.jpg";
import dessert from "@/assets/zayqa-dessert.jpg";
import interior from "@/assets/zayqa-interior-hero.jpg";
import kitchen from "@/assets/zayqa-kitchen.jpg";
import lamb from "@/assets/zayqa-lamb-chops.jpg";
import seabass from "@/assets/zayqa-seabass.jpg";
import table from "@/assets/zayqa-table.jpg";

export const restaurant = {
  name: "Zayqa Lounge",
  shortName: "ZAYQA",
  tagline: "Where flavour meets atmosphere",
  phrase: "Taste · Connect · Unwind",
  address: "48 Mercer Street, New York, NY 10013",
  phone: "+1 (212) 555-0148",
  email: "hello@zayqalounge.com",
  hours: "12:00 — 23:00",
  currency: "USD",
};

export const images = { biryani, dessert, interior, kitchen, lamb, seabass, table };
export type CategorySlug = "starters" | "signatures" | "mains" | "grills" | "desserts" | "drinks";
export type Dish = { slug: string; category: CategorySlug; name: string; description: string; longDescription: string; price: number; image: string; ingredients: string[]; allergens: string[]; dietary: string[]; addOns: { name: string; price: number }[] };
export const categories: { slug: CategorySlug; name: string; intro: string }[] = [
  { slug: "starters", name: "Starters", intro: "Small plates to begin." },
  { slug: "signatures", name: "Signatures", intro: "The dishes that define Zayqa." },
  { slug: "mains", name: "Mains", intro: "Considered plates for the table." },
  { slug: "grills", name: "Grills", intro: "From charcoal and flame." },
  { slug: "desserts", name: "Desserts", intro: "A quiet finish." },
  { slug: "drinks", name: "Drinks", intro: "House pours and alcohol-free serves." },
];
export const dishes: Dish[] = [
  { slug:"truffle-saffron-arancini", category:"starters", name:"Truffle Saffron Arancini", description:"Crisp risotto · Kashmiri saffron · smoked tomato", longDescription:"Golden risotto croquettes with Kashmiri saffron, black truffle and a slow-cooked smoked tomato relish.", price:18, image:dessert, ingredients:["Risotto","Kashmiri saffron","Black truffle","Smoked tomato"], allergens:["Milk","Gluten"], dietary:["Vegetarian"], addOns:[{name:"Extra truffle",price:4}]},
  { slug:"charred-aubergine", category:"starters", name:"Charred Aubergine", description:"Sesame · pomegranate · green chilli", longDescription:"Fire-softened aubergine with toasted sesame, bright pomegranate and a restrained green chilli dressing.", price:14, image:table, ingredients:["Aubergine","Sesame","Pomegranate","Green chilli"], allergens:["Sesame"], dietary:["Vegan","Gluten-free"], addOns:[]},
  { slug:"signature-clay-pot-biryani", category:"signatures", name:"Signature Clay-Pot Biryani", description:"Aged basmati · slow-cooked lamb · saffron · mint raita", longDescription:"Our house biryani arrives sealed in its clay pot, layered with tender lamb, aged basmati, saffron and roasted nuts.", price:28, image:biryani, ingredients:["Lamb","Aged basmati","Saffron","Cashew","Mint"], allergens:["Nuts","Milk"], dietary:["Halal"], addOns:[{name:"Extra lamb",price:8},{name:"Cucumber raita",price:3}]},
  { slug:"zayqa-butter-chicken", category:"signatures", name:"Zayqa Butter Chicken", description:"Charred tomato · fenugreek · cultured butter", longDescription:"Charred chicken folded through a deep tomato sauce with fenugreek and cultured butter.", price:24, image:lamb, ingredients:["Chicken","Tomato","Fenugreek","Butter"], allergens:["Milk"], dietary:["Halal","Gluten-free"], addOns:[{name:"Garlic naan",price:5}]},
  { slug:"pan-seared-sea-bass", category:"mains", name:"Pan-Seared Sea Bass", description:"Lemongrass curry · wilted greens · charred lime", longDescription:"Crisp-skinned sea bass over a fragrant lemongrass curry with wilted greens, ginger and charred lime.", price:36, image:seabass, ingredients:["Sea bass","Lemongrass","Ginger","Greens"], allergens:["Fish"], dietary:["Gluten-free"], addOns:[{name:"Saffron rice",price:5}]},
  { slug:"slow-braised-beef", category:"mains", name:"Slow-Braised Beef", description:"Black cardamom · onion · soft herbs", longDescription:"Beef shoulder cooked slowly with black cardamom and caramelised onion until spoon-soft.", price:31, image:biryani, ingredients:["Beef","Black cardamom","Onion","Coriander"], allergens:[], dietary:["Halal","Gluten-free"], addOns:[]},
  { slug:"smoke-infused-lamb-chops", category:"grills", name:"Smoke-Infused Lamb Chops", description:"Mint yogurt · charred lemon · soft herbs", longDescription:"Twenty-four hour marinated lamb, cooked over charcoal and served with cool mint yogurt and charred lemon.", price:32, image:lamb, ingredients:["Lamb","Mint","Yogurt","Lemon"], allergens:["Milk"], dietary:["Halal","Gluten-free"], addOns:[{name:"Extra chop",price:9}]},
  { slug:"tandoor-chicken", category:"grills", name:"Tandoor Chicken", description:"Kashmiri chilli · hung yogurt · lime", longDescription:"Bone-in chicken marinated overnight, fired in the tandoor and finished with lime.", price:26, image:kitchen, ingredients:["Chicken","Kashmiri chilli","Yogurt","Lime"], allergens:["Milk"], dietary:["Halal","Gluten-free"], addOns:[]},
  { slug:"pistachio-rose-tart", category:"desserts", name:"Pistachio Rose Tart", description:"Cardamom · rose · pistachio ganache", longDescription:"Buttery pastry filled with pistachio ganache, lifted with cardamom and dried rose.", price:16, image:dessert, ingredients:["Pistachio","Rose","Cardamom","Pastry"], allergens:["Nuts","Milk","Gluten"], dietary:["Vegetarian"], addOns:[{name:"Cardamom ice cream",price:4}]},
  { slug:"saffron-milk-cake", category:"desserts", name:"Saffron Milk Cake", description:"Roasted milk · saffron · almond", longDescription:"A soft milk-soaked sponge with saffron cream and roasted almond.", price:14, image:dessert, ingredients:["Milk","Saffron","Almond","Flour"], allergens:["Nuts","Milk","Gluten","Egg"], dietary:["Vegetarian"], addOns:[]},
  { slug:"royal-saffron-chai", category:"drinks", name:"Royal Saffron Chai", description:"Black tea · warm spice · saffron", longDescription:"Black tea brewed with warm spice, saffron and steamed milk.", price:9, image:table, ingredients:["Black tea","Saffron","Milk","Spice"], allergens:["Milk"], dietary:["Vegetarian"], addOns:[{name:"Oat milk",price:1}]},
  { slug:"pomegranate-fizz", category:"drinks", name:"Pomegranate Fizz", description:"Pomegranate · lime leaf · soda", longDescription:"Cold-pressed pomegranate, fragrant lime leaf and bright soda.", price:11, image:table, ingredients:["Pomegranate","Lime leaf","Soda"], allergens:[], dietary:["Vegan","Gluten-free"], addOns:[]},
  { slug:"crispy-samosa-chaat", category:"starters", name:"Crispy Samosa Chaat", description:"Spiced potato · chickpea · tamarind yogurt", longDescription:"Shattered crisp pastry over warm spiced chickpeas, tamarind yogurt and pomegranate.", price:13, image:kitchen, ingredients:["Potato","Chickpea","Tamarind","Yogurt"], allergens:["Milk","Gluten"], dietary:["Vegetarian"], addOns:[]},
  { slug:"beetroot-goat-cheese-kebab", category:"starters", name:"Beetroot & Goat Cheese Kebab", description:"Toasted walnut · honey · watercress", longDescription:"Soft beetroot kebabs with whipped goat cheese, toasted walnut and a little honey.", price:15, image:dessert, ingredients:["Beetroot","Goat cheese","Walnut","Honey"], allergens:["Nuts","Milk"], dietary:["Vegetarian","Gluten-free"], addOns:[]},
  { slug:"raan-e-zayqa", category:"signatures", name:"Raan-e-Zayqa", description:"Slow-roasted lamb shoulder · black cumin · onion", longDescription:"A whole lamb shoulder roasted slowly with black cumin and caramelised onion, carved at the table.", price:34, image:lamb, ingredients:["Lamb shoulder","Black cumin","Onion","Coriander"], allergens:[], dietary:["Halal","Gluten-free"], addOns:[{name:"Butter naan",price:5}]},
  { slug:"malabar-prawn-curry", category:"mains", name:"Malabar Prawn Curry", description:"Coconut · curry leaf · red chilli", longDescription:"Tiger prawns folded through a coastal coconut curry with curry leaf and gentle red chilli.", price:29, image:seabass, ingredients:["Prawns","Coconut","Curry leaf","Red chilli"], allergens:["Crustaceans"], dietary:["Gluten-free"], addOns:[{name:"Steamed rice",price:4}]},
  { slug:"wild-mushroom-pullao", category:"mains", name:"Wild Mushroom Pullao", description:"Aged basmati · truffle oil · crisp shallot", longDescription:"Aged basmati tossed with wild mushrooms, a whisper of truffle oil and crisp shallots.", price:22, image:biryani, ingredients:["Wild mushrooms","Aged basmati","Shallot","Truffle oil"], allergens:[], dietary:["Vegetarian","Gluten-free"], addOns:[{name:"Fried egg",price:3}]},
  { slug:"charcoal-seekh-kebab", category:"grills", name:"Charcoal Seekh Kebab", description:"Hand-minced lamb · green chilli · mint", longDescription:"Hand-minced lamb seasoned with green chilli and mint, grilled over charcoal.", price:24, image:lamb, ingredients:["Lamb","Green chilli","Mint","Ginger"], allergens:[], dietary:["Halal","Gluten-free"], addOns:[{name:"Mint chutney",price:2}]},
  { slug:"ajwaini-salmon-tikka", category:"grills", name:"Ajwaini Salmon Tikka", description:"Carom seed · hung yogurt · lemon", longDescription:"Salmon marinated with carom seed and hung yogurt, fired in the tandoor and finished with lemon.", price:28, image:seabass, ingredients:["Salmon","Carom seed","Yogurt","Lemon"], allergens:["Fish","Milk"], dietary:["Gluten-free"], addOns:[]},
  { slug:"dark-chocolate-cardamom-mousse", category:"desserts", name:"Dark Chocolate Cardamom Mousse", description:"70% chocolate · sea salt · olive oil", longDescription:"A quiet, dark chocolate mousse lifted with cardamom, sea salt and good olive oil.", price:15, image:dessert, ingredients:["Dark chocolate","Cardamom","Cream","Olive oil"], allergens:["Milk","Egg"], dietary:["Vegetarian","Gluten-free"], addOns:[]},
  { slug:"smoked-old-fashioned", category:"drinks", name:"Smoked Old Fashioned", description:"Bourbon · jaggery · smoked oak", longDescription:"Bourbon stirred with jaggery and bitters, finished under a wisp of smoked oak.", price:16, image:table, ingredients:["Bourbon","Jaggery","Bitters","Oak smoke"], allergens:[], dietary:[], addOns:[]},
  { slug:"alphonso-mango-lassi", category:"drinks", name:"Alphonso Mango Lassi", description:"Mango · yogurt · cardamom", longDescription:"Ripe Alphonso mango blended with yogurt and a little cardamom.", price:8, image:dessert, ingredients:["Mango","Yogurt","Cardamom"], allergens:["Milk"], dietary:["Vegetarian","Gluten-free"], addOns:[]},
];
export const reviews: { quote: string; name: string; detail: string }[] = [
  { quote: "The kind of room where one drink quietly becomes dinner.", name: "Maya R.", detail: "Guest note" },
  { quote: "The biryani alone is worth the trip downtown.", name: "Daniel K.", detail: "Guest note" },
  { quote: "Quiet, warm and completely unhurried. We stayed for hours.", name: "Sofia L.", detail: "Guest note" },
  { quote: "Service that arrives exactly when you need it.", name: "James W.", detail: "Guest note" },
  { quote: "The lamb chops are the best I've had in New York.", name: "Priya S.", detail: "Guest note" },
  { quote: "Felt like a celebration even on an ordinary Tuesday.", name: "Elena M.", detail: "Guest note" },
  { quote: "Beautiful room, generous plates, honest cooking.", name: "Omar H.", detail: "Guest note" },
  { quote: "Our go-to for every occasion that matters.", name: "Rachel T.", detail: "Guest note" },
];
export const featured = [dishes[2], dishes[6], dishes[4], dishes[8]] as Dish[];
export const money = (value:number) => `$${value.toFixed(Number.isInteger(value)?0:2)}`;
/** Today's date as YYYY-MM-DD in the visitor's own timezone (toISOString() would give the UTC date). */
export const localDateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
/** "2026-10-02" -> "Friday, 2 October". Parsed as a local date so it never shifts by a day. */
/** Database times come back as "20:00:00"; show them as "8:00 PM". */
export const formatTime = (t:string) => { const m=t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/); if(!m) return t; const h=Number(m[1]); return `${h%12||12}:${m[2]} ${h<12?"AM":"PM"}` };
export const formatDate = (key:string) => { const [y,m,d]=key.split("-").map(Number); if(!y||!m||!d) return key; return new Date(y,m-1,d).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}) };
