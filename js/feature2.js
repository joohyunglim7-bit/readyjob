// --- [3차 분리] AI 자소서 생성 (F2) ---

// 1. core.js에서 공유 자원 import
import { appState, callGeminiAPI, supabaseClient } from './core.js';

// --- F2 HTML 생성 함수 ---
export function getFeature2HTML() {
    // F2의 HTML 구조는 변경되지 않았으므로 기존 코드 유지
    return ` 
    <div class="mb-4">
                <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                    &larr; 대시보드로 돌아가기
                </button>
    </div>
    <h2 class="text-3xl font-bold mb-2">AI 자소서 생성</h2> <p class="text-gray-600 mb-8">'자기 분석 & 프로필 생성'에 입력된 정보를 바탕으로 AI가 매력적인 자소서를 만들어 드립니다.</p> <div class="bg-white p-6 rounded-lg shadow mb-8 space-y-8"> <div> <h3 class="font-bold text-lg mb-4 text-gray-800">1. 기본 설정</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700">글자수</label> <select id="f2-char-count" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"> <option>100자 이내</option><option>200자 이내</option><option>300자 이내</option><option>400자 이내</option><option>500자 이내</option><option>600자 이내</option><option>700자 이내</option><option>800자 이내</option><option>900자 이내</option><option>1000자 이내</option> </select> </div> <div> <label class="block text-sm font-medium text-gray-700">작성 스타일</label> <select id="f2-style" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"> <option>서술식</option><option>개조식</option> </select> </div> </div> </div> <div> <h3 class="font-bold text-lg mb-4 text-gray-800">2. 문항 유형 선택</h3> <div id="f2-category-container" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4"> ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("지원동기", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>', "지원동기")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("조직이해", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375M9 12h6.375M9 17.25h6.375M12 21V3" /></svg>', "조직이해")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("성장과정", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.607m3.75.607V11.25m-3.75 0l-3.75 0" /></svg>', "성장과정")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("개인 특성 및 역량", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>', "개인역량")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("직무역량", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21v-4.5m0 4.5h4.5m-4.5 0L9 15M21 3.75v4.5m0-4.5h-4.5m4.5 0L15 9" /></svg>', "직무역량")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("소통역량", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12s4.03 8.25 9 8.25z" /></svg>', "소통역량")} ${((t, o, n) => ` <div class="category-card" data-category="${t}"> ${o} <span class="category-card-text">${n}</span> </div>`)("기타", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>', "직접입력")} </div> </div> <div id="f2-question-detail-container" class="opacity-0 transition-opacity duration-300"> <h3 class="font-bold text-lg mb-4 text-gray-800">3. 세부 문항 선택</h3> <select id="f2-question-selection" class="hidden w-full rounded-md border-gray-300 shadow-sm"></select> <input id="f2-question-input" type="text" class="hidden w-full rounded-md border-gray-300 shadow-sm" placeholder="자소서 문항을 직접 입력하세요."> </div> <button id="f2-generate-btn" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-2.5 rounded-md font-bold text-lg">자소서 생성하기 (최대 10개)</button> </div> <div id="f2-loader" class="hidden justify-center my-4"><div class="loader"></div></div>
    <div id="f2-result-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    `;
}

