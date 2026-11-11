// Report.gs : 스크랩 현황을 요약해 매주 메일로 보냄
// Code.gs의 getSheet_ 를 쓰므로
// Code.gs가 먼저 있어야 합니다
const REPORT_HOUR = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// 스크랩 개수와 최근 저장일을 내 메일로 보냅니다
function weeklyReport() {
  const rows = getSheet_().getDataRange()
    .getValues().slice(1)
    .filter(function (r) { return r[0]; });
  const dates = pickDates_(rows);
  const zone = Session.getScriptTimeZone();

  let latest = '날짜 없음';
  if (dates.length > 0) {
    const last = new Date(
      Math.max.apply(null, dates));
    latest = Utilities.formatDate(
      last, zone, 'yyyy-MM-dd');
  }

  const weekAgo = new Date(
    Date.now() - WEEK_MS);
  const recent = dates.filter(function (d) {
    return d >= weekAgo;
  });
  const today = Utilities.formatDate(
    new Date(), zone, 'yyyy-MM-dd');

  const body = '전체 스크랩: '
    + rows.length + '건\n'
    + '최근 7일: ' + recent.length + '건\n'
    + '가장 최근 저장일: ' + latest + '\n';
  const me = Session.getEffectiveUser()
    .getEmail();
  MailApp.sendEmail(me,
    '[주간 보고] ' + today, body);
  Logger.log(me + ' 주소로 보냈습니다');
}

// 매주 월요일 아침 weeklyReport 가 돌게 예약합니다
function makeWeeklyTrigger() {
  const all = ScriptApp.getProjectTriggers();
  for (const t of all) {
    const name = t.getHandlerFunction();
    if (name === 'weeklyReport') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('weeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(REPORT_HOUR)
    .create();
  Logger.log('주간 트리거를 만들었습니다');
}

// 각 줄의 날짜(D열)만 모읍니다(잘못된 값은 뺌)
function pickDates_(rows) {
  return rows
    .map(function (r) {
      return new Date(r[3]);
    })
    .filter(function (d) {
      return !isNaN(d.getTime());
    });
}
