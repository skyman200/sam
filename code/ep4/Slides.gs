// Slides.gs : '대본' 탭 → 디자인된 발표 슬라이드
const SHEET_NAME = '대본';
const MAX_SLIDES = 20;

// 디자인 명세서: 이 몇 줄만 바꾸면 전체가 바뀝니다
const THEME = '파랑'; // 파랑 · 남색 · 숲색 · 먹색
const TITLE_FONT = 'Noto Sans KR'; // 제목 글꼴
const BODY_FONT = 'Noto Sans KR';  // 본문 글꼴
const DECK_TITLE = ''; // 비우면 파일 이름을 씁니다
const SUBTITLE = '';   // 표지 제목 아래 한 줄
const PRESENTER = '';  // 표지에 넣을 발표자 이름
const HEADER = 'PRESENTATION'; // 왼쪽 위 작은 글
const CLOSING = '감사합니다.';
const SHOW_AGENDA = true; // 차례 장을 넣을지
const USE_LAYOUT = true;  // 틀을 바탕 틀에 한 번만 그림

// 색 세트: bg 쪽 바탕, main 대표 색, pale 옅은 면,
// dot 점선, ink 글자, sub 보조 글
const THEMES = {
  '파랑': { bg: '#EFE9E0', main: '#1865C6',
    pale: '#EAF3FC', dot: '#9DBFE8',
    ink: '#1F1B1B', sub: '#6F747C' },
  '남색': { bg: '#ECE8DF', main: '#21324B',
    pale: '#E9EDF3', dot: '#AEB9CA',
    ink: '#1C1F24', sub: '#6B7078' },
  '숲색': { bg: '#ECEADF', main: '#2F5D43',
    pale: '#E8F0EA', dot: '#B1C8B8',
    ink: '#1B211D', sub: '#687068' },
  '먹색': { bg: '#EAE8E3', main: '#333333',
    pale: '#EFEEEB', dot: '#BDBBB6',
    ink: '#1A1A1A', sub: '#707070' }
};
const COLOR = THEMES[THEME] || THEMES['파랑'];
const WHITE = '#FFFFFF';
// 본문 상자: 왼쪽 100, 위 110, 폭 520, 높이 248
const BX = 100, BY = 110, BW = 520, BH = 248;
const DECK = { n: 0, name: '', day: '', base: null };
// '도구 1. 이름', '2단계: 이름' 같은 제목 찾기
const SERIES = new RegExp('^(\\D{0,10}?)\\s*' +
  '(\\d{1,2})(\\D{0,3}?)\\s*[.:)\\-]\\s+(.+)$');

// 시트를 열면 '발표 도우미' 메뉴를 만듭니다
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('발표 도우미')
    .addItem('슬라이드 만들기', 'makeSlides')
    .addToUi();
}

// 표지, 차례, 대본 줄마다 한 장, 맺음 장을 만듭니다
function makeSlides() {
  const ss = SpreadsheetApp
    .getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    throw new Error('대본 탭이 없습니다.');
  }
  // 보이는 글 그대로 읽어 '3/4'가 날짜로 안 바뀌게
  const rows = sh.getDataRange()
    .getDisplayValues();
  rows.shift(); // 1행(머리글)은 뺀다
  const items = rows.filter(r => r[0].trim());

  if (items.length === 0) {
    throw new Error('2행부터 대본을 적으세요.');
  }
  if (items.length > MAX_SLIDES) {
    throw new Error(MAX_SLIDES
      + '장 이하로 줄이세요.');
  }
  DECK.n = items.length;
  DECK.name = DECK_TITLE || ss.getName();
  DECK.day = Utilities.formatDate(new Date(),
    ss.getSpreadsheetTimeZone(), 'yyyy.MM.dd');
  const deck = SlidesApp.create(
    '발표 초안 - ' + ss.getName());
  const blank = deck.getSlides()[0];
  setBase_(deck);
  addCover_(deck);
  if (SHOW_AGENDA && items.length > 3) {
    addAgenda_(deck, items);
  }
  items.forEach((r, i) =>
    addSlide_(deck, r, i + 1));
  addEnd_(deck);

  blank.remove(); // 빈 첫 장 지우기
  const url = deck.getUrl();
  console.log('완성: ' + url);
  try { // 웹앱에서는 알림이 없어도 됩니다
    ss.toast('내 드라이브에 저장했습니다', '완성', 10);
  } catch (e) {}
  return url;
}

