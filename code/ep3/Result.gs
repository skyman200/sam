// Result.gs : 웹앱 결과 화면에 보낼 값 만들기
// Code·Score·Notes·Exam 파일이 먼저 필요합니다
// 필요 권한: 스프레드시트, 문서(Drive), 캘린더

// 점수·정답률·틀린 문제·TOP3 를 객체로 돌려줍니다
function getResult() {
  const total = getQuiz().length;
  const last = {}, cnt = {};
  wrongRows_().forEach(r => {
    last[r[1]] = r;
    cnt[r[1]] = (cnt[r[1]] || 0) + 1;
  });
  const qs = Object.keys(last);
  const wrongs = qs.map(q => ({ q: q,
    mine: Number(last[q][2]),
    answer: Number(last[q][3]),
    why: String(last[q][4]) }));
  const top3 = qs.slice()
    .sort((a, b) => cnt[b] - cnt[a])
    .slice(0, 3)
    .map(q => ({ q: q, n: cnt[q] }));
  const score = Math.max(
    0, total - qs.length);
  const rate = total
    ? Math.round(score / total * 100) : 0;
  return { score: score, total: total,
    rate: rate, wrongs: wrongs, top3: top3 };
}

// 복습 문서를 만들고 주소 글자만 돌려줍니다
function makeReviewDocUrl() {
  return String(makeReviewDoc());
}

// 시험 일정을 등록하고 일정 글자 목록을 돌려줍니다
function addExamEvents() {
  return addExam();
}
