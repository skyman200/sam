// Web.gs : 발표 도우미 웹앱 화면의 서버 함수
// Slides.gs·Timer.gs·Check.gs 가 먼저 필요합니다
// 필요 권한: 스프레드시트·슬라이드 (기존과 같음)

// 웹앱 주소를 열면 발표 도우미 화면을 보여 줍니다
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('Helper')
    .setTitle('발표 도우미')
    .addMetaTag('viewport',
      'width=device-width, initial-scale=1');
}

// 대본 탭 2행부터의 값을 모두 가져옵니다
function scriptRows_() {
  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) {
    throw new Error('2행부터 대본을 적으세요.');
  }
  return sh.getRange(
    2, 1, sh.getLastRow() - 1, 3)
    .getValues();
}

// 대본 줄마다 [제목, 내용, 발표할 말] 문자열로
function loadScript() {
  return scriptRows_().map(
    r => r.map(c => String(c)));
}

// 고칠 칸 목록 [{row, col, why}] (시트는 안 칠함)
function checkScript() {
  const list = [];
  scriptRows_().forEach((r, i) => {
    r.forEach((c, j) => {
      if (!isBad_(c, r)) return;
      const why = String(c).trim() === ''
        ? '빈 칸입니다'
        : '한 문장이 ' + MAX_SENTENCE
          + '자를 넘습니다';
      list.push({
        row: i + 2, col: j + 1, why });
    });
  });
  return list;
}

// 예상 발표 시간(분)을 숫자로 돌려줍니다
function estimate() {
  return estimateMinutes();
}

// 슬라이드를 만들고 {url, titles} 를 돌려줍니다
function makeSlidesUrl() {
  const url = makeSlides();
  const titles = scriptRows_()
    .filter(r => r[0])
    .map(r => String(r[0]));
  return { url, titles };
}
