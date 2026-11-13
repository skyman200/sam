// Maker.gs : 유인물로 4지선다 문제 만들기
// Code.gs 의 QUIZ, 속성 GEMINI_API_KEY 필요
const QUIZ_MODEL = 'gemini-3.5-flash-lite';
const QUIZ_ASK = '이 유인물로 4지선다 10문제.'
  + ' 유인물에 없는 내용 금지.'
  + ' 정답은 보기 번호 1~4(첫 보기가 1).'
  + ' 해설 한 문장.';

// 웹앱이 보낸 파일로 문제를 만들어 시트에 씁니다
function makeQuizFromFile(b64, mime) {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName(QUIZ);
  if (!sh) throw new Error('Quiz 탭이 없습니다');
  const rows = askQuiz_({ inline_data: {
    mime_type: mime, data: b64 } }, QUIZ_ASK);
  if (rows.length < 5) throw new Error('쓸 만한'
    + ' 문제가 ' + rows.length + '개뿐입니다.'
    + ' 다시 눌러 주세요');
  // 글 앞에 ' 를 붙여 '2:1' 같은 글이 시간으로
  // 바뀌지 않게 글자 그대로 적습니다
  const safe = rows.map(r => r.map(v =>
    typeof v === 'string' ? "'" + v : v));
  sh.getRange('A2:G').clearContent();
  sh.getRange(2, 1, safe.length, 7)
    .setValues(safe);
  return safe.length;
}

// AI에게 묻고, 시트에 쓸 줄(7칸) 목록을 받습니다
function askQuiz_(part, ask) {
  const key = PropertiesService
    .getScriptProperties()
    .getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY 없음'
    + ': 프로젝트 설정 → 스크립트 속성');
  const url = 'https://generativelanguage'
    + '.googleapis.com/v1beta/models/'
    + QUIZ_MODEL + ':generateContent';
  const s = { type: 'STRING' };
  const item = { type: 'OBJECT', properties: {
    q: s, ch: { type: 'ARRAY', items: s,
      minItems: 4, maxItems: 4 },
    ans: { type: 'INTEGER', minimum: 1,
      maximum: 4, description: '첫 보기가 1' },
    exp: s },
    required: ['q', 'ch', 'ans', 'exp'],
    propertyOrdering: ['q', 'ch', 'ans', 'exp'] };
  const body = { contents: [{ parts: [
    part, { text: ask }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: { type: 'ARRAY',
        items: item, maxItems: 10 } } };
  const opt = { method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true };
  let res; // 바쁘면(429·503) 3초 뒤 한 번 더
  for (let t = 0; t < 2; t++) {
    res = UrlFetchApp.fetch(url, opt);
    const c0 = res.getResponseCode();
    if (![429, 500, 503].includes(c0)) break;
    Utilities.sleep(3000);
  }
  const code = res.getResponseCode();
  const json = res.getContentText();
  if (code !== 200) {
    let m = json;
    try { m = JSON.parse(json).error.message; }
    catch (e) {}
    throw new Error('오류 ' + code + ' : '
      + String(m).slice(0, 120));
  }
  return readQuiz_(JSON.parse(json));
}

// AI 답에서 문제 목록을 꺼내고, 이상한 문제는 뺍니다
function readQuiz_(data) {
  const c = (data.candidates || [])[0];
  const ps = c && c.content && c.content.parts;
  const text = (ps || []).filter(
    p => p.text && !p.thought)
    .map(p => p.text).join('');
  if (!text) throw new Error('AI가 답을 주지'
    + ' 않았습니다. 다른 파일로 해 보세요');
  let list;
  try { list = JSON.parse(text); }
  catch (e) { list = null; }
  if (!Array.isArray(list)) throw new Error(
    'AI 답이 중간에 끊겼습니다. 다시 눌러 주세요');
  return list.map(toRow_).filter(r => r)
    .slice(0, 10);
}

// 문제 한 개를 검사하고 시트 한 줄로 바꿉니다
function toRow_(it) {
  const ch = Array.isArray(it.ch) ? it.ch : [];
  const ans = Number(it.ans);
  const r = [it.q].concat(ch, ans, it.exp);
  const ok = ch.length === 4
    && [1, 2, 3, 4].includes(ans) && r.every(
      v => v != null && String(v).trim() !== '');
  return ok ? r : null;
}

// 편집기에서 먼저 실행해 권한을 허용합니다
function testMaker() {
  const part = { text: '광합성은 식물이 빛으로 '
    + '물과 이산화탄소에서 포도당을 만드는 일이다.' };
  Logger.log(askQuiz_(part, QUIZ_ASK
    .replace('10문제', '3문제')));
}
