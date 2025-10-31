// --- [신규] 마이페이지 (mypage.js) ---

// 1. core.js에서 공유 자원 import
import { appState, supabaseClient } from './core.js';

// 차트 인스턴스를 관리하기 위한 변수
let mypageRadarChart = null;

// 2. 마이페이지 HTML 뼈대 생성 함수 (모달 창 구조 추가)
export function getMyPageHTML() {
    return `
        <div class="mb-4">
            <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                &larr; 대시보드로 돌아가기
            </button>
        </div>
        <h2 class="text-3xl font-bold mb-8">🚀 나의 활동</h2>
        <p class="text-gray-600 mb-6">READYJOB과 함께한 나의 분석 결과와 생성된 결과물을 모두 확인하세요.</p>
        
        <div class="border-b border-gray-200">
            <nav id="mypage-tabs" class="-mb-px flex space-x-8" aria-label="Tabs">
                <button data-tab="starter" class="tab-btn active">
                    🚀 Starter 활동 내역
                </button>
                <button data-tab="expert" class="tab-btn">
                    🌟 Expert 활동 내역
                </button>
            </nav>
        </div>
        
        <div class="mt-6">
            <div id="starter-content" class="tab-panel space-y-8">
                <div id="mypage-f1-profile" class="bg-white p-6 rounded-lg shadow">
                    <div class="loader"></div>
                </div>
                
                <div id="mypage-f1-diagnostics" class="bg-white p-6 rounded-lg shadow">
                    <div class="loader"></div>
                </div>
                
                <div id="mypage-f2-list" class="bg-white p-6 rounded-lg shadow">
                    <div class="loader"></div>
                </div>
                
                <div id="mypage-f3-list" class="bg-white p-6 rounded-lg shadow">
                    <div class="loader"></div>
                </div>
            </div>
            
            <div id="expert-content" class="tab-panel hidden space-y-8">
                <div id="mypage-expert-list" class="bg-white p-6 rounded-lg shadow">
                    <div class="loader"></div>
                </div>
                
                <div id="mypage-expert-cl-list" class="bg-white p-6 rounded-lg shadow">
                    <h3 class="font-bold text-xl mb-4">AI 첨삭 자소서</h3>
                    <p class="text-sm text-gray-500 mb-4">Expert 면접을 통해 보완된 자소서 목록입니다. (수정/저장 가능)</p>
                    <div id="expert-cl-list-content" class="mt-4">
                        <div class="loader"></div>
                    </div>
                </div>
            </div>
            </div>

        <div id="mypage-pdf-loader" class="hidden fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div class="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
                <div class="loader"></div>
                <span class="font-semibold text-lg">PDF 보고서 생성 중...</span>
            </div>
        </div>

        <div id="mypage-modal" class="hidden fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b">
                    <h3 class="font-bold text-xl">AI 면접 결과 리포트</h3>
                    <button id="modal-close-btn" class="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div id="modal-content" class="p-6 space-y-6 overflow-y-auto">
                    </div>
            </div>
        </div>
    `;
}

// 3. 마이페이지 이벤트 리스너 바인딩 함수
export function bindMyPageListeners() {

    // 탭 스위칭 로직
    const tabs = document.querySelectorAll('#mypage-tabs .tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    if (tabs.length > 0 && tabs[0].dataset.listenerBound) {
        return;
    }

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetPanelId = tab.dataset.tab + '-content';
            panels.forEach(p => p.classList.toggle('hidden', p.id !== targetPanelId));
        };
        tab.dataset.listenerBound = 'true';
    });

    // 모달 닫기 버튼
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn && !modalCloseBtn.dataset.listenerBound) {
        modalCloseBtn.onclick = closeResultModal;
        modalCloseBtn.dataset.listenerBound = 'true';
    }
}

/**
 * [핵심] 모든 데이터를 Supabase와 appState에서 불러와 렌더링하는 메인 함수
 * [수정] F2/Expert 자소서 분리 로직 추가
 */
