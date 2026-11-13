// Score.gs : 퀴즈 점수 기록과 약한 문제 찾기
// Code.gs 의 WRONG·getQuiz 가 먼저 필요합니다
// 필요 권한: 구글 스프레드시트 읽기·쓰기
const SCORE_TAB = '점수';

// 오늘 틀린 수로 점수·정답률을 적습니다(하루 1회)
function saveScore() {
  const today = new Date().toDateString();
  const wrong = wrongRows_().filter(r =>
    new Date(r[0]).toDateString() === today);
  const total = getQuiz().length;
  const right = total - wrong.length;

  const rate = Math.round(
    right / total * 100);
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SCORE_TAB)
    || ss.insertSheet(SCORE_TAB);
  sh.appendRow(
    [new Date(), right, total, rate]);
  Logger.log('정답률 ' + rate + '%');
}

// 가장 자주 틀린 문제 3개를 보여 줍니다
function showWeakTop3() {
  const count = {};
  wrongRows_().forEach(r => {
    count[r[1]] = (count[r[1]] || 0) + 1;
  });

  const top = Object.keys(count)
    .sort((a, b) => count[b] - count[a])
    .slice(0, 3);
  top.forEach((q, i) => Logger.log(
    (i + 1) + '위 ' + count[q] + '번: ' + q));
}

// 오답노트의 틀린 문제 줄을 읽습니다(없으면 빈 목록)
function wrongRows_() {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName(WRONG);
  if (!sh) return [];
  return sh.getDataRange().getValues()
    .filter(r => r[1] && r[0] !== '날짜');
}
