// Summary.gs : 셀에서 쓰는 AI 요약 함수
// 모델 이름은 자주 바뀝니다. 바뀌면 여기만
const MODEL = 'gemini-flash-latest';

/**
 * 글을 3줄로 요약합니다.
 * @customfunction
 */
function AI_SUMMARY(text) {
  if (!text) return '';

  const key = PropertiesService
    .getScriptProperties()
    .getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error('GEMINI_API_KEY 없음');
  }
  const url = 'https://generativelanguage'
    + '.googleapis.com/v1beta/models/'
    + MODEL + ':generateContent';

  const body = { contents: [{ parts: [{
    text: '대학생 시험 대비용으로 별표 없이 '
      + '3줄로 요약해 줘:\n' + text
  }] }] };
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true });

  const code = res.getResponseCode();
  const json = res.getContentText();
  if (code !== 200) {
    throw new Error('오류 ' + code + ' : '
      + json.slice(0, 80));
  }
  const c = JSON.parse(json).candidates;
  if (!c) throw new Error('답이 비었습니다');
  return c[0].content.parts[0].text;
}

// 편집기에서 먼저 실행해 권한을 허용합니다
function testSummary() {
  const out = AI_SUMMARY('광합성은 식물이 빛으로 '
    + '물과 이산화탄소에서 포도당을 만드는 일이다.');
  Logger.log(out);
}
