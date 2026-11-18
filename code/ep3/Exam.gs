// Exam.gs : 시험일 D-14, D-7, D-1 을 캘린더에 등록
// 새 파일로 만듭니다. Code.gs와 이름이 겹치지 않습니다
const EXAM = '시험';
const DAYS = [14, 7, 1];

// '시험' 탭 2행으로 일정을 만들고 글자 목록을 돌려줍니다
function addExam() {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName(EXAM);
  if (!sh) throw new Error('시험 탭이 없습니다');
  const name = sh.getRange('A2').getValue();
  const day = sh.getRange('B2').getValue();
  if (!name) throw new Error('A2에 과목명을 쓰세요');
  if (!(day instanceof Date)) {
    throw new Error('B2는 2026-12-14처럼 날짜로');
  }

  const c = CalendarApp.getDefaultCalendar();
  const zone = Session.getScriptTimeZone();
  return DAYS.map(n => {
    const d = new Date(day.getTime());
    d.setDate(d.getDate() - n);
    const t = 'D-' + n + ' ' + name;
    addOnce(c, t, d);
    const ymd = Utilities.formatDate(
      d, zone, 'yyyy-MM-dd');
    return t + ' · ' + ymd;
  });
}

// 같은 제목이 그날 없을 때만 종일 일정을 만듭니다
function addOnce(c, title, d) {
  const old = c.getEventsForDay(d)
    .filter(e => e.getTitle() === title);
  if (old.length > 0) {
    console.log(title + ' 이미 있음, 건너뜀');
    return;
  }
  c.createAllDayEvent(title, d);
  console.log(title + ' 등록함');
}
