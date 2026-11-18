# 7주차 (ep1+ep2) 전역 이름 충돌 점검표

7-1 의 Code.gs·Feed.gs·Report.gs·Clean.gs·Share.gs 와 7-2 의 Summary.gs·SamSummary.gs·Pdf.gs·Trigger.gs·Menu.gs·Folder.gs 는 같은 프로젝트에 붙습니다.
전체 표(9주차 포함)는 `../NAMES.md`.

## 이름 목록

| 파일 | 강 | 이름 |
|---|---|---|
| Code.gs | 7-1 | SHEET_NAME, doGet, getSheet_, addScrap, mailList |
| Feed.gs | 7-1 | FEED_URL, FEED_COUNT, importFeed, readFeed_, savedLinks_ |
| Report.gs | 7-1 | REPORT_HOUR, WEEK_MS, weeklyReport, makeWeeklyTrigger, pickDates_ |
| Clean.gs | 7-1 | removeDuplicates, dupRows_, countByTopic |
| Share.gs | 7-1 | SHARE_TITLE, exportToDoc, addItem_ |
| Summary.gs | 7-2 | MODEL, AI_SUMMARY, testSummary |
| SamSummary.gs | 7-2 | SAM_URL, SAM_CODE, SAM_MIN_LENGTH, SAM_CACHE_SECONDS, SAM_SUMMARY, makeCacheKey_, testSamSummary |
| Pdf.gs | 7-2 | savePdf |
| Trigger.gs | 7-2 | setTrigger |
| Menu.gs | 7-2 | MENU_NAME, MENU_MAX_CELLS, onOpen, summarizeSelection |
| Folder.gs | 7-2 | FOLDER_NAME, makeFolder, movePdfs, stamp_ |

겹침: 없음 (41개 이름, 중복 0).
앞 파일에 기대는 곳(이름을 빌려 씀, 다시 선언하지 않음):
Feed.gs·Report.gs·Clean.gs·Share.gs → `getSheet_`(Code.gs), Trigger.gs → 문자열 `'mailList'`(Code.gs),
Menu.gs → `SAM_SUMMARY`(SamSummary.gs)와 문자열 `'savePdf'`(Pdf.gs), Folder.gs → Pdf.gs 가 만든 PDF.
AI가 준 코드에서 `SHEET_NAME`·`doGet`·`getSheet_`·`addScrap`·`mailList` 를 다시 만들었다면 그 줄을 지웁니다.

프로젝트 A 에는 9주차 파일(Quiz·Exam·Slides 등)을 붙이지 않습니다: `doGet`·`SHEET_NAME`·`onOpen` 이 겹칩니다.
