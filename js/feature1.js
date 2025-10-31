// --- [2차 분리] 자기 분석 (F1) ---

// 1. core.js에서 공유 자원 import
import { 
    appState, 
    saveUserData, 
    showView,
    industries, 
    jobCategories, 
    jobDuties, 
    majors 
} from './core.js';

// --- F1 카드 상태 업데이트 함수 ---
export function updateF1CardStates() {
    const { jobInfo, jobValueResult, personalityResult, workStyleResult, socialExperiences } = appState.feature1Data;
    const completionStatus = {
        'f1-card-job': jobInfo,
        'f1-card-jobValue': jobValueResult,
        'f1-card-personality': personalityResult,
        'f1-card-workStyle': workStyleResult,
        'f1-card-experience': socialExperiences.length > 0
    };

    for (const [cardId, isCompleted] of Object.entries(completionStatus)) {
        const card = document.getElementById(cardId);
        if (!card) continue;

        card.querySelector('.completion-badge')?.remove();
        card.querySelector('.card-button-container')?.remove();

        if (isCompleted) {
            card.classList.add('completed');
            if (cardId !== 'f1-card-experience') card.classList.remove('cursor-pointer');
            card.style.position = 'relative';

            const badge = document.createElement('div');
            badge.className = 'completion-badge';
            badge.textContent = '✔️ 완료';
            card.appendChild(badge);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'card-button-container';

            const viewResultButton = document.createElement('button');
            viewResultButton.className = 'view-result-button';
            viewResultButton.textContent = '결과보기';
            viewResultButton.dataset.targetCard = cardId;
            viewResultButton.onclick = (e) => {
                e.stopPropagation();
                const targetCardId = e.currentTarget.dataset.targetCard;
                const container = document.getElementById('feature1-section');
                if (targetCardId === 'f1-card-job') {
                    container.innerHTML = getF1JobResultHTML(appState.feature1Data.jobInfo);
                    document.getElementById('f1-back-btn').onclick = () => {
                        container.innerHTML = getFeature1HTML();
                        updateF1CardStates();
                        bindFeature1Listeners();
                    };
                    return;
                }
                const cardTypeMap = { 'f1-card-jobValue': 'jobValue', 'f1-card-personality': 'personality', 'f1-card-workStyle': 'workStyle' };
                const resultKeyMap = { 'f1-card-jobValue': 'jobValueResult', 'f1-card-personality': 'personalityResult', 'f1-card-workStyle': 'workStyleResult' };
                if (cardTypeMap[targetCardId]) {
                    handleCardClick(cardTypeMap[targetCardId], resultKeyMap[targetCardId], true);
                }
            };

            const resetButton = document.createElement('button');
            resetButton.className = 'reset-button';
            resetButton.textContent = '초기화';
            resetButton.dataset.resetTarget = cardId;
            resetButton.onclick = (e) => {
                e.stopPropagation();
                if (confirm('정말로 이 항목을 초기화하고 다시 시작하시겠습니까?')) resetF1Data(cardId);
            };

            if (cardId === 'f1-card-experience') {
                const editButton = document.createElement('button');
                editButton.className = 'view-result-button';
                editButton.textContent = '수정하기';
                editButton.style.flexGrow = '1';
                editButton.onclick = (e) => { e.stopPropagation(); card.click(); };
                buttonContainer.appendChild(editButton);
            } else {
                buttonContainer.appendChild(viewResultButton);
                buttonContainer.appendChild(resetButton);
            }
            card.appendChild(buttonContainer);
        } else {
            card.classList.remove('completed');
            card.classList.add('cursor-pointer');
            card.style.position = '';
        }
    }
}

function resetF1Data(cardId) {
    switch (cardId) {
        case 'f1-card-job': appState.feature1Data.jobInfo = null; break;
        case 'f1-card-jobValue': appState.feature1Data.jobValueResult = null; break;
        case 'f1-card-personality': appState.feature1Data.personalityResult = null; break;
        case 'f1-card-workStyle': appState.feature1Data.workStyleResult = null; break;
        case 'f1-card-experience': appState.feature1Data.socialExperiences = []; break;
    }
    saveUserData(appState.currentUser, appState.feature1Data); // core.js
    const container = document.getElementById('feature1-section');
    container.innerHTML = getFeature1HTML();
    updateF1CardStates();
    bindFeature1Listeners();
}

// --- F1 HTML 생성 함수 ---
export function getFeature1HTML() {
    return `
                <div class="mb-4">
                    <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                        &larr; 대시보드로 돌아가기
                    </button>
                </div>
                <div class="text-center mb-10">
                    <h2 class="text-3xl font-bold">자기 분석 & 프로필 생성</h2>
                    <p class="text-gray-600 mt-2">자신을 깊이 이해하는 것이 성공적인 취업의 첫걸음입니다. 아래 단계를 통해 자신을 탐색해보세요.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div id="f1-card-job" class="f1-main-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer">
                        <div><h3 class="font-bold text-xl mb-2">1. 희망 직무/산업</h3><p class="text-gray-600">나의 커리어 목표와 방향을 설정합니다.</p></div>
                    </div>
                    <div id="f1-card-jobValue" class="f1-main-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer">
                        <div><h3 class="font-bold text-xl mb-2">2. 직무 가치 진단</h3><p class="text-gray-600">내가 중요하게 생각하는 직업 가치를 찾습니다.</p></div>
                    </div>
                    <div id="f1-card-personality" class="f1-main-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer">
                        <div><h3 class="font-bold text-xl mb-2">3. 개인 성격 진단</h3><p class="text-gray-600">나의 타고난 성격적 강점을 파악합니다.</p></div>
                    </div>
                    <div id="f1-card-workStyle" class="f1-main-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between cursor-pointer">
                        <div><h3 class="font-bold text-xl mb-2">4. 업무 성향 진단</h3><p class="text-gray-600">팀 안에서 나의 역할과 시너지를 알아봅니다.</p></div>
                    </div>
                    <div id="f1-card-experience" class="f1-main-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1 flex flex-col justify-between cursor-pointer">
                        <div><h3 class="font-bold text-xl mb-2">5. 나의 사회 경험</h3><p class="text-gray-600">흩어져 있는 나의 경험들을 자산으로 만듭니다.</p></div>
                    </div>
                </div>
            `;
}

function getF1JobHTML() {
    // core.js에서 import한 정적 데이터 사용
    return ` <div class="bg-white p-6 sm:p-8 rounded-lg shadow-lg"> <h3 class="font-bold text-2xl mb-6">1. 희망 직무/산업 설정</h3> <div class="space-y-8"> ${((t, o, n, a, l) => { const e = o.map((t => `<div class="selection-box" data-value="${t}">${t}</div>`)).join(""); return ` <div> <label class="block text-sm font-medium text-gray-700 mb-2">${t} <span class="text-xs text-gray-500">${l}</span></label> <div id="${n}" class="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-gray-50"> ${e} </div> <div class="mt-2 flex items-center gap-2"> <label for="${n}-other" class="text-sm font-medium text-gray-700 whitespace-nowrap">기타:</label> <input id="${n}-other" type="text" class="w-full rounded-md border-gray-300 text-sm shadow-sm" placeholder="선택지에 없는 경우 직접 입력"> </div> </div>` })("희망 산업군", industries, "f1-industry-container", 2, "최대 2개 선택")} ${((t, o, n, a, l) => { const e = o.map((t => `<div class="selection-box" data-value="${t}">${t}</div>`)).join(""); return ` <div> <label class="block text-sm font-medium text-gray-700 mb-2">${t} <span class="text-xs text-gray-500">${l}</span></label> <div id="${n}" class="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-gray-50"> ${e} </div> <div class="mt-2 flex items-center gap-2"> <label for="${n}-other" class="text-sm font-medium text-gray-700 whitespace-nowrap">기타:</label> <input id="${n}-other" type="text" class="w-full rounded-md border-gray-300 text-sm shadow-sm" placeholder="선택지에 없는 경우 직접 입력"> </div> </div>` })("희망 직종", jobCategories, "f1-job-category-container", 3, "최대 3개 선택")} ${((t, o, n, a, l) => { const e = o.map((t => `<div class="selection-box" data-value="${t}">${t}</div>`)).join(""); return ` <div> <label class="block text-sm font-medium text-gray-700 mb-2">${t} <span class="text-xs text-gray-500">${l}</span></label> <div id="${n}" class="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-gray-50"> ${e} </div> <div class="mt-2 flex items-center gap-2"> <label for="${n}-other" class="text-sm font-medium text-gray-700 whitespace-nowrap">기타:</label> <input id="${n}-other" type="text" class="w-full rounded-md border-gray-300 text-sm shadow-sm" placeholder="선택지에 없는 경우 직접 입력"> </div> </div>` })("희망 직무", jobDuties, "f1-job-duties-container", 4, "최대 4개 선택")} ${((t, o, n, a, l) => { const e = o.map((t => `<div class="selection-box" data-value="${t}">${t}</div>`)).join(""); return ` <div> <label class="block text-sm font-medium text-gray-700 mb-2">${t} <span class="text-xs text-gray-500">${l}</span></label> <div id="${n}" class="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-gray-50"> ${e} </div> <div class="mt-2 flex items-center gap-2"> <label for="${n}-other" class="text-sm font-medium text-gray-700 whitespace-nowrap">기타:</label> <input id="${n}-other" type="text" class="w-full rounded-md border-gray-300 text-sm shadow-sm" placeholder="선택지에 없는 경우 직접 입력"> </div> </div>` })("전공", majors, "f1-major-container", 1, "전공을 선택하거나 직접 입력하세요")} <div class="flex justify-end space-x-2 pt-4 border-t"> <button id="f1-back-btn" class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">이전</button> <button id="f1-job-save-btn" class="pastel-bg-primary pastel-bg-primary-hover text-white py-2 px-4 rounded-md">저장하기</button> </div> </div> </div> `;
}

