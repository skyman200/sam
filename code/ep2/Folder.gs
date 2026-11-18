// Folder.gs : 드라이브 폴더 만들기와 PDF 정리
// Pdf.gs 의 savePdf 로 만든 PDF를 옮깁니다
// 필요 권한: 구글 드라이브 파일·폴더 관리
const FOLDER_NAME = '수업 PDF';

// 폴더를 찾고, 없으면 새로 만듭니다
function makeFolder() {
  const found = DriveApp
    .getFoldersByName(FOLDER_NAME);
  if (found.hasNext()) {
    return found.next();
  }

  const folder = DriveApp
    .createFolder(FOLDER_NAME);
  Logger.log('폴더 생성: ' + folder.getUrl());
  return folder;
}

// 내 드라이브 첫 화면의 PDF를 폴더로 옮깁니다
function movePdfs() {
  const folder = makeFolder();
  const it = DriveApp.getRootFolder()
    .getFilesByType(MimeType.PDF);
  const files = [];
  while (it.hasNext()) files.push(it.next());

  files.forEach(function (f) {
    f.setName(stamp_(f.getName()));
    f.moveTo(folder);
  });
  Logger.log(files.length + '개 PDF를 옮겼습니다');
}

// 이름 앞에 오늘 날짜를 붙입니다(이미 있으면 그대로)
function stamp_(name) {
  const zone = Session.getScriptTimeZone();
  const day = Utilities.formatDate(
    new Date(), zone, 'yyyy-MM-dd');
  return name.indexOf(day) === 0
    ? name : day + '_' + name;
}
