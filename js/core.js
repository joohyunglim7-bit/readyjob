// --- [1차 통합] Core.js ---
// services.js, store.js, data.js, view.js의 모든 코드를 통합합니다.

// --- 1. Store (store.js) ---
export const initialFeature1Data = {
    jobInfo: null, // null로 변경하여 완료 여부 체크
    jobValueResult: null,
    personalityResult: null,
    workStyleResult: null,
    socialExperiences: [],
};

export const appState = {
    currentUser: null,
    feature1Data: JSON.parse(JSON.stringify(initialFeature1Data)), // 초기 상태 복사
    feature2Data: { generatedCount: 0 },
    feature4Data: {
        trends: [
            { title: "2024년 하반기 IT 산업 채용 트렌드 분석", summary: "클라우드 네이티브 및 AI 전문가 수요가 급증하고 있으며, 개발자의 소프트 스킬 중요성이 더욱 강조되고 있습니다.", link: "#" },
            { title: "마케팅 직무, 이제는 데이터 분석이 필수", summary: "퍼포먼스 마케팅의 성장으로 데이터 분석 및 활용 능력을 갖춘 마케터에 대한 선호도가 높아지고 있습니다.", link: "#" }
        ]
    }
};


// --- 2. Services (services.js) ---
const API_KEY = "AIzaSyDXAdoMpSr1jAcQrWcw-YGZ2y9-RFUZRsc"; // 💎 여기에 Gemini API 키를 입력하세요.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SUPABASE_URL = 'https://kqaaqmmigwqqtdlrvwat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWFxbW1pZ3dxcXRkbHJ2d2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDQ5NjksImV4cCI6MjA3NjU4MDk2OX0.CZUmPc5GzUBPaD8WnD2CS1Qn5CVQw9VAuheI64eqPis';

// Supabase 클라이언트 생성 및 export
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 데이터 관리 함수
export async function saveUserData(username, data) {
    if (!username) return;

    try {
        const dataToSave = { feature1Data: data };
        const { error } = await supabaseClient
            .from('profiles')
            .upsert({ username: username, data: dataToSave }, { onConflict: 'username' });

        if (error) throw error;

    } catch (error) {
        console.error('데이터 저장 실패 (Supabase 오류):', error);
    }
}

export async function loadUserData(username) {
    if (!username) return null;

    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('data')
            .eq('username', username)
            .single();

        if (error) {
            console.warn('프로필 로드 실패 (신규 유저일 수 있음):', error.message);
            return null;
        }

        return data ? data.data : null; // data.data -> { feature1Data: { ... } }

    } catch (error) {
        console.error('데이터 불러오기 실패 (Supabase API 오류):', error);
        return null;
    }
}

// Gemini API 호출
export async function callGeminiAPI(prompt, isJson = false) {
    if (!API_KEY || !API_KEY.startsWith("AIza")) {
        console.warn("API 키가 유효하지 않습니다. 데모 응답을 반환합니다.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isJson) {
            return JSON.stringify({
                overall: "전반적으로 직무에 대한 이해도가 높고 자신의 경험을 잘 연결하여 답변하는 모습이 인상적이었습니다.",
                scores: { '직무 이해도': 85, '논리력': 90, '의사소통': 75, '경험의 구체성': 80, '인성/가치관': 85 },
                tip: "STAR 기법을 활용하여 자신의 경험을 구조적으로 설명하는 연습을 더 해보세요.",
                improved_scripts: [{
                    user_answer: "저는 소통을 잘합니다.",
                    improved_script: "저는 상대방의 의견을 경청하고 핵심을 파악하여 명확한 해결책을 제시하는 커뮤니케이션 역량을 갖추고 있습니다. 실제로 OO프로젝트 당시, 팀원 간의 갈등을 중재하여 목표를 성공적으로 달성한 경험이 있습니다."
                }],
                expressionFeedback: "데모 모드에서는 표정 분석이 제공되지 않습니다."
            });
        }
        if (prompt.includes("면접관 역할")) return "네, 좋은 답변 감사합니다. 다음 질문 드리겠습니다. 지원한 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?";
        return `[데모] AI 응답입니다.`;
    }

    try {
        const generationConfig = isJson ? { response_mime_type: "application/json" } : {};
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig
        };
        const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("API 응답 파싱 실패");
        return text.trim().replace(/\*\*/g, '');
    } catch (error) {
        console.error("Gemini API 호출 오류:", error);
        return isJson ? '{"error":"AI 응답 생성 중 오류가 발생했습니다."}' : "AI 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
}


// --- 3. Data (data.js) ---
export const industries = ["IT·웹·통신", "은행·금융", "제조·화학", "서비스", "유통·무역·운송", "건설", "의료·제약·바이오", "교육", "미디어·디자인", "공공·비영리", "부동산", "소비재", "법률·회계", "컨설팅"];
export const jobCategories = ["경영·사무", "교육", "농림어업", "보건·의료", "연구·공학기술", "영업·판매", "예술", "방송", "디자인", "사회복지", "컴퓨터·IT·시스템개발", "금융·보험"];
export const jobDuties = ["기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD", "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역", "고객상담·TM", "구매·자재·물류", "상품기획·MD", "운전·운송·배송", "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", "미디어·문화·스포츠", "금융·보험", "영업·판촉", "공공·복지"];
export const majors = ["컴퓨터공학", "소프트웨어공학", "정보통신공학", "전기전자공학", "기계공학", "화학공학", "신소재공학", "산업공학", "건축공학", "경영학", "경제학", "통계학", "광고홍보학", "미디어커뮤니케이션", "국어국문학", "영어영문학", "중어중문학", "일어일문학", "사학", "철학", "심리학", "사회학", "정치외교학", "행정학", "법학", "시각디자인", "산업디자인", "의류학", "식품영양학", "간호학", "물리학", "화학", "생명과학", "수학", "지구과학", "교육학", "유아교육", "음악", "미술"];


// --- 4. View (view.js) ---
const dashboardMain = document.getElementById('dashboard-main');

export function showView(viewName) {
    if (dashboardMain) {
        dashboardMain.style.display = 'none';
    }
    document.querySelectorAll('.feature-section').forEach(s => s.style.display = 'none');

    if (viewName === 'dashboard') {
        if (dashboardMain) {
            dashboardMain.style.display = 'block';
        }
    } else {
        const targetSection = document.getElementById(viewName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
    window.scrollTo(0, 0);
}