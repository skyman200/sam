// Slides.gs : '대본' 탭 → 구글 슬라이드
const SHEET_NAME = '대본';
const MAX_SLIDES = 20;
const MAIN_COLOR = '#D6232B'; // 명세서 메인색

// 시트를 열면 '발표 도우미' 메뉴를 만듭니다
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('발표 도우미')
    .addItem('슬라이드 만들기', 'makeSlides')
    .addToUi();
}

// 대본 탭의 줄마다 슬라이드를 한 장씩 만듭니다
function makeSlides() {
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
  if (items.length > MAX_SLIDES) {
    throw new Error('20장 이하로 줄이세요.');
  }
  const deck = SlidesApp.create(
    '발표 초안 - ' + ss.getName());
  const blank = deck.getSlides()[0];
  items.forEach(r => addSlide(deck, r));

  blank.remove(); // 빈 첫 장 지우기
  const url = deck.getUrl();
  console.log('완성: ' + url);
  try { // 웹앱에서는 알림이 없어도 됩니다
    ss.toast('내 드라이브에 저장했습니다', '완성', 10);
  } catch (e) {}
  return url;
}

// 슬라이드 한 장에 제목·내용·발표자 노트를 채웁니다
function addSlide(deck, r) {
  const s = deck.appendSlide(SlidesApp
    .PredefinedLayout.TITLE_AND_BODY);
  const T = SlidesApp.PlaceholderType;

  const title = s.getPlaceholder(T.TITLE);
  const body = s.getPlaceholder(T.BODY);
  if (!title || !body) {
    throw new Error('자리표시자를 못 찾았습니다.');
  }
  const t = title.asShape().getText()
    .setText(String(r[0]));
  t.getTextStyle()
    .setForegroundColor(MAIN_COLOR);

  const text = String(r[1]).split('/')
    .map(v => v.trim()).join('\n');
  body.asShape().getText().setText(text);
  if (r[2]) {
    s.getNotesPage().getSpeakerNotesShape()
      .getText().setText(String(r[2]));
  }
}