// 한 장: 제목을 놓고, 내용 모양에 맞는 본문을 고릅니다
function addSlide_(deck, r, no) {
  const s = newPage_(deck);
  const title = String(r[0]).trim();
  let lines = String(r[1]).split('/')
    .map(v => v.trim()).filter(v => v);
  const m0 = title.match(SERIES); // 앞말은 한글만
  const m = m0 && /^[가-힣\s]*$/.test(m0[1])
    ? m0 : null;
  let y = BY, h = BH;
  if (lines.length === 0) { // 제목만: 강조 장
    layBig_(s, title, 70, 286);
  } else {
    head_(s, m ? m[4] : title);
    if (isLead_(lines)) { // 긴 첫 줄은 요약 띠로
      layLead_(s, lines[0], y);
      lines = lines.slice(1);
      y += 58;
      h -= 58;
    }
    layBody_(s, lines, m, no, y, h);
  }
  put_(s, pad_(no) + ' / ' + pad_(DECK.n), 604, 352,
    70, 18, { z: 8, c: COLOR.sub, a: 'R' });
  if (r[2]) { // 발표할 말은 발표자 노트에
    s.getNotesPage().getSpeakerNotesShape()
      .getText().setText(String(r[2]));
  }
}

// 줄 수·길이·제목 모양으로 본문 모양을 고릅니다
function layBody_(s, lines, m, no, y, h) {
  const k = lines.length, ps = lines.map(parts_);
  const wide = Math.max(...lines.map(em_));
  const tiny = ps.every(
    v => em_(v[0]) <= 9 && em_(v[1]) <= 24);
  if (m) {                 // 번호 붙은 제목: 나눔 장
    laySplit_(s, m, lines, y, h);
  } else if (k === 1) {    // 한 줄: 강조 장
    layBig_(s, lines[0], y, h);
  } else if (no === DECK.n && k <= 4) { // 끝: 번호 요약
    panel_(s, BX, y, BW, h, COLOR.pale, 10);
    layRows_(s, lines, BX + 70, y + 12, BW - 140,
      h - 24, 'num');
  } else if (k === 3 && tiny) { // 짧은 3줄: 원 3개
    layCircles_(s, ps, y, h);
  } else if (k <= 3 && wide <= [0, 0, 48, 30][k]) {
    layCards_(s, ps, y, h); // 2~3줄: 카드
  } else if (k === 4 && wide <= 36) { // 4줄: 2x2 격자
    layGrid_(s, ps, y, h);
  } else {                 // 5줄부터: 체크·번호 목록
    layRows_(s, lines, BX + 10, y, BW - 20, h,
      k <= 6 ? 'tick' : 'num');
  }
}

// 표지: 제목을 두 줄로 나눠 앞줄만 대표 색으로
function addCover_(deck) {
  const s = newPage_(deck);
  const ab = halves_(DECK.name);
  const z = fit_(em_(ab[0]) > em_(ab[1]) ? ab[0]
    : ab[1], 540, 66, [44, 38, 32, 26, 22]);
  const lh = z * 1.3, mid = 162;
  const o = { f: TITLE_FONT, z: z, b: true, a: 'C' };
  const top = ab[1] ? mid - lh : mid - lh / 2;
  put_(s, ab[0], 80, top, 560, lh,
    Object.assign({ c: COLOR.main }, o));
  put_(s, ab[1], 80, mid, 560, lh, o);
  const y = top + (ab[1] ? 2 : 1) * lh + 12;
  put_(s, SUBTITLE || DECK.n + '장 발표 자료',
    100, y, 520, 24, { z: 12, a: 'C' });
  if (!PRESENTER) return;
  box_(s, 'R', 349, y + 38, 22, 1.5, COLOR.ink);
  put_(s, PRESENTER, 100, y + 48, 520, 24,
    { z: 12, a: 'C' });
}

