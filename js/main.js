// --- [최종] 모듈 Import ---
import {
    appState,
    initialFeature1Data,
    saveUserData,
    loadUserData,
    showView
} from './core.js';

// 기능 모듈 Import
import { getFeature1HTML, bindFeature1Listeners, updateF1CardStates } from './feature1.js';
import { getFeature2HTML, bindF2Listeners } from './feature2.js';
import {
    getFeature3HTML,
    bindF3Listeners,
    getFeature4HTML,
    bindF4Listeners
} from './feature3_4.js'; // 3, 4 통합 파일 import

import { getExpertHTML, bindExpertListeners } from './expert.js';
// [수정] loadAndRenderMyPageData 함수 추가 import
import { getMyPageHTML, bindMyPageListeners, loadAndRenderMyPageData } from './mypage.js';


// --- DOM 요소 ---
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');

// --- 초기화 및 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        appState.currentUser = username;
        const userData = await loadUserData(username); // core.js 함수 사용
        if (userData && userData.feature1Data) {
            appState.feature1Data = { ...initialFeature1Data, ...userData.feature1Data }; // core.js 변수 사용
        } else {
            appState.feature1Data = JSON.parse(JSON.stringify(initialFeature1Data)); // core.js 변수 사용
        }
        document.getElementById('welcome-message').textContent = `${username}님, 환영합니다!`;
        loginSection.classList.add('hidden');
        appSection.classList.remove('hidden');

        // ▼▼▼ [수정] 로그인 직후 대시보드 대신 버전 선택 화면으로 이동 ▼▼▼
        // showView('dashboard'); (기존 코드)
        renderFeaturePage('version-selection-section'); // (신규)
        showView('version-selection-section'); // (신규)
        // ▲▲▲ [수정] 여기까지 ▲▲▲
    });

    logoutButton.addEventListener('click', () => {
        saveUserData(appState.currentUser, appState.feature1Data); // core.js 함수 사용
        appState.currentUser = null;
        appSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        location.reload();
    });

    // [신규] '홈' 버튼 리스너 추가 (버전 선택 화면으로 이동)
    document.getElementById('home-button').addEventListener('click', () => {
        renderFeaturePage('version-selection-section'); // (기존 함수 재사용)
        showView('version-selection-section');
    });

    // [신규] 나의 활동 버튼 리스너 추가
    document.getElementById('mypage-button').addEventListener('click', () => {
        renderFeaturePage('mypage-section');
        showView('mypage-section'); // core.js 함수 사용
        
        // [수정] 데이터를 매번 새로 불러오도록 명시적 호출
        loadAndRenderMyPageData(); 
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.dataset.target;
            renderFeaturePage(targetId);
            showView(targetId); // core.js 함수 사용
        });
    });
});

// --- 페이지 렌더링 및 라우팅 ---

/**
 * ▼▼▼ [수정] 버전 선택 화면 HTML (아이콘, 크기, 오타 수정) ▼▼▼
 */
function getVersionSelectionHTML() {
    return `
        <div class="text-center mb-12">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">READYJOB에 오신 것을 환영합니다</h1>
            <p class="mt-4 text-xl text-gray-600">시작할 버전을 선택해주세요.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div id="start-starter-btn"
                class="feature-card bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center space-y-4 transition duration-300 card-hover cursor-pointer">
                
                <div class="pastel-bg-icon-1 p-4 rounded-full flex items-center justify-center">
                    <img src="images/ready_icon_starter.png" alt="Starter 마스코트" class="h-24 w-24 object-contain" />
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2">🚀 Starter 버전</h3>
                    <p class="text-gray-600">어서와! 취업은 처음이지? 너가 가진 무궁무진한 가능성 발견부터 자소서 생성 그리고 AI 면접까지 모두 경험할 수 있어!</p>
                </div>
            </div>
            <div id="start-expert-btn"
                class="feature-card bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center space-y-4 transition duration-300 card-hover cursor-pointer">
                
                <div class="pastel-bg-icon-2 p-4 rounded-full flex items-center justify-center">
                    <img src="images/ready_icon_expert.png" alt="Expert 마스코트" class="h-24 w-24 object-contain" />
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2">🌟 Expert 버전</h3>
                    <p class="text-gray-600">이력서와 자소서가 모두 완성되었다고? 그럼 면접 전에 레디의 도움을 받아서 더 다듬어보자!</p>
                </div>
            </div>
        </div>
    `;
}
/**
 * ▲▲▲ [수정] 버전 선택 화면 HTML 수정 완료 ▲▲▲
 */


