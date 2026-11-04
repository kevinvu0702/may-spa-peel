'use strict';
const cfg=window.MAY_CONFIG||{};
const form=document.querySelector('#booking-form'), status=document.querySelector('#form-status'), submit=document.querySelector('#submit');
const date=document.querySelector('#date'), time=document.querySelector('#time');
const note=document.querySelector('#mode-note');
let cta='form', pending=null, sending=false;
function vnDate(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
function bounds(){date.min=vnDate();date.max=vnDate(new Date(Date.now()+30*86400000));}bounds();
for(let n=540;n<=1170;n+=15){const v=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');time.add(new Option(v,v));}
function event(name,position){if(cfg.analyticsEnabled){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:name,landing_page:'peel',cta_position:position});}}
document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>event('phone_click',a.dataset.cta||'footer')));
document.querySelectorAll('[data-book]').forEach(a=>a.addEventListener('click',()=>{cta=a.dataset.book;}));
document.querySelectorAll('[data-directions]').forEach(a=>a.addEventListener('click',()=>event('directions_click','booking')));
note.textContent=cfg.bookingEndpoint?'Mây sẽ liên hệ xác nhận sau khi nhận yêu cầu.':'Bản xem trước: chưa kết nối nhận lịch. Chị/bạn vui lòng gọi 0911 400 718 để hẹn trực tiếp.';
const attribution={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid']){const v=new URLSearchParams(location.search).get(k);if(v)attribution[k]=v.slice(0,300);}
form.addEventListener('submit',async e=>{e.preventDefault();if(sending)return;bounds();if(!form.reportValidity())return;
 const phone=form.elements.namedItem('phone').value.replace(/[^0-9+]/g,'').replace(/^\+84/,'0').replace(/^84(?=\d{9}$)/,'0');
 if(!/^0[35789]\d{8}$/.test(phone)){status.textContent='Vui lòng kiểm tra số điện thoại di động Việt Nam.';form.elements.namedItem('phone').focus();return;}
 const appointment=new Date(date.value+'T'+time.value+':00+07:00');
 if(date.value<date.min||date.value>date.max||appointment<=new Date()){status.textContent='Vui lòng chọn lịch trong tương lai, tối đa 30 ngày.';return;}
 if(!cfg.bookingEndpoint){status.textContent='Chưa gửi thông tin vì bản xem trước chưa kết nối nhận lịch. Vui lòng gọi 0911 400 718.';return;}
 // Giữ nguyên request khi retry sau lỗi không rõ trạng thái; không ghi thông tin cá nhân vào storage.
 if(!pending)pending={request_id:crypto.randomUUID(),name:form.elements.namedItem('name').value.trim(),phone,date:date.value,time:time.value,website:form.elements.namedItem('website').value,consent:true,service_id:'peel',landing_page:location.origin+location.pathname,cta_position:cta,attribution};
 sending=true;submit.disabled=true;status.textContent='Đang gửi yêu cầu…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(cfg.bookingEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(pending),signal:controller.signal,redirect:'follow'});if(!response.ok)throw Error('network');const result=await response.json();if(!result.ok||result.request_id!==pending.request_id)throw Error('save');
 event('booking_request_submit',pending.cta_position);pending=null;form.reset();bounds();status.textContent='Mây đã nhận yêu cầu và sẽ liên hệ xác nhận.';document.querySelector('#success').showModal();
 }catch(err){status.textContent='Chưa xác nhận được trạng thái gửi. Bạn có thể bấm gửi lại cùng yêu cầu hoặc gọi 0911 400 718. Nếu đã gửi, hệ thống sẽ tránh ghi trùng.';}
 finally{clearTimeout(timer);sending=false;submit.disabled=false;}
});
// Tránh âm thầm thay đổi nội dung của một request đang cần retry.
form.addEventListener('input',()=>{if(pending)status.textContent='Yêu cầu trước chưa rõ trạng thái. Nút gửi lại sẽ kiểm tra yêu cầu trước; vui lòng gọi Mây nếu cần đổi lịch.';});
document.querySelector('#close-success').addEventListener('click',()=>document.querySelector('#success').close());
