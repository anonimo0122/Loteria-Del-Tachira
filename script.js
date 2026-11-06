// Tablero demostrativo: los estados rojos deben sustituirse por inventario real sincronizado.
const TOTAL_SERIES=10, PER_SERIES=1000, RESERVED_COUNT=4500;
const PAYMENT={phone:'04245783934',id:'30353321',bank:'Banco Venezolano de Crédito'};
const WHATSAPP_NUMBER='573161976350';
const SINGLE_PRICE=7000, FIVE_PACK_PRICE=10000;
const selected=new Set(); let currentSeries=1;
const $=id=>document.getElementById(id);
const fmt=n=>String(n).padStart(3,'0');
function hash(n){let x=(n*9301+49297)%233280;return x/233280;}
// Selección pseudoaleatoria reproducible: 4.500 números repartidos por todas las series.
// El orden se mezcla y no queda un bloque consecutivo de números vendidos.
const reserved=new Set();
const shuffled=Array.from({length:10000},(_,i)=>i+1);
let seed=0x5a17c3;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
for(let i=0;i<RESERVED_COUNT;i++)reserved.add(shuffled[i]);
const seriesPicker=$('seriesPicker'),grid=$('numbers'),search=$('numberSearch');
function globalId(series,n){return (series-1)*1000+n+1;}
function updateStats(){const blocked=reserved.size,available=10000-blocked,pct=Math.round(blocked/100);$('availableCount').textContent=available.toLocaleString('es-VE');$('blockedCount').textContent=blocked.toLocaleString('es-VE');$('progressPercent').textContent=pct;$('progressFill').style.width=pct+'%';}
function renderSeries(){seriesPicker.innerHTML='';for(let s=1;s<=TOTAL_SERIES;s++){const b=document.createElement('button');b.type='button';b.className='series-btn'+(s===currentSeries?' active':'');b.textContent=String(s).padStart(2,'0');b.setAttribute('aria-label',`Serie ${s}`);b.onclick=()=>{currentSeries=s;renderSeries();renderNumbers();};seriesPicker.appendChild(b);}}
function renderNumbers(){grid.innerHTML='';$('seriesLabel').textContent=`Serie ${String(currentSeries).padStart(2,'0')} · 000–999`;const term=search.value.replace(/\D/g,'').slice(0,3);const frag=document.createDocumentFragment();for(let n=0;n<1000;n++){if(term&&!fmt(n).includes(term))continue;const id=globalId(currentSeries,n),b=document.createElement('button');b.type='button';b.className='number '+(reserved.has(id)?'unavailable':'available');b.textContent=fmt(n);if(reserved.has(id)){b.disabled=true;b.title='No disponible';}else{b.title='Seleccionar '+fmt(n);if(selected.has(id))b.classList.add('selected');b.onclick=()=>toggle(id,currentSeries,n,b);}frag.appendChild(b);}grid.appendChild(frag);}
function toggle(id,s,n,b){if(selected.has(id)){selected.delete(id);b.classList.remove('selected');}else{selected.add(id);b.classList.add('selected');}updateSelection();}
function labelFor(id){const s=Math.floor((id-1)/1000)+1,n=(id-1)%1000;return `S${String(s).padStart(2,'0')}-${fmt(n)}`;}
function calculateTotal(count){return Math.floor(count/5)*FIVE_PACK_PRICE+(count%5)*SINGLE_PRICE;}
function money(value){return new Intl.NumberFormat('es-VE',{maximumFractionDigits:0}).format(value)+' Bs.';}
function updateSelection(){const values=[...selected].sort((a,b)=>a-b).map(labelFor),count=values.length,total=calculateTotal(count);$('selectedCount').textContent=count;$('whatsappSelectedCount').textContent=count;$('selectedText').textContent=count?'Tus selecciones: '+values.join(', '):'Aún no has seleccionado números.';$('whatsappSelectedNumbers').textContent=count?values.join(' · '):'Elige números disponibles en cualquiera de las series.';$('totalPrice').textContent=count?money(total):'0 números';$('totalCost').textContent=money(total);$('priceBreakdown').textContent=count?`${Math.floor(count/5)} paquete(s) de 5 × ${money(FIVE_PACK_PRICE)}${count%5?` + ${count%5} número(s) × ${money(SINGLE_PRICE)}`:''}`:'1 número = 7.000 Bs. · 5 números = 10.000 Bs.';$('sendNumbersBtn').disabled=!count;$('sendNumbersBtn').textContent=count?'📲 ENVIAR NÚMEROS AL WHATSAPP':'📲 SELECCIONA TUS NÚMEROS';$('sendNumbersBtn').closest('.numbers-whatsapp-card').classList.toggle('has-selection',count>0);}
search.addEventListener('input',renderNumbers);$('clearSearch').onclick=()=>{search.value='';renderNumbers();};$('clearBtn').onclick=()=>{selected.clear();renderNumbers();updateSelection();};
$('sendNumbersBtn').onclick=()=>{if(!selected.size)return;const values=[...selected].sort((a,b)=>a-b).map(labelFor);const total=calculateTotal(values.length);const msg=`¡Hola! Quiero enviar mi jugada de Triple Táchira.\n\nNúmeros seleccionados (${values.length}):\n${values.join(', ')}\n\nTotal a pagar: ${money(total)}\n\nPor favor, confirmen la disponibilidad y los datos de pago antes de realizar la transferencia.`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');};
document.querySelectorAll('.copy-payment-btn').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);const old=b.textContent;b.textContent='✅ Copiado';setTimeout(()=>b.textContent=old,1500);}catch(e){window.prompt('Copia este dato:',b.dataset.copy);}}));
updateStats();renderSeries();renderNumbers();updateSelection();
