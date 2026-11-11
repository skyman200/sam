// 수업용 요약 API(/api/summarize). 나머지 경로는 정적 파일(site/)이 처리한다. Workers AI(무료 사용량) 사용.
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type,x-sam-code", "access-control-allow-methods": "POST,OPTIONS" };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });
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
    try {
      const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: [
        { role: "system", content: "너는 대학 필기를 정리하는 도우미다. 입력된 글을 한국어로 정확히 3줄(각 줄 40자 이내)로 요약한다. 없는 내용을 지어내지 않는다. 숫자와 고유명사는 그대로 둔다." },
        { role: "user", content: text }], max_tokens: 200 });
      const out = (r && (r.response || (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content))) || "";
      return json({ summary: String(out).trim() });
    } catch (e) { return json({ error: "AI 호출 실패: 잠시 뒤 다시 시도", detail: String((e && e.message) || e).slice(0, 200) }, 502); }
  },
};
