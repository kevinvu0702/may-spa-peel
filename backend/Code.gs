/** Google Apps Script V8. Cấu hình SPREADSHEET_ID trong Script Properties. */
function doPost(e) {
  const output=x=>ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);
  let lock;
  try {
    if(!e || !e.postData || e.postData.contents.length>12000) throw Error('invalid');
    const b=JSON.parse(e.postData.contents);
    if(b.website || b.consent!==true || b.service_id!=='peel') throw Error('invalid');
    if(!/^[a-f0-9-]{36}$/i.test(b.request_id||'')) throw Error('invalid');
    if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||!/^0[35789]\d{8}$/.test(b.phone||''))throw Error('invalid');
    const zone='Asia/Ho_Chi_Minh',now=new Date(),today=Utilities.formatDate(now,zone,'yyyy-MM-dd');
    const max=Utilities.formatDate(new Date(now.getTime()+30*86400000),zone,'yyyy-MM-dd');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date||'')||!/^\d{2}:\d{2}$/.test(b.time||''))throw Error('invalid');
    const minutes=Number(b.time.slice(0,2))*60+Number(b.time.slice(3));
    if(minutes<540||minutes>1170||minutes%15!==0)throw Error('invalid');
    const at=new Date(b.date+'T'+b.time+':00+07:00');
    if(isNaN(at.getTime())||Utilities.formatDate(at,zone,'yyyy-MM-dd')!==b.date)throw Error('invalid');
    const spreadsheet=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
    lock=LockService.getScriptLock();lock.waitLock(15000);
    let sheet=spreadsheet.getSheetByName('LICH_HEN');
    if(!sheet)throw Error('missing_template');
    const headers=['Mã lịch','Ngày tạo','Ngày hẹn','Giờ hẹn','Họ tên','Số điện thoại','Tình trạng da','Trạng thái lịch','Nguồn lead','UTM Source','UTM Medium','UTM Campaign','UTM Content','UTM Term','GCLID','GBRAID','WBRAID','Landing page','Vị trí CTA','KTV phụ trách','Ngày xác nhận','Ngày khách đến','Dịch vụ','Doanh thu (VNĐ)','Ghi chú','Lần cập nhật'];
    if(JSON.stringify(sheet.getRange(1,1,1,26).getValues()[0])!==JSON.stringify(headers))throw Error('header_mismatch');
    const bookingId='MAY-PEEL-'+b.request_id;
    if(sheet.getLastRow()>1&&sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(bookingId).matchEntireCell(true).findNext())return output({ok:true,request_id:b.request_id,duplicate:true});
    if(b.date<today||b.date>max||at<=now)throw Error('invalid');
    // Chống chèn công thức bảng tính; dữ liệu liên hệ lưu dưới dạng chuỗi.
    const clean=v=>{const s=String(v||'').slice(0,300);return /^[=+@\-\t\r\n]/.test(s)?"'"+s:s;};
    const a=b.attribution||{};
    const midnight=new Date(b.date+'T00:00:00+07:00');
    const row=[bookingId,now,midnight,minutes/1440,clean(b.name),"'"+b.phone,'','cho_xac_nhan','landing_peel'];
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid'].forEach(k=>row.push(clean(a[k])));
    row.push(clean(b.landing_page),clean(b.cta_position),'','','','Peel da','', 'Đồng ý liên hệ xử lý lịch hẹn',now);
    sheet.appendRow(row);
    const last=sheet.getLastRow();
    sheet.getRange(last,2).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange(last,3).setNumberFormat('dd/MM/yyyy');
    sheet.getRange(last,4).setNumberFormat('HH:mm');
    sheet.getRange(last,6).setNumberFormat('@');
    sheet.getRange(last,24).setNumberFormat('#,##0');
    sheet.getRange(last,26).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    const states=['cho_xac_nhan','da_xac_nhan','can_doi_gio','khong_lien_lac_duoc','khach_huy','spa_huy','da_den','dang_phuc_vu','hoan_tat','khong_den'];
    sheet.getRange(last,8).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(states,true).setAllowInvalid(false).build());
    SpreadsheetApp.flush();return output({ok:true,request_id:b.request_id});
  } catch(err) {return output({ok:false,error:'REQUEST_NOT_SAVED'});} finally {if(lock&&lock.hasLock())lock.releaseLock();}
}

/** Simple trigger khi mã này gắn trực tiếp với sheet peel. Không cài thêm trigger trùng. */
function onEdit(e) {
  if(!e||!e.range)return;
  const sh=e.range.getSheet();
  if(sh.getName()!=='LICH_HEN'||e.range.getLastRow()<2)return;
  const now=new Date();
  for(let r=Math.max(2,e.range.getRow());r<=e.range.getLastRow();r++){
    if(!sh.getRange(r,1).getValue())continue;
    sh.getRange(r,26).setValue(now).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    if(e.range.getColumn()<=8&&e.range.getLastColumn()>=8){
      const status=sh.getRange(r,8).getValue();
      if(status==='da_xac_nhan'&&!sh.getRange(r,21).getValue())sh.getRange(r,21).setValue(now).setNumberFormat('dd/MM/yyyy');
      if(['da_den','dang_phuc_vu','hoan_tat'].indexOf(status)>=0&&!sh.getRange(r,22).getValue())sh.getRange(r,22).setValue(now).setNumberFormat('dd/MM/yyyy');
    }
  }
}
