// Timer.gs : 대본 글자 수로 발표 시간 계산
// Slides.gs 의 SHEET_NAME 이 먼저 필요합니다
// 필요 권한: 구글 스프레드시트 읽기
const CHARS_PER_MIN = 350; // 1분에 말하는 글자 수
const LIMIT_MIN = 0.5; // 제한 시간(분), 바꿔 쓰기

// 발표할 말(C열) 글자 수를 시간으로 바꿉니다
function estimateMinutes() {
  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);
  if (!sh) {
    throw new Error('대본 탭이 없습니다.');
  }

  const rows = sh.getDataRange().getValues();
  rows.shift(); // 1행(머리글)은 뺀다
  const chars = sumChars_(rows);
  const min = Math.round(
    chars / CHARS_PER_MIN * 10) / 10;

  console.log(chars + '자 = 약 ' + min + '분');
  if (min > LIMIT_MIN) {
    console.log('경고: ' + LIMIT_MIN
      + '분을 넘었습니다.');
  }
  return min;
}

// 모든 줄의 발표할 말 글자 수를 더합니다
function sumChars_(rows) {
  let sum = 0;
  rows.forEach(r => {
    sum += String(r[2]).replace(/\s/g, '')
      .length;
  });
  return sum;
}