// 차례: 제목마다 점선 테두리 띠와 번호 원
function addAgenda_(deck, items) {
  const s = newPage_(deck);
  const n = items.length, cols = n > 5 ? 2 : 1;
  const per = Math.ceil(n / cols);
  const gap = per > 7 ? 4 : 8;
  const w = cols === 2 ? 254 : 400;
  const x0 = cols === 2 ? BX : 160;
  const rh = Math.min(40,
    (BH - gap * (per - 1)) / per);
  const z = Math.max(9, Math.min(15, rh * 0.42));
  const y0 = BY + (BH - per * (rh + gap) + gap) / 2;
  head_(s, '차례');
  items.forEach((r, i) => {
    const x = x0 + Math.floor(i / per) * (w + 12);
    const y = y0 + (i % per) * (rh + gap);
    box_(s, 'RR', x, y, w, rh, COLOR.pale,
      [COLOR.dot, 1, 1]);
    num_(s, i + 1, x + 22, y + rh / 2,
      Math.min(18, rh - 6));
    put_(s, cut_(String(r[0]).trim(), (w - 70) / z),
      x + 40, y, w - 46, rh, { z: z });
  });
}

// 맺음 장: Q & A 와 인사말
function addEnd_(deck) {
  const s = newPage_(deck);
  put_(s, 'Q & A', 110, 122, 500, 84,
    { f: TITLE_FONT, z: 54, b: true, a: 'C' });
  put_(s, CLOSING, 110, 212, 500, 40,
    { z: 22, b: true, a: 'C' });
}

// 강조 장: 큰 둥근 면에 한 문장 (물음이면 짙은 면)
function layBig_(s, text, y, h) {
  const dark = /[?？]$/.test(text);
  const ph = Math.min(h, 170);
  const py = y + (h - ph) / 2;
  panel_(s, BX, py, BW, ph,
    dark ? COLOR.main : COLOR.pale, 10);
  put_(s, text, BX + 30, py, BW - 60, ph,
    { b: true, a: 'C', c: dark ? WHITE : COLOR.main,
      z: fit_(text, BW - 60, ph - 30,
        [30, 26, 22, 20, 18, 16, 14]) });
}

// 요약 띠: 본문 맨 위의 옅은 띠에 긴 첫 줄
function layLead_(s, text, y) {
  panel_(s, BX, y, BW, 46, COLOR.pale, 8);
  put_(s, text, BX + 16, y, BW - 32, 46,
    { b: true, a: 'C', z: fit_(text, BW - 32, 40,
      [14, 13, 12, 11]) });
}

// 카드: 옅은 면 안에 흰 카드 2~3장
function layCards_(s, ps, y, h) {
  const n = ps.length, ph = Math.min(h, 196);
  const py = y + (h - ph) / 2;
  const w = (BW - 28 - 12 * (n - 1)) / n;
  const z = fit_(longest_(ps.map(v => v[0])), w - 24,
    ps.some(v => v[1]) ? 50 : ph - 100,
    [22, 20, 18, 16, 14, 12]);
  panel_(s, BX, py, BW, ph, COLOR.pale, 10);
  ps.forEach((v, i) => {
    const x = BX + 14 + i * (w + 12);
    panel_(s, x, py + 14, w, ph - 28, WHITE, 10);
    num_(s, i + 1, x + w / 2, py + 40, 20);
    stack_(s, v, x + 10, py + 56, w - 20,
      ph - 80, z);
  });
}

// 원 3개: 짧은 세 줄을 옅은 원 안에
function layCircles_(s, ps, y, h) {
  const d = Math.min(h, 164);
  const top = y + (h - d) / 2;
  const z = fit_(longest_(ps.map(v => v[0])),
    d * 0.72, 30, [18, 16, 14, 12]);
  ps.forEach((v, i) => {
    const cx = BX + BW * (2 * i + 1) / 6;
    box_(s, 'O', cx - d / 2, top, d, d, COLOR.pale);
    stack_(s, v, cx - d * 0.38, top + d * 0.18,
      d * 0.76, d * 0.64, z);
  });
}