function getF1JobResultHTML(jobInfo) {
    return ` <div class="bg-white p-6 sm:p-8 rounded-lg shadow-lg"> <h3 class="font-bold text-2xl mb-8 text-center">희망 직무/산업 설정 결과</h3> <div class="prose max-w-none"> <div class="result-card bg-gray-50 p-6"> ${((t, o) => { if (!o || 0 === o.length) return ""; return ` <div class="mb-6"> <h4 class="font-semibold text-lg text-gray-800 border-b pb-2 mb-3">${t}</h4> <ul class="list-disc list-inside text-gray-700 space-y-1"> ${o.map((t => `<li>${t}</li>`)).join("")} </ul> </div>` })("희망 산업군", jobInfo.industry)} ${((t, o) => { if (!o || 0 === o.length) return ""; return ` <div class="mb-6"> <h4 class="font-semibold text-lg text-gray-800 border-b pb-2 mb-3">${t}</h4> <ul class="list-disc list-inside text-gray-700 space-y-1"> ${o.map((t => `<li>${t}</li>`)).join("")} </ul> </div>` })("희망 직종", jobInfo.jobCategory)} ${((t, o) => { if (!o || 0 === o.length) return ""; return ` <div class="mb-6"> <h4 class="font-semibold text-lg text-gray-800 border-b pb-2 mb-3">${t}</h4> <ul class="list-disc list-inside text-gray-700 space-y-1"> ${o.map((t => `<li>${t}</li>`)).join("")} </ul> </div>` })("희망 직무", jobInfo.jobDuties)} ${((t, o) => { if (!o || 0 === o.length) return ""; return ` <div class="mb-6"> <h4 class="font-semibold text-lg text-gray-800 border-b pb-2 mb-3">${t}</h4> <ul class="list-disc list-inside text-gray-700 space-y-1"> ${o.map((t => `<li>${t}</li>`)).join("")} </ul> </div>` })("전공", jobInfo.major)} </div> </div> <div class="flex justify-end mt-6"> <button id="f1-back-btn" class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">돌아가기</button> </div> </div> `;
}

function getF1ExperienceHTML() {
    return ` <div class="bg-white rounded-lg shadow-lg"> <div class="p-6 sm:p-8"> <h3 class="text-2xl font-bold mb-6 border-b pb-4">5. 나의 사회 경험 기록하기</h3> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div class="lg:col-span-1 space-y-6"> <div> <label for="f1-exp-type" class="form-label"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> 경험 유형 </label> <select id="f1-exp-type" class="w-full rounded-md border-gray-300 shadow-sm"> <option>직장 경력</option><option>인턴</option><option>아르바이트</option><option>동아리 활동</option><option>수상 경력</option><option value="기타">기타 (직접입력)</option> </select> <input id="f1-exp-type-other" type="text" placeholder="경험 유형 직접입력" class="hidden w-full rounded-md border-gray-300 shadow-sm mt-2"> </div> <div> <label for="f1-exp-org" class="form-label"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> 조직명 / 활동명 </label> <input id="f1-exp-org" type="text" placeholder="예: ReadyJob 컴퍼니, 마케팅 공모전" class="w-full rounded-md border-gray-300 placeholder:text-gray-400"> </div> <div> <label class="form-label"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg> 수행 기간 </label> <div class="grid grid-cols-2 gap-2 items-center"> <select id="f1-exp-start-year" class="w-full rounded-md border-gray-300"></select> <select id="f1-exp-start-month" class="w-full rounded-md border-gray-300"></select> <select id="f1-exp-end-year" class="w-full rounded-md border-gray-300"></select> <select id="f1-exp-end-month" class="w-full rounded-md border-gray-300"></select> </div> <div class="mt-2 flex items-center"> <input id="f1-exp-present" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"> <label for="f1-exp-present" class="ml-2 block text-sm text-gray-900">현재 활동중</label> </div> </div> <div> <label class="form-label"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> 주요 활동 및 과업 </label> <div id="f1-exp-tasks-container"></div> <button type="button" id="add-task-btn" class="add-task-btn"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> 항목 추가 </button> </div> <div> <label for="f1-exp-notes" class="form-label"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> 활동 소감 및 배운 점 <span class="text-sm font-normal text-gray-500 ml-2">(선택사항)</span> </label> <textarea id="f1-exp-notes" rows="3" placeholder="활동을 통해 배우고 느낀 점을 자유롭게 작성해주세요." class="w-full rounded-md border-gray-300 placeholder:text-gray-400"></textarea> </div> <button id="f1-add-exp-btn" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-semibold text-lg">경험 추가하기</button> </div> <div class="lg:col-span-1"> <h4 class="text-xl font-bold mb-4">나의 경험 목록</h4> <div id="f1-experience-list" class="space-y-4 max-h-[600px] overflow-y-auto pr-2"> <p class="text-gray-500 text-center py-8">아직 추가된 경험이 없습니다.</p> </div> </div> </div> </div> <div class="bg-gray-50 px-6 py-4 flex justify-end"> <button id="f1-back-btn" class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">메인으로 돌아가기</button> </div> </div> `;
}