// --- F2 이벤트 리스너 ---
export function bindF2Listeners() {
    loadAndRenderF2Results();
    // 자소서 문항 선택 UI 로직
    const setupF2QuestionSelector = () => {
        const coverLetterQuestions = {
            "지원동기": ["지원동기, 근무희망 분야 및 그 이유에 대하여 구체적으로 기술하여 주십시오.", "지원한 이유와 입사 후 회사에서 이루고 싶은 꿈을 기술하십시오"],
            "조직이해": ["본인이 회사를 선택함에 있어 중요시 여기는 가치와 우리 회사가 왜 그 가치와 부합하는지 본인의 의견을 서술하여 주십시오", "이제까지 가장 강하게 소속감을 느꼈던 조직은 무엇이었으며, 그 조직의 발전을 위해 헌신적으로 노력했던 것 중 가장 기억에 남는 경험은 무엇습니까?", "본인이 회사를 선택할 때 가장 중요하게 생각하는 하는 기준이 무엇인지 작성하고, 이 기준을 바탕으로 우리 회사에 지원한 동기를 기술해주세요"],
            "성장과정": ["본인의 성장과정을 간략히 기술하되 현재의 자신에게 가장 큰 영향을 끼친 사건, 인물 등을 포함하여 기술하시기 바랍니다. (※작품속 가상인물도 가능)", "본인이 이룬 가장 큰 성취경험과 실패경험에 대하여", "지금까지 살아오면서 가장 많은 노력을 쏟아부었던 성공 혹은 실패 경험과 그 과정을 통해 무엇을 배웠는지 소개해주세요", "스스로 목표를 설정해서 달성해나가는 과정에서 겪은 어려움과 극복 과정을 기술하시오", "자신이 현대로템 및 지원 직무에 적합한 인재라고 생각하는 이유에 대해 말씀해 주세요", "지원 분야와 관련하여 특정 영역의 전문성을 키기 위해 꾸준히 노력한 경험에 대해 서술해 주십시오"],
            "개인 특성 및 역량": ["본인의 역량과 열정에 대하여", "다른 사람과 차별화되는 본인만의 특성(가치관, 성격 등)과 장점을 알려주세요", "목표와 계획을 세우고 이를 달성하기 위해 노력했던 경험에 대해 기술해주십시오", "자신이 어떤 사람인지를 하나의 '단어'로 어떻게 표현할 수 있는지 구체적인 사례를 들어 말씀해 주세요", "본인 성격의 장단점을 자신의 성장과정과 경험을 기반으로 서술하여 주십시오", "자신에게 요구된 것보다 더 높은 목표를 스스로 세워 시도했던 경험 중 가장 기억에 남는 것은 무엇습니까?"],
            "직무역량": ["지원한 직무 관련 본인이 갖고 있는 전문지식/경험(심화전공, 프로젝트, 논문, 공모전 등)을 작성하고 이를 바탕으로 본인이 지원 직무에 적합한 사유를 구체적으로 서술해 주시기 바랍니다", "본인의 전공능력이 지원한 직무에 적합한 사유를 구체적 사례를 들어 기술해 주시기 바랍니다", "지원 분야를 위해 '노력한 내용(전공, 직무 관련 경험 등)'과 이를 통해 '확보된 역량'을 구체적으로 기술해주십시오", "지원분야와 관련된 구체적인 지식이나 경험은 무엇이 있나요?", "본인이 지원한 직무와 관련된 지식, 프로젝트경험 및 기타역량을 기술해 주십시오.(구체적으로 작성해주시고, 근거 및 사례를 포함해 주십시오.)", "본인만의 차별화된 직무 강점과 이를 통해 당사에 기여할 수 있는 점에 대하여 기술하시오", "본인의 지원직무를 어떻게 이해하고 있는지 구체적으로 기술하고, 해당 분야에 본인이 적합하다고 판단할 수 있는 근거를 사례 및 경험을 바탕으로 기재해 주세요", "업무 또는 기타 계획 진행 과정에서 갑작스러운 어려움에 부딪혔지만 극복하려 노력했던 경험과 그 결과에 대해 말씀해 주세요", "새로운 시각으로 습관적이고 일상화된 비효율을 발견하고 개선했던 경험을 서술하여 주십시오", "새로운 것을 접목하거나 남다른 아이디어를 통해 문제를 개선했던 경험에 대해 서술해 주십시오", "잘못된 관행을 개선하거나 변화를 주도했던 경험을 설명해주세요. 진행과정에서 어떤 문제가 있었고, 어떻게 대처하여 끝까지 완수해냈는지 구체적으로 기술해주세요.", "글로벌 역량을 증명 할 수 있는 본인의 실제 경험이나 노력들을 기술하시고, 이러한 지원자의 Globality 가 입사 후 어떻게 활용 될 수 있을지 서술해 주세요"],
            "소통역량": ["협업을 통해서 문제를 해결해본 경험과 그 과정에서 느꼈던 본인 성격의 단점, 이를 극복하기 위한 노력을 말씀해주세요", "서로에 대한 이해를 바탕으로 타인과 소통하고 협업했던 경험을 서술하여 주십시오", "혼자 하기 어려운 일에서 다양한 자원 활용, 타인의 협력을 최대한으로 이끌어 내며, 팀워크를 발휘하여 공동의 목표 달성에 기여한 경험에 대해 서술해 주십시오", "본인과 동료의 입장, 상황을 대처해간 과정과 결과에 대해 구체적으로 기술해주세요.", "본인이 참여한 팀 활동 중 가장 기억에 남는 사례를 기술해 주세요. 각 팀원들의 역할, 과정에서 의견조율 등 어려웠던 점과 그를 극복하기 위해 어떤 노력을 기울였는지 등을 포함해 구체적으로 작성하여 주시기 바랍니다.", "학업 또는 조직활동에서 본인과 의견이 다른 구성원을 설득하고 협업하여 성과를 달성한 경험이 있다면 어떠한 방법으로 소통하였는지 구체적으로 기술해주세요", "커뮤니케이션을 잘하는 사람은 어떤 사람인지 간략히 정의하고, 커뮤니케이션 역량을 발휘했던 사례를 기술해주세요", "다른 사람을 배려하는 마음이 어느 정도라고 생각하는지 그와 관련된 사례를 기술해주세요."]
        };
        const categoryContainer = document.getElementById('f2-category-container');
        const detailContainer = document.getElementById('f2-question-detail-container');
        const questionSelect = document.getElementById('f2-question-selection');
        const questionInput = document.getElementById('f2-question-input');

        categoryContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (!card) return;

            categoryContainer.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const selectedCategory = card.dataset.category;
            detailContainer.classList.remove('opacity-0'); // Show detail section

            if (selectedCategory === "기타") {
                questionSelect.classList.add('hidden');
                questionInput.classList.remove('hidden');
                questionInput.value = '';
                questionInput.focus();
            } else if (coverLetterQuestions[selectedCategory]) {
                questionInput.classList.add('hidden');
                questionSelect.classList.remove('hidden');
                questionSelect.innerHTML = ''; // Clear previous options
                coverLetterQuestions[selectedCategory].forEach(q => {
                    const option = document.createElement('option');
                    option.value = q;
                    option.textContent = q;
                    questionSelect.appendChild(option);
                });
            } else {
                // Handle case where category might not exist (optional)
                questionSelect.classList.add('hidden');
                questionInput.classList.add('hidden');
            }
        });
    };

    setupF2QuestionSelector();

    // '자소서 생성하기' 버튼 클릭 이벤트
    document.getElementById('f2-generate-btn').onclick = async () => {
        if (appState.feature2Data.generatedCount >= 10) {
            return alert("자소서는 최대 10개까지 생성할 수 있습니다.");
        }

        const selectedCategoryCard = document.querySelector('#f2-category-container .category-card.selected');
        if (!selectedCategoryCard) {
            return alert("문항 유형을 먼저 선택해주세요.");
        }
        const category = selectedCategoryCard.dataset.category;
        const categoryText = selectedCategoryCard.querySelector('.category-card-text').textContent;

        let question = '';
        if (category === '기타') {
            question = document.getElementById('f2-question-input').value;
        } else {
            question = document.getElementById('f2-question-selection').value;
        }

        if (!question) {
            return alert("자소서 세부 문항을 선택하거나 입력해주세요.");
        }
        // F1 데이터(특히 희망 직무, 사회 경험)가 있는지 확인
        if (!appState.feature1Data.jobInfo || appState.feature1Data.socialExperiences.length === 0) {
            return alert("'자기 분석 & 프로필 생성'의 '희망 직무/산업'과 '나의 사회 경험'을 먼저 완료해주세요. 더 정확한 자소서가 생성됩니다.");
        }

        document.getElementById('f2-loader').style.display = 'flex'; // Show loader

        // 글자 수 및 스타일 설정 가져오기
        const charCountValue = document.getElementById('f2-char-count').value;
        const styleValue = document.getElementById('f2-style').value;
        const maxChars = parseInt(charCountValue, 10); // Extract number from "XXX자 이내"
        const minChars = Math.floor(maxChars * 0.9); // 90%
        const lengthInstruction = `글자수는 공백을 포함하여 반드시 ${minChars}자 이상 ${maxChars}자 이하로 작성해야 해. 이 글자수 제한을 매우 엄격하게 지켜줘.`;

        // [수정 시작] 경험 우선순위 정렬 로직
        const priorityTypes = ['직장 경력', '인턴', '아르바이트', '수상 경력'];

        // appState 원본을 수정하지 않기 위해 프로필 데이터 깊은 복사
        const prioritizedProfile = JSON.parse(JSON.stringify(appState.feature1Data));

        // 복사된 데이터의 socialExperiences 정렬
        prioritizedProfile.socialExperiences.sort((a, b) => {
            const aIsPriority = priorityTypes.includes(a.type);
            const bIsPriority = priorityTypes.includes(b.type);

            if (aIsPriority && !bIsPriority) {
                return -1; // a가 우선순위가 높으므로 앞으로
            } else if (!aIsPriority && bIsPriority) {
                return 1; // b가 우선순위가 높으므로 뒤로
            } else {
                return 0; // 둘 다 우선순위가 같거나 낮으면 순서 유지
            }
        });
        // Gemini API 호출 프롬프트 구성 (수정된 프로필과 지시사항 추가)
        const prompt = `취업 준비생 프로필(${JSON.stringify(prioritizedProfile)})을 바탕으로, 다음 자소서 문항에 대해 ${styleValue}으로 작성해줘. ${lengthInstruction} 문항: "${question}"
        
        [중요 지시]
        자소서를 작성할 때, 프로필의 'socialExperiences' 항목 중 '직장 경력', '인턴', '아르바이트', '수상 경력'을 '동아리 활동'이나 '기타' 경험보다 훨씬 더 비중 있게 참고하고 강조해서 작성해줘.`;

        const result = await callGeminiAPI(prompt); // core.js
        let newItemId = null; // [신규] 생성된 항목의 ID를 저장할 변수

        try {
            // [수정] .select('id').single()을 추가하여 방금 삽입된 행의 ID를 가져옴
            const { data: insertData, error } = await supabaseClient
                .from('generated_cover_letters')
                .insert({
                    user_username: appState.currentUser,
                    category: categoryText, // '지원동기' 등
                    question: question,     // 실제 문항
                    generated_text: result  // AI가 생성한 원본
                })
                .select('id')
                .single();

            if (error) throw error;
            if (insertData) {
                newItemId = insertData.id; // [신규] ID 저장
            }

        } catch (error) {
            console.error('F2 자소서 저장 실패:', error);
            // 사용자에게 알리지 않고 콘솔에만 에러를 남깁니다.
        }
        appState.feature2Data.generatedCount++; // 생성 횟수 증가

        // 결과 카드 생성 및 추가
        const resultContainer = document.getElementById('f2-result-container');
        
        // [수정] ID에 newItemId 사용
        const newResultId = `f2-result-textarea-${newItemId || Date.now()}`;
        const newProofreadBtnId = `f2-proofread-btn-${newItemId || Date.now()}`;
        const newEditBtnId = `f2-edit-btn-${newItemId || Date.now()}`; // [신규] 수정 버튼 ID

        const resultCard = document.createElement('div');
        resultCard.className = "bg-white p-4 rounded-lg shadow";
        resultCard.innerHTML = `
            <div class="flex items-center mb-3">
                <span class="text-sm font-semibold text-white py-1 px-3 rounded-full pastel-bg-primary">${categoryText}</span>
            </div>
            <p class="text-gray-800 font-semibold text-base mb-3 leading-snug">${question}</p>
            <textarea id="${newResultId}" class="w-full h-64 border rounded-md p-2 text-sm bg-gray-50" readonly>${result}</textarea>
            <div class="mt-2 grid grid-cols-3 gap-2">
                <button class="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 text-sm">Word로 다운로드</button> 
                <button id="${newProofreadBtnId}" class="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 text-sm">AI 문장 검수 받기</button>
                <button id="${newEditBtnId}" data-target-id="${newResultId}" data-item-id="${newItemId}" class="edit-f2-btn w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 text-sm">수정하기</button>
            </div>
        `;
        resultContainer.appendChild(resultCard);

        // --- [수정] Word 파일(.doc)로 다운로드 ---
        const downloadBtn = resultCard.querySelector('.bg-teal-500');
        downloadBtn.textContent = 'Word로 다운로드'; // 버튼 텍스트 변경
        downloadBtn.onclick = () => {
            // 1. 캡처 대상(cardToCapture)이 아닌, 문항과 내용을 직접 가져옵니다.
            const cardToCapture = downloadBtn.closest('.bg-white'); // 카테고리, 문항을 가져오기 위해 유지
            const question = cardToCapture.querySelector('p.text-gray-800').innerText;
            const content = document.getElementById(newResultId).value; // textarea의 ID로 실제 값 가져오기
            const category = categoryText; // '자소서 생성하기' 버튼 클릭 시 사용된 변수

            // 2. HTML 문자열 생성 (Word가 인식할 수 있도록)
            // \ufeff는 UTF-8 BOM으로, Excel/Word에서 한글이 깨지지 않게 합니다.
            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>ReadyJob 자소서</title></head>
                <body>
                    <h1>${category}</h1>
                    <h3>${question}</h3>
                    <p>${content.replace(/\n/g, '<br>')}</p>
                </body>
                </html>`;

            // 3. Blob을 'msword' 타입으로 생성
            const blob = new Blob(['\ufeff', htmlContent], {
                type: 'application/msword'
            });
            
            // 4. 다운로드 링크를 동적으로 생성하여 실행
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = `ReadyJob_${category}.doc`; // .doc 파일로 저장
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };

        // 'AI 문장 검수' 버튼 이벤트 리스너 추가
        const proofreadBtn = document.getElementById(newProofreadBtnId);
        proofreadBtn.onclick = async () => {
            const textarea = document.getElementById(newResultId);
            const currentText = textarea.value;
            if (!currentText) return alert("검수할 내용이 없습니다.");

            proofreadBtn.textContent = "검수 중...";
            proofreadBtn.disabled = true;

            const proofreadPrompt = `다음 자기소개서 문장을 더 매력적이고 전문적으로 다듬어줘. 핵심 내용은 유지하되, 문장 구조, 어휘 선택, 표현력을 개선해줘. 원본: "${currentText}"`;
            const refinedText = await callGeminiAPI(proofreadPrompt); // core.js

            textarea.value = refinedText.replace(/\*\*/g, ''); // ** 제거
            alert("문장 검수가 완료되었습니다!");
            proofreadBtn.textContent = "AI 문장 검수 받기";
            proofreadBtn.disabled = false;
        };

        // --- [신규] '수정하기' 버튼 리스너 추가 ---
        const editBtn = document.getElementById(newEditBtnId); 
        if (editBtn) {
            attachF2EditListener(editBtn); // 공통 리스너 함수 호출
        }

        document.getElementById('f2-loader').style.display = 'none'; // Hide loader
    };

    /**
     * [신규] F2 자소서 카드의 '수정하기'/'저장하기' 버튼에 이벤트 리스너를 바인딩합니다.
     * (mypage.js의 F2 수정 로직과 동일)
     * @param {HTMLElement} button - 'edit-f2-btn' 클래스를 가진 버튼 요소
     */
    function attachF2EditListener(button) {
        button.onclick = async (e) => {
            const btn = e.currentTarget;
            const targetId = btn.dataset.targetId;
            const itemId = btn.dataset.itemId;
            const textarea = document.getElementById(targetId);

            if (!itemId || itemId === "null") {
                alert('항목 ID를 찾을 수 없어 저장할 수 없습니다. (새로고침 후 시도해 주세요)');
                return;
            }

            if (btn.textContent === '수정하기') {
                // 1. 수정 모드로 변경
                textarea.readOnly = false;
                textarea.classList.remove('bg-gray-50');
                textarea.classList.add('bg-white', 'focus:ring-2', 'focus:ring-purple-500');
                textarea.focus();
                btn.textContent = '저장하기';
                btn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            } else {
                // 2. 저장 모드로 변경
                const newText = textarea.value;
                btn.textContent = '저장 중...';
                btn.disabled = true;

                // 3. Supabase에 저장
                const { error } = await supabaseClient
                    .from('generated_cover_letters')
                    .update({ generated_text: newText })
                    .eq('id', itemId);

                if (error) {
                    alert('저장에 실패했습니다: ' + error.message);
                    btn.textContent = '저장하기';
                    btn.disabled = false;
                } else {
                    // 4. 읽기 전용 모드로 복귀
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
    }

    async function loadAndRenderF2Results() {
        const resultContainer = document.getElementById('f2-result-container');
        resultContainer.innerHTML = '<div class="loader"></div>'; // 로딩 표시

        const { data, error } = await supabaseClient
            .from('generated_cover_letters')
            .select('*')
            .eq('user_username', appState.currentUser)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            resultContainer.innerHTML = ''; // 데이터 없으면 비움
            return;
        }

        resultContainer.innerHTML = ''; // 로더 제거

        // appState.feature2Data.generatedCount를 DB 카운트로 초기화 (10개 제한 로직)
        appState.feature2Data.generatedCount = data.length;

        data.forEach(item => {
            // 기존에 생성된 카드 렌더링 (생성 버튼 로직과 동일하게)
            const newResultId = `f2-result-textarea-${item.id}`;
            const newProofreadBtnId = `f2-proofread-btn-${item.id}`;

            const resultCard = document.createElement('div');
            resultCard.className = "bg-white p-4 rounded-lg shadow";
            resultCard.innerHTML = `
            <div class="flex items-center mb-3">
                <span class="text-sm font-semibold text-white py-1 px-3 rounded-full pastel-bg-primary">${item.category}</span>
            </div>
            <p class="text-gray-800 font-semibold text-base mb-3 leading-snug">${item.question}</p>
            <textarea id="${newResultId}" class="w-full h-64 border rounded-md p-2 text-sm bg-gray-50" readonly>${item.generated_text}</textarea>
            <div class="mt-2 grid grid-cols-3 gap-2">
                <button class="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 text-sm">Word로 다운로드</button> 
                <button id="${newProofreadBtnId}" class="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 text-sm">AI 문장 검수 받기</button>
                <button data-target-id="${newResultId}" data-item-id="${item.id}" class="edit-f2-btn w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 text-sm">수정하기</button>
            </div>
        `;
            resultContainer.appendChild(resultCard);

            // --- [수정] Word 파일(.doc)로 다운로드 ---
            const downloadBtn = resultCard.querySelector('.bg-teal-500');
            downloadBtn.textContent = 'Word로 다운로드'; // 버튼 텍스트 변경
            downloadBtn.onclick = () => {
                // 1. 문항과 내용을 직접 가져옵니다.
                const question = item.question; // DB에서 로드한 'item' 객체 사용
                const content = document.getElementById(newResultId).value; // textarea ID로 값 가져오기
                const category = item.category; // DB에서 로드한 'item' 객체 사용

                // 2. HTML 문자열 생성
                const htmlContent = `
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                    <head><meta charset='utf-8'><title>ReadyJob 자소서</title></head>
                    <body>
                        <h1>${category}</h1>
                        <h3>${question}</h3>
                        <p>${content.replace(/\n/g, '<br>')}</p>
                    </body>
                    </html>`;

                // 3. Blob을 'msword' 타입으로 생성
                const blob = new Blob(['\ufeff', htmlContent], {
                    type: 'application/msword'
                });
                
                // 4. 다운로드 링크 생성 및 실행
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = `ReadyJob_${category}.doc`; // .doc 파일로 저장
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            };

            // 'AI 문장 검수' 버튼 이벤트 리스너 추가
            const proofreadBtn = document.getElementById(newProofreadBtnId);
            proofreadBtn.onclick = async () => {
                const textarea = document.getElementById(newResultId);
                const currentText = textarea.value;
                if (!currentText) return alert("검수할 내용이 없습니다.");

                proofreadBtn.textContent = "검수 중...";
                proofreadBtn.disabled = true;

                const proofreadPrompt = `다음 자기소개서 문장을 더 매력적이고 전문적으로 다듬어줘. 핵심 내용은 유지하되, 문장 구조, 어휘 선택, 표현력을 개선해줘. 원본: "${currentText}"`;
                const refinedText = await callGeminiAPI(prompt);

                textarea.value = refinedText.replace(/\*\*/g, '');
                alert("문장 검수가 완료되었습니다!");
                proofreadBtn.textContent = "AI 문장 검수 받기";
                proofreadBtn.disabled = false;
            };

            // --- [신규] '수정하기' 버튼 이벤트 리스너 추가 ---
            const editBtn = resultCard.querySelector('.edit-f2-btn');
            if(editBtn) {
                attachF2EditListener(editBtn); // 공통 리스너 함수 호출
            }
        });
    }
}