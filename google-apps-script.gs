// Google Sheets -> Extensions -> Apps Script: paste this file.
// Bind this script to the target spreadsheet (Extensions -> Apps Script).
const SHEET_NAME = 'RSVP';
function doPost(e) {
  const p = (e && e.parameter) || {};
  const name = String(p.guestName || '').trim().slice(0,100);
  const attendance = String(p.attendance || '');
  const count = Number(p.guestCount);
  const message = String(p.message || '').trim().slice(0,500);
  if (p.website || !name || !['yes','no'].includes(attendance) ||
    !Number.isInteger(count) || count < 0 || count > 10 ||
    (attendance === 'yes' && count < 1) || (attendance === 'no' && count !== 0)) {
    return ContentService.createTextOutput('Invalid form data');
  }
  // Prevent spreadsheet formula execution for user-entered text.
  const safe = (s) => /^[=+@\-]/.test(s) ? "'" + s : s;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    if (!book) throw new Error('Open script via Google Sheets > Extensions > Apps Script.');
    let sheet = book.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = book.insertSheet(SHEET_NAME);
      sheet.appendRow(['Received at','Name','Attendance','Number of guests','Message']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(),safe(name),attendance,count,safe(message)]);
    return ContentService.createTextOutput('OK');
  } finally { lock.releaseLock(); }
}
