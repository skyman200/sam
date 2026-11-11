#!/usr/bin/env python3
"""code/ + MANIFEST.json -> site/ (index.html, ep1~4.html, code/ 복사본). 상대 경로만 사용."""
import html, json, shutil
from pathlib import Path

ROOT = Path(__file__).parent
SITE = ROOT / "site"
M = json.loads((ROOT / "code/MANIFEST.json").read_text(encoding="utf-8"))

EPS = {
    "7-1": ("ep1", "7주차 1강", "스크랩 웹앱과 메일 리포트", "내 자료를 한 곳에 모으고, 한 주 모은 것을 메일로 받는 웹앱을 만듭니다."),
    "7-2": ("ep2", "7주차 2강", "필기는 표로, 요약은 셀에서", "셀에 =AI_SUMMARY(A2)를 쓰면 요약이 나오고, PDF 저장과 매일 아침 실행까지 붙입니다."),
    "9-1": ("ep3", "9주차 1강", "소크라테스 튜터와 폰 CBT 퀴즈", "폰에서 푸는 퀴즈 웹앱을 만들고, 시험 일정을 내 캘린더에 넣습니다."),
    "9-2": ("ep4", "9주차 2강", "발표 과제를 말로 시켜 만든다", "발표 대본에서 슬라이드를 자동으로 만들고, 키를 안전하게 보관하는 법을 익힙니다."),
}

CSS = """
:root{--red:#D6232B;--dred:#8E1B20;--ink:#1A1A1A;--gray:#555;--line:#1A1A1A;--bg:#fff;--soft:#F3F3F3;--dot:#D4D4D4}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;color:var(--ink);background:var(--bg);line-height:1.7;
background-image:radial-gradient(var(--dot) 1px,transparent 1px);background-size:24px 24px}
header.top{background:var(--ink);color:#fff;padding:10px 20px;font-size:14px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
header.top a{color:#fff;text-decoration:none;border-bottom:1px solid var(--red)}
header.top b{background:var(--red);padding:2px 8px}
main{max-width:920px;margin:0 auto;padding:28px 18px 80px}
h1{font-size:40px;line-height:1.25;margin:8px 0 6px;border-left:12px solid var(--red);padding-left:14px}
h2{font-size:26px;margin:44px 0 10px;border-bottom:2px solid var(--ink);padding-bottom:4px}
.lead{color:var(--gray);font-size:18px;background:#fff;padding:4px 0}
.card{background:#fff;border:1px solid var(--ink);padding:16px 18px;margin:14px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.card h3{margin:0 0 4px;font-size:20px}
.tag{display:inline-block;background:var(--red);color:#fff;font-size:13px;padding:1px 8px;margin-right:6px}
.tag.k{background:var(--ink)}
.file{background:#fff;border:1px solid var(--ink);margin:22px 0}
.file>.bar{display:flex;gap:8px;align-items:center;background:var(--soft);border-bottom:1px solid var(--ink);padding:8px 12px;flex-wrap:wrap}
.bar .n{font-weight:700;font-size:18px}.bar .p{color:var(--gray);font-size:14px;flex:1;min-width:200px}
button.copy,a.dl{font:inherit;font-size:14px;background:var(--red);color:#fff;border:0;padding:6px 14px;cursor:pointer;text-decoration:none}
button.copy.done{background:var(--ink)}
pre{margin:0;padding:14px 16px;background:#1A1A1A;color:#F2F2F2;overflow:auto;font:15px/1.6 ui-monospace,Menlo,Consolas,monospace;max-height:560px}
.note{border-left:6px solid var(--red);background:#fff;padding:8px 14px;margin:14px 0;font-size:16px}
ol.steps li{margin:6px 0}
footer{color:var(--gray);font-size:13px;margin-top:50px}
code.i{background:var(--soft);padding:1px 5px}
"""

JS = """
document.querySelectorAll('button.copy').forEach(function(b){b.addEventListener('click',function(){
var t=document.getElementById(b.dataset.t).textContent;
function ok(){b.textContent='복사됨';b.classList.add('done');setTimeout(function(){b.textContent='복사';b.classList.remove('done')},1500)}
if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(ok)}else{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}
})});
"""


def page(title, body, base=""):
    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>{CSS}</style></head><body>