// 2x2 격자: 점선 십자로 나눈 네 칸
function layGrid_(s, ps, y, h) {
  const cw = BW / 2, ch = h / 2;
  const any = ps.some(v => v[1]);
  const z = fit_(longest_(ps.map(v => v[0])),
    (any ? 0.38 : 1) * (cw - 60), ch - 30,
    [18, 16, 14, 13, 12]);
  dots_(s, BX + cw, y + 6, BX + cw, y + h - 6);
  dots_(s, BX, y + ch, BX + BW, y + ch);
  ps.forEach((v, i) => {
    const x = BX + (i % 2) * cw + 10;
    const cy = y + Math.floor(i / 2) * ch;
    num_(s, i + 1, x + 10, cy + ch / 2, 18);
    pair_(s, v, x + 28, cy, cw - 48, ch, z, any);
  });
}

// 나눔 장: 왼쪽 옅은 면에 큰 번호, 오른쪽에 체크 목록
function laySplit_(s, m, lines, y, h) {
  const mid = y + h / 2;
  panel_(s, BX, y, 150, h, COLOR.pale, 10);
  put_(s, (m[1] + m[3]).trim(), BX, mid - 76, 150,
    24, { z: 13, c: COLOR.sub, b: true, a: 'C' });
  put_(s, m[2], BX, mid - 58, 150, 124,
    { f: TITLE_FONT, z: 84, c: COLOR.main,
      b: true, a: 'C' });
  layRows_(s, lines, BX + 174, y, BW - 174, h,
    'tick');
}

// 목록: 줄마다 체크(또는 번호 원)와 글, 사이는 점선
function layRows_(s, lines, x, y, w, h, mark) {
  const n = lines.length, cols = n > 6 ? 2 : 1;
  const per = Math.ceil(n / cols);
  const cw = (w - 24 * (cols - 1)) / cols;
  const rh = Math.min(n === 1 ? 112 : 64, h / per);
  const y0 = y + (h - rh * per) / 2;
  const ps = lines.map(parts_);
  const any = ps.some(v => v[1]);
  const z = fit_(longest_(ps.map(v => v[0])),
    (any ? 0.38 : 1) * (cw - 32), rh - 8,
    [20, 18, 16, 14, 13, 12, 11, 10, 9]);
  ps.forEach((v, i) => {
    const cx = x + Math.floor(i / per) * (cw + 24);
    const cy = y0 + (i % per) * rh;
    if (i % per) dots_(s, cx, cy, cx + cw, cy);
    if (mark === 'tick') {
      tick_(s, cx + 10, cy + rh / 2);
    } else {
      num_(s, i + 1, cx + 10, cy + rh / 2,
        Math.min(18, rh - 6));
    }
    pair_(s, v, cx + 26, cy, cw - 26, rh, z, any);
  });
}

// 가운데 쌓기: 굵은 핵심어 아래 작은 설명
function stack_(s, v, x, y, w, h, z) {
  const o = { z: z, c: COLOR.main, b: true, a: 'C' };
  if (!v[1]) return put_(s, v[0], x, y, w, h, o);
  o.v = 'B';
  put_(s, v[0], x, y, w, h * 0.45, o);
  put_(s, v[1], x, y + h * 0.45, w, h * 0.55,
    { z: Math.max(10, z * 0.62), c: COLOR.sub,
      a: 'C', v: 'T' });
}

// 나란히 놓기: 굵은 핵심어 옆에 작은 설명
function pair_(s, v, x, y, w, h, z, any) {
  const hw = any ? w * 0.38 : w;
  put_(s, v[0], x, y, hw, h, { z: z, b: true,
    c: any ? COLOR.main : COLOR.ink });
  put_(s, v[1], x + hw + 4, y, w - hw - 4, h,
    { z: Math.max(10, z * 0.72), c: COLOR.sub });
}

