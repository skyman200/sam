// Feed.gs : 새 글 목록(RSS)을 읽어 스크랩에 추가
// Code.gs의 getSheet_ 를 쓰므로
// Code.gs가 먼저 있어야 합니다
const FEED_URL = 'https://sam.ptclinical'
  + '.workers.dev/practice/feed.xml';
const FEED_COUNT = 5;

// 최신 5건의 제목·링크를 '스크랩' 탭 끝에 추가합니다
function importFeed() {
  const items = readFeed_()
    .slice(0, FEED_COUNT);
  const sheet = getSheet_();
  const known = savedLinks_(sheet);

  let added = 0;
  items.forEach(function (item) {
    if (known.includes(item.link)) {
      return; // 이미 저장한 링크는 건너뜁니다
    }
    sheet.appendRow([item.title,
      item.link, '', new Date()]);
    added++;
  });

  Logger.log(added + '건 추가했습니다');
  return added;
}

// 주소에서 RSS를 받아 제목·링크 목록으로 바꿉니다
function readFeed_() {
  const res = UrlFetchApp.fetch(FEED_URL,
    { muteHttpExceptions: true });
  const code = res.getResponseCode();
  if (code !== 200) {
    throw new Error('피드 오류 ' + code);
  }

  const xml = res.getContentText('UTF-8');
  const root = XmlService.parse(xml)
    .getRootElement();
  const channel = root.getChild('channel');
  if (!channel) {
    throw new Error('RSS 형식이 아닙니다');
  }
  return channel.getChildren('item')
    .map(function (e) {
      return {
        title: e.getChildText('title'),
        link: e.getChildText('link')
      };
    });
}

// 시트에 이미 있는 링크(B열)를 목록으로 모읍니다
function savedLinks_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) {
    return [];
  }
  return sheet.getRange(2, 2, last - 1, 1)
    .getValues()
    .map(function (r) {
      return String(r[0]);
    });
}
