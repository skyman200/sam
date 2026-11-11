# 전역 이름 표

같은 프로젝트에 붙이는 `.gs` 파일끼리는 `const`·`function` 이름이 겹치면 안 됩니다.
(`already been declared` 오류, 또는 함수가 조용히 덮어써짐.)
`Index.html` 안의 `<script>` 함수는 브라우저 쪽이라 `.gs` 와 따로 계산합니다.
`_` 로 끝나는 함수는 함수 목록에 안 보이는 도우미입니다.

## 프로젝트 A: 7주차 시트 (7-1 + 7-2 를 한 프로젝트에 붙임)

| 파일 | 강 | 이름 |
|---|---|---|
| Code.gs | 7-1 | SHEET_NAME, LIST_MAX, doGet, getSheet_, addScrap, listScraps, mailList |
| Feed.gs | 7-1 | FEED_URL, FEED_COUNT, importFeed, readFeed_, savedLinks_ |
| Report.gs | 7-1 | REPORT_HOUR, WEEK_MS, weeklyReport, makeWeeklyTrigger, pickDates_ |
| Clean.gs | 7-1 | removeDuplicates, dupRows_, countByTopic, cleanUp |
| Share.gs | 7-1 | SHARE_TITLE, exportToDoc, addItem_, exportDoc |
| Summary.gs | 7-2 | MODEL, AI_SUMMARY, testSummary |
| SamSummary.gs | 7-2 | SAM_URL, SAM_CODE, SAM_MIN_LENGTH, SAM_CACHE_SECONDS, SAM_SUMMARY, makeCacheKey_, testSamSummary |
| Pdf.gs | 7-2 | savePdf |
| Trigger.gs | 7-2 | setTrigger |
| Menu.gs | 7-2 | MENU_NAME, MENU_MAX_CELLS, onOpen, summarizeSelection |
| Folder.gs | 7-2 | FOLDER_NAME, makeFolder, movePdfs, stamp_ |
| WebSummary.gs | 7-2 | NOTE_TAB, NOTE_MAX, loadNotes, summarizeNote, savePdfLink |

겹침: 없음 (51개 이름, 중복 0). 7-2 화면 Note.html 은 `?page=Note` 로 열립니다(Code.gs 의 doGet 이 고름).
앞 파일에 기대는 곳(이름을 빌려 씀, 다시 선언하지 않음):
Feed.gs·Report.gs·Clean.gs·Share.gs → `getSheet_`(Code.gs), Trigger.gs → 문자열 `'mailList'`(Code.gs),
Menu.gs → `SAM_SUMMARY`(SamSummary.gs)와 문자열 `'savePdf'`(Pdf.gs), Folder.gs → Pdf.gs 가 만든 PDF.
AI가 준 코드에서 `SHEET_NAME`·`doGet`·`getSheet_`·`addScrap`·`mailList` 를 다시 만들었다면 그 줄을 지웁니다.

## 프로젝트 B: 9주차 1강 (새 시트·새 프로젝트)

| 파일 | 이름 |
|---|---|
| Code.gs | QUIZ, WRONG, doGet, getQuiz, toItem, saveWrong |
| Exam.gs | EXAM, DAYS, addExam, addOnce |
| Notes.gs | REVIEW_TITLE, makeReviewDoc, readWrong_ |
| Score.gs | SCORE_TAB, saveScore, showWeakTop3, wrongRows_ |
| Remind.gs | REMIND_HOUR, sendRemind, makeRemindTrigger |
| Result.gs | getResult, makeReviewDocUrl, addExamEvents |

겹침: 없음 (23개, 중복 0). Result.gs 는 Notes.gs·Exam.gs 의 함수를 불러 씁니다. Notes.gs·Score.gs 는 Code.gs 의 `WRONG` 을 빌려 쓰고,
Score.gs 는 `getQuiz`(Code.gs)도 씁니다. Remind.gs 는 Score.gs 의 `wrongRows_` 를 빌려 씁니다.

## 프로젝트 C: 9주차 2강 (새 시트·새 프로젝트)

| 파일 | 이름 |
|---|---|
| Slides.gs | SHEET_NAME, MAX_SLIDES, MAIN_COLOR, onOpen, makeSlides, addSlide |
| Script.gs | makeScriptDoc, pointsOf_ |
| Keys.gs | checkKey |
| Timer.gs | CHARS_PER_MIN, LIMIT_MIN, estimateMinutes, sumChars_ |
| Check.gs | CHECK_COLOR, MAX_SENTENCE, highlightProblems, isBad_ |
| Web.gs | doGet, loadScript, checkScript, estimate, makeSlidesUrl, scriptRows_ |

겹침: 없음 (23개, 중복 0). Web.gs 의 doGet 때문에 이 프로젝트에 7-1·9-1 을 붙이면 안 됩니다. Script.gs·Timer.gs·Check.gs 는 Slides.gs 의 `SHEET_NAME` 을 빌려 씁니다.

## 프로젝트 사이 주의

- 프로젝트 A 에 B 나 C 를 같이 붙이면 `doGet`(A·B), `SHEET_NAME`(A·C), `onOpen`(A의 Menu.gs·C) 이 겹쳐 멈춥니다. 9주차는 반드시 새 시트에서 시작합니다.
- 모든 프로젝트에서 `onOpen`(C) 처럼 이름이 정해진 함수는 한 번만 둡니다.
- 이름 선정 규칙: 상수는 대문자(`MODEL`), 셀 함수는 `AI_SUMMARY`·`SAM_SUMMARY`, 도우미는 `_` 로 끝납니다.
