// WebSummary.gs : 요약 노트 화면용 함수
// SamSummary.gs·Pdf.gs 가 먼저 필요합니다
// 필요 권한: 스프레드시트 읽기·쓰기, 외부 연결, 드라이브
const NOTE_TAB = '필기';
const NOTE_MAX = 10;

// '필기' 탭 A열(2행부터)을 {row, text} 로 돌려줍니다
function loadNotes() {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOTE_TAB);
  if (!sheet) throw new Error('필기 탭이 없습니다');

  const last = sheet.getLastRow();
  if (last < 2) return [];
  const vals = sheet
    .getRange(2, 1, last - 1, 1).getValues();

  const notes = [];
  vals.forEach(function (v, i) {
    const text = String(v[0]).trim();
    if (text && notes.length < NOTE_MAX) {
      notes.push({ row: i + 2, text: text });
    }
  });
  return notes;
}

// 한 칸을 3줄로 요약해 B열에도 저장합니다
function summarizeNote(row, text) {
  const out = SAM_SUMMARY(text);
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(NOTE_TAB)
    .getRange(row, 2).setValue(out);
  return String(out);
}

// PDF를 저장하고 파일 이름과 링크를 돌려줍니다
function savePdfLink() {
  const file = savePdf();
  return { name: file.name, url: file.url };
}
