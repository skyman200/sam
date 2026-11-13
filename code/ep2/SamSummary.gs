// SamSummary.gs : 키 없이 쓰는 수업용 요약 함수
// 수업용 서버(Cloudflare)에 글을 보내 3줄로 받습니다
const SAM_URL = 'https://sam.ptclinical'
  + '.workers.dev/api/summarize';
const SAM_CODE = 'sam-2026';
const SAM_MIN_LENGTH = 20;
const SAM_CACHE_SECONDS = 21600; // 6시간

/**
 * 키 없이 글을 3줄로 요약합니다.
 * @customfunction
 */
function SAM_SUMMARY(text) {
  if (Array.isArray(text)) {
    text = text.join(' ');
  }
  text = String(text || '').trim();
  if (text.length < SAM_MIN_LENGTH) {
    return '20자 이상 글을 넣어 주세요';
  }

  // 같은 글은 6시간 동안 저장해 둔 답을 씁니다
  const cache = CacheService
    .getScriptCache();
  const cacheKey = makeCacheKey_(text);
  const saved = cache.get(cacheKey);
  if (saved) {
    return saved;
  }

  const res = UrlFetchApp.fetch(SAM_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-sam-code': SAM_CODE },
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true });

  const code = res.getResponseCode();
  const json = res.getContentText();
  if (code !== 200) {
    throw new Error('오류 ' + code + ' : '
      + json.slice(0, 80));
  }
  const summary = JSON.parse(json).summary;
  if (!summary) throw new Error('답이 비었습니다');
  cache.put(cacheKey, summary,
    SAM_CACHE_SECONDS);
  return summary;
}

// 글 내용으로 짧은 저장 이름(캐시 키)을 만듭니다
function makeCacheKey_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    text, Utilities.Charset.UTF_8);
  return 'sam_'
    + Utilities.base64EncodeWebSafe(bytes);
}

// 편집기에서 먼저 실행해 권한을 허용합니다
function testSamSummary() {
  const out = SAM_SUMMARY('광합성은 식물이 빛으로 '
    + '물과 이산화탄소에서 포도당을 만드는 일이다.');
  Logger.log(out);
}
