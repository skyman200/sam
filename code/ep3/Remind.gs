// Remind.gs : 오늘 틀린 문제 수를 내 메일로 알림
// Score.gs 의 wrongRows_ 가 먼저 필요합니다
// 필요 권한: 스프레드시트 읽기, 메일 보내기, 트리거
const REMIND_HOUR = 21;

// 오늘 틀린 문제 개수를 내 메일로만 보냅니다
function sendRemind() {
  const today = new Date().toDateString();
  const list = wrongRows_().filter(r =>
    new Date(r[0]).toDateString() === today);
  if (list.length === 0) {
    Logger.log('오늘 틀린 문제가 없습니다');
    return;
  }

  const me = Session.getEffectiveUser()
    .getEmail();
  MailApp.sendEmail(me,
    '[복습 알림] 오늘 ' + list.length + '개 틀림',
    '오답노트를 다시 풀어 보세요.');
  Logger.log(me + ' 주소로 보냈습니다');
}

// 한 번만 실행하면 매일 밤 9시대에 알림이 옵니다
function makeRemindTrigger() {
  const all = ScriptApp.getProjectTriggers();
  for (const t of all) {
    const name = t.getHandlerFunction();
    if (name === 'sendRemind') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('sendRemind')
    .timeBased()
    .everyDays(1)
    .atHour(REMIND_HOUR)
    .create();
  Logger.log('매일 알림 트리거를 만들었습니다');
}