export async function loadAndRenderMyPageData() {
    const username = appState.currentUser;
    if (!username) return;

    // 로딩 스피너 표시
    const f1Profile = document.getElementById('mypage-f1-profile');
    const f1Diag = document.getElementById('mypage-f1-diagnostics');
    const f2List = document.getElementById('mypage-f2-list');
    const f3List = document.getElementById('mypage-f3-list');
    const expertList = document.getElementById('mypage-expert-list');
    // [신규] Expert 자소서 목록 로더
    const expertCLListContent = document.getElementById('expert-cl-list-content');

    if (f1Profile) f1Profile.innerHTML = '<div class="loader"></div>';
    if (f1Diag) f1Diag.innerHTML = '<div class="loader"></div>';
    if (f2List) f2List.innerHTML = '<div class="loader"></div>';
    if (f3List) f3List.innerHTML = '<div class="loader"></div>';
    if (expertList) expertList.innerHTML = '<div class="loader"></div>';
    if (expertCLListContent) expertCLListContent.innerHTML = '<div class="loader"></div>'; // [신규]


    // 1. F1 데이터 렌더링 (동기식)
    renderF1Profile(appState.feature1Data);
    renderF1Diagnostics(appState.feature1Data);

    // 2. F2, F3, Expert 데이터 DB에서 병렬로 불러오기
    try {
        const [f2Res, f3Res, expertRes] = await Promise.all([
            // [수정] F2(자소서)는 Starter/Expert 모두 여기서 불러옴
            supabaseClient.from('generated_cover_letters').select('*').eq('user_username', username).order('created_at', { ascending: false }),
            supabaseClient.from('starter_interview_results').select('id, created_at, mode, type, category, result_json->videoUrl')
                .eq('user_username', username)
                .order('created_at', { ascending: false }),
            supabaseClient.from('expert_session_results').select('id, created_at, result_json->videoUrl')
                .eq('user_username', username)
                .order('created_at', { ascending: false })
        ]);

        if (f2Res.error) throw new Error(`F2 Error: ${f2Res.error.message}`);
        if (f3Res.error) throw new Error(`F3 Error: ${f3Res.error.message}`);
        if (expertRes.error) throw new Error(`Expert Error: ${expertRes.error.message}`);

        // --- 5개 이력 제한 및 자동 삭제 로직 (F3, Expert 면접) ---

        // F3 (Starter) 자동 삭제
        if (f3Res.data && f3Res.data.length > 5) {
            const itemsToKeep = f3Res.data.slice(0, 5);
            const itemsToDelete = f3Res.data.slice(5);
            const idsToDelete = itemsToDelete.map(item => item.id);

            console.log(`[F3 자동삭제] ${idsToDelete.length}개의 오래된 이력을 삭제합니다...`);
            supabaseClient.from('starter_interview_results').delete().in('id', idsToDelete)
                .then(({ error }) => {
                    if (error) console.error("F3 자동 삭제 실패:", error);
                    else console.log("F3 자동 삭제 완료.");
                });
            renderF3List(itemsToKeep);
        } else {
            renderF3List(f3Res.data);
        }

        // Expert 자동 삭제
        if (expertRes.data && expertRes.data.length > 5) {
            const itemsToKeep = expertRes.data.slice(0, 5);
            const itemsToDelete = expertRes.data.slice(5);
            const idsToDelete = itemsToDelete.map(item => item.id);

            console.log(`[Expert 자동삭제] ${idsToDelete.length}개의 오래된 이력을 삭제합니다...`);
            supabaseClient.from('expert_session_results').delete().in('id', idsToDelete)
                .then(({ error }) => {
                    if (error) console.error("Expert 자동 삭제 실패:", error);
                    else console.log("Expert 자동 삭제 완료.");
                });
            renderExpertList(itemsToKeep);
        } else {
            renderExpertList(expertRes.data);
        }

        // --- ▼▼▼ [신규] F2 / Expert 자소서 분리 렌더링 ▼▼▼ ---
        if (f2Res.data) {
            // 'Expert 첨삭'이 아닌 것만 F2(Starter) 목록으로
            const f2Data = f2Res.data.filter(item => item.category !== "Expert 첨삭");
            renderF2List(f2Data);

            // 'Expert 첨삭'인 것만 Expert 자소서 목록으로
            const expertCLData = f2Res.data.filter(item => item.category === "Expert 첨삭");
            renderExpertCLList(expertCLData); // [신규] 함수 호출
        } else {
            renderF2List([]);
            renderExpertCLList([]); // [신규] 함수 호출
        }
        // --- ▲▲▲ [신규] 분리 렌더링 끝 ▲▲▲ ---

    } catch (error) {
        console.error("마이페이지 데이터 로드 실패:", error);
        if (f1Profile) f1Profile.innerHTML = `<p class="text-red-500">데이터 로드 실패</p>`;
        if (f1Diag) f1Diag.innerHTML = `<p class="text-red-500">데이터 로드 실패</p>`;
        if (f2List) f2List.innerHTML = `<p class="text-red-500">데이터 로드 실패</p>`;
        if (f3List) f3List.innerHTML = `<p class="text-red-500">데이터 로드 실패</p>`;
        if (expertList) expertList.innerHTML = `<p class="text-red-500">Expert 면접 이력을 불러오는 데 실패했습니다.</p>`;
        if (expertCLListContent) expertCLListContent.innerHTML = `<p class="text-red-500">Expert 자소서 내역을 불러오는 데 실패했습니다.</p>`; // [신규]
    }
}

