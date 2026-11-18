// Trigger.gs : 매일 아침 mailList 자동 실행

// 매일 아침 mailList 가 저절로 돌게 예약합니다
function setTrigger() {
  // 같은 트리거가 있으면 먼저 지웁니다
  const all = ScriptApp.getProjectTriggers();
  for (const t of all) {
    const name = t.getHandlerFunction();
    if (name === 'mailList') {
      ScriptApp.deleteTrigger(t);
    }
  }

  // 매일 8시대(8~9시 사이)에 mailList 실행
  ScriptApp.newTrigger('mailList')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('트리거를 만들었습니다');
}
