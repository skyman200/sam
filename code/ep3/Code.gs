// Code.gs : CBT 퀴즈 웹앱 (9주차 1강)
const QUIZ = 'Quiz';
const WRONG = '오답노트';

// 웹앱 주소를 열면 Index 화면을 보여 줍니다
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('CBT 퀴즈')
    .addMetaTag('viewport',
    'width=device-width, initial-scale=1');
}

// 'Quiz' 탭의 문제를 모두 읽어 목록으로 돌려줍니다
function getQuiz() {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName(QUIZ);
  if (!sh) throw new Error('Quiz 탭이 없습니다');
  return sh.getDataRange().getValues()
    .map((r, k) => (k > 0 && r[0] !== '')
      ? toItem(r, k + 1) : null)
    .filter(Boolean);
}

// 시트 한 줄을 문제 한 개로 바꿉니다
function toItem(r, row) {
  const ans = Number(r[5]);
  if (![1, 2, 3, 4].includes(ans)) {
    throw new Error(row + '행 F열은 1~4 숫자만');
  }
  const ch = r.slice(1, 5).map(String);
  return { q: String(r[0]), ch: ch,
    ans: ans, exp: String(r[6]) };
}

// 틀린 문제를 '오답노트' 탭에 한 줄 저장합니다
function saveWrong(i, pick) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(WRONG)
    || ss.insertSheet(WRONG);
  const it = getQuiz()[i];
  if (!it) throw new Error('없는 문제 번호');
  sh.appendRow([new Date(), it.q,
    pick, it.ans, it.exp]);
  return true;
}