// --- 4A. Starter 탭 렌더링 함수들 ---

function renderF1Profile(f1Data) {
    const container = document.getElementById('mypage-f1-profile');
    if (!container) return;
    let html = '<h3 class="font-bold text-xl mb-4">나의 프로필 (F1)</h3>';

    if (!f1Data.jobInfo && f1Data.socialExperiences.length === 0) {
        html += `<p class="text-gray-500">아직 F1(자기 분석)을 진행하지 않았습니다.</p>`;
        html += `<button id="goto-f1-btn" class="mt-4 view-result-button !inline-flex !w-auto">자기 분석하러 가기</button>`;
    } else {
        if (f1Data.jobInfo) {
            html += '<div class="mb-4">';
            html += '<h4 class="font-semibold text-gray-700 mb-2">희망 직무/산업</h4>';
            html += '<div class="flex flex-wrap gap-2">';
            [...(f1Data.jobInfo.industry || []), ...(f1Data.jobInfo.jobCategory || []), ...(f1Data.jobInfo.jobDuties || [])]
                .forEach(item => {
                    html += `<span class="selection-box !bg-gray-100 !border-gray-300">${item}</span>`;
                });
            html += '</div></div>';
        }

        html += '<h4 class="font-semibold text-gray-700 mb-2">나의 사회 경험</h4>';
        if (f1Data.socialExperiences.length > 0) {
            html += '<div class="space-y-4">';
            f1Data.socialExperiences.forEach(exp => {
                html += `
                    <div class="experience-card !p-4 !shadow-none border">
                        <span class="exp-type-badge">${exp.type}</span>
                        <h5 class="font-bold text-gray-800 mt-2">${exp.org}</h5>
                        <p class="text-xs text-gray-500 mb-2">${exp.duration}</p>
                        <ul class="text-sm text-gray-600 list-disc pl-5">${exp.tasks.map(t => `<li>${t}</li>`).join('')}</ul>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += `<p class="text-gray-500 text-sm">아직 추가된 사회 경험이 없습니다.</p>`;
        }
    }

    container.innerHTML = html;

    container.querySelector('#goto-f1-btn')?.addEventListener('click', () => {
        document.querySelector('.feature-card[data-target="feature1-section"]')?.click();
    });
}

function renderF1Diagnostics(f1Data) {
    const container = document.getElementById('mypage-f1-diagnostics');
    if (!container) return;
    let html = '<h3 class="font-bold text-xl mb-4">나의 진단 결과 (F1)</h3>';

    const results = [
        { title: "직무 가치 진단", key: "jobValueResult" },
        { title: "개인 성격 진단", key: "personalityResult" },
        { title: "업무 성향 진단", key: "workStyleResult" }
    ];

    const completedResults = results.filter(r => f1Data[r.key]);

    if (completedResults.length === 0) {
        html += `<p class="text-gray-500">아직 완료한 진단이 없습니다.</p>`;
    } else {
        html += '<div class="space-y-2">';
        completedResults.forEach(result => {
            html += `
                <details class="bg-gray-50 p-3 rounded-lg">
                    <summary class="font-semibold cursor-pointer">${result.title} (결과 보기)</summary>
                    <div class="mt-4 border-t pt-4">${f1Data[result.key]}</div>
                </details>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('details').forEach(detail => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                const scriptTag = detail.querySelector('script');
                if (scriptTag && !scriptTag.dataset.executed) {
                    scriptTag.dataset.executed = "true";
                    const newScript = document.createElement("script");
                    newScript.innerHTML = scriptTag.innerHTML;
                    detail.appendChild(newScript);
                }
            }
        }, { once: true });
    });
}

