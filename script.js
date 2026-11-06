// Tablero de 9.999 combinaciones de cuatro cifras.
const TOTAL_NUMBERS=9999, RESERVED_COUNT=4500;
const PAYMENT={phone:'04245783934',id:'30353321',bank:'Banco Venezolano de Crédito'};
const WHATSAPP_NUMBER='573161976350';
const SINGLE_PRICE=7000, FIVE_PACK_PRICE=12000;
const selected=new Set();
const $=id=>document.getElementById(id);
const fmt=n=>String(n).padStart(4,'0');

// Se conservan 4.500 combinaciones marcadas como no disponibles en este tablero demostrativo.
const reserved=new Set();
const shuffled=Array.from({length:TOTAL_NUMBERS},(_,i)=>i+1);
let seed=0x5a17c3;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
for(let i=0;i<RESERVED_COUNT;i++)reserved.add(shuffled[i]);

const grid=$('numbers'),search=$('numberSearch');
function updateStats(){
 const blocked=reserved.size,available=TOTAL_NUMBERS-blocked,pct=Math.round(blocked/TOTAL_NUMBERS*100);
 $('availableCount').textContent=available.toLocaleString('es-VE');
 $('blockedCount').textContent=blocked.toLocaleString('es-VE');
 $('progressPercent').textContent=pct;
 $('progressFill').style.width=pct+'%';
}
function renderNumbers(){
 grid.innerHTML='';
 $('seriesLabel').textContent='Números 0001–9999';
 const term=search.value.replace(/\D/g,'').slice(0,4);
 const frag=document.createDocumentFragment();
 for(let n=1;n<=TOTAL_NUMBERS;n++){
  const label=fmt(n);
  if(term&&!label.includes(term))continue;
  const b=document.createElement('button');
  b.type='button';
  b.className='number '+(reserved.has(n)?'unavailable':'available');
  b.textContent=label;
  if(reserved.has(n)){b.disabled=true;b.title='No disponible';}
  else{
   b.title='Seleccionar '+label;
   if(selected.has(n))b.classList.add('selected');
   b.onclick=()=>toggle(n,b);
  }
  frag.appendChild(b);
 }
 grid.appendChild(frag);
}
function toggle(n,b){
 if(selected.has(n)){selected.delete(n);b.classList.remove('selected');}
 else{selected.add(n);b.classList.add('selected');}
 updateSelection();
}
function calculateTotal(count){
 return Math.floor(count/5)*FIVE_PACK_PRICE+(count%5)*SINGLE_PRICE;
}
function money(value){
 return new Intl.NumberFormat('es-VE',{maximumFractionDigits:0}).format(value)+' Bs.';
}
function updateSelection(){
 const values=[...selected].sort((a,b)=>a-b).map(fmt),count=values.length,total=calculateTotal(count);
 $('selectedCount').textContent=count;
 $('whatsappSelectedCount').textContent=count;
 $('selectedText').textContent=count?'Tus selecciones: '+values.join(', '):'Aún no has seleccionado números.';
 $('whatsappSelectedNumbers').textContent=count?values.join(' · '):'Elige números disponibles.';
 $('totalPrice').textContent=count?money(total):'0 números';
 $('totalCost').textContent=money(total);
 $('priceBreakdown').textContent=count
  ?`${Math.floor(count/5)} paquete(s) de 5 × ${money(FIVE_PACK_PRICE)}${count%5?` + ${count%5} boleta(s) × ${money(SINGLE_PRICE)}`:''}`
  :'1 boleta = 7.000 Bs. · 5 boletas = 12.000 Bs.';
 $('sendNumbersBtn').disabled=!count;
 $('sendNumbersBtn').textContent=count?'📲 ENVIAR NÚMEROS AL WHATSAPP':'📲 SELECCIONA TUS NÚMEROS';
 $('sendNumbersBtn').closest('.numbers-whatsapp-card').classList.toggle('has-selection',count>0);
}
search.addEventListener('input',renderNumbers);
$('clearSearch').onclick=()=>{search.value='';renderNumbers();};
$('clearBtn').onclick=()=>{selected.clear();renderNumbers();updateSelection();};
$('sendNumbersBtn').onclick=()=>{
 if(!selected.size)return;
 const values=[...selected].sort((a,b)=>a-b).map(fmt),total=calculateTotal(values.length);
 const msg=`¡Hola! Quiero enviar mi jugada de Triple Táchira.\n\nNúmeros seleccionados (${values.length}):\n${values.join(', ')}\n\nTotal a pagar: ${money(total)}\n\nPor favor, confirmen la disponibilidad y los datos de pago antes de realizar la transferencia.`;
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
};
document.querySelectorAll('.copy-payment-btn').forEach(b=>b.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(b.dataset.copy);const old=b.textContent;b.textContent='✅ Copiado';setTimeout(()=>b.textContent=old,1500);}
 catch(e){window.prompt('Copia este dato:',b.dataset.copy);}
}));
updateStats();renderNumbers();updateSelection();
