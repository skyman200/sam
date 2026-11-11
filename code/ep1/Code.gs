// 스크랩 웹앱 (7주차 1강)
const SHEET_NAME = '스크랩';

// 웹앱 주소를 열면 Index 화면을 보여 줍니다
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('내 스크랩')
    .addMetaTag('viewport',
    'width=device-width, initial-scale=1');
}

// '스크랩' 탭을 찾아 돌려줍니다(없으면 오류)
function getSheet_() {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('스크랩 탭이 없습니다');
  }
  return sheet;
}

// 주제·링크·인용구와 오늘 날짜를 한 줄 저장합니다
function addScrap(topic, link, quote) {
  if (!topic || !link) {
    throw new Error('주제와 링크를 넣어 주세요');
  }
  getSheet_().appendRow(
    [topic, link, quote, new Date()]);
  return '저장했습니다';
}

// 스크랩 목록을 내 메일 주소로만 보냅니다
function mailList() {
  const rows = getSheet_().getDataRange()
    .getValues().slice(1);
  if (rows.length === 0) {
    return '보낼 스크랩이 없습니다';
  }

  let body = '';
  rows.forEach(function (r, i) {
    body += (i + 1) + '. ' + r[0] + '\n'
      + r[1] + '\n' + r[2] + '\n\n';
  });

  const me = Session.getEffectiveUser()
    .getEmail();
  MailApp.sendEmail(me,
    '[스크랩] 내 자료 ' + rows.length + '건',
    body);
  return me + ' 주소로 보냈습니다';
}
