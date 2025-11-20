// Настройки по умолчанию — замените на ваши данные
const SETTINGS = {
  whatsapp: {
    phone: "+79990000000", // формат +7XXXXXXXXXX
    message: encodeURIComponent("Здравствуйте! Хочу забронировать комплект.")
  },
  telegram: {
    username: "your_telegram" // без @
  },
  location: {
    name: encodeURIComponent("г. Ваш город, Ул. Примерная, 1"),
    lat: 55.751244, // Москва как пример
    lng: 37.618423
  }
};

// Ссылки мессенджеров
const tgLink = document.getElementById('tgLink');
const waLink = document.getElementById('waLink');
const bookBtn = document.getElementById('bookBtn');
const bookBtn2 = document.getElementById('bookBtn2');

const tgHref = `https://t.me/${SETTINGS.telegram.username}`;
const waHref = `https://wa.me/${SETTINGS.whatsapp.phone.replace(/\D/g,'')}?text=${SETTINGS.whatsapp.message}`;
if (tgLink) tgLink.href = tgHref;
if (waLink) waLink.href = waHref;
if (bookBtn) bookBtn.href = waHref;
if (bookBtn2) bookBtn2.href = waHref;
// Кнопки бронирования в карточках листалки
document.querySelectorAll('.book-wa').forEach(a=>{ a.href = waHref; a.target = '_blank'; a.rel = 'noopener'; });

// Телефоны
const phoneTop = document.getElementById('phoneTop');
const phoneLink = document.getElementById('phoneLink');
const phoneLink2 = document.getElementById('phoneLink2');
if (phoneLink) phoneLink.href = `tel:${SETTINGS.whatsapp.phone}`;
if (phoneLink2) phoneLink2.href = `tel:${SETTINGS.whatsapp.phone}`;
if (phoneTop) phoneTop.href = `tel:${SETTINGS.whatsapp.phone}`;
if (phoneLink) phoneLink.textContent = formatPhone(SETTINGS.whatsapp.phone);
if (phoneLink2) phoneLink2.textContent = formatPhone(SETTINGS.whatsapp.phone);
if (phoneTop) phoneTop.textContent = formatPhone(SETTINGS.whatsapp.phone);

function formatPhone(p){
  const d = p.replace(/\D/g,'');
  if (d.length === 11 && d.startsWith('7')) return `+7 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
  return p;
}

// Оверлей меню
const burger = document.getElementById('burger');
const overlayNav = document.getElementById('overlayNav');
if (burger && overlayNav){
  burger.addEventListener('click',()=>{
    const open = overlayNav.classList.toggle('active');
    burger.setAttribute('aria-expanded', String(open));
    overlayNav.setAttribute('aria-hidden', String(!open));
  });
  overlayNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    overlayNav.classList.remove('active');
    burger.setAttribute('aria-expanded','false');
    overlayNav.setAttribute('aria-hidden','true');
  }));
}

// Tabs
const tabs = document.querySelectorAll('.tab');
const slides = document.querySelectorAll('.slide');

tabs.forEach(t=>{
  t.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    slides.forEach(s=>s.classList.remove('active'));
    t.classList.add('active');
    const pane = document.querySelector(`.slide[data-pane="${t.dataset.tab}"]`);
    if (pane) pane.classList.add('active');
  });
});

// Плавное выделение активной секции (bottom nav)
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const id = entry.target.getAttribute('id');
    if (entry.isIntersecting && id){
      document.querySelectorAll('.bottom-nav a').forEach(a=>{
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      })
    }
  })
},{rootMargin:"-40% 0px -55% 0px", threshold:[0,1]});

document.querySelectorAll('section[id]').forEach(sec=>observer.observe(sec));

// Геометка и построение маршрута
const routeBtn = document.getElementById('routeBtn');
const routeBtn2 = document.getElementById('routeBtn2');
const mapBox = document.getElementById('mapBox');

function openRoute(){
  if (!('geolocation' in navigator)){
    openMaps(false);
    return;
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    openMaps(true, pos.coords.latitude, pos.coords.longitude);
  },()=>{
    openMaps(false);
  },{enableHighAccuracy:true,timeout:7000,maximumAge:0});
}

function openMaps(hasStart, lat, lng){
  const dest = `${SETTINGS.location.lat},${SETTINGS.location.lng}`;
  const yandex = hasStart
    ? `https://yandex.ru/maps/?rtext=${lat},${lng}~${dest}&rtt=auto`
    : `https://yandex.ru/maps/?text=${dest}`;
  const google = hasStart
    ? `https://www.google.com/maps/dir/?api=1&destination=${dest}&origin=${lat},${lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${dest}`;
  // Попробуем открыть Яндекс, затем Google
  window.open(yandex, '_blank');
  setTimeout(()=>window.open(google,'_blank'), 400);
  if (mapBox){
    mapBox.innerHTML = `<iframe title="map" width="100%" height="100%" style="border:0;border-radius:12px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${dest}&output=embed"></iframe>`;
  }
}

routeBtn && routeBtn.addEventListener('click', openRoute);
routeBtn2 && routeBtn2.addEventListener('click', openRoute);

// Редактирование контента с сохранением
const editToggle = document.getElementById('editToggle');
const editbar = document.getElementById('editbar');
const saveEdits = document.getElementById('saveEdits');
const resetEdits = document.getElementById('resetEdits');

const EDIT_KEY = 'rent-site-edits-v1';

function setEditable(on){
  document.querySelectorAll('[data-edit]').forEach(el=>{
    el.contentEditable = on ? 'true' : 'false';
    el.classList.toggle('editable', on);
  });
  editbar.hidden = !on;
  editToggle && editToggle.setAttribute('aria-pressed', String(on));
}

function loadEdits(){
  try{
    const saved = JSON.parse(localStorage.getItem(EDIT_KEY)||'{}');
    Object.entries(saved).forEach(([id, html])=>{
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });
  }catch(e){/* noop */}
}

function persistEdits(){
  const data = {};
  document.querySelectorAll('[data-edit][id]').forEach(el=>{
    data[el.id] = el.innerHTML;
  });
  localStorage.setItem(EDIT_KEY, JSON.stringify(data));
}

function clearEdits(){
  localStorage.removeItem(EDIT_KEY);
  location.reload();
}

editToggle && editToggle.addEventListener('click',()=>{
  const on = editbar.hidden;
  setEditable(on);
});

saveEdits && saveEdits.addEventListener('click', persistEdits);
resetEdits && resetEdits.addEventListener('click', clearEdits);

loadEdits();

// Декоративно: активация скролла по ссылкам с плавностью и фокусом
function enableSmoothAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',(e)=>{
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        history.pushState(null,'',`#${id}`);
      }
    })
  })
}

enableSmoothAnchors();