/**
 * F2 AI 자소서 목록 렌더링
 * [수정] 제목 변경
 */
function renderF2List(data) {
    const container = document.getElementById('mypage-f2-list');
    if (!container) return;

    // ▼▼▼ [수정] 제목 변경 ▼▼▼
    let html = '<h3 class="font-bold text-xl mb-4">AI 생성 자소서 (Starter)</h3>';
    // ▲▲▲ [수정] 제목 변경 ▲▲▲

    if (!data || data.length === 0) {
        html += `<p class="text-gray-500">아직 F2(AI 자소서 생성)를 진행하지 않았습니다.</p>`;
        html += `<button id="goto-f2-btn" class="mt-4 view-result-button !inline-flex !w-auto">자소서 생성하러 가기</button>`;
    } else {
        html += '<div class="space-y-4">';
        data.forEach((item, index) => {
            const textareaId = `f2-item-${item.id}`;
            html += `
                <div class="border rounded-lg p-4">
                    <p class="font-semibold text-gray-700">${item.question}</p>
                    <textarea id="${textareaId}" class="w-full h-32 text-sm bg-gray-50 border rounded mt-2 p-2" readonly>${item.generated_text}</textarea>
                    
                    <div class="mt-2 flex gap-2">
                        <button data-target-id="${textareaId}" class="copy-f2-btn bg-gray-600 text-white py-1 px-3 rounded-md text-sm hover:bg-gray-700">본문 복사</button>
                        <button data-target-id="${textareaId}" data-item-id="${item.id}" class="edit-f2-btn bg-purple-600 text-white py-1 px-3 rounded-md text-sm hover:bg-purple-700">수정하기</button>
                    </div>
                    </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;

    container.querySelector('#goto-f2-btn')?.addEventListener('click', () => {
        document.querySelector('.feature-card[data-target="feature2-section"]')?.click();
    });

    // [수정] 공통 함수로 이벤트 바인딩
    attachF2EditListeners(container);
}

/**
 * F3 Starter 면접 이력 렌더링
 */
function renderF3List(data) {
    const container = document.getElementById('mypage-f3-list');
    if (!container) return;
    let html = `<h3 class="font-bold text-xl mb-4">AI 면접 이력 (F3) <span class="text-sm font-medium text-gray-500 ml-2">※ 이력은 최대 5개만 생성되며 이전 기록은 삭제됩니다. 반드시 개인 PC에 저장해 두시길 추천 드립니다:)</span></h3>`;

    if (!data || data.length === 0) {
        html += `<p class="text-gray-500">아직 F3(AI 면접)을 진행하지 않았습니다.</p>`;
        html += `<button id="goto-f3-btn" class="mt-4 view-result-button !inline-flex !w-auto">면접 연습하러 가기</button>`;
    } else {
        html += '<div class="space-y-4">';
        data.forEach(item => {
            const modeText = { 'text': '📝 텍스트', 'voice': '🎙️ 음성', 'video': '📹 화상' }[item.mode] || item.mode;
            const typeText = { 'taster': '🍰 맛보기', 'real': '🔥 실전' }[item.type] || item.type;
            const hasVideo = item.mode === 'video' && item.videoUrl;

            html += `
                <div class="border rounded-lg p-4 flex justify-between items-center" data-item-container-id="${item.id}">
                    <div class="flex items-baseline gap-3">
                        <p class="font-semibold text-base">${new Date(item.created_at).toLocaleString('ko-KR')}</p>
                        <p class="text-sm text-gray-600">${modeText} / ${typeText} ${item.category ? `(${item.category})` : ''}</p>
                    </div>

                    <div class="flex flex-wrap gap-2 justify-end">
                        ${hasVideo ? `<button data-item-id="${item.id}" class="download-f3-video-btn view-result-button !bg-green-600 hover:!bg-green-700 text-sm">영상 다운</button>` : ''}
                        <button data-item-id="${item.id}" class="open-f3-modal-btn view-result-button text-sm">결과 보기</button>
                        <button data-item-id="${item.id}" class="download-f3-pdf-btn view-result-button !bg-teal-500 hover:!bg-teal-600 text-sm">PDF 다운</button>
                        <button data-item-id="${item.id}" data-table="starter_interview_results" class="delete-item-btn view-result-button !bg-red-600 hover:!bg-red-700 text-sm">삭제</button>
                    </div>
                    </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;

    container.querySelector('#goto-f3-btn')?.addEventListener('click', () => {
        document.querySelector('.feature-card[data-target="feature3-section"]')?.click();
    });

    // '결과 보기' 버튼 리스너
    container.querySelectorAll('.open-f3-modal-btn').forEach(button => {
        button.onclick = async (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            const { data, error } = await supabaseClient
                .from('starter_interview_results')
                .select('result_json')
                .eq('id', itemId)
                .single();

            if (error || !data) return alert("결과를 불러오는 데 실패했습니다.");

            openResultModal(data.result_json, 'F3');
        };
    });

    // F3 '영상 다운' 버튼 리스너
    container.querySelectorAll('.download-f3-video-btn').forEach(button => {
        button.onclick = async (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            button.textContent = '확인 중...';
            const item = data.find(d => d.id == itemId);

            if (!item || !item.videoUrl) {
                alert("영상 URL을 찾을 수 없습니다.");
                button.textContent = '영상 다운';
                return;
            }

            window.open(item.videoUrl, '_blank');
            button.textContent = '영상 다운';
        };
    });

    // F3 'PDF 다운' 버튼 리스너
    container.querySelectorAll('.download-f3-pdf-btn').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            handlePdfDownload(itemId, 'starter_interview_results', 'F3', button);
        };
    });

    // '삭제' 버튼 리스너
    container.querySelectorAll('.delete-item-btn').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            const tableName = e.currentTarget.dataset.table;
            const itemElement = e.currentTarget.closest(`[data-item-container-id="${itemId}"]`);
            handleDelete(itemId, tableName, itemElement);
        };
    });
}


