(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const w=["Утро","День","Вечер","Ночь"],ke=60,Se="house-last-safe-home-save-v2",Ye=1400,L=[{name:"Ясно",riskMod:.9},{name:"Туман",riskMod:1.1},{name:"Дождь",riskMod:1.25},{name:"Кислотный дождь",riskMod:1.45}],V=[{id:"bike",name:"Велосипед",fuelUse:0,cargo:35,breakRisk:1.1},{id:"scooter",name:"Скутер",fuelUse:8,cargo:50,breakRisk:1},{id:"car",name:"Машина",fuelUse:14,cargo:80,breakRisk:.9}],X={home:["suburb"],suburb:["home","market","gas","farm"],market:["suburb","station"],gas:["suburb","factory"],farm:["suburb","forest"],station:["market","cityCenter","lab"],factory:["gas","rail"],forest:["farm","rail"],cityCenter:["station"],rail:["factory","forest","lab"],lab:["station","rail"]},ce=[{id:"home",name:"Дом",risk:.2,tags:["food"]},{id:"suburb",name:"Пригород",risk:.9,tags:["food","materials"]},{id:"market",name:"Супермаркет",risk:1,tags:["food","meds"]},{id:"gas",name:"Бензоколонка",risk:1.1,tags:["fuel","parts"]},{id:"farm",name:"Ферма",risk:1.25,tags:["food","materials"]},{id:"station",name:"Ж/д узел",risk:1.35,tags:["parts","electronics"]},{id:"factory",name:"Завод",risk:1.55,tags:["materials","parts"]},{id:"forest",name:"Лесная зона",risk:1.2,tags:["food","materials"]},{id:"cityCenter",name:"Центр города",risk:1.7,tags:["meds","electronics"]},{id:"rail",name:"Заброшенный узел",risk:1.45,tags:["parts","fuel"]},{id:"lab",name:"Лаборатория",risk:1.8,tags:["meds","electronics"]}],le=[{id:"fortifiedDoor",name:"Укрепленная дверь",desc:"+15 к прочности двери, волны наносят меньше урона",cost:{materials:20,parts:8},apply:t=>{t.base.door=Math.min(100,t.base.door+15),t.modifiers.waveDamage*=.88}},{id:"workshop",name:"Мастерская",desc:"Ремонт дешевле, шанс поломки транспорта ниже",cost:{materials:16,parts:12,fuel:4},apply:t=>{t.modifiers.repairEfficiency+=.3,t.modifiers.breakRisk*=.85}},{id:"greenhouse",name:"Теплица",desc:"Каждый вечер +4 еды (зимой +2)",cost:{materials:24,parts:6,electronics:4},apply:t=>{t.modifiers.greenhouse=!0}},{id:"generator",name:"Генератор + батареи",desc:"Снижает ночной урон и усталость",cost:{materials:18,parts:14,fuel:10},apply:t=>{t.modifiers.generator=!0,t.base.power=Math.min(100,t.base.power+30),t.modifiers.waveDamage*=.9}},{id:"watchtower",name:"Охранная вышка",desc:"Охранники эффективнее, шанс отбить волну выше",cost:{materials:25,parts:12,electronics:5},apply:t=>{t.modifiers.watchtower=!0,t.modifiers.defenseBonus+=.2}},{id:"radio",name:"Радиосвязь",desc:"Открывает главную линию и события эвакуации",cost:{materials:10,electronics:14,parts:6},apply:t=>{t.modifiers.radio=!0,t.story.radioOnline=!0}}],Je=[{id:"engineer",name:"Инженер",bonus:"Ремонт +25%"},{id:"guard",name:"Охранник",bonus:"Ночные волны слабее"},{id:"gardener",name:"Садовник",bonus:"Теплица даёт +2 еды"},{id:"medic",name:"Фельдшер",bonus:"Меньше штрафов от заражения"},{id:"trader",name:"Торговец",bonus:"Иногда обменивает хлам на медикаменты"}],Me=['Радио: "...если кто-то слышит, безопасный коридор может открыться на севере..."','Радио: "Передаём штормовое предупреждение. Избегайте низин и каналов."','Радио: "Сигнал лагеря беженцев прервался три часа назад."','Радио: "На частоте 91.2 остались выжившие, им нужен фильтр воды."','Радио: "Ночная активность мутантов выросла после кислотного дождя."'],ue=[{id:"garageEngine",name:"Тюнинг двигателя",desc:"-20% расход топлива у транспорта",cost:{parts:16,fuel:6,electronics:4}},{id:"garageHull",name:"Усиленный корпус",desc:"Шанс поломки в экспедиции заметно ниже",cost:{materials:18,parts:12}},{id:"garageTrunk",name:"Расширенный багажник",desc:"+8 слотов и +45 кг к лимиту инвентаря",cost:{materials:14,parts:10,electronics:3}},{id:"garageLights",name:"Прожекторы и радар",desc:"Ниже риск засады и выше точность в бою",cost:{parts:12,electronics:8,fuel:3}}],x={food:{label:"Еда",weight:1},fuel:{label:"Топливо",weight:1.4},meds:{label:"Медикаменты",weight:.6},ammo9:{label:"Патроны 9mm",weight:.2},ammo12:{label:"Патроны 12g",weight:.25},ammo556:{label:"Патроны 5.56",weight:.22},materials:{label:"Материалы",weight:2},parts:{label:"Запчасти",weight:1.2},electronics:{label:"Электроника",weight:.7}},Y=[{id:"knife",name:"Нож выжившего",damageMin:4,damageMax:7,hitBonus:.05,aimedBonus:.02,noise:.1,ammoUse:0,ammoType:null,maxDurability:100,durabilityLoss:.4,cost:null},{id:"pistol",name:"Пистолет",damageMin:7,damageMax:11,hitBonus:.09,aimedBonus:.08,noise:1,ammoUse:1,ammoType:"ammo9",maxDurability:95,durabilityLoss:1.4,cost:{parts:10,materials:6,fuel:2}},{id:"shotgun",name:"Дробовик",damageMin:10,damageMax:15,hitBonus:.04,aimedBonus:.04,noise:1.45,ammoUse:1,ammoType:"ammo12",maxDurability:90,durabilityLoss:2.1,cost:{parts:16,materials:10,fuel:4}},{id:"rifle",name:"Карабин",damageMin:9,damageMax:14,hitBonus:.12,aimedBonus:.14,noise:.85,ammoUse:1,ammoType:"ammo556",maxDurability:105,durabilityLoss:1.2,cost:{parts:20,materials:12,electronics:5}}],J=[{id:"jacket",name:"Куртка с накладками",hpBonus:0,damageReduction:.07,dodgeBonus:.03,cost:null},{id:"leather",name:"Кожаная броня",hpBonus:3,damageReduction:.12,dodgeBonus:.04,cost:{materials:12,parts:6}},{id:"kevlar",name:"Кевларовый жилет",hpBonus:6,damageReduction:.2,dodgeBonus:.02,cost:{parts:14,materials:10,electronics:2}},{id:"riot",name:"Штурмовая броня",hpBonus:9,damageReduction:.26,dodgeBonus:0,cost:{parts:22,materials:14,electronics:4,fuel:3}}],b=document.querySelector("#app");function p(t,a){return Math.floor(Math.random()*(a-t+1))+t}function l(t,a,n){return Math.max(a,Math.min(n,t))}function Be(){return{day:1,phase:0,weather:L[0],seasonIndex:0,gameOver:!1,logs:[],map:{currentNodeId:"home",discovered:["home","suburb","market","gas"],selectedNodeId:"market"},pendingEncounter:null,combat:null,flow:{mode:"idle"},selectedTransportId:"car",resources:{food:26,fuel:24,meds:8,ammo9:18,ammo12:10,ammo556:14,materials:20,parts:12,electronics:5},inventory:{items:[],baseSlots:12,baseWeight:55},base:{wall:72,door:70,power:38,fatigue:26,stress:24,infection:8},modifiers:{waveDamage:1,repairEfficiency:1,breakRisk:1,defenseBonus:0,greenhouse:!1,generator:!1,watchtower:!1,radio:!1,infectionResist:1},upgradesBuilt:[],garage:{built:[]},hero:{ownedWeapons:["knife"],ownedArmors:["jacket"],equippedWeaponId:"knife",equippedArmorId:"jacket",injuries:{arm:0,leg:0,torso:0},weaponDurability:{knife:100,pistol:95,shotgun:90,rifle:105}},worldThreat:Object.fromEntries(ce.map(t=>[t.id,0])),npcManagement:{fatigue:12,morale:62,shifts:{guard:1,scavenger:1,medic:1,mechanic:1}},npcs:[],story:{introDone:!1,radioOnline:!1,antennaParts:0,endingReady:!1},dayStats:{gained:{food:0,fuel:0,meds:0,ammo9:0,ammo12:0,ammo556:0,materials:0,parts:0,electronics:0},spent:{food:0,fuel:0,meds:0,ammo9:0,ammo12:0,ammo556:0,materials:0,parts:0,electronics:0}},ui:{upgradesCollapsed:!0,garageCollapsed:!0,heroGearCollapsed:!0,defaultsApplied:!0},gameplay:{arcadeMode:!0},ai:{autoHeroEnabled:!0,intent:"Оценка обстановки",defaultsApplied:!0},dayPlan:{generatedForDay:0,goals:[]},economyHistory:[]}}function Ke(t){var s,i,d,c,g;const a=Be(),n=t||a,o={...a.ui,...n.ui||{}};return o.defaultsApplied||(o.upgradesCollapsed=!0,o.garageCollapsed=!0,o.heroGearCollapsed=!0,o.defaultsApplied=!0),{...a,...n,map:{...a.map,...n.map||{}},flow:{...a.flow,...n.flow||{}},resources:{...a.resources,...n.resources||{}},inventory:{...a.inventory,...n.inventory||{}},base:{...a.base,...n.base||{}},modifiers:{...a.modifiers,...n.modifiers||{}},story:{...a.story,...n.story||{}},dayStats:{gained:{...a.dayStats.gained,...((s=n.dayStats)==null?void 0:s.gained)||{}},spent:{...a.dayStats.spent,...((i=n.dayStats)==null?void 0:i.spent)||{}}},ui:o,ai:(()=>{const f={...a.ai,...n.ai||{}};return f.defaultsApplied||(f.autoHeroEnabled=!0,f.defaultsApplied=!0),f})(),hero:{...a.hero,...n.hero||{},injuries:{...a.hero.injuries,...((d=n.hero)==null?void 0:d.injuries)||{}},weaponDurability:{...a.hero.weaponDurability,...((c=n.hero)==null?void 0:c.weaponDurability)||{}}},worldThreat:{...a.worldThreat,...n.worldThreat||{}},npcManagement:{...a.npcManagement,...n.npcManagement||{},shifts:{...a.npcManagement.shifts,...((g=n.npcManagement)==null?void 0:g.shifts)||{}}},dayPlan:{...a.dayPlan,...n.dayPlan||{}},economyHistory:Array.isArray(n.economyHistory)?n.economyHistory:a.economyHistory,gameplay:{...a.gameplay,...n.gameplay||{}},garage:{...a.garage,...n.garage||{}},upgradesBuilt:[...new Set(n.upgradesBuilt||a.upgradesBuilt)],npcs:n.npcs||[],logs:n.logs||[],pendingEncounter:n.pendingEncounter||null,combat:n.combat||null}}let e=Ke(et()),_=null,xe="",ae=0;function oe(t){const a=["food","fuel","meds","ammo9","ammo12","ammo556","materials","parts","electronics"],n={};return a.forEach(o=>{n[o]=Number.isFinite(t==null?void 0:t[o])?t[o]:0}),n}function Xe(t){return{gained:oe((t==null?void 0:t.gained)||{}),spent:oe((t==null?void 0:t.spent)||{})}}e.resources=oe(e.resources);e.dayStats=Xe(e.dayStats);e.hero.ownedWeapons=[...new Set(e.hero.ownedWeapons)].filter(t=>Y.some(a=>a.id===t));e.hero.ownedArmors=[...new Set(e.hero.ownedArmors)].filter(t=>J.some(a=>a.id===t));e.hero.ownedWeapons.length||(e.hero.ownedWeapons=["knife"]);e.hero.ownedArmors.length||(e.hero.ownedArmors=["jacket"]);e.hero.ownedWeapons.includes(e.hero.equippedWeaponId)||(e.hero.equippedWeaponId=e.hero.ownedWeapons[0]);e.hero.ownedArmors.includes(e.hero.equippedArmorId)||(e.hero.equippedArmorId=e.hero.ownedArmors[0]);function Ie(){return["Весна","Лето","Осень","Зима"][e.seasonIndex]}function Ze(){e.seasonIndex=Math.floor((e.day-1)/15)%4}function Qe(t=e.selectedTransportId){return V.find(a=>a.id===t)||V[0]}function D(t){return ce.find(a=>a.id===t)}function S(t){return e.garage.built.includes(t)}function N(t=e.selectedTransportId){const a=Qe(t);return{...a,fuelUse:Math.max(0,Math.round(a.fuelUse*(S("garageEngine")?.8:1))),breakRisk:a.breakRisk*(S("garageHull")?.72:1)}}function ne(t){const a=V.map(n=>{const o=N(n.id);return{id:n.id,fuelNeed:o.fuelUse*t,cargo:o.cargo}}).filter(n=>e.resources.fuel>=n.fuelNeed);return a.length?(a.sort((n,o)=>o.cargo-n.cargo),a[0].id):null}function C(t){return Y.find(a=>a.id===t)||Y[0]}function me(t){return J.find(a=>a.id===t)||J[0]}function Z(){return C(e.hero.equippedWeaponId)}function Re(){return me(e.hero.equippedArmorId)}function O(t){return l(e.hero.weaponDurability[t]??C(t).maxDurability,0,140)}function Ee(t,a){e.hero.weaponDurability[t]=l(O(t)-a,0,140)}function re(t){const a=C(t),o=O(t)/a.maxDurability;return o>=.75?1:o>=.5?.92:o>=.25?.82:.68}function r(t,a=""){const n=`${a}|${t}`;if(xe===n){if(ae+=1,ae>1)return}else xe=n,ae=0;e.logs.unshift({msg:t,cssClass:a}),e.logs=e.logs.slice(0,220)}function h(){localStorage.setItem(Se,JSON.stringify(e))}function et(){try{const t=localStorage.getItem(Se);if(!t)return null;const a=JSON.parse(t);return!a||typeof a!="object"?null:a}catch{return null}}function tt(){e=Be(),r("Новая сессия начата."),e.weather=L[p(0,L.length-1)],h(),ye(),u()}function H(t){return Object.entries(t).every(([a,n])=>e.resources[a]>=n)}function W(t){Object.entries(t).forEach(([a,n])=>{var o,s;e.resources[a]-=n,((s=(o=e.dayStats)==null?void 0:o.spent)==null?void 0:s[a])!==void 0&&(e.dayStats.spent[a]+=n)})}function Ae(t,a){var n,o;e.resources[t]===void 0||a<=0||(e.resources[t]+=a,((o=(n=e.dayStats)==null?void 0:n.gained)==null?void 0:o[t])!==void 0&&(e.dayStats.gained[t]+=a))}function pe(){return{slots:e.inventory.baseSlots+(S("garageTrunk")?8:0),weight:e.inventory.baseWeight+(S("garageTrunk")?45:0)}}function fe(){return e.inventory.items.reduce((t,a)=>{var n;return t+a.qty*(((n=x[a.type])==null?void 0:n.weight)||1)},0)}function De(){return e.inventory.items.length}function at(t,a){if(!x[t]||a<=0)return 0;const n=pe(),o=x[t].weight,s=e.inventory.items.find(M=>M.type===t),i=fe(),d=Math.floor((n.weight-i)/o),c=!s,g=n.slots-De(),f=c&&g<=0?0:a,$=Math.max(0,Math.min(a,d,f));return $<=0?0:(s?s.qty+=$:e.inventory.items.push({type:t,qty:$}),$)}function nt(t){const a={};return Object.entries(t).forEach(([n,o])=>{const s=at(n,o),i=o-s;i>0&&(a[n]=i)}),a}function st(){const t=o=>Object.entries(o).filter(([,s])=>s>0).map(([s,i])=>`${x[s].label}: ${i}`).join(", "),a=t(e.dayStats.gained),n=t(e.dayStats.spent);(a||n)&&r(`Итог дня — добыто: ${a||"нет"}; израсходовано: ${n||"нет"}.`,"good"),e.economyHistory.push({day:e.day,gained:{...e.dayStats.gained},spent:{...e.dayStats.spent}}),e.economyHistory.length>7&&(e.economyHistory=e.economyHistory.slice(-7)),e.dayStats.gained={food:0,fuel:0,meds:0,ammo9:0,ammo12:0,ammo556:0,materials:0,parts:0,electronics:0},e.dayStats.spent={food:0,fuel:0,meds:0,ammo9:0,ammo12:0,ammo556:0,materials:0,parts:0,electronics:0}}function v(t){e.ai.intent=t}function He(){const t=[];e.resources.food<10&&t.push("Добыть еду и вернуться до вечера"),e.resources.fuel<12&&t.push("Найти топливо и не рисковать лишний раз"),(e.resources.meds<3||e.base.infection>35)&&t.push("Приоритет: медикаменты и снижение заражения"),(e.base.wall<50||e.base.door<50)&&t.push("Укрепить дом перед ночью"),e.story.radioOnline||t.push("Искать компоненты для радиосвязи"),t.length||t.push("Поддерживать запасы и избегать лишнего риска"),e.dayPlan={generatedForDay:e.day,goals:t.slice(0,3)}}function ot(){e.hero.injuries.arm=Math.max(0,e.hero.injuries.arm-4),e.hero.injuries.leg=Math.max(0,e.hero.injuries.leg-4),e.hero.injuries.torso=Math.max(0,e.hero.injuries.torso-4)}function rt(){const t=e.npcManagement.shifts,a=Math.max(1,e.npcs.length),n=2+Math.max(0,t.guard+t.scavenger+t.medic+t.mechanic-a);if(e.npcManagement.fatigue=l(e.npcManagement.fatigue+n-(w[e.phase]==="Ночь"?0:1),0,100),t.medic>0&&e.resources.meds>0&&e.base.infection>18&&(e.base.infection=l(e.base.infection-2,0,100),e.resources.meds-=1,e.dayStats.spent.meds+=1),t.mechanic>0&&e.resources.parts>0&&Math.random()<.4){e.resources.parts-=1,e.dayStats.spent.parts+=1;const s=e.hero.equippedWeaponId;e.hero.weaponDurability[s]=l(O(s)+2,0,140)}if(t.scavenger>0&&w[e.phase]==="День"&&Math.random()<.35){const s=[["food",p(1,3)],["materials",p(1,2)],["ammo9",p(1,3)]],i=s[p(0,s.length-1)];Ae(i[0],i[1])}const o=(t.guard>0?1:-1)-(e.npcManagement.fatigue>70?2:0);e.npcManagement.morale=l(e.npcManagement.morale+o,0,100)}function it(){Object.keys(e.worldThreat).forEach(t=>{const a=w[e.phase]==="Ночь"?1:2;e.worldThreat[t]=l(e.worldThreat[t]-a,0,100)})}function Te(){if(!e.inventory.items.length){r("Инвентарь пуст.","bad"),u();return}e.inventory.items.forEach(t=>{e.resources[t.type]!==void 0&&(e.resources[t.type]+=t.qty)}),e.inventory.items=[],r("Груз разгружен на склад базы.","good"),h(),u()}function j(t,a){if(t===a)return 0;const n=new Set([t]),o=[{id:t,d:0}];for(;o.length;){const{id:s,d:i}=o.shift(),d=X[s]||[];for(const c of d){if(c===a)return i+1;n.has(c)||(n.add(c),o.push({id:c,d:i+1}))}}return 99}function Q(){const t=e.map.currentNodeId;return e.map.discovered.filter(a=>j(t,a)<=3)}function dt(t,a){if(t===a)return[t];const n=[[t]],o=new Set([t]);for(;n.length;){const s=n.shift(),i=s[s.length-1],d=X[i]||[];for(const c of d){if(!e.map.discovered.includes(c)||o.has(c))continue;const g=[...s,c];if(c===a)return g;o.add(c),n.push(g)}}return null}function Le(t,a=3){const n=e.map.currentNodeId,o=dt(n,t);if(!o||o.length<=1)return null;const s=Math.min(a,o.length-1);return o[s]}function ct(){const t=Q();t.length&&(t.includes(e.map.selectedNodeId)||(e.map.selectedNodeId=t.includes(e.map.currentNodeId)?e.map.currentNodeId:t[0]))}function Ne(t){return t<1.1?"обычные":t<1.35?Math.random()<.5?"быстрые":"обычные":t<1.6?Math.random()<.45?"устойчивые":"быстрые":Math.random()<.55?"мутанты":"устойчивые"}function lt(t){const n=(X[t]||[]).filter(s=>!e.map.discovered.includes(s));if(!n.length)return;const o=n[p(0,n.length-1)];e.map.discovered.push(o),r(`Разведка: обнаружен новый узел карты — ${D(o).name}.`,"good")}function ut(t){if(e.npcs.length>=5)return;const a=l(.14+t*.04,.1,.42);if(Math.random()>a)return;const n=Je.filter(s=>!e.npcs.some(i=>i.id===s.id));if(!n.length)return;const o=n[p(0,n.length-1)];e.npcs.push(o),mt(o),r(`Вы встретили NPC: ${o.name}. Он присоединился к базе (${o.bonus}).`,"good")}function mt(t){t.id==="engineer"?e.modifiers.repairEfficiency+=.25:t.id==="guard"?e.modifiers.defenseBonus+=.18:t.id==="gardener"?e.modifiers.greenhouse=!0:t.id==="medic"?e.modifiers.infectionResist=.75:t.id==="trader"&&e.resources.parts>=6&&(e.resources.parts-=6,e.resources.meds+=4,r("Торговец обменял 6 запчастей на 4 медикамента."))}function pt(t){e.story.introDone||(e.story.introDone=!0,r("Задача: починить дом, пережить первую волну и подготовить радиосвязь.")),t==="station"&&Math.random()<.4&&(e.story.antennaParts+=1,r(`Найдены элементы антенны (${e.story.antennaParts}/3).`,"good")),e.story.radioOnline&&e.story.antennaParts>=3&&e.day>=18&&(e.story.endingReady=!0)}function G(t){return(X[t]||[]).filter(n=>n!==e.map.currentNodeId&&e.map.discovered.includes(n))}function ge(){e.phase+=1,e.phase>3&&(st(),e.phase=0,e.day+=1,Ze(),e.weather=L[p(0,L.length-1)],r(`Новый день: ${e.day}. Погода: ${e.weather.name}.`),He())}function ft(){const t=(100-e.base.wall)*.01+(100-e.base.door)*.01,a=e.weather.riskMod,n=e.npcManagement.shifts.guard*.08,o=e.modifiers.defenseBonus+e.npcs.length*.03+n,s=l(.9+t+a-o,.7,2.2),i=e.gameplay.arcadeMode?.62:1,d=p(5,14)*s*e.modifiers.waveDamage*i,c=Math.round(d*.65),g=Math.round(d*.35);e.base.wall=l(e.base.wall-c,0,100),e.base.door=l(e.base.door-g,0,100),e.base.fatigue=l(e.base.fatigue+p(4,8),0,100),e.base.stress=l(e.base.stress+p(3,9),0,100),r(`Ночная волна: урон базе - стены ${c}, дверь ${g}.`,"bad"),e.modifiers.watchtower&&Math.random()<.3&&(e.resources.parts+=2,r("Охранная вышка помогла отбить волну и собрать трофеи (+2 запчасти).","good"))}function he(){if(e.resources.food=Math.max(0,e.resources.food-(2+Math.floor(e.npcs.length/2))),e.modifiers.generator?(e.resources.fuel=Math.max(0,e.resources.fuel-1),e.base.power=l(e.base.power+2,0,100)):e.base.power=l(e.base.power-2,0,100),e.modifiers.greenhouse&&w[e.phase]==="Вечер"){const t=Ie()==="Зима"?2:4;e.resources.food+=t,r(`Теплица принесла +${t} еды.`,"good")}if(e.resources.food===0&&(e.base.stress=l(e.base.stress+6,0,100),e.base.fatigue=l(e.base.fatigue+8,0,100),r("Голод подрывает силы и мораль.","bad")),e.resources.meds>0&&e.base.infection>25){e.resources.meds-=1,e.dayStats.spent.meds+=1;const t=e.modifiers.infectionResist<1?7:5;e.base.infection=l(e.base.infection-t,0,100),r(`Использованы медикаменты. Заражение -${t}.`,"good")}if(w[e.phase]==="Ночь"&&ft(),e.gameplay.arcadeMode&&w[e.phase]==="Утро"){const t=3+Math.floor(e.npcManagement.shifts.mechanic*1.2),a=2+Math.floor(e.npcManagement.shifts.guard*.8);e.base.wall=l(e.base.wall+t,0,100),e.base.door=l(e.base.door+a,0,100),r(`Аркада: база стабилизируется за ночь (стены +${t}, дверь +${a}).`,"good")}e.story.radioOnline&&Math.random()<.38&&r(Me[p(0,Me.length-1)]),rt(),it()}function be(){e.day>ke&&!e.story.endingReady&&(e.gameOver=!0,r("Ресурсы региона истощились. Вы не успели наладить связь вовремя.","bad"));const t=e.gameplay.arcadeMode?-18:0;(e.base.wall<=t||e.base.door<=t)&&(e.gameOver=!0,r("База пала под напором зараженных.","bad")),e.base.infection>=100&&(e.gameOver=!0,r("Инфекция взяла верх.","bad")),e.story.endingReady&&e.day>=24&&(e.gameOver=!0,r("Финал: вы наладили радиоканал и подготовили коридор эвакуации для общины.","good"))}function P(t=!1){if(e.gameOver||e.flow.mode!=="idle"||e.pendingEncounter||e.combat)return;if(w[e.phase]==="Ночь"){r("Ночью выезд слишком опасен. Дождитесь утра.","bad"),u();return}const a=e.map.currentNodeId,n=e.map.selectedNodeId,o=D(n),s=N(),d=3-(e.hero.injuries.leg>35?1:0),c=j(a,n);if(!o||c>3){const k=Le(n);if(o&&k)return e.map.selectedNodeId=k,r(`Маршрут скорректирован: промежуточная точка ${D(k).name}.`),u(),P(t);r("Маршрут недоступен для текущего выезда.","bad"),u();return}if(c>d){r("Травма ноги ограничивает дальние поездки. Нужен отдых или лечение.","bad"),u();return}const g=s.fuelUse*c;if(e.resources.fuel<g){r("Недостаточно топлива для выбранной поездки.","bad"),u();return}e.resources.fuel-=g;const f=e.weather.riskMod,$=w[e.phase]==="Вечер"?1.25:1,M=(e.worldThreat[n]||0)*.01,E=(o.risk+M*.6)*f*$,B=Ne(E);e.pendingEncounter={isScout:t,from:a,to:n,distance:c,transportId:s.id,globalRisk:E,zombieClass:B},e.flow.mode="encounter",r(`Выезд в ${o.name}. На маршруте замечены зараженные (${B}).`),u()}function I(t){const a=e.pendingEncounter;if(!a)return;const n=N(a.transportId),o=D(a.to),s=(t==null?void 0:t.action)||"stealth",i=!!(t!=null&&t.forceReturn),d=l(.08*a.globalRisk*n.breakRisk*e.modifiers.breakRisk,.03,.45),c=l(.07*a.globalRisk,.02,.5),g=l(.28*a.globalRisk,.1,.9);let f=a.isScout?.45:1,$=d,M=c,E=g;const B=s==="fightWin"||s==="fightLose"?18:8;e.worldThreat[a.to]=l((e.worldThreat[a.to]||0)+B,0,100),s==="stealth"?(f*=.78,$*=.7,M*=.65,E*=.45,r("Вы выбрали стелс-подход: меньше риска, но и меньше добычи.")):s==="fightWin"?(f*=1.2,$*=.92,M*=.9,E=1,r("После победы в бою вы зачистили зону и собрали больше лута.","good")):s==="fightLose"&&(f*=.35,$*=1.35,M*=1.3,E=1,r("Поражение в бою. Эвакуация под давлением врага.","bad"));const k=n.cargo,m=Math.round(k*(.35+Math.random()*.4)*f),R={};for(const y of o.tags){const A=Math.max(2,Math.round(m/o.tags.length*(.7+Math.random()*.7)));R[y]=(R[y]||0)+A}if(!a.isScout&&Math.random()<.32){const y=["electronics","parts","meds"][p(0,2)];R[y]=(R[y]||0)+p(2,6)}const U=nt(R);if(r(`Экспедиция: ${o.name}. Лут загружен в инвентарь.`,"good"),Object.keys(U).length){const y=Object.entries(U).map(([A,te])=>`${x[A].label} ${te}`).join(", ");r(`Часть трофеев потеряна из-за лимита веса/слотов: ${y}.`,"bad")}const z=Z().noise||0;if(Math.random()<E){const y=p(2,6);e.base.stress=l(e.base.stress+p(3,7),0,100),e.base.fatigue=l(e.base.fatigue+p(4,8),0,100),e.base.door=l(e.base.door-y,0,100),r(`Столкновение (${a.zombieClass}). Повреждение техники/двери: -${y}.`,"bad")}else r(`Удалось пройти участок с зараженными (${a.zombieClass}) без боя.`);if(s==="fightWin"||s==="fightLose"){const y=l(.12*z*a.globalRisk,.02,.3);if(Math.random()<y){const A=p(2,6);e.base.stress=l(e.base.stress+A,0,100),r(`Шум боя привлек новых зараженных. Стресс +${A}.`,"bad")}}if(Math.random()<$){const y=p(2,8);e.resources.fuel=Math.max(0,e.resources.fuel-y),r(`Поломка транспорта в пути. Потеря топлива: ${y}.`,"bad")}if(Math.random()<M){const y=p(4,10);e.base.infection=l(e.base.infection+y,0,100),r(`Контакт с зараженной средой. Рост заражения: +${y}.`,"bad"),e.hero.injuries.torso=l(e.hero.injuries.torso+p(2,5),0,100)}a.isScout&&Math.random()<.65&&lt(a.to),e.map.currentNodeId=a.to,ut(a.globalRisk),pt(a.to);const ee=G(a.to);if(!i&&!a.isScout&&(a.secondStop||0)<2&&ee.length){e.pendingEncounter={...a,from:a.from,secondStop:a.secondStop||0,awaitingRouteDecision:!0},e.flow.mode="routeDecision",r("Точка зачищена. Решайте: идти дальше или возвращаться."),h(),u();return}e.pendingEncounter=null,e.flow.mode="idle",ge(),he(),be(),h(),u()}function gt(){if(!e.pendingEncounter)return;const t=e.pendingEncounter,a=Z(),n=Re(),o=re(a.id),s=e.hero.injuries.arm>=40?.12:0,i=e.hero.injuries.leg>=40?.08:0;e.combat={playerHp:26+(S("garageHull")?4:0)+n.hpBonus,enemyHp:Math.round(20+t.globalRisk*7),round:1,enemyType:t.zombieClass,defend:!1,precisionBonus:((S("garageLights")?.15:0)+a.aimedBonus-s)*o,dodgeBonus:(S("garageLights")?.18:0)+n.dodgeBonus-i,damageReduction:n.damageReduction,weaponId:a.id,durabilityFactor:o},e.flow.mode="combat",r("Бой начался. Используйте действия боевой сцены."),u()}function se(){if(!e.combat)return;const t=e.combat;let a=p(4,8);if(t.defend&&(a=Math.floor(a*.45)),Math.random()<t.dodgeBonus&&(a=Math.floor(a*.5)),a=Math.max(1,Math.round(a*(1-t.damageReduction))),t.playerHp=Math.max(0,t.playerHp-a),r(`Зараженный наносит ${a} урона.`,a>=6?"bad":""),a>=5&&Math.random()<.45){const n=["arm","leg","torso"][p(0,2)],o=p(3,8);e.hero.injuries[n]=l(e.hero.injuries[n]+o,0,100),r(`Травма: повреждена ${{arm:"рука",leg:"нога",torso:"корпус"}[n]} (+${o}).`,"bad")}}function Ce(t){if(!e.combat||e.gameOver)return;const a=e.combat,n=C(a.weaponId||e.hero.equippedWeaponId),o=n.durabilityLoss||.6;if(a.defend=!1,t==="attack"){if(n.ammoUse>0&&n.ammoType&&e.resources[n.ammoType]<n.ammoUse){r("Недостаточно патронов, используйте защиту или отступайте.","bad"),se(),a.playerHp<=0?(r("Вы ранены и выбиты из боя. Пришлось срочно отступить.","bad"),e.base.infection=l(e.base.infection+p(6,12),0,100),e.base.stress=l(e.base.stress+p(6,12),0,100),e.base.fatigue=l(e.base.fatigue+p(8,14),0,100),e.combat=null,I({action:"fightLose"})):(a.round+=1,h(),u());return}n.ammoUse>0&&n.ammoType&&(e.resources[n.ammoType]-=n.ammoUse,e.dayStats.spent[n.ammoType]+=n.ammoUse),Ee(n.id,o);const s=re(n.id),i=.78+n.hitBonus;if(Math.random()<=i){const d=Math.max(1,Math.round(p(n.damageMin,n.damageMax)*s));a.enemyHp=Math.max(0,a.enemyHp-d),r(`Вы атакуете (${n.name}) и наносите ${d} урона.`,"good")}else r(`Атака (${n.name}) не попала в цель.`,"bad")}else if(t==="aimed"){if(n.ammoUse>0&&n.ammoType&&e.resources[n.ammoType]<n.ammoUse){r("Недостаточно патронов для точного выстрела.","bad"),se(),a.playerHp<=0?(r("Вы ранены и выбиты из боя. Пришлось срочно отступить.","bad"),e.base.infection=l(e.base.infection+p(6,12),0,100),e.base.stress=l(e.base.stress+p(6,12),0,100),e.base.fatigue=l(e.base.fatigue+p(8,14),0,100),e.combat=null,I({action:"fightLose"})):(a.round+=1,h(),u());return}n.ammoUse>0&&n.ammoType&&(e.resources[n.ammoType]-=n.ammoUse,e.dayStats.spent[n.ammoType]+=n.ammoUse),Ee(n.id,o+.3);const s=re(n.id),i=.66+a.precisionBonus;if(Math.random()<=i){const d=Math.max(1,Math.round(p(n.damageMin+2,n.damageMax+3)*s));a.enemyHp=Math.max(0,a.enemyHp-d),r(`Точный выстрел (${n.name}): ${d} урона.`,"good")}else r("Точный выстрел мимо.","bad")}else if(t==="defend"){a.defend=!0;const s=p(2,4);a.enemyHp=Math.max(0,a.enemyHp-s),r(`Вы держите оборону и контратакуете на ${s}.`)}else if(t==="medkit")if(e.resources.meds>0){e.resources.meds-=1;const s=p(7,11);a.playerHp=Math.min(34,a.playerHp+s),r(`Использована аптечка. Восстановление: +${s} HP.`,"good")}else r("Аптечек нет.","bad");else if(t==="flee"){if(Math.random()<.5){r("Удалось оторваться от врага и отступить.","good");const s=N(e.pendingEncounter.transportId),i=Math.ceil(s.fuelUse*e.pendingEncounter.distance*.5);e.resources.fuel=Math.max(0,e.resources.fuel-i),e.base.stress=l(e.base.stress+4,0,100),e.combat=null,e.flow.mode="encounter",I({action:"fightLose"});return}r("Попытка бегства провалилась.","bad")}if(a.enemyHp<=0){r("Враг повержен.","good"),e.combat=null,e.flow.mode="encounter",I({action:"fightWin"});return}if(se(),a.playerHp<=0){r("Вы ранены и выбиты из боя. Пришлось срочно отступить.","bad"),e.base.infection=l(e.base.infection+p(6,12),0,100),e.base.stress=l(e.base.stress+p(6,12),0,100),e.base.fatigue=l(e.base.fatigue+p(8,14),0,100),e.combat=null,e.flow.mode="encounter",I({action:"fightLose"});return}a.round+=1,h(),u()}function Oe(t){if(!(!e.pendingEncounter||e.gameOver||e.combat||e.flow.mode!=="encounter")){if(e.pendingEncounter.awaitingRouteDecision){if(!G(e.pendingEncounter.to).length){r("Маршрутная развилка сброшена: недоступна следующая точка, выполняется возврат."),K(!1);return}r("Сначала решите: идти на следующую точку или возвращаться."),u();return}if(t==="stealth")I({action:"stealth"});else if(t==="fight")r("Вы выбрали бой. Переход в боевую сцену."),gt();else if(t==="retreat"){const a=N(e.pendingEncounter.transportId),n=Math.ceil(a.fuelUse*e.pendingEncounter.distance*.5);e.resources.fuel=Math.max(0,e.resources.fuel-n),e.base.stress=l(e.base.stress+3,0,100),r(`Вы отступили. Доп. расход топлива: ${n}.`,"bad"),e.pendingEncounter=null,e.flow.mode="idle",ge(),he(),be(),h(),u()}}}function K(t){const a=e.pendingEncounter;if(!a||e.gameOver||e.combat||e.flow.mode!=="routeDecision"||!a.awaitingRouteDecision)return;if(!t){r("Решение: возвращаемся домой с текущей добычей."),e.pendingEncounter.awaitingRouteDecision=!1,e.flow.mode="encounter",I({action:"stealth",forceReturn:!0});return}const n=G(a.to);if(!n.length){r("Вторая точка недоступна, рейд завершен на текущей локации."),e.pendingEncounter.awaitingRouteDecision=!1,e.flow.mode="encounter",I({action:"stealth",forceReturn:!0});return}const o=n[p(0,n.length-1)],s=Math.max(1,j(a.to,o)),d=N(a.transportId).fuelUse*s;if(e.resources.fuel<d){r("На вторую точку не хватает топлива, рейд завершен.","bad"),e.pendingEncounter.awaitingRouteDecision=!1,e.flow.mode="encounter",I({action:"stealth",forceReturn:!0});return}e.resources.fuel-=d,e.dayStats.spent.fuel+=d;const c=D(o),g=l(a.globalRisk*1.18+.12,.9,2.4);e.pendingEncounter={...a,from:a.to,to:o,distance:s,globalRisk:g,zombieClass:Ne(g),secondStop:(a.secondStop||0)+1,awaitingRouteDecision:!1},e.flow.mode="encounter",r(`Рейд продолжается: вторая точка ${c.name}. Риск повышен.`,"bad"),u()}function T(){e.gameOver||e.pendingEncounter||e.combat||(ge(),he(),be(),h(),u())}function ie(){if(!(e.gameOver||e.pendingEncounter||e.combat)){if(w[e.phase]!=="Вечер"&&w[e.phase]!=="Ночь"){r("Лучше отдыхать вечером или ночью."),u();return}e.base.fatigue=l(e.base.fatigue-18,0,100),e.base.stress=l(e.base.stress-10,0,100),ot(),r("Вы отдохнули и немного восстановились.","good"),h(),u()}}function qe(){if(e.gameOver||e.pendingEncounter||e.combat)return;const t=e.gameplay.arcadeMode?6:8;if(e.resources.materials<t){r("Недостаточно материалов для ремонта.","bad"),u();return}e.resources.materials-=t;const a=e.gameplay.arcadeMode?14:10,n=Math.round(a*e.modifiers.repairEfficiency);e.base.wall=l(e.base.wall+n,0,100),e.base.door=l(e.base.door+Math.round(n*.7),0,100),r(`База отремонтирована: стены +${n}.`,"good"),h(),u()}function de(){if(!(e.gameOver||e.pendingEncounter||e.combat)){if(e.resources.food<4){r("Недостаточно еды для приготовления.","bad"),u();return}e.resources.food-=4,e.base.fatigue=l(e.base.fatigue-8,0,100),e.base.stress=l(e.base.stress-6,0,100),r("Приготовлена горячая еда. Мораль поднялась.","good"),h(),u()}}function je(t){if(e.gameOver||e.pendingEncounter||e.combat||!["arm","leg","torso"].includes(t))return;const a=e.hero.injuries[t];if(a<=0){r("Серьезных повреждений в этой зоне нет."),u();return}if(e.resources.meds<=0){r("Недостаточно медикаментов для лечения.","bad"),u();return}e.resources.meds-=1,e.dayStats.spent.meds+=1;const n=t==="torso"?p(10,16):p(12,18);e.hero.injuries[t]=l(a-n,0,100),r(`Медосмотр: обработана зона "${{arm:"рука",leg:"нога",torso:"корпус"}[t]}". Травма -${n}.`,"good"),h(),u()}function Pe(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const a=le.find(n=>n.id===t);if(!(!a||e.upgradesBuilt.includes(t))){if(!H(a.cost)){r(`Недостаточно ресурсов для улучшения "${a.name}".`,"bad"),u();return}W(a.cost),e.upgradesBuilt.push(t),a.apply(e),r(`Построено: ${a.name}.`,"good"),t==="radio"&&r("В эфире появились сюжетные сигналы и запросы о помощи."),h(),u()}}function We(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const a=ue.find(n=>n.id===t);if(!(!a||S(t))){if(!H(a.cost)){r(`Недостаточно ресурсов для апгрейда гаража "${a.name}".`,"bad"),u();return}W(a.cost),e.garage.built.push(t),r(`Гараж улучшен: ${a.name}.`,"good"),h(),u()}}function ht(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const a=C(t);if(!(!a||!a.cost||e.hero.ownedWeapons.includes(t))){if(!H(a.cost)){r(`Недостаточно ресурсов для создания "${a.name}".`,"bad"),u();return}W(a.cost),e.hero.ownedWeapons.push(t),e.hero.weaponDurability[t]=a.maxDurability,r(`Создано оружие: ${a.name}.`,"good"),h(),u()}}function bt(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const a=me(t);if(!(!a||!a.cost||e.hero.ownedArmors.includes(t))){if(!H(a.cost)){r(`Недостаточно ресурсов для создания "${a.name}".`,"bad"),u();return}W(a.cost),e.hero.ownedArmors.push(t),r(`Создана броня: ${a.name}.`,"good"),h(),u()}}function Ue(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const n={ammo9:{amount:8,cost:{parts:3,materials:2}},ammo12:{amount:6,cost:{parts:4,materials:2}},ammo556:{amount:7,cost:{parts:4,materials:3,electronics:1}}}[t];if(n){if(!H(n.cost)){r("Недостаточно ресурсов для крафта боеприпасов.","bad"),u();return}W(n.cost),Ae(t,n.amount),r(`Собраны боеприпасы: +${n.amount} (${x[t].label}).`,"good"),h(),u()}}function Fe(t){if(e.gameOver||e.pendingEncounter||e.combat)return;const a=C(t),n=O(t);if(n>=a.maxDurability){r("Оружие не требует ремонта."),u();return}const o={parts:2,materials:2};if(!H(o)){r("Недостаточно ресурсов для ремонта оружия.","bad"),u();return}W(o),e.hero.weaponDurability[t]=l(n+18,0,140),r(`Оружие "${a.name}" отремонтировано (+18 прочности).`,"good"),h(),u()}function yt(t){e.hero.ownedWeapons.includes(t)&&(e.hero.equippedWeaponId=t,r(`Экипировано оружие: ${C(t).name}.`),h(),u())}function vt(t){e.hero.ownedArmors.includes(t)&&(e.hero.equippedArmorId=t,r(`Экипирована броня: ${me(t).name}.`),h(),u())}function $t(){e.ui.upgradesCollapsed=!e.ui.upgradesCollapsed,h(),u()}function wt(){e.ui.garageCollapsed=!e.ui.garageCollapsed,h(),u()}function Mt(){e.ui.heroGearCollapsed=!e.ui.heroGearCollapsed,h(),u()}function xt(){e.ai.autoHeroEnabled=!e.ai.autoHeroEnabled,r(e.ai.autoHeroEnabled?"Автопилот героя включен: приоритет — выживание, осторожные решения и ранний отход.":"Автопилот героя выключен.",e.ai.autoHeroEnabled?"good":""),h(),ye(),u()}function Et(){e.gameplay.arcadeMode=!e.gameplay.arcadeMode,r(e.gameplay.arcadeMode?"Режим Аркада включен: дом прочнее и быстрее восстанавливается.":"Режим Аркада выключен: стандартная выживаемость.",e.gameplay.arcadeMode?"good":""),h(),u()}function kt(){const t=e.combat;if(!t)return"attack";const a=t.playerHp<=12;return t.playerHp<=7&&Math.random()<.65?"flee":a&&e.resources.meds>0?"medkit":a&&Math.random()<.35?"defend":t.enemyHp<=7?"aimed":t.playerHp<=16&&Math.random()<.25?"defend":Math.random()<.65?"aimed":"attack"}function St(){const t=e.pendingEncounter;return t?(e.base.infection>60||e.base.stress>75||e.base.fatigue>78||e.resources.meds<2)&&t.globalRisk>1.15||e.base.wall<35||e.base.door<35?"retreat":t.globalRisk>1.45?"stealth":t.globalRisk<1.2&&e.resources.meds>=3&&e.base.fatigue<70?"fight":"stealth":"stealth"}function Bt(){const t=e.pendingEncounter;return!t||t.secondStop>=2||t.globalRisk>1.5||e.base.infection>45||e.base.fatigue>68||e.resources.meds<2?!1:e.resources.fuel>10&&Math.random()<.45}function It(){var i;const t=Q().filter(d=>d!==e.map.currentNodeId);if(!t.length)return null;const a=e.resources.food<10,n=e.resources.fuel<12,o=e.resources.meds<4,s=t.map(d=>{const c=D(d),g=(e.worldThreat[d]||0)*.01;let f=1.05-(c.risk+g*.6)*.45;return a&&c.tags.includes("food")&&(f+=.85),n&&c.tags.includes("fuel")&&(f+=.85),o&&c.tags.includes("meds")&&(f+=.75),c.tags.includes("electronics")&&!e.story.radioOnline&&(f+=.35),(e.base.infection>50||e.base.fatigue>70)&&(f-=c.risk*.5),f+=Math.random()*.25,{id:d,score:f}});return s.sort((d,c)=>c.score-d.score),((i=s[0])==null?void 0:i.id)||null}function Rt(){if(!e.ai.autoHeroEnabled||e.gameOver)return;if(e.flow.mode==="combat"&&e.combat){v("Бой: защитить себя и выжить"),Ce(kt());return}if(e.flow.mode==="routeDecision"&&e.pendingEncounter&&e.pendingEncounter.awaitingRouteDecision){if(!G(e.pendingEncounter.to).length){v("Рейд: принудительный возврат, следующая точка недоступна"),K(!1);return}v("Рейд: оценка, идти на следующую точку или возвращаться"),K(Bt());return}if(e.flow.mode==="encounter"&&e.pendingEncounter){v("Экспедиция: снизить риск столкновения"),Oe(St());return}if(e.flow.mode!=="idle"&&(e.flow.mode="idle"),w[e.phase]==="Ночь"){v("Ночь: переждать и восстановиться"),e.base.fatigue>45||e.base.stress>55?ie():T();return}if(e.inventory.items.length&&e.map.currentNodeId==="home"){v("База: разгрузка добычи"),Te();return}const t=e.base.infection>55||e.base.stress>70||e.base.fatigue>72||e.resources.food<7||e.resources.meds<2;if((e.base.wall<45||e.base.door<45)&&e.resources.materials>=8){v("База: срочный ремонт защиты"),qe();return}if(e.resources.food>=4&&(e.base.fatigue>65||e.base.stress>65)){v("База: восстановить силы едой"),de();return}if((w[e.phase]==="Вечер"||w[e.phase]==="Ночь")&&e.base.fatigue>55){v("База: отдых перед ночью"),ie();return}if(t&&e.map.currentNodeId==="home"){if(e.resources.meds>0){const s=e.hero.injuries,i=Object.entries(s).sort((d,c)=>c[1]-d[1])[0];if(i&&i[1]>=18){v("Выживание: приоритетное лечение травм"),je(i[0]);return}}if(e.resources.food>=4&&(e.base.fatigue>55||e.base.stress>55)){v("Выживание: питание и снижение стресса"),de();return}if(e.base.infection>45&&e.resources.meds>0){v("Выживание: лечение и стабилизация"),T();return}}if(!t){const s=Z();if(O(s.id)<s.maxDurability*.45&&e.map.currentNodeId==="home"){v("Поддержка: ремонт оружия"),Fe(s.id);return}if(e.resources.ammo9<6&&e.resources.ammo12<4&&e.resources.ammo556<5&&e.map.currentNodeId==="home"){v("Поддержка: сборка боеприпасов");const f=e.resources.ammo9<6?"ammo9":e.resources.ammo556<5?"ammo556":"ammo12";Ue(f);return}const c=le.find(f=>!e.upgradesBuilt.includes(f.id)&&H(f.cost));if(c){v("Развитие: улучшение базы"),Pe(c.id);return}const g=ue.find(f=>!S(f.id)&&H(f.cost));if(g){v("Развитие: апгрейд транспорта"),We(g.id);return}}const a=pe(),n=fe(),o=e.map.currentNodeId!=="home"&&(n>=a.weight*.65||e.inventory.items.length>=a.slots*.65||w[e.phase]==="Вечер"||t);if(o&&Q().includes("home")){const s=j(e.map.currentNodeId,"home"),i=ne(s);if(!i){T();return}e.selectedTransportId=i,e.map.selectedNodeId="home",v("Экспедиция: вернуться домой с добычей"),P(!1);return}else if(o){const s=Le("home");if(s){const i=j(e.map.currentNodeId,s),d=ne(i);if(!d){T();return}e.selectedTransportId=d,e.map.selectedNodeId=s,v("Экспедиция: этапный возврат домой"),P(!1);return}}if(w[e.phase]!=="Ночь"){const s=It();if(s){const i=j(e.map.currentNodeId,s),d=ne(i);if(!d){e.resources.fuel<4&&r("Автогерой: мало топлива, делаю паузу до следующей фазы."),T();return}e.selectedTransportId=d,e.map.selectedNodeId=s;const c=e.map.discovered.length<ce.length&&Math.random()<.35;v(c?"Экспедиция: разведка безопасного маршрута":"Экспедиция: добыча ресурсов"),P(c);return}}v("Ожидание: экономия сил и ресурсов"),T()}function ye(){_&&(clearInterval(_),_=null),e.ai.autoHeroEnabled&&(_=setInterval(Rt,Ye))}function At(){return Object.entries(e.resources).filter(([t])=>!!x[t]).map(([t,a])=>`<div class="res"><span>${x[t].label}</span><strong>${a}</strong></div>`).join("")}function q(t,a,n,o=!1){const s=o?100-a:a;return`
    <div class="stat">
      <div class="stat-top"><span>${t}</span><span>${a}/100</span></div>
      <div class="bar"><div class="fill" style="width:${s}%; background:${n}"></div></div>
    </div>
  `}function Dt(){const t=Q();return e.map.discovered.map(a=>{const n=D(a),o=a===e.map.currentNodeId,s=a===e.map.selectedNodeId,i=t.includes(a);return`
        <button
          class="map-node ${o?"current-node":""} ${s?"selected-node":""}"
          data-node-id="${a}"
          ${i?"":"disabled"}
        >
          ${n.name}${o?" (вы здесь)":""}
        </button>
      `}).join("")}function Ht(){return le.map(t=>{const a=e.upgradesBuilt.includes(t.id),n=Object.entries(t.cost).map(([o,s])=>`${o}:${s}`).join(", ");return`
      <div class="upgrade-card">
        <div class="upgrade-title">${t.name}</div>
        <div class="muted">${t.desc}</div>
        <div class="muted">Цена: ${n}</div>
        <button ${a?"disabled":""} data-upgrade-id="${t.id}">
          ${a?"Построено":"Построить"}
        </button>
      </div>
    `}).join("")}function Tt(){if(!e.npcs.length)return'<div class="muted">Пока никто не присоединился.</div>';const t=e.npcManagement.shifts,a=`
    <div class="npc-card">
      <strong>Смены базы</strong>
      <div class="muted">Охрана: ${t.guard} | Снабжение: ${t.scavenger} | Медицина: ${t.medic} | Техник: ${t.mechanic}</div>
      <div class="muted">Усталость NPC: ${e.npcManagement.fatigue}/100 | Мораль: ${e.npcManagement.morale}/100</div>
    </div>
  `;return e.npcs.map(n=>`<div class="npc-card"><strong>${n.name}</strong><div class="muted">${n.bonus}</div></div>`).join("")+a}function Lt(){if(!e.pendingEncounter)return"";const t=(e.pendingEncounter.secondStop||0)<2?G(e.pendingEncounter.to):[],a=!!e.pendingEncounter.awaitingRouteDecision;return`
    <div class="encounter">
      <h2>Контакт с угрозой</h2>
      <div class="muted">На маршруте замечены зараженные (${e.pendingEncounter.zombieClass}). Выбери подход:</div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-encounter="stealth" ${a?"disabled":""}>Стелс</button>
        <button data-encounter="fight" ${a?"disabled":""}>Бой</button>
      </div>
      <button data-encounter="retreat" style="margin-top:8px;" ${a?"disabled":""}>Отступить</button>
      ${a&&!t.length?`
        <div class="muted" style="margin-top:8px;">Следующая точка недоступна. Завершите рейд возвратом.</div>
        <button data-raid-next="no" style="margin-top:6px;">Возврат домой</button>
      `:t.length?`
        <div class="muted" style="margin-top:8px;">Рейд можно продолжить: +риск, +награда (${e.pendingEncounter.secondStop||0}/2).</div>
        <div class="btn-row" style="margin-top:6px;">
          <button data-raid-next="yes" ${a?"":"disabled"}>Идти дальше</button>
          <button data-raid-next="no" ${a?"":"disabled"}>Возврат домой</button>
        </div>
      `:""}
    </div>
  `}function Nt(){return e.combat?`
    <div class="encounter combat-scene">
      <h2>Боевая сцена</h2>
      <div class="muted">Раунд ${e.combat.round} | Противник: ${e.combat.enemyType}</div>
      <div class="combat-bars">
        <div>Вы: <strong>${e.combat.playerHp} HP</strong></div>
        <div>Враг: <strong>${e.combat.enemyHp} HP</strong></div>
      </div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-combat-action="attack">Атака</button>
        <button data-combat-action="aimed">Точный выстрел</button>
      </div>
      <div class="btn-row" style="margin-top:8px;">
        <button data-combat-action="defend">Защита</button>
        <button data-combat-action="medkit">Аптечка</button>
      </div>
      <button style="margin-top:8px;" data-combat-action="flee">Попытка бегства</button>
    </div>
  `:""}function Ct(){return V.map(t=>{const a=N(t.id),n=t.id===e.selectedTransportId?"selected":"";return`<option value="${t.id}" ${n}>${t.name} | топливо ${a.fuelUse}/узел | груз ${a.cargo}</option>`}).join("")}function Ot(){return e.gameOver?`
    <div class="game-over">
      Игра завершена. Можно начать заново кнопкой "Новая игра".
    </div>
  `:""}function qt(){const t=e.upgradesBuilt.length,a=t>=5?3:t>=3?2:t>=1?1:0,n=["Укрытие","Укрепленный дом","Форпост","Крепость"][a],o=e.base.wall>65?"good":e.base.wall>35?"warn":"bad",s=e.base.door>65?"good":e.base.door>35?"warn":"bad",i=e.base.power>30||e.modifiers.generator,d=w[e.phase]==="Ночь",c=e.weather.name==="Дождь"||e.weather.name==="Кислотный дождь",g=d&&!e.gameOver&&(e.base.wall<95||e.base.door<95),f=e.base.wall<35||e.base.door<35,$=`tier-${a}`,M=d?3:1,E=c?1:0,B=e.base.stress>65?1:0,k=Math.min(6,M+E+B),m=i||a>=2,R=e.upgradesBuilt.includes("fortifiedDoor"),U=e.upgradesBuilt.includes("workshop"),z=e.modifiers.generator,ee=e.modifiers.watchtower,y=e.modifiers.greenhouse,A=e.modifiers.radio,te=Date.now()/1e3,Ge=Array.from({length:k}).map((Vt,F)=>{const $e=F%3,we=9+F*1.2,ze=(te%we+F*1.35).toFixed(2),_e=$e===0?"z-lane-front":$e===1?"z-lane-mid":"z-lane-back",Ve=F%3===0?"z-runner":F%3===1?"z-walker":"z-brute";return`<span class="px zombie ${_e} ${Ve}" style="animation-delay:-${ze}s;animation-duration:${we.toFixed(2)}s;"><span class="limb arm"></span><span class="limb leg"></span></span>`}).join(""),ve=a>=3?"gate":"door";return`
    <div class="pixel-house-scene ${$} ${d?"night-scene":""} ${c?"rain-scene":""} ${g?"raid-active":""} ${f?"severe-damage":""}">
      <div class="pixel-house-wrap">
        <span class="px haze"></span>
        <span class="px celestial ${d?"moon":"sun"}"></span>
        <span class="px cloud c1"></span>
        <span class="px cloud c2"></span>
        <span class="px fence-line"></span>
        <span class="px bush left"></span>
        <span class="px bush right"></span>
        <span class="px ground-shadow"></span>
        <div class="pixel-house ${$} ${R?"steel-door":""} ${U?"workshop-on":""} ${g?"under-raid":""} ${f?"damaged":""}">
          ${a>=1?'<span class="px barricade left"></span><span class="px barricade right"></span>':""}
          <span class="px roof"></span>
          <span class="px roof-shadow"></span>
          <span class="px eave"></span>
          <span class="px body ${o}"></span>
          <span class="px porch"></span>
          <span class="px door ${s}"></span>
          <span class="px win left ${i?"lit":"dim"}"></span>
          <span class="px win right ${i?"lit":"dim"}"></span>
          <span class="px frame left"></span>
          <span class="px frame right"></span>
          <span class="px chimney"></span>
          ${U?'<span class="px workshop-sign"></span>':""}
          ${R?'<span class="px spike-trap"></span>':""}
          ${z?'<span class="px battery-pack"></span>':""}
          ${m?'<span class="px smoke s1"></span><span class="px smoke s2"></span><span class="px smoke s3"></span>':""}
          ${ee?'<span class="px tower"></span>':""}
          ${y?'<span class="px greenhouse"></span>':""}
          ${A?'<span class="px antenna"></span>':""}
          ${z?'<span class="px cable"></span>':""}
          ${a>=2?'<span class="px wall-plate left"></span><span class="px wall-plate right"></span>':""}
          ${a>=3?`<span class="px gate"></span><span class="px flood-light ${i?"on":"off"}"></span><span class="px flood-beam ${i?"on":"off"}"></span>`:""}
          ${g?`<span class="px impact ${ve}"></span>`:""}
          ${g?`<span class="px zombie raider z-brute ${ve}"></span>`:""}
        </div>
        ${Ge}
      </div>
      <div class="pixel-legend muted">
        ${g?"НАЛЕТ: активная атака базы | ":""}
        Стадия: ${n} (${a}/3) | Стены: ${e.base.wall}/100 | Дверь: ${e.base.door}/100 | Энергия: ${e.base.power}/100
      </div>
    </div>
  `}function jt(){const t=pe(),a=fe(),n=De();return e.inventory.items.length?`
    <div class="muted">Слоты: ${n}/${t.slots} | Вес: ${a.toFixed(1)}/${t.weight} кг</div>
    ${e.inventory.items.map(o=>{const s=x[o.type],i=(o.qty*s.weight).toFixed(1);return`<div class="res"><span>${s.label} x${o.qty}</span><strong>${i} кг</strong></div>`}).join("")}
  `:`
      <div class="muted">Инвентарь пуст.</div>
      <div class="muted">Слоты: ${n}/${t.slots} | Вес: ${a.toFixed(1)}/${t.weight} кг</div>
    `}function Pt(){if(!e.economyHistory.length)return'<div class="muted">Сводка за 7 дней появится после завершения первых суток.</div>';const t={gained:{},spent:{}};return Object.keys(x).forEach(n=>{t.gained[n]=0,t.spent[n]=0}),e.economyHistory.forEach(n=>{Object.keys(x).forEach(o=>{var s,i;t.gained[o]+=((s=n.gained)==null?void 0:s[o])||0,t.spent[o]+=((i=n.spent)==null?void 0:i[o])||0})}),Object.keys(x).map(n=>({k:n,delta:t.gained[n]-t.spent[n],inVal:t.gained[n],outVal:t.spent[n]})).filter(n=>n.inVal>0||n.outVal>0).sort((n,o)=>n.delta-o.delta).slice(0,6).map(n=>`<div class="res"><span>${x[n.k].label}</span><strong>${n.inVal}/${n.outVal} (${n.delta>=0?"+":""}${n.delta})</strong></div>`).join("")}function Wt(){const t=Z(),a=Re(),n=e.hero.injuries,o=O(t.id);return`
    <div class="npc-card">
      <strong>Оружие:</strong> ${t.name}
      <div class="muted">Урон ${t.damageMin}-${t.damageMax} | Точность +${Math.round(t.hitBonus*100)}% | Шум x${t.noise.toFixed(2)} | Патроны ${t.ammoUse?t.ammoUse+"/выстрел":"не нужны"} | Износ ${o.toFixed(0)}/${t.maxDurability}</div>
    </div>
    <div class="npc-card">
      <strong>Броня:</strong> ${a.name}
      <div class="muted">Снижение урона ${Math.round(a.damageReduction*100)}% | HP +${a.hpBonus}</div>
    </div>
    <div class="npc-card">
      <strong>Травмы:</strong>
      <div class="muted">Рука ${n.arm}/100 | Нога ${n.leg}/100 | Корпус ${n.torso}/100</div>
    </div>
  `}function Ut(){const t=Y.map(n=>{const o=e.hero.ownedWeapons.includes(n.id),s=e.hero.equippedWeaponId===n.id,i=n.cost?Object.entries(n.cost).map(([d,c])=>`${d}:${c}`).join(", "):"Стартовое";return`
      <div class="upgrade-card">
        <div class="upgrade-title">${n.name}</div>
        <div class="muted">Урон: ${n.damageMin}-${n.damageMax}, точность +${Math.round(n.hitBonus*100)}%, шум x${n.noise.toFixed(2)}, износ ${O(n.id).toFixed(0)}/${n.maxDurability}</div>
        <div class="muted">Цена: ${i}</div>
        ${o?`<button data-equip-weapon="${n.id}" ${s?"disabled":""}>${s?"Экипировано":"Экипировать"}</button>
               <button data-repair-weapon="${n.id}" style="margin-top:6px;">Ремонтировать</button>`:`<button data-craft-weapon="${n.id}">Создать</button>`}
      </div>
    `}).join(""),a=J.map(n=>{const o=e.hero.ownedArmors.includes(n.id),s=e.hero.equippedArmorId===n.id,i=n.cost?Object.entries(n.cost).map(([d,c])=>`${d}:${c}`).join(", "):"Стартовое";return`
      <div class="upgrade-card">
        <div class="upgrade-title">${n.name}</div>
        <div class="muted">Броня: -${Math.round(n.damageReduction*100)}% урона, HP +${n.hpBonus}</div>
        <div class="muted">Цена: ${i}</div>
        ${o?`<button data-equip-armor="${n.id}" ${s?"disabled":""}>${s?"Экипировано":"Экипировать"}</button>`:`<button data-craft-armor="${n.id}">Создать</button>`}
      </div>
    `}).join("");return`
    <h2 style="margin-top:14px;">Оружие</h2>
    <div class="grid">${t}</div>
    <h2 style="margin-top:14px;">Броня</h2>
    <div class="grid">${a}</div>
  `}function Ft(){const t=e.hero.injuries,a=(n,o,s)=>{const i=s<=0||e.resources.meds<=0;return`<button data-treat="${n}" ${i?"disabled":""}>${o} (${s})</button>`};return`
    <h2 style="margin-top:14px;">Медосмотр</h2>
    <div class="muted">Медикаменты: ${e.resources.meds}. Лечение тратит 1 ед. медикаментов.</div>
    <div class="btn-row" style="margin-top:8px;">
      ${a("arm","Лечить руку",t.arm)}
      ${a("leg","Лечить ногу",t.leg)}
    </div>
    <button data-treat="torso" style="margin-top:8px;" ${t.torso<=0||e.resources.meds<=0?"disabled":""}>
      Лечить корпус (${t.torso})
    </button>
  `}function Gt(){return`
    <h2 style="margin-top:14px;">Боеприпасы</h2>
    <div class="muted">Текущие запасы: 9mm ${e.resources.ammo9}, 12g ${e.resources.ammo12}, 5.56 ${e.resources.ammo556}</div>
    <div class="btn-row" style="margin-top:8px;">
      <button data-craft-ammo="ammo9">Собрать 9mm (+8)</button>
      <button data-craft-ammo="ammo12">Собрать 12g (+6)</button>
    </div>
    <button data-craft-ammo="ammo556" style="margin-top:8px;">Собрать 5.56 (+7)</button>
  `}function zt(){return ue.map(t=>{const a=S(t.id),n=Object.entries(t.cost).map(([o,s])=>`${o}:${s}`).join(", ");return`
      <div class="upgrade-card">
        <div class="upgrade-title">${t.name}</div>
        <div class="muted">${t.desc}</div>
        <div class="muted">Цена: ${n}</div>
        <button data-garage-id="${t.id}" ${a?"disabled":""}>
          ${a?"Установлено":"Установить"}
        </button>
      </div>
    `}).join("")}function u(){ct(),e.dayPlan.generatedForDay!==e.day&&He();const t=e.gameOver||!!e.pendingEncounter||!!e.combat,a=D(e.map.currentNodeId),n=e.ui.upgradesCollapsed,o=e.ui.garageCollapsed,s=e.ui.heroGearCollapsed;b.innerHTML=`
    <main class="app">
      <section class="card header">
        <div>
          <h1>House: Last Safe Home</h1>
          <div class="subline">Выживи, укрепи дом и собери общину.</div>
        </div>
        <div class="header-right">
          <span class="status-pill">День ${e.day} / ${ke}</span>
          <span class="status-pill phase">${w[e.phase]}</span>
          <span class="status-pill weather">${e.weather.name}</span>
          <span class="status-pill ${e.gameplay.arcadeMode?"good-pill":""}">
            ${e.gameplay.arcadeMode?"Аркада":"Хардкор"}
          </span>
          <span class="status-pill ${e.ai.autoHeroEnabled?"good-pill":""}">
            Герой: ${e.ai.autoHeroEnabled?"Авто":"Ручной"}
          </span>
          <button id="arcadeBtn" class="small-btn">${e.gameplay.arcadeMode?"Хардкор":"Аркада"}</button>
          <button id="autoHeroBtn" class="small-btn">${e.ai.autoHeroEnabled?"Стоп авто":"Авто-герой"}</button>
          <button id="saveBtn" class="small-btn">Сохранить</button>
          <button id="resetBtn" class="small-btn">Новая игра</button>
        </div>
      </section>

      <section class="card">
        <h2>Состояние базы</h2>
        <h2 style="margin-top:4px;">Пиксельный дом</h2>
        ${qt()}
        <div class="stats">
          ${q("Стены",e.base.wall,"#69b8ff")}
          ${q("Дверь",e.base.door,"#52d3bc")}
          ${q("Энергия",e.base.power,"#f2b14a")}
          ${q("Усталость",e.base.fatigue,"#cc8df7",!0)}
          ${q("Стресс",e.base.stress,"#f18f8f",!0)}
          ${q("Заражение",e.base.infection,"#ff6868",!0)}
        </div>
        <h2 style="margin-top:12px;">Ресурсы</h2>
        <div class="resources">${At()}</div>
        <h2 style="margin-top:12px;">Инвентарь (вес/слоты)</h2>
        <div class="grid">${jt()}</div>
        <button id="unloadBtn" style="margin-top:8px;" ${t?"disabled":""}>Разгрузить в склад</button>
        <h2 style="margin-top:12px;">Статус</h2>
        <div class="grid muted">
          <div>Сезон: <strong>${Ie()}</strong></div>
          <div>Текущая позиция: <strong>${a.name}</strong></div>
          <div>NPC на базе: <strong>${e.npcs.length}</strong></div>
          <div>Угроза локации: <strong>${Math.round(e.worldThreat[e.map.currentNodeId]||0)}/100</strong></div>
          <div>Антенна: <strong>${e.story.antennaParts}/3</strong></div>
          <div>Радио: <strong>${e.story.radioOnline?"Включено":"Отключено"}</strong></div>
          <div>Намерение героя: <strong>${e.ai.intent}</strong></div>
          <div>План дня:</div>
          ${e.dayPlan.goals.map(i=>`<div>- ${i}</div>`).join("")}
          <div>Состояние потока: <strong>${e.flow.mode}</strong></div>
        </div>
        <h2 style="margin-top:12px;">Экономика за 7 дней</h2>
        <div class="grid">${Pt()}</div>
        ${Ot()}
      </section>

      <section class="card">
        <h2>Карта узлов</h2>
        <div class="map-grid">${Dt()}</div>

        <h2 style="margin-top:14px;">Экспедиция</h2>
        <div class="grid">
          <label class="muted" for="transportSelect">Транспорт</label>
          <select id="transportSelect" ${t?"disabled":""}>${Ct()}</select>
          <div class="btn-row">
            <button id="expeditionBtn" ${t?"disabled":""}>Выехать</button>
            <button id="scoutBtn" ${t?"disabled":""}>Разведка</button>
          </div>
        </div>

        ${Lt()}
        ${Nt()}

        <div class="section-row" style="margin-top:14px;">
          <h2>Гараж и транспорт</h2>
          <button id="toggleGarageBtn" class="small-btn">
            ${o?"Развернуть":"Свернуть"}
          </button>
        </div>
        ${o?'<div class="muted">Панель гаража скрыта.</div>':`<div class="grid">${zt()}</div>`}

        <div class="section-row" style="margin-top:14px;">
          <h2>Улучшения дома</h2>
          <button id="toggleUpgradesBtn" class="small-btn">
            ${n?"Развернуть":"Свернуть"}
          </button>
        </div>
        ${n?'<div class="muted">Панель улучшений скрыта.</div>':`<div class="grid">${Ht()}</div>`}

        <h2 style="margin-top:14px;">Действия дома</h2>
        <div class="btn-row">
          <button id="craftMealBtn" ${t?"disabled":""}>Приготовить еду</button>
          <button id="repairBtn" ${t?"disabled":""}>Ремонт стен</button>
        </div>
        <div class="btn-row" style="margin-top:8px;">
          <button id="restBtn" ${t?"disabled":""}>Отдохнуть</button>
          <button id="advanceBtn" ${t?"disabled":""}>Следующая фаза</button>
        </div>
      </section>

      <section class="card">
        <h2>Жители базы</h2>
        <div class="grid">${Tt()}</div>
        <div class="section-row" style="margin-top:14px;">
          <h2>Снаряжение героя</h2>
          <button id="toggleHeroGearBtn" class="small-btn">
            ${s?"Развернуть":"Свернуть"}
          </button>
        </div>
        ${s?'<div class="muted">Панель оружия и брони скрыта.</div>':`<div class="grid">${Wt()}</div>${Ft()}${Gt()}${Ut()}`}
        <h2 style="margin-top:14px;">Радио и события</h2>
        <div class="log">
          ${e.logs.map(i=>`<div class="log-item ${i.cssClass||""}">${i.msg}</div>`).join("")}
        </div>
      </section>
    </main>
  `,_t()}function _t(){var t,a,n,o,s,i,d,c,g,f,$,M,E,B,k;(t=b.querySelector("#saveBtn"))==null||t.addEventListener("click",()=>{h(),r("Состояние игры сохранено."),u()}),(a=b.querySelector("#resetBtn"))==null||a.addEventListener("click",tt),(n=b.querySelector("#autoHeroBtn"))==null||n.addEventListener("click",xt),(o=b.querySelector("#arcadeBtn"))==null||o.addEventListener("click",Et),(s=b.querySelector("#transportSelect"))==null||s.addEventListener("change",m=>{e.selectedTransportId=m.target.value,h(),u()}),(i=b.querySelector("#unloadBtn"))==null||i.addEventListener("click",Te),(d=b.querySelector("#toggleUpgradesBtn"))==null||d.addEventListener("click",$t),(c=b.querySelector("#toggleGarageBtn"))==null||c.addEventListener("click",wt),(g=b.querySelector("#toggleHeroGearBtn"))==null||g.addEventListener("click",Mt),b.querySelectorAll("[data-node-id]").forEach(m=>{m.addEventListener("click",()=>{e.map.selectedNodeId=m.dataset.nodeId,h(),u()})}),(f=b.querySelector("#expeditionBtn"))==null||f.addEventListener("click",()=>P(!1)),($=b.querySelector("#scoutBtn"))==null||$.addEventListener("click",()=>P(!0)),(M=b.querySelector("#craftMealBtn"))==null||M.addEventListener("click",de),(E=b.querySelector("#repairBtn"))==null||E.addEventListener("click",qe),(B=b.querySelector("#restBtn"))==null||B.addEventListener("click",ie),(k=b.querySelector("#advanceBtn"))==null||k.addEventListener("click",T),b.querySelectorAll("[data-upgrade-id]").forEach(m=>{m.addEventListener("click",()=>Pe(m.dataset.upgradeId))}),b.querySelectorAll("[data-garage-id]").forEach(m=>{m.addEventListener("click",()=>We(m.dataset.garageId))}),b.querySelectorAll("[data-encounter]").forEach(m=>{m.addEventListener("click",()=>Oe(m.dataset.encounter))}),b.querySelectorAll("[data-raid-next]").forEach(m=>{m.addEventListener("click",()=>K(m.dataset.raidNext==="yes"))}),b.querySelectorAll("[data-combat-action]").forEach(m=>{m.addEventListener("click",()=>Ce(m.dataset.combatAction))}),b.querySelectorAll("[data-craft-weapon]").forEach(m=>{m.addEventListener("click",()=>ht(m.dataset.craftWeapon))}),b.querySelectorAll("[data-craft-ammo]").forEach(m=>{m.addEventListener("click",()=>Ue(m.dataset.craftAmmo))}),b.querySelectorAll("[data-craft-armor]").forEach(m=>{m.addEventListener("click",()=>bt(m.dataset.craftArmor))}),b.querySelectorAll("[data-equip-weapon]").forEach(m=>{m.addEventListener("click",()=>yt(m.dataset.equipWeapon))}),b.querySelectorAll("[data-repair-weapon]").forEach(m=>{m.addEventListener("click",()=>Fe(m.dataset.repairWeapon))}),b.querySelectorAll("[data-equip-armor]").forEach(m=>{m.addEventListener("click",()=>vt(m.dataset.equipArmor))}),b.querySelectorAll("[data-treat]").forEach(m=>{m.addEventListener("click",()=>je(m.dataset.treat))})}e.logs.length||(e.weather=L[p(0,L.length-1)],r("Вы укрылись в доме на окраине. Первая цель: продержаться 7 дней."),r("Подсказка: разведывай узлы карты и готовь базу к ночным волнам."),h());ye();u();
