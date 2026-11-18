// Check.gs : 빈 칸·너무 긴 문장을 노란색으로 칠하기
// Slides.gs 의 SHEET_NAME 이 먼저 필요합니다
// 필요 권한: 구글 스프레드시트 읽기·쓰기
const CHECK_COLOR = '#FFF176'; // 노란색
const MAX_SENTENCE = 60; // 한 문장 최대 글자 수

// 대본 탭에서 고칠 칸을 찾아 노란색으로 칠합니다
function highlightProblems() {
  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) {
    throw new Error('2행부터 대본을 적으세요.');
  }

  const n = sh.getLastRow() - 1;
  const range = sh.getRange(2, 1, n, 3);
  range.setBackground(null); // 지난번 색을 지운다
  let bad = 0;

  range.getValues().forEach((row, i) => {
    row.forEach((cell, j) => {
      if (!isBad_(cell, row)) return;
      range.getCell(i + 1, j + 1)
        .setBackground(CHECK_COLOR);
      bad++;
    });
  });
  console.log('고칠 칸 ' + bad + '개를 칠했습니다.');
}

// 빈 칸이거나 한 문장이 너무 길면 true
function isBad_(cell, row) {
  const text = String(cell).trim();
  if (text === '') {
    return row.join('') !== '';
  }
  return text.split(/[.?!/]/).some(
    s => s.trim().length > MAX_SENTENCE);
}