/**
 * 기능별 이벤트 리스너를 바인딩하는 메인 함수
 * @param {string} pageId 
 */
function bindEventListeners(pageId) {
    // ▼▼▼ [신규] 버전 선택 화면 이벤트 바인딩 ▼▼▼
    if (pageId === 'version-selection-section') {
        document.getElementById('start-starter-btn').onclick = () => {
            showView('dashboard'); // 기존 대시보드로 이동
        };
        document.getElementById('start-expert-btn').onclick = () => {
            renderFeaturePage('expert-section'); // Expert 모드 렌더링
            showView('expert-section');
        };
    }
    if (pageId === 'feature1-section') {
        bindFeature1Listeners(); // feature1.js
    }
    if (pageId === 'feature2-section') {
        bindF2Listeners(); // feature2.js
    }
    if (pageId === 'feature3-section') {
        bindF3Listeners(); // feature3_4.js
    }
    if (pageId === 'feature4-section') {
        bindF4Listeners(); // feature3_4.js
    }
    if (pageId === 'expert-section') {
        bindExpertListeners(); // expert.js
    }
    if (pageId === 'mypage-section') {
        bindMyPageListeners(); // mypage.js
    }
}

/**
 * 각 기능 페이지의 HTML을 렌더링하고 이벤트 리스너를 바인딩
 * @param {string} pageId 
 */
function renderFeaturePage(pageId) {
    const container = document.getElementById(pageId);
    if (!container) return;

    let html = '';

    // ▼▼▼ [수정] 렌더링 로직에 신규 case 추가 ▼▼▼
    if (pageId === 'version-selection-section') {
        html = getVersionSelectionHTML(); // 신규
    } else if (pageId === 'expert-section') {
        html = getExpertHTML(); // 신규 (expert.js)
    } else if (pageId === 'feature1-section') {
        html = getFeature1HTML(); // feature1.js
    } else if (pageId === 'feature2-section') {
        html = getFeature2HTML(); // feature2.js
    } else if (pageId === 'feature3-section') {
        html = getFeature3HTML(); // feature3_4.js
    } else if (pageId === 'feature4-section') {
        html = getFeature4HTML(); // feature3_4.js
    } else if (pageId === 'mypage-section') {
        html = getMyPageHTML(); // mypage.js
    }
    // ▲▲▲ [수정] 여기까지 ▲▲▲

    container.innerHTML = html;

    // F1의 경우 특별한 상태 업데이트 함수 호출
    if (pageId === 'feature1-section') {
        updateF1CardStates(); // feature1.js
    }
    const backBtn = container.querySelector('.back-to-dashboard-btn');
    if (backBtn) {
        if (pageId === 'expert-section') {
            // 'Expert 모드'의 뒤로가기 -> '버전 선택'
            backBtn.onclick = () => {
                renderFeaturePage('version-selection-section');
                showView('version-selection-section');
            };
        
        // [수정] mypage-section 일 때도 대시보드로 이동하도록 조건 추가
        } else if (pageId.startsWith('feature') || pageId === 'mypage-section') { 
            
            // 'Starter 모드' (F1~F4) 및 '나의 활동'의 뒤로가기 -> '대시보드'
            backBtn.onclick = () => {
                showView('dashboard'); // 'Starter' 대시보드로 이동
            };
        }
    }

    // 각 기능별 메인 이벤트 리스너 바인딩
    bindEventListeners(pageId);
}