function getQuizHTML(quizType) {
    const quizzes = {
        jobValue: {
            title: "2. 직무 가치 진단",
            description: "직업 선택 시 중요하게 생각하는 가치에 대해 답해주세요.",
            questions: ["난이도 있는 과제를 맡으면 의욕이 크게 오른다.", "성과(또는 결과)가 수치나 지표로 확인될 때 일의 재미가 커진다.", "결과 책임이 분명한 역할에 끌린다.", "내 기여가 공식 발표나 리포트에 명시되는 환경이 좋다.", "전문가로 평가받고 영향력을 넓히는 것이 중요하다.", "성과(또는 결과)에 대한 피드백이 빠르고 공개적으로 주어지면 동기가 생긴다.", "업무 우선순위를 내가 설계하고 결정 할 수 있어야 몰입한다.", "세부 방법까지 지시받기보다 결과만 위임받는 것을 선호한다.", "스스로 결정한 계획을 스스로 조정하며 일하고 싶다.", "새로운 도구나 방식을 시험해보는 업무가 즐겁다.", "문제를 기존 규칙대로 처리하기보다 다른 각도에서 풀어보려 한다.", "작은 개선이라도 실험해 보고 학습하는 문화를 원한다.", "변동이 적고 예측 가능한 일정과 보상이 중요하다.", "안전하고 과부하가 적절히 관리되는 환경에서 최고의 성과를 낸다.", "장기 계획이 가능한 직무를 선호한다.", "서로 돕는 팀 문화에서 일할 때 성과가 잘 난다.", "필요한 자원과 도움을 요청했을 때 즉시 연결되는 체계를 중시한다.", "동료와 신뢰 관계를 쌓는 시간이 업무만큼 중요하다."]
        },
        personality: {
            title: "3. 개인 성격 진단",
            description: "자신을 가장 잘 설명하는 문항에 가깝게 답해주세요.",
            questions: ["나는 새로운 동료와 빠르게 친해질 수 있다.", "사람들과 어울리면 에너지가 생긴다.", "회의나 모임에서 의견을 적극적으로 말한다.", "낯선 상황에서도 쉽게 대화를 시작한다.", "동료가 힘들어하면 도와주고 싶은 마음이 든다.", "상대방의 감정을 이해하려 노력한다.", "협업 시 타인의 의견을 존중한다.", "갈등 상황에서 상대의 입장을 먼저 들어본다.", "맡은 일은 끝까지 책임지고 완수한다.", "작은 일이라도 꼼꼼히 처리하려 한다.", "마감 기한을 철저히 지킨다.", "결과에 대한 책임을 회피하지 않는다.", "스트레스 상황에서도 침착하게 대응한다.", "예기치 못한 변화가 와도 쉽게 무너지지 않는다.", "중요한 순간에 감정을 잘 조절한다.", "압박 속에서도 차분함을 유지한다.", "새로운 아이디어를 떠올리는 것을 즐긴다.", "낯선 방식이라도 시도해보려 한다.", "기존 방식을 개선할 방법을 고민한다.", "창의적인 아이디어를 실행에 옮기려 한다."]
        },
        workStyle: {
            title: "4. 업무 성향 진단",
            description: "업무 중 특정 상황에서 당신이 할 행동과 가장 가까운 것을 선택해주세요. (1순위, 2순위를 순서대로 클릭)",
            questions: [{
                scenario: "Q1. 당신은 회사에서 신규 프로젝트에 배정되었습니다. 당신이 가장 먼저 하고 싶은 일은 무엇인가요?",
                options: [{
                    text: "프로젝트의 목표와 최종 결과물을 명확히 정의하고, 내가 주도적으로 이끌어 간다.",
                    value: "주도지향성"
                }, {
                    text: "팀원들과 친해지고 서로를 알게 되는 시간을 가지면서 서로의 강점과 역할을 파악한다.",
                    value: "협력지향성"
                }, {
                    text: "전체 프로젝트의 일정과 세부적인 업무 진행 방향과 순서를 먼저 설계한다.",
                    value: "체계지향성"
                }, {
                    text: "일단 가볍게 시작해보고, 진행하면서 구체적인 계획과 역할을 정립해나간다.",
                    value: "유연지향성"
                }, {
                    text: "이 프로젝트에서 시도해볼 만한 새로운 기술이나 창의적인 방법은 없는지 리서치한다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q2. 팀 프로젝트 마감이 임박했는데, 예상치 못한 문제가 발생했습니다. 당신의 첫 번째 행동은 무엇인가요?",
                options: [{
                    text: "즉시 회의를 소집하고, 문제 해결을 위한 역할 분담을 빠르게 결정한다.",
                    value: "주도지향성"
                }, {
                    text: "당황한 팀원들을 진정시키고, 함께 해결 방안을 논의하자고 제안한다.",
                    value: "협력지향성"
                }, {
                    text: "문제의 원인을 단계별로 분석하고, 계획에 차질이 없도록 대안을 마련한다.",
                    value: "체계지향성"
                }, {
                    text: "일단 문제를 빠르게 해결할 수 있는 임시방편을 찾아 적용하고, 상황에 맞춰 대응한다.",
                    value: "유연지향성"
                }, {
                    text: "이 문제를 계기로 기존 프로세스 자체를 개선할 수 있는 새로운 방법을 모색한다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q3. 팀 회의 중, 당신의 의견과 다른 팀원의 의견이 충돌했습니다. 어떻게 대응하시겠습니까?",
                options: [{
                    text: "논의가 길어지지 않도록 최종 결정권자에게 의견을 제시하고, 빠르게 결정을 내리도록 이끈다.",
                    value: "주도지향성"
                }, {
                    text: "상대방의 의견을 먼저 경청하고, 공통의 목표를 위해 절충안을 찾으려 노력한다.",
                    value: "협력지향성"
                }, {
                    text: "각 의견의 장단점을 데이터에 기반하여 객관적으로 비교하고, 가장 합리적인 안을 선택하자고 설득한다.",
                    value: "체계지향성"
                }, {
                    text: "상황이 변했으니 두 의견 모두를 잠시 보류하고, 현재 상황에 더 적합한 제3의 대안을 찾아보자고 제안한다.",
                    value: "유연지향성"
                }, {
                    text: "두 의견을 결합하거나 완전히 새로운 관점에서 문제를 해결할 창의적인 아이디어를 제시한다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q4. 당신에게 중요하고 복잡한 업무가 주어졌습니다. 선호하는 업무 방식은 무엇인가요?",
                options: [{
                    text: "업무의 최종 목표와 권한을 위임받아, 내 방식대로 책임지고 처리한다.",
                    value: "주도지향성"
                }, {
                    text: "관련 동료들과 정기적으로 진행 상황을 공유하고, 피드백을 받으며 함께 진행한다.",
                    value: "협력지향성"
                }, {
                    text: "업무를 가장 작은 단위로 나누고, 체크리스트를 만들어 순서대로 완벽하게 처리한다.",
                    value: "체계지향성"
                }, {
                    text: "상황 변화에 즉시 대응할 수 있도록, 여러 가지 대안을 염두에 두고 유연하게 처리한다.",
                    value: "유연지향성"
                }, {
                    text: "정해진 방식에 얽매이지 않고, 더 효율적인 방법이 있다면 과감하게 시도하며 진행한다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q5. 프로젝트가 성공적으로 끝났습니다. 당신에게 가장 큰 보람을 느끼게 하는 것은 무엇인가요?",
                options: [{
                    text: "나의 리더십과 결정 덕분에 프로젝트가 성공했다는 인정을 받는 것.",
                    value: "주도지향성"
                }, {
                    text: "힘든 과정을 함께 이겨낸 동료들과 성취감을 나누고, 팀워크가 더 단단해진 것.",
                    value: "협력지향성"
                }, {
                    text: "처음에 세웠던 꼼꼼한 계획이 차질 없이 실행되어 완벽한 결과로 이어진 것.",
                    value: "체계지향성"
                }, {
                    text: "예상치 못한 위기들을 유연하게 대처하여 결국 좋은 결과로 만들어낸 과정.",
                    value: "유연지향성"
                }, {
                    text: "프로젝트에 적용했던 새로운 아이디어가 성공적인 결과로 이어진 것.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q6. 지루하고 반복적인 업무를 처리해야 할 때, 당신의 방식은 무엇인가요?",
                options: [{
                    text: "다른 중요한 업무에 방해되지 않도록, 집중해서 빠르게 끝내버린다.",
                    value: "주도지향성"
                }, {
                    text: "동료와 함께 이야기하며 즐겁게 하거나, 우리 팀 전체의 효율을 높일 방법을 고민한다.",
                    value: "협력지향성"
                }, {
                    text: "실수하지 않도록 정해진 절차에 따라 꼼꼼하게 처리하고, 체크리스트를 만든다.",
                    value: "체계지향성"
                }, {
                    text: "업무의 우선순위를 고려해, 다른 급한 일이 생기면 잠시 미뤄두고 유연하게 처리한다.",
                    value: "유연지향성"
                }, {
                    text: "이 작업을 더 빠르고 쉽게 할 수 있는 자동화 방법이나 새로운 툴은 없는지 찾아본다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q7. 동료로부터 당신의 업무 방식에 대한 예상치 못한 피드백(지적)을 받았습니다. 당신의 반응은?",
                options: [{
                    text: "피드백을 준 동료에게 감사함을 표하고, 개선점을 찾아 다음 업무에 주도적으로 적용한다.",
                    value: "주도지향성"
                }, {
                    text: "기분 상할 수 있지만, 팀의 성과를 위한 조언이라 생각하고 열린 마음으로 대화한다.",
                    value: "협력지향성"
                }, {
                    text: "피드백의 내용을 객관적으로 분석하고, 개선할 부분이 있다면 즉시 계획에 반영한다.",
                    value: "체계지향성"
                }, {
                    text: "피드백을 준 동료의 의도와 현재 상황을 종합적으로 고려하여 유연하게 대처한다.",
                    value: "유연지향성"
                }, {
                    text: "나와 다른 관점의 피드백을 새로운 아이디어를 얻을 기회로 생각한다.",
                    value: "혁신지향성"
                }]
            }, {
                scenario: "Q8. 상사로부터 업무 지시를 받았지만, 목표나 방법이 매우 모호합니다. 어떻게 행동하겠습니까?",
                options: [{
                    text: "즉시 상사에게 찾아가 질문하여 업무의 목표(Goal), 역할(Role), 결과물(Output)을 명확히 한다.",
                    value: "주도지향성"
                }, {
                    text: "이 업무를 경험해봤을 동료에게 먼저 다가가 조언을 구하고, 함께 방향을 논의한다.",
                    value: "협력지향성"
                }, {
                    text: "모호한 부분을 명확히 하기 위해, 업무의 배경, 범위, 제약 조건 등을 체계적으로 정리하여 질문한다.",
                    value: "체계지향성"
                }, {
                    text: "일단 내가 이해한 방향으로 업무를 시작하고, 중간 결과물을 만들어 공유하며 방향을 맞춰나간다.",
                    value: "유연지향성"
                }, {
                    text: "이 모호한 상황을 오히려 기회로 삼아, 기존에 없던 창의적인 방식으로 업무를 정의하고 시도해본다.",
                    value: "혁신지향성"
                }]
            }]
        }
    };
    let questionsHTML = "";
    const quizData = quizzes[quizType];
    
    // --- [수정] workStyle 퀴즈 HTML 생성 방식 변경 (1순위/2순위) ---
    if ("workStyle" === quizType) {
        questionsHTML = quizData.questions.map(((t, e) => ` 
        <div class="scenario-question" data-question-index="${e}"> 
            <p>${t.scenario}</p> 
            <div> 
                ${t.options.map(((t, o) => ` 
                    <div class="scenario-option work-style-option" data-value="${t.value}">
                        <span>${t.text}</span>
                        <span class="priority-badge"></span> 
                    </div>
                `)).join("")} 
            </div> 
        </div> 
        `)).join("");
    // --- [수정 끝] ---
    } else if ("personality" === quizType) {
        const t = ["😠", "😟", "🤔", "😊", "😄"];
        questionsHTML = quizData.questions.map(((o, e) => ` <div class="mb-4 p-4 border rounded-lg bg-white shadow-sm"> <p class="font-medium mb-4 text-gray-800 text-center">${e + 1}. ${o}</p> <div class="quiz-options-container"> <span class="text-sm text-gray-500 hidden sm:inline">전혀 아니다</span> <div class="flex-grow flex justify-center items-center space-x-2 sm:space-x-4 mx-4"> ${t.map(((t, i) => ` <div> <input type="radio" name="q${e}" id="q${e}v${i + 1}" value="${i + 1}"> <label for="q${e}v${i + 1}">${t}</label> </div>`)).join("")} </div> <span class="text-sm text-gray-500 hidden sm:inline">매우 그렇다</span> </div> </div> `)).join("")
    } else {
        questionsHTML = quizData.questions.map(((t, e) => ` <div class="mb-4 p-4 border rounded-lg bg-white shadow-sm"> <p class="font-medium mb-4 text-gray-800 text-center">${e + 1}. ${t}</p> <div class="quiz-options-container"> <span class="text-sm text-gray-500">전혀 아니다</span> <div class="flex-grow flex justify-center items-center space-x-2 sm:space-x-4 mx-4"> ${[1, 2, 3, 4, 5].map((t => ` <div> <input type="radio" name="q${e}" id="q${e}v${t}" value="${t}"> <label for="q${e}v${t}" class="w-11 h-11 text-base">${t}</label> </div>`)).join("")} </div> <span class="text-sm text-gray-500">매우 그렇다</span> </div> </div> `)).join("");
    }

    return ` <div class="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-inner"> <h3 class="font-bold text-2xl mb-2">${quizData.title}</h3> <p class="text-gray-600 mb-8">${quizData.description}</p> <form id="f1-quiz-form" data-quiz-type="${quizType}"> ${questionsHTML} <div class="flex justify-end space-x-2 mt-8"> <button type="button" id="f1-back-btn" class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">이전</button> <button type="submit" class="pastel-bg-primary pastel-bg-primary-hover text-white py-2 px-4 rounded-md">결과 보기</button> </div> </form> </div> `
}

function getResultHTML(quizType) {
    return ` <div id="f1-result-container" class="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-inner"> <h2 class="font-bold text-3xl mb-6 text-center">${{ jobValue: "직무 가치 진단 결과", personality: "개인 성격 진단 결과", workStyle: "업무 성향 진단 결과" }[quizType]}</h2> <div id="f1-loader" class="flex justify-center my-8"><div class="loader"></div></div> <div id="f1-result-content" class="prose max-w-none hidden"></div> <div class="flex justify-end space-x-2 mt-8"> <button id="f1-back-btn" class="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">이전</button> <button id="f1-download-btn" class="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 hidden">PDF로 저장</button> </div> </div>`
}

// --- F1 리포트 생성 함수 ---
function generateJobValueReport(answers) {
    const factors = {
        성취: (parseInt(answers.q0) + parseInt(answers.q1) + parseInt(answers.q2)) / 3,
        인정: (parseInt(answers.q3) + parseInt(answers.q4) + parseInt(answers.q5)) / 3,
        자율: (parseInt(answers.q6) + parseInt(answers.q7) + parseInt(answers.q8)) / 3,
        혁신: (parseInt(answers.q9) + parseInt(answers.q10) + parseInt(answers.q11)) / 3,
        환경: (parseInt(answers.q12) + parseInt(answers.q13) + parseInt(answers.q14)) / 3,
        관계: (parseInt(answers.q15) + parseInt(answers.q16) + parseInt(answers.q17)) / 3
    };
    const mainValues = {
        "성장 가치": ((factors.성취 + factors.인정) / 2).toFixed(2),
        "도전 가치": ((factors.자율 + factors.혁신) / 2).toFixed(2),
        "안정 가치": ((factors.환경 + factors.관계) / 2).toFixed(2)
    };
    const sortedValues = Object.entries(mainValues).sort((([, a], [, b]) => b - a));
    const primaryValue = sortedValues[0][0];
    const primaryScore = sortedValues[0][1];
    return ` <div class="result-card"> <h3>📊 총평</h3> <p>진단 결과, 당신은 <strong>'${primaryValue}'</strong>를 가장 중요하게 생각하는 유형입니다. (평균 ${primaryScore}점) 이는 직업을 통해 '${{ "성장 가치": "가시적인 성과를 내고 전문가로 성장하는 것", "도전 가치": "업무에 대한 주도권을 갖고 새로운 시도를 하는 것", "안정 가치": "안정적인 환경에서 동료들과 신뢰를 쌓으며 일하는 것" }[primaryValue]}'에서 가장 큰 동기부여와 만족감을 얻는다는 것을 의미합니다. 자신의 핵심 가치를 이해하고, 이를 충족시킬 수 있는 기업과 직무를 선택하는 것이 성공적인 커리어의 첫걸음입니다. 자소서나 면접에서 '왜 이 직무를 선택했는가'라는 질문에 자신의 핵심 가치를 연결하여 답변한다면 진정성 있는 스토리를 만들 수 있습니다.</p> </div> <div class="result-card"> <h3>⭐ 강점 및 보완점</h3> <p><strong>강점:</strong> 높은 '${primaryValue}'는 해당 가치가 보장되는 환경에서 누구보다 높은 몰입도와 성과를 낼 수 있는 강력한 동력이 됩니다. 자신의 가치와 일치하는 목표가 주어졌을 때, 열정적으로 업무를 수행하며 빠르게 성장할 수 있습니다. 이는 힘든 상황에서도 포기하지 않고 나아가게 하는 내적 동기로 작용하여, 장기적인 커리어 성공에 긍정적인 영향을 미칩니다.</p> <p><strong>보완점:</strong> 반면, '${primaryValue}'가 충족되지 않는 환경에서는 상대적으로 스트레스를 받거나 동기부여가 저하될 수 있습니다. 예를 들어, '${primaryValue}'가 높은 사람이 '${{ "성장 가치": "성장이나 인정이 더딘 조직", "도전 가치": "규율이 엄격하고 변화가 적은 조직", "안정 가치": "경쟁이 치열하고 개인 성과만 강조하는 조직" }[primaryValue]}'에 속할 경우 어려움을 겪을 수 있습니다. 따라서 지원하려는 기업의 문화와 가치 체계를 미리 파악하는 것이 중요합니다. 또한, 여러 가치 간의 균형을 맞추려는 노력도 필요합니다. 예를 들어 '성장'을 중시하더라도 '안정'의 가치를 완전히 무시하면 번아웃에 취약해질 수 있습니다.</p> </div> <div class="result-card"> <h3>📈 3대 직무 가치 그래프</h3> <p>아래 그래프는 당신의 3가지 주요 직무 가치에 대한 선호도를 보여줍니다. 점수가 높을수록 해당 가치를 더 중요하게 생각한다는 의미입니다.</p> <div class="max-w-xl mx-auto h-64 md:h-80"><canvas id="jobValueChart"></canvas></div> </div> <div class="result-card"> <h3>💡 추천 직무 및 기업 문화</h3> <p>당신의 최우선 가치인 <strong>'${primaryValue}'</strong>를 고려할 때, 다음과 같은 직무와 환경을 추천합니다. 이는 당신의 잠재력을 최대한 발휘하고 높은 직업 만족도를 얻는 데 도움이 될 것입니다.</p> <ul> ${{ "성장 가치": "<li><strong>추천 직무:</strong> 성과 기반 인센티브가 명확한 영업/마케팅, 컨설팅, IT 개발 직군 또는 전문성을 키울 수 있는 R&D, 데이터 분석 직무. 명확한 목표(KPI)가 주어지고, 그 결과를 통해 역량을 증명할 수 있는 일에서 큰 성취감을 느낄 것입니다.</li><li><strong>추천 환경:</strong> 개인의 성과를 투명하게 공개하고 공정하게 보상하는 문화, 역량 강화를 위한 교육 및 성장 지원이 활발한 기업. 사내 스터디나 컨퍼런스 참여를 장려하는 곳이라면 더욱 좋습니다.</li>", "도전 가치": "<li><strong>추천 직무:</strong> 독립적으로 프로젝트를 리드할 수 있는 PM/PO, 창의성이 중요한 기획/디자인 직군, 혹은 변화가 빠른 스타트업 환경. 정해진 방식보다 새로운 방식을 시도하고 개선하는 과정에서 즐거움을 느낍니다.</li><li><strong>추천 환경:</strong> 마이크로매니징이 적고, 결과에 대한 책임과 권한을 함께 부여하는 수평적인 조직 문화. 실패를 용인하고 실험을 장려하는 '심리적 안전감'이 보장되는 곳에서 잠재력을 폭발시킬 수 있습니다.</li>", "안정 가치": "<li><strong>추천 직무:</strong> 프로세스가 중요한 공공/금융 분야, 안정적인 서비스 운영 직군, 또는 팀워크가 핵심인 인사/총무/교육 직무. 예측 가능한 환경에서 동료들과 협력하며 꾸준히 성과를 쌓아나가는 일에 적합합니다.</li><li><strong>추천 환경:</strong> 장기적인 고용 안정을 보장하고, 동료 간의 협업과 신뢰를 강조하는 공동체적인 기업 문화. 경쟁보다는 협력을, 개인의 영광보다는 팀의 성공을 중시하는 곳에서 편안함을 느낍니다.</li>" }[primaryValue]} </ul> </div> <script> new Chart(document.getElementById('jobValueChart').getContext('2d'), { type: 'bar', data: { labels: ${JSON.stringify(Object.keys(mainValues))}, datasets: [{ label: '직무 가치 점수', data: ${JSON.stringify(Object.values(mainValues))}, backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(34, 197, 94, 0.7)', 'rgba(249, 115, 22, 0.7)'], }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 5 } }, plugins: { legend: { display: false } } } }); <\/script> `;
}

function generatePersonalityReport(answers) {
    const scores = {
        사회관계성: 0,
        공감배려성: 0,
        성실책임성: 0,
        정서안정성: 0,
        창의탐구성: 0
    };
    const factorKeys = Object.keys(scores);
    for (let i = 0; i < 20; i++) scores[factorKeys[Math.floor(i / 4)]] += parseInt(answers[`q${i}`] || 1);
    const sortedPersonality = Object.entries(scores).sort((([, a], [, b]) => b - a));
    const top2 = [sortedPersonality[0], sortedPersonality[1]];
    const bottom2 = [sortedPersonality[4], sortedPersonality[3]];
    const primaryPersonality = sortedPersonality[0][0];
    return ` <div class="result-card"> <h3>📊 총평</h3> <p>당신의 성격에서 가장 두드러지는 특성은 <strong>'${primaryPersonality}'</strong>입니다. 이는 당신이 생각하고 행동하는 방식의 핵심적인 부분으로, 직무와 조직 생활 전반에 영향을 미칩니다. 아래 분석을 통해 자신의 강점을 극대화하고 보완점을 관리함으로써 잠재력을 최대한 발휘할 수 있는 방법을 확인해보세요. 면접에서 "당신의 장점은 무엇인가요?" 라는 질문에 '${primaryPersonality}'의 긍정적인 측면을 구체적인 경험과 함께 제시하면 좋습니다.</p> </div> <div class="result-card"> <h3>📈 개인 성격 진단 그래프</h3> <p>5가지 성격 특성의 분포를 확인해보세요. (총점 20점)</p> <div class="max-w-xl mx-auto h-64 md:h-96"><canvas id="personalityChart"></canvas></div> </div> <div class="result-card"> <h3>⭐ 당신의 강점 (Top 2)</h3> ${top2.map((([key, score]) => { let feedback = ""; switch (key) { case "사회관계성": feedback = "새로운 사람들과 쉽게 어울리고 긍정적인 관계를 형성하는 데 능숙합니다. 당신의 활기찬 에너지는 팀에 활력을 불어넣고, 폭넓은 네트워크는 새로운 기회를 가져오는 중요한 자산이 될 수 있습니다. 특히 외부 고객이나 파트너와의 협업이 중요한 직무에서 탁월한 역량을 발휘할 것입니다. 당신은 조직의 '에너지 드링크'와 같은 존재로, 침체된 분위기를 바꾸고 팀원들이 서로 소통하도록 격려하는 역할을 자연스럽게 수행합니다. 이러한 강점은 단순한 친화력을 넘어, 비즈니스 기회를 포착하고 갈등을 예방하는 핵심 역량이 될 수 있습니다."; break; case "공감배려성": feedback = "타인의 감정을 깊이 이해하고 존중하며, 팀의 화합을 중요하게 생각합니다. 갈등 상황에서 중재자 역할을 하거나, 동료가 어려움을 겪을 때 먼저 손을 내미는 따뜻한 마음을 가졌습니다. 이러한 강점은 팀워크를 강화하고 긍정적인 조직 문화를 만드는 데 핵심적인 역할을 합니다. 당신의 공감 능력은 고객의 숨겨진 니즈를 파악하거나, 팀원들의 잠재력을 이끌어내는 리더십의 기반이 될 수 있습니다."; break; case "성실책임성": feedback = "맡은 일은 반드시 시간 내에, 높은 품질로 완수해야 직성이 풀리는 유형입니다. 꼼꼼함과 강한 책임감을 바탕으로 주변 사람들로부터 깊은 신뢰를 얻습니다. 당신의 안정적인 업무 수행 능력은 모든 프로젝트의 든든한 기반이 됩니다. '믿고 맡길 수 있는 사람'이라는 평가는 당신의 가장 큰 무기이며, 어떤 조직에서든 필수적인 인재로 인정받을 수 있는 핵심 역량입니다."; break; case "정서안정성": feedback = "예상치 못한 문제나 갑작스러운 변화 속에서도 침착함을 잃지 않습니다. 스트레스 상황에서도 감정적으로 동요하기보다, 문제를 객관적으로 분석하고 해결책을 찾는 데 집중합니다. 이러한 안정감은 위기 상황에서 팀의 중심을 잡아주는 역할을 합니다. 당신의 강한 멘탈은 빠르게 변화하고 압박이 심한 환경에서도 꾸준한 성과를 내는 원동력이 될 것입니다."; break; case "창의탐구성": feedback = "늘 새로운 아이디어에 목마르고, 기존의 틀을 깨는 시도를 즐깁니다. 호기심이 많아 새로운 지식이나 기술을 빠르게 학습하며, 복잡한 문제를 창의적인 관점에서 해결하는 데 강점을 보입니다. 당신의 탐구 정신은 조직의 혁신을 이끄는 원동력이 될 것입니다. 남들이 보지 못하는 새로운 가능성을 발견하고, 그것을 현실로 만들어내는 과정에서 큰 성취감을 느낄 것입니다." }return `<div><h4>🎉 ${key} (점수: ${score}/20)</h4><p>${feedback}</p></div>` })).join("")} </div> <div class="result-card"> <h3>🌱 당신의 개선점 (Bottom 2)</h3> ${bottom2.map((([key, score]) => { let feedback = ""; switch (key) { case "사회관계성": feedback = "다소 신중하고 내향적인 성향으로, 새로운 환경이나 사람들과 친해지는 데 시간이 걸릴 수 있습니다. 이는 깊이 있는 관계를 중시하기 때문일 수 있습니다. 다만, 업무적으로는 조금 더 적극적으로 자신을 표현하고 다양한 동료와 교류하려는 의식적인 노력이 당신의 협업 능력을 한 단계 더 성장시킬 수 있습니다. 예를 들어, 회의에서 의식적으로 먼저 질문을 던지거나, 점심시간에 다른 팀 동료와 대화를 시도하는 작은 습관을 만드는 것이 좋습니다. 당신의 깊이 있는 생각을 더 자주 공유할 때, 주변 사람들은 당신의 통찰력에 더 크게 신뢰를 보낼 것입니다."; break; case "공감배려성": feedback = "관계나 감정보다는 객관적인 사실과 원칙에 기반하여 판단하는 경향이 있습니다. 이는 공정하고 논리적인 의사결정에 강점을 보이지만, 때로는 동료의 감정을 충분히 헤아리지 못한다는 인상을 줄 수도 있습니다. 협업 시 상대방의 입장을 먼저 생각하고 소통하려는 노력이 더해진다면 더욱 뛰어난 팀플레이어가 될 것입니다. 동료의 의견에 반대하기 전에 \"그렇게 생각할 수도 있겠네요. 그런데 제 생각은...\"과 같이 상대방의 의견을 먼저 인정해주는 화법을 연습해보는 것도 좋은 방법입니다."; break; case "성실책임성": feedback = "큰 그림을 보고 빠르게 실행하는 데 강점이 있으며, 정해진 규칙이나 세부사항에 얽매이는 것을 선호하지 않을 수 있습니다. 이는 유연한 사고로 이어질 수 있지만, 때로는 꼼꼼함이 부족하다는 인상을 줄 수 있습니다. 중요한 업무일수록 마감 기한과 디테일을 한번 더 확인하는 습관을 들인다면 신뢰도를 더욱 높일 수 있습니다. 체크리스트를 활용하거나, 동료에게 크로스체크를 부탁하는 것도 좋은 방법입니다. 당신의 빠른 실행력에 꼼꼼함이 더해진다면 누구도 따라올 수 없는 경쟁력이 될 것입니다."; break; case "정서안정성": feedback = "주변 환경의 변화나 외부 자극에 민감하게 반응하는 편입니다. 이는 섬세한 감수성으로 이어져 다른 사람들이 놓치는 미묘한 문제점을 발견하는 데 도움이 될 수 있습니다. 하지만 스트레스가 높은 상황에서는 감정적인 소모가 클 수 있으니, 자신만의 스트레스 해소법(예: 명상, 운동, 취미 생활)을 찾고 평정심을 유지하는 연습이 필요합니다. 감정이 격해질 때는 잠시 하던 일을 멈추고 심호흡을 하는 것만으로도 큰 도움이 될 수 있습니다."; break; case "창의탐구성": feedback = "새롭고 불확실한 시도보다는, 검증되고 안정적인 방식을 선호하는 경향이 있습니다. 이는 업무의 효율성과 안정성을 높이는 데 큰 장점이 됩니다. 하지만 빠르게 변화하는 환경에 적응하기 위해, 가끔은 기존의 방식에 의문을 제기하고 작은 개선이라도 시도해보는 열린 자세가 당신의 경쟁력을 더욱 강화시킬 것입니다. 관련 분야의 최신 트렌드를 다루는 아티클을 주 1회 읽어보거나, 새로운 툴을 가볍게 사용해보는 등 작은 시도부터 시작해보는 것을 추천합니다." }return `<div><h4>🌱 ${key} (점수: ${score}/20)</h4><p>${feedback}</p></div>` })).join("")} </div> <script> new Chart(document.getElementById('personalityChart').getContext('2d'), { type: 'radar', data: { labels: ${JSON.stringify(Object.keys(scores))}, datasets: [{ label: '성격 특성 점수', data: ${JSON.stringify(Object.values(scores))}, backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: 'rgba(79, 70, 229, 1)', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 20, ticks: { stepSize: 4 } } } } }); <\/script>`;
}

function generateWorkStyleReport(answers) {
    const styles = {
        주도지향성: 0,
        협력지향성: 0,
        체계지향성: 0,
        유연지향성: 0,
        혁신지향성: 0
    };

    // --- [수정] 1순위: 5점, 2순위: 3점, 나머지: 1점 로직 ---
    const allStyleKeys = Object.keys(styles);
    
    // answers 객체: { q0: { p1: "주도지향성", p2: "협력지향성" }, ... }
    for (const qKey in answers) {
        const p1Value = answers[qKey].p1;
        const p2Value = answers[qKey].p2;

        allStyleKeys.forEach(styleKey => {
            if (styleKey === p1Value) {
                styles[styleKey] += 5; // 1순위 5점
            } else if (styleKey === p2Value) {
                styles[styleKey] += 3; // 2순위 3점
            } else {
                styles[styleKey] += 1; // 그 외 1점
            }
        });
    }
    // --- [수정 끝] ---
    
    const sortedStyles = Object.entries(styles).sort((([, a], [, b]) => b - a));
    const top1 = sortedStyles[0][0];
    const top2 = sortedStyles[1][0];
    const typeMap = {
        "주도지향성-협력지향성": {
            name: "👍 팀플메이커",
            desc: "사람들을 모아 함께 성과를 만들어내는 인재"
        },
        "주도지향성-체계지향성": {
            name: "👍 플랜보스",
            desc: "계획을 세우고 추진력을 발휘하는 인재"
        },
        "유연지향성-주도지향성": {
            name: "👍 트러블슈터",
            desc: "위기에도 해결책을 찾아내는 인재"
        },
        "주도지향성-혁신지향성": {
            name: "☀️ 이노베이터",
            desc: "새로운 길을 열어가는 인재"
        },
        "체계지향성-협력지향성": {
            name: "👍 하모나이저",
            desc: "조화를 이루며 질서를 세우는 인재"
        },
        "유연지향성-협력지향성": {
            name: "👍 케어테이커",
            desc: "사람을 돌보고 상황을 살피는 인재"
        },
        "혁신지향성-협력지향성": {
            name: "👍 인싸메이커",
            desc: "새로운 흐름 속에서 모두를 어울리게 하는 인재"
        },
        "유연지향성-체계지향성": {
            name: "👍 멀티플레이어",
            desc: "여러 역할을 유연하게 해내는 인재"
        },
        "체계지향성-혁신지향성": {
            name: "👍 시스템체인저",
            desc: "체계를 바탕으로 변화를 이끄는 인재"
        },
        "유연지향성-혁신지향성": {
            name: "👍 크리에이터",
            desc: "자유롭게 새로움을 만들어내는 인재"
        }
    };
    const typeKey = [top1, top2].sort().join("-");
    const userType = typeMap[typeKey] || {
        name: "👍 균형잡힌 멀티플레이어",
        desc: "다양한 성향을 고루 갖추어 어떤 역할이든 유연하게 수행하는"
    };
    const cautionaryMap = {
        주도지향성: {
            name: "'케어테이커(협력+유연)'나 '하모나이저(협력+체계)'",
            reason: "당신의 빠른 의사결정과 추진력이 상대방에게는 충분한 논의나 공감 없이 일방적으로 느껴질 수 있습니다. 목표를 향해 나아가면서도, 팀원들의 감정과 안정감을 고려하는 소통 방식이 필요합니다."
        },
        협력지향성: {
            name: "'이노베이터(주도+혁신)'나 '플랜보스(주도+체계)'",
            reason: "상대방의 강한 주도성과 명확한 목표 의식이 때로는 당신의 의견을 충분히 반영하지 않고 지나치게 빠르게 느껴질 수 있습니다. 팀의 조화를 지키면서도, 자신의 전문적인 의견을 명확하고 논리적으로 전달하는 연습이 중요합니다."
        },
        체계지향성: {
            name: "'크리에이터(유연+혁신)'나 '이노베이터(주도+혁신)'",
            reason: "당신이 중요하게 생각하는 계획과 절차가 상대방의 창의적이고 즉흥적인 아이디어에 의해 흔들릴 때 스트레스를 받을 수 있습니다. 안정적인 프로세스도 중요하지만, 때로는 새로운 시도를 위한 유연성을 발휘하는 것이 더 큰 성과로 이어질 수 있습니다."
        },
        유연지향성: {
            name: "'플랜보스(주도+체계)'나 '시스템체인저(체계+혁신)'",
            reason: "변화에 빠르게 적응하는 당신의 강점과 달리, 상대방은 정해진 계획과 규칙을 매우 중요하게 생각할 수 있습니다. 예상치 못한 변수가 발생했을 때, 일방적으로 계획을 바꾸기보다 상대방에게 상황을 충분히 설명하고 동의를 구하는 과정이 갈등을 줄일 수 있습니다."
        },
        혁신지향성: {
            name: "'하모나이저(협력+체계)'나 '멀티플레이어(체계+유연)'",
            reason: "당신의 새롭고 혁신적인 아이디어가 상대방에게는 검증되지 않은 리스크로 느껴질 수 있습니다. 아이디어를 제시할 때, 그것이 기존 시스템에 어떻게 긍정적으로 기여할 수 있는지 구체적인 데이터나 논리를 함께 제시하여 상대방을 설득하는 노력이 필요합니다."
        }
    };
    const cautionaryCombination = cautionaryMap[top1] || {
        name: "다른 성향의 동료",
        reason: "자신의 강점이 지나칠 때 상대방에게는 약점으로 비춰질 수 있습니다. 항상 상대방의 업무 스타일을 존중하고 열린 자세로 소통하는 것이 중요합니다."
    };
    
    // --- [수정] 점수 구간(Threshold) 및 피드백 텍스트 수정 ---
    // (8문항 * 5점 = 40점 만점 기준)
    return ` <div class="result-card"> <h3>🏆 당신의 업무 페르소나: ${userType.desc} '${userType.name}'</h3> <p>당신은 팀의 목표를 향해 나아갈 때, <strong>'${top1}'</strong>의 에너지와 <strong>'${top2}'</strong>의 시너지를 발휘하는 사람입니다. 이는 단순히 두 가지 성향을 가진 것을 넘어, 두 특성이 결합하여 독특한 강점을 만들어냄을 의미합니다. 예를 들어, '${top1}'을 통해 목표를 설정하고 추진하면서도, '${top2}'를 통해 그 과정에서 발생할 수 있는 변수를 고려하고 팀원들과의 조화를 잃지 않는 균형 감각을 보여줍니다. 당신의 존재감은 팀에 강력한 추진력과 안정감을 동시에 제공하며, 이 고유한 조합은 당신이 어떤 상황에서 빛을 발하고 어떻게 협업할 때 최고의 시너지를 내는지 알려주는 핵심 열쇠입니다. 자신의 페르소나를 잘 이해하고 활용하는 것이 중요합니다.</p> </div> <div class="result-card"> <h3>⭐ 각 요인별 상세 피드백</h3> <div class="max-w-xl mx-auto h-64 md:h-96 mb-6"><canvas id="workStyleChart"></canvas></div> ${Object.entries(styles).map((([key, score]) => { let meaning = "", feedback = ""; switch (key) { case "주도지향성": meaning = "스스로 앞장서서 일을 이끌고 책임지려는 성향입니다."; feedback = score >= 20 ? "<strong>[높음]</strong> 당신은 타고난 리더입니다. 불확실한 상황에서도 방향을 제시하고 팀을 이끄는 데 강점을 보입니다. 목표 지향적이며 결과물을 만들어내는 능력이 탁월합니다. 다만, 때로는 너무 빠른 속도감으로 인해 팀원들이 지칠 수 있으니, 의사결정 과정에서 팀원들의 의견을 경청하고 속도를 조절하는 노력이 더해진다면 더욱 존경받는 리더가 될 것입니다." : score >= 10 ? "<strong>[중간]</strong> 당신은 필요할 때 리더의 역할을 수행하지만, 항상 전면에 나서기보다는 팀과 조화를 이루는 것을 선호합니다. 상황에 따라 유연하게 리더와 팔로워의 역할을 오갈 수 있는 균형감이 돋보입니다. 이는 당신이 독단적이지 않으면서도 책임감 있는 동료라는 신뢰를 줍니다. 리더십을 발휘해야 할 중요한 순간을 잘 포착하는 연습을 한다면 잠재력을 더욱 발휘할 수 있습니다." : "<strong>[낮음]</strong> 당신은 팀의 안정적인 지원가 역할을 할 때 편안함을 느낍니다. 명확한 목표와 방향이 주어졌을 때, 자신의 역할을 묵묵히 수행하며 팀에 기여하는 데 강점을 보입니다. 리더를 보좌하거나 전문적인 실무를 담당할 때 뛰어난 역량을 발휘하며, 당신의 꾸준함은 팀의 안정성에 크게 기여합니다. 가끔은 자신의 의견을 조금 더 적극적으로 표현하는 것도 좋습니다."; break; case "협력지향성": meaning = "타인과 협업하고 긍정적인 관계를 유지하려는 성향입니다."; feedback = score >= 20 ? "<strong>[높음]</strong> 당신은 뛰어난 팀플레이어입니다. 팀의 윤활유 같은 존재로서 당신이 있으면 팀의 분위기가 부드러워지고 갈등이 줄어듭니다. 동료의 의견을 경청하고 지지하며 시너지를 만드는 데 핵심적인 역할을 합니다. 당신의 공감 능력과 배려는 팀의 심리적 안전감을 높여, 결과적으로 더 높은 성과를 이끌어내는 중요한 밑거름이 됩니다." : score >= 10 ? "<strong>[중간]</strong> 당신은 개인의 목표와 팀의 목표 사이에서 균형을 잘 맞춥니다. 독립적으로 업무를 처리하는 능력과 협업 능력을 모두 갖추고 있어 다양한 상황에 유연하게 대처할 수 있습니다. 효율성을 중시하면서도, 동료와의 관계를 해치지 않으려는 노력을 꾸준히 하는 모습이 긍정적인 평가를 받습니다. 때로는 자신의 의견을 조금 더 명확하게 주장하는 것이 팀에 도움이 될 수 있습니다." : "<strong>[낮음]</strong> 당신은 독립적으로 업무를 수행할 때 최고의 효율을 내는 전문가 유형입니다. 혼자만의 시간을 통해 깊이 있게 문제에 몰입하고 해결책을 찾는 데 강점을 보입니다. 불필한 논쟁보다 결과로 증명하는 것을 선호합니다. 다만, 복잡한 프로젝트에서는 동료들과의 주기적인 정보 공유가 오해를 줄이고 더 나은 결과로 이어진다는 점을 기억하는 것이 좋습니다."; break; case "체계지향성": meaning = "계획, 규칙, 절차를 중시하며 꼼꼼하게 일하는 성향입니다."; feedback = score >= 20 ? "<strong>[높음]</strong> 당신은 완벽을 추구하는 전략가입니다. 마치 프로젝트의 품질 관리자처럼, 사소한 실수도 놓치지 않는 꼼꼼함으로 프로젝트의 완성도를 극대화합니다. 당신이 검토한 결과물은 언제나 믿을 수 있다는 강한 신뢰를 줍니다. 하지만 지나치게 세부사항에 집착하면 전체적인 진행 속도가 느려질 수 있으니, '중요도'에 따라 완급을 조절하는 연습이 필요합니다." : score >= 10 ? "<strong>[중간]</strong> 당신은 계획의 중요성을 인지하지만, 때로는 상황에 따라 유연하게 대처하는 것을 선호합니다. 큰 틀 안에서 움직이되, 세부적인 규칙보다는 효율성을 더 중요하게 생각할 수 있습니다. 계획과 실행 사이의 균형을 잘 잡는 당신의 능력은 안정적이면서도 효율적인 프로젝트 운영에 기여합니다. 중요한 프로젝트에서는 체크리스트를 활용하는 습관을 들이면 실수를 줄일 수 있습니다." : "<strong>[낮음]</strong> 당신은 정해진 규칙이나 절차보다 창의적인 자유를 중시합니다. 틀에 얽매이지 않고 큰 그림을 그리며, 빠른 실행을 통해 가능성을 탐색하는 데 강점을 보입니다. 아이디어를 현실로 만드는 과정 자체를 즐깁니다. 하지만 당신의 뛰어난 아이디어가 좋은 결과물로 이어지기 위해서는, 마무리 단계에서 다른 꼼꼼한 동료의 검토를 받는 등 체계적인 보완이 필요할 수 있습니다."; break; case "유연지향성": meaning = "변화와 불확실성에 대처하고 적응하는 능력입니다."; feedback = score >= 20 ? "<strong>[높음]</strong> 당신은 어떤 위기에도 흔들리지 않는 해결사입니다. 예상치 못한 문제 상황에서 새로운 기회를 포착하고 빠르게 대안을 찾아내는 능력이 뛰어납니다. 변화를 두려워하기보다 오히려 즐기는 경향이 있습니다. 당신의 긍정적인 태도와 빠른 적응력은 불확실성이 높은 프로젝트에서 팀의 등대와 같은 역할을 합니다." : score >= 10 ? "<strong>[중간]</strong> 당신은 안정적인 환경을 선호하지만, 필요한 경우 변화에 적응할 수 있는 능력을 갖추고 있습니다. 예측 가능한 상황에서는 안정적으로 성과를 내고, 변화가 필요할 때는 이를 수용할 준비가 되어 있습니다. 급격한 변화보다는 점진적인 개선을 선호하며, 변화의 필요성을 충분히 이해했을 때 적극적으로 움직입니다. 이러한 당신의 성향은 조직의 안정적인 변화 관리에 긍정적으로 기여합니다." : "<strong>[낮음]</strong> 당신은 예측 가능하고 안정적인 환경에서 최고의 성과를 냅니다. 반복적인 업무나 명확한 절차가 있는 업무를 통해 꾸준히 성과를 쌓아가는 것을 선호하며, 급작스러운 변화에는 스트레스를 받을 수 있습니다. 당신의 꾸준함과 안정성은 조직 운영의 튼튼한 기반이 됩니다. 변화가 불가피할 때는, 변화의 목표와 계획을 명확하게 공유받을 때 더 쉽게 적응할 수 있습니다."; break; case "혁신지향성": meaning = "새로운 아이디어를 탐색하고 기존의 방식을 개선하려는 성향입니다."; feedback = score >= 20 ? "<strong>[높음]</strong> 당신은 팀의 아이디어 뱅크입니다. 기존에 없던 새로운 관점으로 문제를 해결하고 혁신적인 아이디어를 제시하는 데 탁월합니다. 현상 유지에 안주하지 않고 끊임없이 더 나은 방식을 고민합니다. 당신의 창의적인 제안은 팀과 조직에 새로운 활력을 불어넣고 성장을 이끄는 중요한 원동력이 될 것입니다. 아이디어를 구체적인 실행 계획으로 연결하는 노력을 더한다면 금상첨화입니다." : score >= 10 ? "<strong>[중간]</strong> 당신은 창의적인 아이디어의 가치를 인정하지만, 동시에 현실적인 실행 가능성을 중요하게 생각합니다. 혁신과 안정 사이에서 균형을 맞추려는 경향이 있습니다. 기존의 방식을 개선하는 '점진적 혁신'에 강점을 보이며, 당신의 현실적인 아이디어는 조직에 실질적인 도움이 될 때가 많습니다. 새로운 아이디어를 접했을 때 비판적으로 보기보다 가능성을 먼저 탐색하는 열린 자세를 갖는 것이 좋습니다." : "<strong>[낮음]</strong> 당신은 검증된 프로세스와 효율성을 중시합니다. 새로운 시도에 따르는 리스크보다는, 현재의 방식을 최적화하여 안정적인 성과를 내는 것에 더 큰 가치를 둡니다. 당신의 이런 성향은 조직의 운영 효율성을 높이고 실수를 줄이는 데 크게 기여합니다. 다만, 시장과 기술이 빠르게 변하는 시대인 만큼, 의식적으로 새로운 트렌드에 관심을 갖고 학습하려는 노력이 당신의 경쟁력을 장기적으로 유지하는 데 도움이 될 것입니다." }return `<div><h4>${key}</h4><p><strong>의미:</strong> ${meaning}</p><p>${feedback}</p></div>` })).join("")} </div> <div class="result-card"> <h3>🤝 환상의 조합 vs 세심한 주의가 필요한 조합</h3> <p><strong>환상의 조합:</strong> 당신과 같은 '${userType.name}' 페르소나는, 당신의 강점을 보완해줄 수 있는 동료와 함께할 때 엄청난 시너지를 낼 수 있습니다. 예를 들어, ${"주도지향성" === top1 || "주도지향성" === top2 ? "당신이 앞서서 방향을 제시하면, '하모나이저'나 '케어테이커' 유형은 팀의 분위기를 다독이고 안정감을 더해줄 것입니다. 당신의 추진력에 그들의 섬세함이 더해져, 목표 달성과 팀워크 두 마리 토끼를 모두 잡을 수 있습니다." : "당신이 팀의 화합을 중요시한다면, '플랜보스'나 '이노베이터' 유형은 강력한 추진력으로 팀의 목표 달성을 가속화시킬 수 있습니다. 당신이 만든 긍정적인 분위기 속에서 그들은 자신의 역량을 마음껏 펼칠 수 있을 것입니다."} 서로의 다른 강점을 인정하고 협력할 때, 어떤 어려움도 해결할 수 있는 최고의 팀이 될 것입니다.</p> <p><strong>주의가 필요한 조합:</strong> 때로는 당신의 강점이 특정 유형의 동료와 만났을 때 오해를 낳거나 갈등의 원인이 되기도 합니다. 예를 들어, <strong>${cautionaryCombination.name}</strong> 유형과 협업할 때 주의가 필요할 수 있습니다. ${cautionaryCombination.reason} 서로의 업무 스타일이 '틀린' 것이 아니라 '다른' 것임을 이해하고, 의식적으로 소통의 방식을 조율하려는 노력이 성공적인 협업의 핵심입니다.</p> </div> <div class="result-card"> <h3>📚 10가지 업무 페르소나 참고 자료</h3> <p>업무 성향의 상위 2가지 조합에 따라 다음과 같은 10가지 페르소나 유형으로 분류할 수 있습니다. 각 유형의 특징을 이해하면 자신과 동료의 업무 스타일을 파악하고 시너지를 내는 데 도움이 됩니다.</p> <ul class="list-disc pl-5" style="columns: 2; -webkit-columns: 2; -moz-columns: 2;"> ${Object.values(typeMap).map((t => `<li><strong>${t.name.split("(")[0]}:</strong> ${t.desc}</li>`)).join("")} </ul> </div> 
    
    <script> new Chart(document.getElementById('workStyleChart').getContext('2d'), { 
        type: 'bar', 
        data: { 
            labels: ${JSON.stringify(Object.keys(styles))}, 
            datasets: [{ 
                label: '업무 성향 점수', 
                data: ${JSON.stringify(Object.values(styles))}, 
                backgroundColor: ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'], 
            }] 
        }, 
        options: { 
            indexAxis: 'y', 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                x: { beginAtZero: true, max: 40 } /* 3. 차트 Max 스케일 40으로 수정 */
            }, 
            plugins: { legend: { display: false }, tooltip: { displayColors: false } } 
        } 
    }); <\/script> `;
    // --- [수정 끝] ---
}

// --- F1 이벤트 리스너 및 핸들러 ---
export function bindFeature1Listeners() {
    const container = document.getElementById("feature1-section");
    const resetToMain = () => {
        container.innerHTML = getFeature1HTML();
        updateF1CardStates();
        bindFeature1Listeners(); // 이 함수가 재귀적으로 호출되며 아래 수정된 리스너를 다시 바인딩합니다.
    };

    // --- [수정된 부분 시작] ---
    // '대시보드로 돌아가기' 버튼 리스너 바인딩
    // resetToMain()에 의해 F1 메인 HTML이 다시 렌더링 될 때마다 이 리스너가 다시 붙도록 합니다.
    const backToDashboardBtn = container.querySelector('.back-to-dashboard-btn');
    if (backToDashboardBtn) {
        backToDashboardBtn.onclick = () => {
            showView('dashboard'); // core.js의 showView 함수 호출
        };
    }

    // F1 하위 페이지(퀴즈, 결과, 폼)에 있는 '이전' 버튼(#f1-back-btn) 리스너 바인딩
    // (F1 메인 화면에는 이 버튼이 없으므로, 하위 페이지에서만 이 코드가 유효하게 됩니다.)
    const backBtn = container.querySelector("#f1-back-btn");
    if (backBtn) {
        backBtn.onclick = resetToMain;
    }
    // --- [수정된 부분 끝] ---

    const createCardClickHandler = (cardType, resultKey, isSpecialForm = false) => {
        const cardId = `f1-card-${cardType === 'job' ? 'job' : cardType}`;
        const cardElement = document.getElementById(cardId);
        
        if (cardElement) {
            cardElement.onclick = () => {
                const isCompleted = cardElement.classList.contains("completed");
                if (isCompleted && cardType !== 'experience') {
                    // 완료된 카드는 클릭 방지 (결과보기/초기화 버튼만 작동)
                    return; 
                }

                if (isSpecialForm) {
                    if (cardType === 'job') {
                        if (appState.feature1Data.jobInfo) {
                            alert('이미 작성된 내용이 있습니다. 다시 작성하시려면 "초기화" 버튼을 눌러주세요.');
                        } else {
                            container.innerHTML = getF1JobHTML();
                            bindJobFormListeners(resetToMain);
                        }
                    } else if (cardType === 'experience') {
                        container.innerHTML = getF1ExperienceHTML();
                        bindExperienceFormListeners(resetToMain);
                    }
                } else {
                    handleCardClick(cardType, resultKey, false);
                }
            };
        }
    };

    createCardClickHandler("job", null, true);
    createCardClickHandler("jobValue", "jobValueResult");
    createCardClickHandler("personality", "personalityResult");
    createCardClickHandler("workStyle", "workStyleResult");
    createCardClickHandler("experience", null, true);
}


function bindJobFormListeners(resetToMain) {
    const setupSelectionGrid = (containerId, maxSelection) => {
        const container = document.getElementById(containerId);
        const otherInput = document.getElementById(`${containerId}-other`);
        
        container.addEventListener("click", (e) => {
            if (e.target.classList.contains("selection-box")) {
                const box = e.target;
                const selectedCount = container.querySelectorAll(".selection-box.selected").length;
                
                if (!box.classList.contains("selected") && selectedCount >= maxSelection) {
                    alert(`최대 ${maxSelection}개까지 선택할 수 있습니다.`);
                    return;
                }
                box.classList.toggle("selected");
            }
        });

        const addOtherItem = () => {
            const value = otherInput.value.trim();
            if (value) {
                if (Array.from(container.querySelectorAll(".selection-box")).some(box => box.dataset.value === value)) {
                    alert("이미 존재하는 항목입니다.");
                    otherInput.value = "";
                    return;
                }
                if (container.querySelectorAll(".selection-box.selected").length >= maxSelection) {
                    alert(`최대 ${maxSelection}개까지 선택할 수 있습니다.`);
                    return;
                }
                const newBox = document.createElement("div");
                newBox.className = "selection-box selected";
                newBox.dataset.value = value;
                newBox.textContent = value;
                container.appendChild(newBox);
                otherInput.value = "";
            }
        };
        
        otherInput.addEventListener("keydown", (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addOtherItem();
            }
        });
        otherInput.addEventListener("blur", addOtherItem);
    };

    setupSelectionGrid("f1-industry-container", 2);
    setupSelectionGrid("f1-job-category-container", 3);
    setupSelectionGrid("f1-job-duties-container", 4);
    setupSelectionGrid("f1-major-container", 1);

    document.getElementById("f1-back-btn").onclick = resetToMain;

    document.getElementById("f1-job-save-btn").onclick = () => {
        const getSelectedValues = (containerId) => 
            Array.from(document.querySelectorAll(`#${containerId} .selection-box.selected`))
                 .map(box => box.dataset.value);

        appState.feature1Data.jobInfo = {
            industry: getSelectedValues("f1-industry-container"),
            jobCategory: getSelectedValues("f1-job-category-container"),
            jobDuties: getSelectedValues("f1-job-duties-container"),
            major: getSelectedValues("f1-major-container")
        };

        const { industry, jobCategory, jobDuties } = appState.feature1Data.jobInfo;
        if (industry.length === 0 && jobCategory.length === 0 && jobDuties.length === 0) {
            alert("하나 이상의 항목을 선택해주세요.");
            appState.feature1Data.jobInfo = null;
        } else {
            saveUserData(appState.currentUser, appState.feature1Data); // core.js
            alert("저장되었습니다!");
            resetToMain();
        }
    };
}

function handleCardClick(cardType, resultKey, forceShowResult = false) {
    const container = document.getElementById("feature1-section");
    const resetToMain = () => {
        container.innerHTML = getFeature1HTML();
        updateF1CardStates();
        bindFeature1Listeners();
    };

    if (appState.feature1Data[resultKey] && forceShowResult) {
        container.innerHTML = getResultHTML(cardType);
        document.getElementById("f1-back-btn").onclick = resetToMain;
        
        const resultContentDiv = document.getElementById("f1-result-content");
        resultContentDiv.innerHTML = appState.feature1Data[resultKey];
        document.getElementById("f1-loader").style.display = "none";
        resultContentDiv.classList.remove("hidden");

        const scriptTag = resultContentDiv.querySelector("script");
        if (scriptTag) {
            const newScript = document.createElement("script");
            newScript.innerHTML = scriptTag.innerHTML;
            resultContentDiv.appendChild(newScript);
            scriptTag.remove();
        }

        const downloadBtn = document.getElementById("f1-download-btn");
        downloadBtn.classList.remove("hidden");
        
        // --- [수정된 부분] ---
        // 기존의 HTML 다운로드 로직 대신,
        // handleQuizSubmit에 있던 PDF 생성 로직을 동일하게 적용합니다.
        downloadBtn.onclick = () => {
            const { jsPDF } = window.jspdf;
            const targetHTML = document.getElementById("f1-result-content");
            // h2 태그에서 제목을 가져옵니다.
            const quizTitle = document.querySelector("#f1-result-container h2").textContent;

            html2canvas(targetHTML, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                // A4 비율에 맞게 이미지 비율 조정
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 10; // 상단 여백

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save(`ReadyJob_${quizTitle}.pdf`); // .pdf 파일로 저장
            });
        };
        // --- [수정 완료] ---

    } else {
        showQuiz(cardType);
    }
}

function bindExperienceFormListeners(resetToMain) {
    document.getElementById("f1-back-btn").onclick = resetToMain;
    
    const typeSelect = document.getElementById("f1-exp-type");
    const typeOtherInput = document.getElementById("f1-exp-type-other");
    const startYearSelect = document.getElementById("f1-exp-start-year");
    const startMonthSelect = document.getElementById("f1-exp-start-month");
    const endYearSelect = document.getElementById("f1-exp-end-year");
    const endMonthSelect = document.getElementById("f1-exp-end-month");
    const presentCheckbox = document.getElementById("f1-exp-present");
    const tasksContainer = document.getElementById("f1-exp-tasks-container");

    typeSelect.onchange = () => typeOtherInput.classList.toggle("hidden", typeSelect.value !== "기타");
    presentCheckbox.onchange = () => {
        endYearSelect.disabled = presentCheckbox.checked;
        endMonthSelect.disabled = presentCheckbox.checked;
    };

    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1990; y--) {
        [startYearSelect, endYearSelect].forEach(sel => sel.add(new Option(y + "년", y)));
    }
    for (let m = 1; m <= 12; m++) {
        [startMonthSelect, endMonthSelect].forEach(sel => sel.add(new Option(m + "월", m)));
    }

    const createNewTaskItem = () => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <input type="text" class="task-input w-full rounded-md border-gray-300 shadow-sm" placeholder="예: 신규 고객 유치 프로모션 기획">
            <button type="button" class="delete-task-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        `;
        tasksContainer.appendChild(taskItem);
    };

    tasksContainer.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".delete-task-btn");
        if (deleteBtn) {
            deleteBtn.closest(".task-item").remove();
        }
    });

    document.getElementById("add-task-btn").onclick = createNewTaskItem;
    for (let i = 0; i < 3; i++) createNewTaskItem(); // 기본 3개 항목

    updateExperienceList(); // 기존 목록 로드

    document.getElementById("f1-add-exp-btn").onclick = () => {
        const type = typeSelect.value === "기타" ? typeOtherInput.value : typeSelect.value;
        const org = document.getElementById("f1-exp-org").value;
        const tasks = Array.from(tasksContainer.querySelectorAll(".task-input"))
                           .map(input => input.value.trim())
                           .filter(Boolean); // 빈 항목 제거

        if (!type || !org || tasks.length === 0) {
            alert("경험 유형, 조직/활동명, 주요 활동은 필수 항목입니다.");
            return;
        }

        const period = {
            startY: startYearSelect.value,
            startM: startMonthSelect.value,
            endY: presentCheckbox.checked ? null : endYearSelect.value,
            endM: presentCheckbox.checked ? null : endMonthSelect.value,
            isPresent: presentCheckbox.checked
        };

        appState.feature1Data.socialExperiences.push({
            id: Date.now(),
            type,
            org,
            tasks,
            period,
            duration: calculateDuration(period.startY, period.startM, period.endY, period.endM, period.isPresent),
            notes: document.getElementById("f1-exp-notes").value
        });

        saveUserData(appState.currentUser, appState.feature1Data); // core.js
        updateExperienceList();

        // 폼 초기화
        typeSelect.value = "직장 경력";
        typeOtherInput.classList.add("hidden");
        typeOtherInput.value = "";
        document.getElementById("f1-exp-org").value = "";
        tasksContainer.innerHTML = "";
        for (let i = 0; i < 3; i++) createNewTaskItem();
        document.getElementById("f1-exp-notes").value = "";
        presentCheckbox.checked = false;
        endYearSelect.disabled = false;
        endMonthSelect.disabled = false;
    };
}

const calculateDuration = (startY, startM, endY, endM, isPresent) => {
    const startDate = new Date(startY, startM - 1);
    const endDate = isPresent ? new Date() : new Date(endY, endM - 1);
    
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth() + 1; // +1 to include the end month

    if (months <= 0) return "1개월 미만";
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
        return `${years}년 ${remainingMonths}개월`;
    } else if (years > 0) {
        return `${years}년`;
    } else {
        return `${remainingMonths}개월`;
    }
};

const updateExperienceList = () => {
    const listContainer = document.getElementById("f1-experience-list");
    const experiences = appState.feature1Data.socialExperiences;

    if (experiences.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500 text-center py-8">아직 추가된 경험이 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = experiences.map(exp => `
        <div class="experience-card">
            <button data-id="${exp.id}" class="exp-delete-btn absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
            <div class="flex items-center gap-4 mb-3">
                <span class="exp-type-badge">${exp.type}</span>
                <h5 class="text-lg font-bold text-gray-800">${exp.org}</h5>
            </div>
            <p class="text-sm text-gray-500 mb-4">
                ${exp.period.startY}.${String(exp.period.startM).padStart(2, "0")} ~ 
                ${exp.period.isPresent ? "현재" : `${exp.period.endY}.${String(exp.period.endM).padStart(2, "0")}`}
                <span class="font-semibold text-gray-700 ml-2">(${exp.duration})</span>
            </p>
            <div class="mb-4">
                <h6 class="font-semibold text-gray-700 mb-2">주요 활동</h6>
                <ul class="text-gray-600 space-y-1">${exp.tasks.map(t => `<li>${t}</li>`).join("")}</ul>
            </div>
            ${exp.notes ? `
            <div>
                <h6 class="font-semibold text-gray-700 mb-2">소감 및 배운 점</h6>
                <p class="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md">${exp.notes}</p>
            </div>` : ""}
        </div>
    `).join("");

    listContainer.querySelectorAll(".exp-delete-btn").forEach(button => {
        button.onclick = (e) => {
            if (confirm("이 경험을 삭제하시겠습니까?")) {
                const idToDelete = parseInt(e.currentTarget.dataset.id, 10);
                appState.feature1Data.socialExperiences = appState.feature1Data.socialExperiences.filter(exp => exp.id !== idToDelete);
                saveUserData(appState.currentUser, appState.feature1Data); // core.js
                updateExperienceList();
            }
        };
    });
};

function showQuiz(quizType) {
    const container = document.getElementById("feature1-section");
    const resetToMain = () => {
        container.innerHTML = getFeature1HTML();
        updateF1CardStates();
        bindFeature1Listeners();
    };
    container.innerHTML = getQuizHTML(quizType);
    document.getElementById("f1-back-btn").onclick = resetToMain;

    // --- [수정] 1/2순위 클릭 로직(workStyle) 및 폼 제출 핸들러 분리 ---
    // 1. workStyle 퀴즈일 경우 1/2순위 클릭 이벤트 리스너 추가
    if (quizType === 'workStyle') {
        const questions = container.querySelectorAll('.scenario-question');
        questions.forEach(question => {
            const options = question.querySelectorAll('.work-style-option');
            let priority1 = null;
            let priority2 = null;

            options.forEach(option => {
                option.addEventListener('click', () => {
                    const badge = option.querySelector('.priority-badge');

                    if (option.classList.contains('priority-1')) {
                        // 1순위 -> 해제. 2순위가 1순위로 승격
                        option.classList.remove('priority-1');
                        badge.textContent = '';
                        priority1 = null;

                        if (priority2) {
                            priority2.classList.remove('priority-2');
                            priority2.classList.add('priority-1');
                            priority2.querySelector('.priority-badge').textContent = '1순위';
                            priority1 = priority2;
                            priority2 = null;
                        }

                    } else if (option.classList.contains('priority-2')) {
                        // 2순위 -> 해제
                        option.classList.remove('priority-2');
                        badge.textContent = '';
                        priority2 = null;

                    } else {
                        // 신규 선택
                        if (!priority1) {
                            // 1순위로 지정
                            option.classList.add('priority-1');
                            badge.textContent = '1순위';
                            priority1 = option;
                        } else if (!priority2) {
                            // 2순위로 지정
                            option.classList.add('priority-2');
                            badge.textContent = '2순위';
                            priority2 = option;
                        } else {
                            // 3순위 선택 -> 2순위 교체
                            priority2.classList.remove('priority-2');
                            priority2.querySelector('.priority-badge').textContent = '';
                            
                            option.classList.add('priority-2');
                            badge.textContent = '2순위';
                            priority2 = option;
                        }
                    }
                });
            });
        });
    }

    // 2. 폼 제출(onsubmit) 로직 수정
    document.getElementById("f1-quiz-form").onsubmit = (e) => {
        e.preventDefault();
        
        // workStyle의 경우 FormData가 아닌, 신규 핸들러를 호출합니다.
        if (quizType === 'workStyle') {
            handleWorkStyleSubmit(quizType); // (신규 함수 호출)
        } else {
            handleQuizSubmit(quizType, new FormData(e.target)); // (기존 함수 수정)
        }
    };
    // --- [수정 끝] ---
}

// --- [신규 함수] workStyle 퀴즈 전용 제출 핸들러 ---
function handleWorkStyleSubmit(quizType) {
    const container = document.getElementById("feature1-section");
    const resetToMain = () => {
        container.innerHTML = getFeature1HTML();
        updateF1CardStates();
        bindFeature1Listeners();
    };

    const answers = {};
    const questions = container.querySelectorAll('.scenario-question');
    const unansweredQuestions = [];

    // 1. UI에서 1/2순위 선택 값을 수집하고 유효성 검사
    questions.forEach(question => {
        const qIndex = question.dataset.questionIndex;
        const p1 = question.querySelector('.priority-1');
        const p2 = question.querySelector('.priority-2');

        if (!p1 || !p2) {
            unansweredQuestions.push(parseInt(qIndex) + 1);
        } else {
            answers[`q${qIndex}`] = {
                p1: p1.dataset.value, // 1순위 값 (예: "주도지향성")
                p2: p2.dataset.value  // 2순위 값
            };
        }
    });

    if (unansweredQuestions.length > 0) {
        return alert(`다음 문항의 1순위와 2순위를 모두 선택해주세요: ${unansweredQuestions.join(", ")}`);
    }
    
    // 2. 결과 렌더링
    container.innerHTML = getResultHTML(quizType);
    document.getElementById("f1-back-btn").onclick = resetToMain;

    // 3. 점수 계산은 generateWorkStyleReport에서 수행
    let reportContent = generateWorkStyleReport(answers); // (수정된 함수 호출)

    appState.feature1Data[quizType + "Result"] = reportContent;
    saveUserData(appState.currentUser, appState.feature1Data);

    document.getElementById("f1-loader").style.display = "none";
    const resultContentDiv = document.getElementById("f1-result-content");
    resultContentDiv.innerHTML = reportContent;
    resultContentDiv.classList.remove("hidden");
    
    window.scrollTo(0, 0);

    const scriptTag = resultContentDiv.querySelector("script");
    if (scriptTag) {
        const newScript = document.createElement("script");
        newScript.innerHTML = scriptTag.innerHTML;
        resultContentDiv.appendChild(newScript);
        scriptTag.remove();
    }
    
    // 4. PDF 저장 버튼
    const downloadBtn = document.getElementById("f1-download-btn");
    downloadBtn.classList.remove("hidden");
    downloadBtn.onclick = () => {
        const { jsPDF } = window.jspdf;
        const targetHTML = document.getElementById("f1-result-content");
        const quizTitle = document.querySelector("#f1-result-container h2").textContent;

        html2canvas(targetHTML, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; 

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`ReadyJob_${quizTitle}.pdf`);
        });
    };
}
// --- [신규 함수 끝] ---

// --- [수정] 기존 handleQuizSubmit (workStyle 로직 제거) ---
function handleQuizSubmit(quizType, formData) {
    const container = document.getElementById("feature1-section");
    const resetToMain = () => {
        container.innerHTML = getFeature1HTML();
        updateF1CardStates();
        bindFeature1Listeners();
    };

    // workStyle은 handleWorkStyleSubmit에서 별도 처리하므로 제외
    const questionCount = { jobValue: 18, personality: 20 }[quizType];

    const unansweredQuestions = Array.from({ length: questionCount }, (_, i) => i)
                                     .filter(i => !formData.has(`q${i}`))
                                     .map(i => i + 1);

    if (unansweredQuestions.length > 0) {
        return alert(`다음 문항에 답변해주세요: ${unansweredQuestions.join(", ")}`);
    }

    const answers = Object.fromEntries(formData.entries());
    container.innerHTML = getResultHTML(quizType);
    document.getElementById("f1-back-btn").onclick = resetToMain;

    let reportContent = "";
    if (quizType === "jobValue") {
        reportContent = generateJobValueReport(answers);
    } else if (quizType === "personality") {
        reportContent = generatePersonalityReport(answers);
    }
    // (workStyle 로직 제거됨)

    appState.feature1Data[quizType + "Result"] = reportContent;
    saveUserData(appState.currentUser, appState.feature1Data); // core.js

    document.getElementById("f1-loader").style.display = "none";
    const resultContentDiv = document.getElementById("f1-result-content");
    resultContentDiv.innerHTML = reportContent;
    resultContentDiv.classList.remove("hidden");
    
    window.scrollTo(0, 0);

    const scriptTag = resultContentDiv.querySelector("script");
    if (scriptTag) {
        const newScript = document.createElement("script");
        newScript.innerHTML = scriptTag.innerHTML;
        resultContentDiv.appendChild(newScript);
        scriptTag.remove();
    }
    
    const downloadBtn = document.getElementById("f1-download-btn");
    downloadBtn.classList.remove("hidden");
    downloadBtn.onclick = () => {
        const { jsPDF } = window.jspdf;
        const targetHTML = document.getElementById("f1-result-content");
        const quizTitle = document.querySelector("#f1-result-container h2").textContent;

        html2canvas(targetHTML, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; 

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`ReadyJob_${quizTitle}.pdf`);
        });
    };
}
// --- [수정 끝] ---