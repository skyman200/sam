// Script.gs : '대본' 탭을 발표 대본 문서로 내보내기
// Slides.gs의 SHEET_NAME 을 쓰므로
// Slides.gs가 먼저 있어야 합니다

// 대본 탭의 제목·핵심·발표할 말을 문서 한 개로 만듭니다
function makeScriptDoc() {
  const ss = SpreadsheetApp
    .getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    throw new Error('대본 탭이 없습니다.');
  }
  const rows = sh.getDataRange().getValues();
  rows.shift(); // 1행(머리글)은 뺀다
  const items = rows.filter(r => r[0]);
  if (items.length === 0) {
    throw new Error('2행부터 대본을 적으세요.');
  }

  const doc = DocumentApp.create(
    '발표 대본 - ' + ss.getName());
  const body = doc.getBody();
  const H = DocumentApp.ParagraphHeading;
  const G = DocumentApp.GlyphType;
  body.getParagraphs()[0]
    .setText(ss.getName())
    .setHeading(H.TITLE);

  items.forEach((r, i) => {
    body.appendParagraph(
      (i + 1) + '. ' + r[0])
      .setHeading(H.HEADING2);
    pointsOf_(r[1]).forEach(p => {
      body.appendListItem(p)
        .setGlyphType(G.BULLET);
    });
    if (r[2]) {
      body.appendParagraph('발표할 말: ' + r[2]);
    }
  });

  const url = doc.getUrl();
  doc.saveAndClose();
  console.log('대본 완성: ' + url);
  return url;
}

// B열 글을 '/' 기준으로 잘라 핵심 문장 목록으로
function pointsOf_(cell) {
  return String(cell).split('/')
    .map(v => v.trim())
    .filter(v => v !== '');
}
