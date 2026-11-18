// 수업용 요약 API(/api/summarize). 나머지 경로는 정적 파일(site/)이 처리한다. Workers AI(무료 사용량) 사용.
// 11/18: 답을 검사한다(정확히 3줄, 줄마다 끝난 문장, 한자·일본 글자 없음, 원문에 없는 영어 낱말 없음).
//        불합격이면 다시 만들고(최대 3번), 그래도 안 되면 다른 모델로 한 번 더. 끝까지 안 되면 502(앱이 '다시 시도' 안내).
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type,x-sam-code", "access-control-allow-methods": "POST,OPTIONS" };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });

const MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/google/gemma-3-12b-it"];
const TRIES = 3;                       // 첫 모델로 몇 번까지
const SYSTEM = [
  "너는 대학 필기를 정리하는 도우미다. 입력된 글을 한국어 3줄로 요약한다.",
  "규칙:",
  "1) 정확히 3줄. 줄마다 '~다.'로 끝나는 완결된 한 문장. 한 문장을 두 줄로 나누지 않는다.",
  "2) 줄마다 40자 이내. 번호·기호·머리말 없이 문장만 쓴다.",
  "3) 한글로만 쓴다. 한자·일본어를 쓰지 않는다. 영어는 원문에 있는 낱말만 그대로 쓴다.",
  "4) 원문에 없는 내용을 지어내지 않는다. 숫자와 고유명사는 그대로 둔다.",
  "예) 입력: 기회비용은 무엇을 고를 때 포기한 것 중 가장 가치가 큰 것이다. 돈을 내지 않아도 생긴다.",
  "출력:",
  "기회비용은 포기한 것 중 가장 가치가 큰 것이다.",
  "고를 때마다 기회비용이 생긴다.",
  "돈을 직접 내지 않아도 기회비용은 생긴다.",
].join("\n");

// 줄로 나누고 번호·기호를 뗀다
export function toLines(s) {
  return String(s || "").split(/\n+/)
    .map((l) => l.replace(/^\s*(\d+[.)]|[-•*·]|[①②③])\s*/, "").trim())
    .filter(Boolean);
}

// 문제 목록(빈 배열이면 합격). src = 원문
export function problems(out, src) {
  const p = [];
  const lines = toLines(out);
  if (lines.length !== 3) p.push("줄 수 " + lines.length);
  const all = lines.join(" ");
  if (/[㐀-䶿一-鿿豈-﫿぀-ヿ]/.test(all)) p.push("한자·일본 글자");
  if (/[Ѐ-ӿ฀-๿؀-ۿ]/.test(all)) p.push("다른 나라 글자");
  const srcLow = String(src).toLowerCase();
  for (const w of all.match(/[A-Za-z]+/g) || []) {
    if (!srcLow.includes(w.toLowerCase())) { p.push("원문에 없는 영어 " + w); break; }
  }
  for (const l of lines) {
    if (l.length < 8) { p.push("짧은 토막 " + l); break; }
    if (l.length > 60) { p.push("너무 긴 줄"); break; }
    if (!/(다|요|음|함|임|됨|짐)\.?$|[.!?)」"']$/.test(l)) { p.push("끝나지 않은 줄 " + l); break; }
  }
  return p;
}

async function ask(env, model, text) {
  const r = await env.AI.run(model, {
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text }],
    max_tokens: 220, temperature: 0.3 });
  return String((r && (r.response || (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content))) || "").trim();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/summarize") return env.ASSETS.fetch(request);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST만 받습니다" }, 405);
    if (request.headers.get("x-sam-code") !== (env.CLASS_CODE || "sam-2026")) return json({ error: "수업 코드가 다릅니다" }, 401);
    let body; try { body = await request.json(); } catch { return json({ error: "JSON 형식이 아닙니다" }, 400); }
    const text = String(body.text || "").slice(0, 1500);
    if (text.length < 20) return json({ error: "요약할 글이 너무 짧습니다" }, 400);

    const plan = [...Array(TRIES).fill(MODELS[0]), ...MODELS.slice(1)];
    let last = "", why = [], fail = "";
    for (const model of plan) {
      try {
        const out = await ask(env, model, text);
        const p = problems(out, text);
        if (p.length === 0) return json({ summary: toLines(out).join("\n") });
        last = out; why = p;
      } catch (e) { fail = String((e && e.message) || e).slice(0, 200); }
    }
    if (!last && fail) return json({ error: "AI 호출 실패: 잠시 뒤 다시 시도", detail: fail }, 502);
    return json({ error: "요약이 고르게 나오지 않았습니다. 다시 눌러 주세요", detail: why.join(", ") }, 502);
  },
};
