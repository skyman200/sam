// Share.gs : 스크랩을 구글 문서 한 개로 모으기
// Code.gs 의 getSheet_ 가 먼저 필요합니다
// 필요 권한: 스프레드시트 읽기, 구글 문서 만들기
const SHARE_TITLE = '스크랩 모음';

// 주제 순서대로 스크랩을 문서 한 개에 담습니다
function exportToDoc() {
  const rows = getSheet_().getDataRange()
    .getValues().slice(1)
    .filter(function (r) { return r[0]; });
  if (rows.length === 0) {
    throw new Error('보낼 스크랩이 없습니다');
  }

  rows.sort(function (a, b) {
    return String(a[0]).localeCompare(
      String(b[0]));
  });

  const doc = DocumentApp.create(
    SHARE_TITLE);
  rows.forEach(function (r) {
    addItem_(doc.getBody(), r);
  });
  const url = doc.getUrl();
  doc.saveAndClose();
  Logger.log('문서 완성: ' + url);
  return url;
}

// 문서에 스크랩 한 건(주제·인용구·링크)을 적습니다
function addItem_(body, r) {
  const H = DocumentApp.ParagraphHeading;
  body.appendParagraph(String(r[0]))
    .setHeading(H.HEADING2);
  body.appendParagraph(String(r[2]));
  body.appendParagraph(String(r[1]))
    .editAsText().setLinkUrl(String(r[1]));
}

// 화면용: 문서를 만들고 이름·링크·건수를 돌려줍니다
function exportDoc() {
  const url = exportToDoc();
  let n = 0;
  countByTopic().forEach(function (c) {
    n += c.n;
  });
  return { url: url, title: SHARE_TITLE,
    n: n };
}