// 장 제목: 가운데 정렬, 굵게
function head_(s, title) {
  put_(s, title, 70, 58, 580, 44, { f: TITLE_FONT,
    b: true, a: 'C',
    z: fit_(title, 560, 40, [24, 22, 20, 18, 16]) });
}

// 틀: 바탕, 대표 색 틀, 흰 카드, 클립, 머리 글
function drawFrame_(p) {
  p.getBackground().setSolidFill(COLOR.bg);
  panel_(p, 22, 26, 676, 357, COLOR.main, 10);
  panel_(p, 32, 36, 656, 337, WHITE, 6);
  box_(p, 'R', 284, 30, 152, 20, WHITE,
    [COLOR.ink, 2]);
  box_(p, 'R', 274, 21, 172, 11, COLOR.ink);
  box_(p, 'O', 268.5, 21, 11, 11, COLOR.ink);
  box_(p, 'O', 440.5, 21, 11, 11, COLOR.ink);
  put_(p, HEADER, 46, 42, 220, 18,
    { z: 8, c: COLOR.sub });
  put_(p, DECK.day, 474, 42, 200, 18,
    { z: 8, c: COLOR.sub, a: 'R' });
}

// 틀을 '빈 화면' 바탕 틀에 한 번만 그려 둡니다
function setBase_(deck) {
  DECK.base = null;
  if (!USE_LAYOUT) return;
  DECK.base = deck.getLayouts().filter(
    v => v.getLayoutName() === 'BLANK')[0] || null;
  if (!DECK.base) return;
  try { drawFrame_(DECK.base); }
  catch (e) { DECK.base = null; } // 장마다 그림
}

// 새 장: 바탕 틀이 없으면 장마다 틀을 그립니다
function newPage_(deck) {
  const s = deck.appendSlide(DECK.base ||
    SlidesApp.PredefinedLayout.BLANK);
  s.getBackground().setSolidFill(COLOR.bg);
  if (!DECK.base) drawFrame_(s);
  return s;
}

// 둥근 면: 모서리 반지름을 r로 맞춥니다
// (둥근 네모의 반지름은 짧은 변의 1/6이라, 높이 6r짜리
//  띠 둘을 위아래에 놓고 가운데를 네모로 메웁니다)
function panel_(p, x, y, w, h, fill, r) {
  const t = Math.min(6 * r, h, w);
  if (t >= h) return box_(p, 'RR', x, y, w, h, fill);
  box_(p, 'RR', x, y, w, t, fill);
  box_(p, 'RR', x, y + h - t, w, t, fill);
  box_(p, 'R', x, y + t / 6, w, h - t / 3, fill);
}

// 도형 하나: kind 'R' 네모, 'RR' 둥근 네모, 'O' 원
// edge = [색, 굵기, 점선이면 1] (없으면 테두리 없음)
function box_(p, kind, x, y, w, h, fill, edge) {
  const T = SlidesApp.ShapeType;
  const r = p.insertShape(kind === 'O' ? T.ELLIPSE
    : kind === 'RR' ? T.ROUND_RECTANGLE
      : T.RECTANGLE, x, y, w, h);
  r.getFill().setSolidFill(fill);
  const b = r.getBorder();
  if (!edge) {
    b.setTransparent();
    return r;
  }
  b.setWeight(edge[1]);
  b.getLineFill().setSolidFill(edge[0]);
  if (edge[2]) {
    b.setDashStyle(SlidesApp.DashStyle.DASH);
  }
  return r;
}

// 점선 하나
function dots_(p, x1, y1, x2, y2) {
  const l = p.insertLine(
    SlidesApp.LineCategory.STRAIGHT,
    x1, y1, x2, y2);
  l.setWeight(1);
  l.setDashStyle(SlidesApp.DashStyle.DOT);
  l.getLineFill().setSolidFill(COLOR.dot);
}

// 번호 원: 흰 원 + 가는 테두리 + 숫자
function num_(p, n, cx, cy, d) {
  box_(p, 'O', cx - d / 2, cy - d / 2, d, d,
    WHITE, [COLOR.sub, 0.75]);
  put_(p, n, cx - 15, cy - 12, 30, 24,
    { z: d * 0.5, a: 'C' });
}

