// Menu.gs : 시트 위쪽에 'AI 도우미' 메뉴 만들기
// SamSummary.gs·Pdf.gs 가 먼저 필요합니다
// 필요 권한: 스프레드시트 읽기·쓰기, 외부 연결
const MENU_NAME = 'AI 도우미';
const MENU_MAX_CELLS = 5;

// 시트를 열면 메뉴 두 개를 만듭니다
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_NAME)
    .addItem('선택한 칸 요약',
      'summarizeSelection')
    .addItem('PDF 저장', 'savePdf')
    .addToUi();
}

// 고른 칸을 요약해 오른쪽 칸에 적습니다
function summarizeSelection() {
  const range = SpreadsheetApp
    .getActiveRange();
  if (range.getNumColumns() > 1) {
    throw new Error('한 열만 고르세요');
  }

  const cells = range.getValues();
  if (cells.length > MENU_MAX_CELLS) {
    throw new Error('5칸 이하로 고르세요');
  }

  cells.forEach(function (row, i) {
    const out = SAM_SUMMARY(row[0]);
    range.offset(i, 1, 1, 1).setValue(out);
  });
  Logger.log(cells.length + '칸을 요약했습니다');
}
