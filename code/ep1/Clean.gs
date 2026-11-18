// Clean.gs : 스크랩 중복 지우기와 주제별 개수
// Code.gs 의 getSheet_ 가 먼저 필요합니다
// 필요 권한: 구글 스프레드시트 읽기·쓰기

// 같은 링크가 또 나오면 뒤쪽 줄을 지웁니다
function removeDuplicates() {
  const sheet = getSheet_();
  const all = sheet.getDataRange()
    .getValues();
  const dups = dupRows_(all);

  dups.forEach(function (n) {
    sheet.deleteRow(n);
  });
  Logger.log(dups.length + '개 줄을 지웠습니다');
  return dups.length;
}

// 앞에서 이미 본 링크의 줄 번호를 모읍니다
function dupRows_(rows) {
  const seen = {};
  const found = [];

  for (let i = 1; i < rows.length; i++) {
    const link = String(rows[i][1]).trim();
    if (seen[link]) found.push(i + 1);
    else if (link) seen[link] = true;
  }
  return found.reverse(); // 아래 줄부터 지웁니다
}

// 화면용: 중복을 지우고 주제별 개수와 함께 돌려줍니다
function cleanUp() {
  const removed = removeDuplicates();
  return { removed: removed,
    counts: countByTopic() };
}

// 주제별로 스크랩이 몇 개인지 세어 돌려줍니다
function countByTopic() {
  const rows = getSheet_().getDataRange()
    .getValues().slice(1);
  const count = {};

  rows.forEach(function (r) {
    if (r[0] === '') return;
    count[r[0]] = (count[r[0]] || 0) + 1;
  });
  return Object.keys(count).map(
    function (k) {
      Logger.log(k + ': ' + count[k] + '개');
      return { topic: k, n: count[k] };
    });
}