// 체크: 대표 색 원 위에 흰 막대 둘(글리프 안 씀)
function tick_(p, cx, cy) {
  box_(p, 'O', cx - 8, cy - 8, 16, 16, COLOR.main);
  box_(p, 'R', cx - 5.3, cy + 0.3, 5, 1.8, WHITE)
    .setRotation(45);
  box_(p, 'R', cx - 2.3, cy - 1.1, 9, 1.8, WHITE)
    .setRotation(315);
}

// 글상자: o = {f 글꼴, z 크기, c 색, b 굵게,
//   a:'C' 가운데·'R' 오른쪽, v:'T' 위·'B' 아래}
function put_(p, text, x, y, w, h, o) {
  if (text === '' || text == null) return null;
  const tb = p.insertTextBox(String(text),
    x, y, w, h);
  const A = SlidesApp.ContentAlignment;
  const P = SlidesApp.ParagraphAlignment;
  tb.setContentAlignment(o.v === 'B' ? A.BOTTOM
    : o.v === 'T' ? A.TOP : A.MIDDLE);
  const t = tb.getText();
  t.getTextStyle()
    .setFontFamily(o.f || BODY_FONT)
    .setFontSize(o.z).setBold(!!o.b)
    .setForegroundColor(o.c || COLOR.ink);
  if (o.a) {
    t.getParagraphStyle().setParagraphAlignment(
      o.a === 'C' ? P.CENTER : P.END);
  }
  return tb;
}

// '핵심어: 설명' 을 [핵심어, 설명] 으로 나눕니다
function parts_(t) {
  const m = t.match(
    /^(.{1,14}?)(?::\s+|\s+[-–—]\s+)(.+)$/);
  return m ? [m[1], m[2]] : [t, ''];
}

// 첫 줄이 나머지보다 훨씬 길면 요약 문장으로 봅니다
function isLead_(lines) {
  const rest = lines.slice(1).map(em_);
  return lines.length > 2 && em_(lines[0]) >= 16
    && em_(lines[0]) >= 1.5 * Math.max(...rest);
}

// 제목을 길이가 비슷한 두 줄로 나눕니다
function halves_(t) {
  const w = t.split(' ');
  if (w.length < 2 || em_(t) <= 8) return [t, ''];
  let k = 1;
  for (let i = 1; i < w.length; i++) {
    const a = em_(w.slice(0, i).join(' '));
    const b = em_(w.slice(0, k).join(' '));
    if (Math.abs(em_(t) - 2 * a)
      < Math.abs(em_(t) - 2 * b)) k = i;
  }
  return [w.slice(0, k).join(' '),
    w.slice(k).join(' ')];
}

// 폭이 max를 넘는 글은 줄이고 … 를 붙입니다
function cut_(t, max) {
  if (em_(t) <= max) return t;
  while (t && em_(t) > max - 1) t = t.slice(0, -1);
  return t.trim() + '…';
}

// 가장 폭이 넓은 글 하나
function longest_(list) {
  return list.reduce(
    (a, b) => em_(b) > em_(a) ? b : a, '');
}

// 글의 폭 어림: 한글 1, 영문·숫자는 절반쯤
function em_(t) {
  let n = 0;
  for (const ch of String(t)) {
    n += ch.charCodeAt(0) > 0x2E7F ? 1
      : ch === ' ' ? 0.3
      : /[A-Z0-9]/.test(ch) ? 0.62 : 0.5;
  }
  return n;
}

// 폭 w 안에서 몇 줄이 되는지 어림합니다
function rowsOf_(t, z, w) {
  return Math.max(1,
    Math.ceil(em_(t) * z * 1.1 / (w - 14)));
}

// 높이 h 안에 들어가는 가장 큰 글자 크기를 고릅니다
function fit_(t, w, h, sizes) {
  return sizes.find(
    z => rowsOf_(t, z, w) * z * 1.5 <= h)
    || sizes[sizes.length - 1];
}

// 1 → '01' 처럼 두 자리로 맞춥니다
function pad_(n) {
  return ('0' + n).slice(-2);
}
