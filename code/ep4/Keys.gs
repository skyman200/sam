// Keys.gs : 스크립트 속성 복습(7주차 2강과 같은 3줄)
// 키 값은 코드에 쓰지 않고 [프로젝트 설정]의 속성에 둡니다

// 속성에서 키를 꺼내 있는지만 확인합니다(값은 안 보임)
function checkKey() {
  const key = PropertiesService
    .getScriptProperties()
    .getProperty('GEMINI_API_KEY');
  console.log(key ? '키가 있습니다' : '키가 없습니다');
}
