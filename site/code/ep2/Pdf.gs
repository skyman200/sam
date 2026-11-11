// Pdf.gs : 시트를 PDF로 내 드라이브에 저장

// 지금 시트 전체를 PDF 파일로 만들어 저장합니다
function savePdf() {
  const ss = SpreadsheetApp
    .getActiveSpreadsheet();
  const blob = ss.getAs('application/pdf');
  blob.setName('한장정리.pdf');
  const file = DriveApp.createFile(blob);
  Logger.log('저장 완료: ' + file.getUrl());
}