<header class="top"><b>SAM</b><a href="{base}index.html">처음</a>
<a href="{base}ep1.html">7-1</a><a href="{base}ep2.html">7-2</a><a href="{base}ep3.html">9-1</a><a href="{base}ep4.html">9-2</a></header>
<main>{body}
<footer>EBS 전문대연합 「생활 속의 AI 융합지식」 7주차·9주차 실습 코드. 모든 예시는 가명·더미 데이터입니다. API 키와 개인정보는 코드에 쓰지 않습니다.</footer>
</main><script>{JS}</script></body></html>"""


def copy_files():
    out = SITE / "code"
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "code", out, ignore=shutil.ignore_patterns("MANIFEST.json"))


def file_block(idx, item):
    src = ROOT / item["file"]
    text = src.read_text(encoding="utf-8")
    name = Path(item["file"]).name
    href = item["file"] if item["file"].startswith("site/") is False else item["file"][5:]
    if item["file"].startswith("site/"):
        href = item["file"][len("site/"):]
    req = f' <span class="tag k">먼저 필요: {html.escape(", ".join(item["requires"]))}</span>' if item["requires"] else ""
    return f"""<div class="file" id="f{idx}"><div class="bar"><span class="n">{html.escape(name)}</span>
<span class="p">{html.escape(item["purpose"])} · 붙일 곳: {html.escape(item["paste_to"])}{req}</span>
<button class="copy" data-t="c{idx}">복사</button><a class="dl" href="{html.escape(href)}" download>받기</a></div>
<pre id="c{idx}">{html.escape(text)}</pre></div>"""


def build():
    copy_files()
    cards = []
    for lec, (ep, wk, title, desc) in EPS.items():
        items = [x for x in M if x["lecture"] == lec]
        blocks = "\n".join(file_block(f"{ep}_{i}", it) for i, it in enumerate(items))
        names = "".join(f'<li><code class="i">{html.escape(Path(x["file"]).name)}</code> {html.escape(x["purpose"])}</li>' for x in items)
        body = f"""<h1>{wk} · {html.escape(title)}</h1>
<p class="lead">{html.escape(desc)}</p>
<div class="note"><b>따라 하는 순서</b></div>
<ol class="steps">
<li>구글 시트를 새로 만든다 (개인 구글 계정 사용).</li>
<li>메뉴 <code class="i">확장 프로그램 &gt; Apps Script</code>를 연다.</li>
<li>아래 파일을 위에서부터 차례로 복사해서 붙이고 저장한다. 같은 이름의 파일이 있으면 내용을 지우고 붙인다.</li>
<li>함수를 골라 <code class="i">실행</code>을 누르고, 권한 창에서 안내대로 진행한다.</li>
</ol>
<div class="note">이 강의 파일: <ul>{names}</ul></div>
{blocks}"""
        (SITE / f"{ep}.html").write_text(page(f"{wk} {title}", body), encoding="utf-8")
        cards.append(f'<div class="card"><h3><span class="tag">{wk}</span></h3><b>{html.escape(title)}</b><br>{html.escape(desc)}<br><a href="{ep}.html">코드 보기 ({len(items)}개 파일)</a></div>')
    idx = f"""<h1>생활 속의 AI 융합지식<br>실습 코드 사이트</h1>
<p class="lead">7주차 · 9주차 4강에서 만드는 Google Apps Script 예제를 그대로 복사해서 쓸 수 있습니다.</p>
<h2>강의별 코드</h2><div class="grid">{"".join(cards)}</div>
<h2>연습용 자료</h2>
<div class="grid">
<div class="card"><b>RSS 피드 연습</b><br><a href="practice/feed.xml">practice/feed.xml</a><br>7-1 importFeed 연습용</div>
<div class="card"><b>연습 글 8편</b><br>{"".join(f'<a href="practice/a{i}.html">a{i}</a> ' for i in range(1,9))}<br>스크랩 연습용 가상 글</div>
<div class="card"><b>CSV 샘플</b><br><a href="practice/scrap_sample.csv">scrap_sample.csv</a> · <a href="practice/sample_notes.csv">sample_notes.csv</a></div>
</div>
<h2>요약 API (7-2 SAM_SUMMARY)</h2>
<div class="card">Cloudflare Workers에서 도는 연습용 요약 API입니다. 주소: <code class="i">POST /api/summarize</code>.
수업 안내에서 알려주는 코드를 헤더에 넣어야 쓸 수 있고, 연습 기간이 끝나면 닫힐 수 있습니다.</div>"""
    (SITE / "index.html").write_text(page("실습 코드 사이트", idx), encoding="utf-8")
    print("built:", ", ".join(sorted(p.name for p in SITE.glob("*.html"))))


if __name__ == "__main__":
    build()