// --- 4B. Expert 탭 렌더링 함수들 ---

/**
 * Expert 면접 이력 렌더링
 */
function renderExpertList(data) {
    const container = document.getElementById('mypage-expert-list');
    if (!container) return;
    let html = `<h3 class="font-bold text-xl mb-4">Expert 면접 이력 <span class="text-sm font-medium text-gray-500 ml-2">※ 이력은 최대 5개만 생성되며 이전 기록은 삭제됩니다. 반드시 개인 PC에 저장해 두시길 추천 드립니다:)</span></h3>`;

    if (!data || data.length === 0) {
        html += `<p class="text-gray-500">아직 Expert 모드를 진행하지 않았습니다.</p>`;
        html += `<button id="goto-expert-btn" class="mt-4 view-result-button !inline-flex !w-auto">Expert 모드 시작하기</button>`;
    } else {
        html += '<div class="space-y-4">';
        data.forEach(item => {
            const hasVideo = item.videoUrl;
            html += `
                <div class="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm" data-item-container-id="${item.id}">
                    <div class="flex items-baseline gap-3">
                        <p class="font-semibold text-base">${new Date(item.created_at).toLocaleString('ko-KR')}</p>
                        <p class="text-sm text-gray-600">🌟 Expert 면접 세션</p>
                    </div>

                    <div class="flex flex-wrap gap-2 justify-end">
                        ${hasVideo ? `<button data-item-id="${item.id}" class="download-expert-video-btn view-result-button !bg-green-600 hover:!bg-green-700 text-sm">영상 다운</button>` : ''}
                        <button data-item-id="${item.id}" class="open-expert-modal-btn view-result-button text-sm">결과 보기</button>
                        <button data-item-id="${item.id}" class="download-expert-pdf-btn view-result-button !bg-teal-500 hover:!bg-teal-600 text-sm">PDF 다운</button>
                        <button data-item-id="${item.id}" data-table="expert_session_results" class="delete-item-btn view-result-button !bg-red-600 hover:!bg-red-700 text-sm">삭제</button>
                    </div>
                    </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;

    container.querySelector('#goto-expert-btn')?.addEventListener('click', () => {
        // [수정] Expert 모드로 가려면 버전 선택 화면(home)으로
        document.getElementById('home-button')?.click();
    });

    // '결과 보기' 버튼 리스너
    container.querySelectorAll('.open-expert-modal-btn').forEach(button => {
        button.onclick = async (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            const { data, error } = await supabaseClient
                .from('expert_session_results')
                .select('result_json')
                .eq('id', itemId)
                .single();

            if (error || !data) return alert("결과를 불러오는 데 실패했습니다.");

            openResultModal(data.result_json, 'Expert');
        };
    });

    // Expert '영상 다운' 버튼 리스너
    container.querySelectorAll('.download-expert-video-btn').forEach(button => {
        button.onclick = async (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            const item = data.find(d => d.id == itemId);
            if (!item || !item.videoUrl) {
                alert("영상 URL을 찾을 수 없습니다.");
                return;
            }
            window.open(item.videoUrl, '_blank');
        };
    });

    // Expert 'PDF 다운' 버튼 리스너
    container.querySelectorAll('.download-expert-pdf-btn').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            handlePdfDownload(itemId, 'expert_session_results', 'Expert', button);
        };
    });

    // '삭제' 버튼 리스너
    container.querySelectorAll('.delete-item-btn').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.currentTarget.dataset.itemId;
            const tableName = e.currentTarget.dataset.table;
            const itemElement = e.currentTarget.closest(`[data-item-container-id="${itemId}"]`);
            handleDelete(itemId, tableName, itemElement);
        };
    });
}

/**
 * [신규] Expert 첨삭 자소서 목록 렌더링 (renderF2List 복사 및 수정)
 */
function renderExpertCLList(data) {
    const container = document.getElementById('expert-cl-list-content');
    if (!container) return;

    let html = ''; // 부모 div에 타이틀이 이미 있으므로 여기서는 비움

    if (!data || data.length === 0) {
        html += `<p class="text-gray-500">아직 Expert 모드를 통해 생성된 첨삭 자소서가 없습니다.</p>`;
    } else {
        html += '<div class="space-y-4">';
        data.forEach((item, index) => {
            const textareaId = `f2-item-${item.id}`; // F2와 ID 형식을 동일하게 사용
            html += `
                <div class="border rounded-lg p-4">
                    <p class="font-semibold text-gray-700">${item.question}</p>
                    <textarea id="${textareaId}" class="w-full h-32 text-sm bg-gray-50 border rounded mt-2 p-2" readonly>${item.generated_text}</textarea>
                    
                    <div class="mt-2 flex gap-2">
                        <button data-target-id="${textareaId}" class="copy-f2-btn bg-gray-600 text-white py-1 px-3 rounded-md text-sm hover:bg-gray-700">본문 복사</button>
                        <button data-target-id="${textareaId}" data-item-id="${item.id}" class="edit-f2-btn bg-purple-600 text-white py-1 px-3 rounded-md text-sm hover:bg-purple-700">수정하기</button>
                    </div>
                    </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;

    // [신규] F2의 수정/복사 리스너를 Expert 자소서 목록 컨테이너에도 동일하게 적용
    attachF2EditListeners(container);
}

// --- 4C. 공통 모달 렌더링 함수 ---

/**
 * [신규] 모달에 들어갈 HTML을 생성하는 헬퍼 함수
 * [수정] Expert일 때 자소서 렌더링하는 로직 제거
 */
function getModalHtml(resultJson, type) {
    let html = '';

    // ▼▼▼ [수정] 이 섹션 전체가 삭제됨 ▼▼▼
    // [Expert 전용] 보완된 자소서 섹션
    // if (type === 'Expert' && resultJson.improved_cover_letters) { ... }
    // ▲▲▲ [수정] 삭제 ▲▲▲

    // [공통] 종합 평가
    html += `
        <div class="p-6 border rounded-lg bg-white">
            <h4 class="font-bold text-lg mb-2">📊 종합 평가</h4>
            <p class="text-gray-600">${resultJson.overall || '데이터 없음'}</p>
        </div>
    `;

    // [공통] 역량 그래프 및 합격 Tip
    html += `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-6 border rounded-lg bg-white">
                <h4 class="font-bold text-lg mb-4">⭐ 역량 분석 그래프</h4>
                <div class="h-80"><canvas id="modal-radar-chart"></canvas></div>
            </div>
            <div class="p-6 border rounded-lg bg-white flex flex-col justify-center">
                <h4 class="font-bold text-lg mb-2 text-indigo-700">💡 합격을 위한 Tip</h4>
                <p class="text-gray-700">${resultJson.tip || '데이터 없음'}</p>
            </div>
        </div>
    `;

    // [공통] 답변 개선 스크립트
    if (resultJson.improved_scripts && resultJson.improved_scripts.length > 0) {
        html += `
            <div class="p-6 border rounded-lg bg-white">
                <h4 class="font-bold text-lg mb-4">✍️ 답변 개선 스크립트</h4>
                <div class="space-y-6">
                ${resultJson.improved_scripts.map(item => `
                    <div>
                        <p class="text-sm font-semibold text-gray-600 mb-1">나의 답변:</p>
                        <p class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md mb-2">${item.user_answer}</p>
                        <p class="text-sm font-semibold text-purple-700 mb-1">💡 레디의 개선 스크립트:</p>
                        <p class="text-sm text-purple-900 bg-purple-50 p-2 rounded-md">${item.improved_script}</p>
                    </div>
                `).join('')}
                </div>
            </div>
        `;
    }
    return html;
}

/**
 * F3 또는 Expert의 결과 JSON을 받아 모달을 열고 차트를 그리는 함수
 */
function openResultModal(resultJson, type) {
    const modal = document.getElementById('mypage-modal');
    const content = document.getElementById('modal-content');

    // 1. HTML 생성 및 삽입 (getModalHtml에서 Expert 자소서 부분이 제거됨)
    content.innerHTML = getModalHtml(resultJson, type);

    // 2. 모달 표시
    modal.classList.remove('hidden');

    // 3. 차트 그리기
    if (mypageRadarChart) {
        mypageRadarChart.destroy();
    }

    const ctx = document.getElementById('modal-radar-chart')?.getContext('2d');
    if (ctx && resultJson.scores) {
        mypageRadarChart = new Chart(ctx, {
            type: "radar",
            data: {
                labels: Object.keys(resultJson.scores),
                datasets: [{
                    label: "역량 점수",
                    data: Object.values(resultJson.scores),
                    backgroundColor: "rgba(160, 140, 218, 0.2)",
                    borderColor: "#A08CDA",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { r: { beginAtZero: true, max: 100 } },
                animation: {
                    duration: 0
                }
            }
        });
    }
}

/**
 * 모달 닫기 함수
 */
function closeResultModal() {
    if (mypageRadarChart) {
        mypageRadarChart.destroy();
        mypageRadarChart = null;
    }
    document.getElementById('mypage-modal').classList.add('hidden');
    document.getElementById('modal-content').innerHTML = '';
}

// --- 5. [신규] 공통 헬퍼 함수 (삭제, PDF, F2수정) ---

/**
 * [신규] 삭제 버튼 핸들러
 */
async function handleDelete(itemId, tableName, itemElement) {
    if (!confirm('정말로 이 이력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 DB에서 영구히 삭제됩니다.')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from(tableName)
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        itemElement.style.transition = 'opacity 0.5s';
        itemElement.style.opacity = '0';
        setTimeout(() => {
            itemElement.remove();
        }, 500);

    } catch (error) {
        console.error('삭제 실패:', error);
        alert('이력 삭제에 실패했습니다: ' + error.message);
    }
}

/**
 * [신규] PDF 다운로드 버튼 핸들러
 * (getModalHtml이 수정되었으므로 이 함수는 수정할 필요 없음)
 */
async function handlePdfDownload(itemId, tableName, type, button) {
    const originalText = button.textContent;
    button.textContent = '생성 중...';
    button.disabled = true;
    document.getElementById('mypage-pdf-loader').classList.remove('hidden');

    try {
        const { data, error } = await supabaseClient
            .from(tableName)
            .select('result_json')
            .eq('id', itemId)
            .single();

        if (error || !data) throw new Error('결과 데이터를 불러오지 못했습니다.');

        const resultJson = data.result_json;

        const tempDiv = document.createElement('div');
        tempDiv.id = 'temp-pdf-render-container';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '24px';
        tempDiv.style.fontFamily = "'Noto Sans KR', sans-serif";
        tempDiv.className = 'space-y-6';

        // [수정] 자소서가 제거된 HTML이 반환됨
        tempDiv.innerHTML = getModalHtml(resultJson, type);
        document.body.appendChild(tempDiv);

        const ctx = tempDiv.querySelector('#modal-radar-chart')?.getContext('2d');
        if (ctx && resultJson.scores) {
            new Chart(ctx, {
                type: "radar",
                data: {
                    labels: Object.keys(resultJson.scores),
                    datasets: [{
                        label: "역량 점수",
                        data: Object.values(resultJson.scores),
                        backgroundColor: "rgba(160, 140, 218, 0.2)",
                        borderColor: "#A08CDA",
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: true,
                    scales: { r: { beginAtZero: true, max: 100 } },
                    animation: {
                        duration: 0
                    }
                }
            });
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        const { jsPDF } = window.jspdf;
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const usableWidth = pdfWidth - 20;
        const imgRatio = canvas.height / canvas.width;
        const finalImgWidth = usableWidth;
        const finalImgHeight = usableWidth * imgRatio;

        let position = 10;
        const pageHeight = pdf.internal.pageSize.getHeight() - 20;

        if (finalImgHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
        } else {
            pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, 0,
                undefined, undefined, 'FAST');
        }
        pdf.save(`ReadyJob_${type}_Report_${itemId}.pdf`);

    } catch (error) {
        console.error('PDF 생성 실패:', error);
        alert('PDF 생성에 실패했습니다: ' + error.message);
    } finally {
        document.getElementById('temp-pdf-render-container')?.remove();
        document.getElementById('mypage-pdf-loader').classList.add('hidden');
        button.textContent = originalText;
        button.disabled = false;
    }
}

/**
 * [신규] F2 자소서 목록(Starter, Expert 공통)에 수정/복사 리스너를 바인딩하는 공통 함수
 * @param {HTMLElement} container - 리스너를 바인딩할 부모 컨테이너 (e.g., mypage-f2-list, mypage-expert-cl-list)
 */
function attachF2EditListeners(container) {
    // 본문 복사
    container.querySelectorAll('.copy-f2-btn').forEach(button => {
        button.onclick = (e) => {
            const targetId = e.currentTarget.dataset.targetId;
            const textarea = document.getElementById(targetId);
            navigator.clipboard.writeText(textarea.value).then(() => {
                e.currentTarget.textContent = "복사 완료!";
                setTimeout(() => { e.currentTarget.textContent = "본문 복사"; }, 2000);
            });
        };
    });

    // 수정하기/저장하기
    container.querySelectorAll('.edit-f2-btn').forEach(button => {
        button.onclick = async (e) => {
            const btn = e.currentTarget;
            const targetId = btn.dataset.targetId;
            const itemId = btn.dataset.itemId;
            const textarea = document.getElementById(targetId);

            if (btn.textContent === '수정하기') {
                textarea.readOnly = false;
                textarea.classList.remove('bg-gray-50');
                textarea.classList.add('bg-white', 'focus:ring-2', 'focus:ring-purple-500');
                textarea.focus();
                btn.textContent = '저장하기';
                btn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
            } else {
                const newText = textarea.value;
                btn.textContent = '저장 중...';
                btn.disabled = true;
                const { error } = await supabaseClient
                    .from('generated_cover_letters')
                    .update({ generated_text: newText })
                    .eq('id', itemId);

                if (error) {
                    alert('저장에 실패했습니다: ' + error.message);
                    btn.textContent = '저장하기';
                    btn.disabled = false;
                } else {
                    textarea.readOnly = true;
                    textarea.classList.add('bg-gray-50');
                    textarea.classList.remove('bg-white', 'focus:ring-2', 'focus:ring-purple-500');
                    btn.textContent = '수정하기';
                    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    btn.classList.add('bg-purple-600', 'hover:bg-purple-700');
                    btn.disabled = false;
                    alert('저장되었습니다.');
                }
            }
        };
    });
}