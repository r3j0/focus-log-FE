'use server';

// 정근님이 배포하신 Cloudtype 서버 주소로 연결!
const BACKEND_URL = 'https://port-0-focus-log-be-mn8s03mk460f70c5.sel3.cloudtype.app';

export async function startStudyAction(userId: number) {
  try {
    // 요구사항 명세서의 API 경로: /focus-log/study/start
    // 백엔드(Python) 명세에 맞춰 카멜케이스(userId)를 스네이크케이스(user_id)로 변환하여 전송합니다.
    const response = await fetch(`${BACKEND_URL}/study/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId}),
      cache: 'no-store', 
    });

    if (!response.ok) {
      // 서버에서 에러가 났을 때 어떤 에러인지 텍스트로 뽑아옵니다.
      const errorText = await response.text();
      throw new Error(`서버 에러(${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('공부 시작 통신 에러:', error);
    return { success: false, error: '시작 요청에 실패했습니다. 백엔드 연결을 확인해주세요.' };
  }
}

export async function stopStudyAction(userId: number) {
  try {
    const response = await fetch(`${BACKEND_URL}/study/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`서버 에러(${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('공부 종료 통신 에러:', error);
    return { success: false, error: '종료 요청에 실패했습니다.' };
  }
}