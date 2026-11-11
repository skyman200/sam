// Notes.gs : 오답노트 탭을 복습 자료 문서로 만들기
// Code.gs의 WRONG 상수를 쓰므로 Code.gs가 먼저 있어야 합니다
const REVIEW_TITLE = '복습 자료';

// 오답노트 전체를 '복습 자료' 문서 하나로 만듭니다
function makeReviewDoc() {
  const rows = readWrong_();
  const zone = Session.getScriptTimeZone();
  const today = Utilities.formatDate(
    new Date(), zone, 'yyyy-MM-dd');

  const doc = DocumentApp.create(
    REVIEW_TITLE + ' ' + today);
  const body = doc.getBody();
  const H = DocumentApp.ParagraphHeading;
  body.getParagraphs()[0]
    .setText(REVIEW_TITLE)
    .setHeading(H.HEADING1);
  body.appendParagraph('틀린 문제 '
    + rows.length + '개 (' + today + ')');

  rows.forEach(function (r, i) {
    body.appendParagraph(
      (i + 1) + '. ' + r[1])
      .setHeading(H.HEADING3);
    body.appendParagraph('내 답: ' + r[2]
      + '번 / 정답: ' + r[3] + '번');
    body.appendParagraph('해설: ' + r[4]);
  });

  const url = doc.getUrl();
  doc.saveAndClose();
  Logger.log('복습 자료 완성: ' + url);
  return url;
}

// 오답노트 탭에서 틀린 문제 줄만 읽어 옵니다
function readWrong_() {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName(WRONG);
  if (!sh) {
    throw new Error('오답노트 탭이 없습니다');
  }
  const rows = sh.getDataRange().getValues()
    .filter(function (r) {
      return r[1] !== '' && r[0] !== '날짜';
    });
  if (rows.length === 0) {
    throw new Error('오답노트에 기록이 없습니다');
  }
  return rows;
}
