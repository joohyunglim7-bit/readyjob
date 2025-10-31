// --- [4차 분리] F3(AI 면접) + F4(경력 관리) 통합 ---
// [수정 완료된 전체 코드]

// 1. core.js에서 공유 자원 import
import { appState, callGeminiAPI, supabaseClient } from './core.js';

// --- F3 변수 ---
let f3RadarChart = null; // 차트 인스턴스 전역 관리

// --- F3 HTML 생성 함수 ---
export function getFeature3HTML() {
    return `
        <div class="mb-4">
            <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                &larr; 대시보드로 돌아가기
            </button>
        </div>
        <h2 class="text-3xl font-bold mb-2">AI 면접 시뮬레이션</h2>
        <p class="text-gray-600 mb-8">'자기 분석' 프로필을 바탕으로 실전같은 AI 면접을 시작합니다.</p>

        <div id="f3-screen-1" class="f3-screen bg-white p-6 rounded-lg shadow">
            <h3 class="font-bold text-xl mb-6 text-center">1. 면접 연습 방식을 선택하세요.</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div data-mode="text" class="f3-selection-card">
                    <h4 class="font-bold text-lg">📝 텍스트 면접</h4>
                    <p class="text-sm text-gray-600">키보드로 답변을 입력하는 기본 면접입니다.</p>
                </div>
                <div data-mode="voice" class="f3-selection-card">
                    <h4 class="font-bold text-lg">🎙️ 음성 면접</h4>
                    <p class="text-sm text-gray-600">마이크를 통해 음성으로 답변합니다.</p>
                </div>
                <div data-mode="video" class="f3-selection-card">
                    <h4 class="font-bold text-lg">📹 화상 면접</h4>
                    <p class="text-sm text-gray-600">녹화된 영상을 보며 셀프 피드백을 합니다.</p>
                </div>
            </div>
        </div>

        <div id="f3-screen-2" class="f3-screen hidden bg-white p-6 rounded-lg shadow">
            <h3 class="font-bold text-xl mb-6 text-center">2. 면접 형태를 선택하세요.</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-type="taster" class="f3-selection-card">
                    <h4 class="font-bold text-lg">🍰 면접 맛보기</h4>
                    <p class="text-sm text-gray-600">핵심 역량별 대표 질문에 답변하며 감을 익힙니다.</p>
                </div>
                <div data-type="real" class="f3-selection-card">
                    <h4 class="font-bold text-lg">🔥 실전 면접</h4>
                    <p class="text-sm text-gray-600">프로필 기반 꼬리 질문으로 실전처럼 진행됩니다.</p>
                </div>
            </div>
            <div id="f3-taster-options" class="hidden mt-6">
                <h4 class="font-medium text-center mb-4">어떤 역량을 연습하시겠어요?</h4>
                <div class="flex justify-center flex-wrap gap-4">
                    <button data-category="자기소개" class="f3-category-btn">자기소개</button>
                    <button data-category="지원동기" class="f3-category-btn">지원동기</button>
                    <button data-category="직무역량" class="f3-category-btn">직무역량</button>
                    <button data-category="소통역량" class="f3-category-btn">소통/협력</button>
                    <button data-category="상황대처" class="f3-category-btn">상황대처</button>
                    <button data-category="포부" class="f3-category-btn">입사 후 포부</button>
                </div>
            </div>
            <div class="mt-8 flex justify-center">
                <button id="f3-start-btn" class="w-full max-w-xs pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-bold text-lg hidden">시뮬레이션 시작</button>
            </div>
        </div>

        <div id="f3-simulation-screen" class="f3-screen hidden">
         <div class="bg-white p-6 rounded-lg shadow">
            <div id="f3-video-container" class="hidden relative mb-4 bg-black rounded-md overflow-hidden aspect-video max-w-xl mx-auto">
                <video id="f3-video-feed" autoplay playsinline muted class="w-full h-full transform scale-x-[-1]"></video>
                <div id="f3-face-api-status" class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded"></div>
            </div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-xl">AI 면접 진행중...</h3>
                <div class="flex items-center gap-4">
                    <div id="f3-total-timer" class="hidden text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">10:00</div>
                    <div id="f3-timer" class="hidden text-2xl font-bold text-red-500">00:59</div>
                </div>
            </div>
            
            <div id="f3-interview-window" class="h-96 overflow-y-auto p-4 bg-gray-50 rounded-md border mb-4 space-y-4"></div>
            <div class="relative">
                <div id="f3-speech-status" class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm hidden animate-pulse">
                    🎙️ 듣고 있어요...
                </div>
                
                <div class="flex items-end gap-2">
                    <textarea id="f3-interview-input" class="flex-grow rounded-md border-gray-300 resize-none" placeholder="답변을 입력하거나 음성 버튼을 눌러 답변하세요..." rows="3"></textarea>
                    
                    <div class="flex-shrink-0 flex items-center gap-2">
                        <button id="f3-mic-btn" class="hidden h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-400" title="음성으로 답변하기">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zM3 8a1 1 0 011-1h1a1 1 0 011 1v1a4 4 0 004 4h0a4 4 0 004-4V8a1 1 0 011-1h1a1 1 0 110 2v1a6 6 0 01-6 6h0a6 6 0 01-6-6V8z"/></svg>
                        </button>
                        <button id="f3-interview-send-btn" class="h-12 px-6 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                            답변 제출
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button id="f3-exit-btn" class="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">면접 중단</button>
                <button id="f3-end-btn" class="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700">면접 종료</button>
            </div>
        </div>
    </div>

        <div id="f3-result-screen" class="f3-screen hidden">
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="font-bold text-xl mb-4 text-center">AI 면접 결과 보고서</h3>
            <div id="f3-result-loader" class="flex justify-center my-4"><div class="loader"></div></div>

            <div id="f3-result-content" class="hidden space-y-6">
                
                <div id="f3-video-playback-container" class="hidden">
                    <h4 class="font-bold text-lg mb-2">📹 나의 면접 영상 다시보기</h4>
                    <video id="f3-playback-video" class="w-full rounded-md bg-black" controls></video>
                    <button id="f3-download-video-btn" class="w-full mt-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                        면접 영상 다운로드
                    </button>
                </div>

                <div class="p-6 border rounded-lg bg-white">
                    <h4 class="font-bold text-lg mb-2">📊 종합 평가</h4>
                    <p id="f3-overall-evaluation" class="text-gray-600"></p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="p-6 border rounded-lg bg-white">
                        <h4 class="font-bold text-lg mb-4">⭐ 역량 분석 그래프</h4>
                        <div class="h-80"><canvas id="f3-radar-chart"></canvas></div>
                    </div>
                    <div class="p-6 border rounded-lg bg-purple-50 flex flex-col justify-center">
                        <h4 class="font-bold text-lg mb-2 text-purple-700">💡 합격을 위한 Tip</h4>
                        <p id="f3-tip" class="text-gray-700"></p>
                    </div>
                </div>

                <div id="f3-scripts-container" class="p-6 border rounded-lg bg-white">
                    <h4 class="font-bold text-lg mb-4">✍️ 답변 개선 스크립트</h4>
                    <div id="f3-scripts-list" class="space-y-6"></div>
                </div>
                
                <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button id="f3-back-to-dashboard-btn-2" class="w-full bg-gray-500 text-white py-3 rounded-md font-bold hover:bg-gray-600">대시보드로</button>
                    <button id="f3-retry-btn" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-bold">다시하기</button>
                </div>

            </div>
        </div>
    </div>

        <style>
            .f3-selection-card { border: 2px solid #e5e7eb; padding: 1.5rem; border-radius: 0.75rem; text-align: center; cursor: pointer; transition: all 0.2s ease; }
            .f3-selection-card:not(.disabled):hover { border-color: #A08CDA; transform: translateY(-4px); }
            .f3-selection-card.selected { border-color: #A08CDA; background-color: #F9F7FD; }
            .f3-selection-card.disabled { opacity: 0.5; cursor: not-allowed; }
            .f3-category-btn { padding: 0.5rem 1.5rem; border: 1px solid #d1d5db; border-radius: 9999px; transition: all 0.2s ease; }
            .f3-category-btn:hover { background-color: #f3f4f6; }
            .f3-category-btn.selected { background-color: #EAE6F6; border-color: #A08CDA; color: #8A73C8; font-weight: 600; }
            #f3-mic-btn.recording {
                animation: pulse-animation 1.5s infinite;
            }

            @keyframes pulse-animation {
                0% { box-shadow: 0 0 0 0 rgba(160, 140, 218, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(160, 140, 218, 0); }
                100% { box-shadow: 0 0 0 0 rgba(160, 140, 218, 0); }
            }
        </style>
    `;
}

// --- F3 이벤트 리스너 ---
export function bindF3Listeners() {
    // 1. 데이터 및 상태 관리
    const interviewQuestions = { "자기소개": ["자신을 한 문장으로 표현한다면 어떻게 표현하시겠습니까?", "본인의 성격을 한 단어로 표현한다면요?", "본인의 강점을 보여주는 대표적인 경험을 소개해주세요.", "다른 사람들과 구별되는 당신만의 특징은 무엇인가요?", "지금까지의 경험에서 가장 중요한 전환점은 무엇이었나요?"], "지원동기": ["우리 회사에 지원한 동기는 무엇인가요?", "여러 기업 중 특별히 우리 회사를 선택한 이유는 무엇인가요?", "입사 후 가장 먼저 하고 싶은 일은 무엇인가요?", "지원 직무에 관심을 가지게 된 계기는 무엇인가요?", "우리 회사의 비전이나 가치 중 마음에 드는 부분은 무엇입니까?"], "직무역량": ["지원한 직무에 가장 중요한 역량은 무엇이라고 생각하나요?", "직무 관련 가장 성공적이었던 프로젝트 경험을 말씀해주세요.", "자신의 전공이 이 직무에 어떻게 도움이 될 것이라 생각하나요?", "이 직무를 수행하기 위해 어떤 노력을 해왔습니까?", "자신의 가장 큰 직무상 강점은 무엇인가요?"], "소통역량": ["의견이 다른 팀원을 설득해 본 경험이 있나요?", "팀워크를 강화하기 위해 어떤 노력을 하시나요?", "동료와 갈등이 생겼을 때 어떻게 해결하나요?", "본인이 생각하는 소통을 잘하는 사람이란 어떤 사람인가요?", "타인의 피드백을 수용하여 개선한 경험이 있나요?"], "상황대처": ["상사가 부당한 지시를 한다면 어떻게 대응하겠습니까?", "프로젝트 마감이 임박했는데 예상치 못한 문제가 발생하면 어떻게 대처하겠습니까?", "자신의 아이디어가 거절당했을 때 어떻게 반응하나요?", "주어진 자원이 부족한 상황에서 과업을 성공시켜야 한다면 어떻게 하겠습니까?", "스트레스가 많은 상황에서 평정심을 유지한 경험이 있나요?"], "포부": ["입사 후 1년 내에 이루고 싶은 목표는 무엇인가요?", "5년, 10년 뒤 자신의 모습은 어떨 것 같나요?", "우리 회사에서 이루고 싶은 최종적인 꿈은 무엇인가요?", "성장을 위해 어떤 노력을 지속적으로 하고 있나요?", "회사 발전에 기여할 수 있는 아이디어가 있나요?"] };

    const simulationState = {
        mode: null,
        type: null,
        category: null,
        chatHistory: [],
        isRecognizing: false,
        stream: null,
        answerTimer: null,
        totalInterviewTimer: null,
        alert5minShown: false,
        alert1minShown: false,
        mediaRecorder: null,
        recordedChunks: [],
        isWaitingForAI: false,
        isManualStop: false
    };
    let recognition;
    let endOfSpeechTimeout;

    // 2. 기술 API 초기화 (음성, 화상)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            if (simulationState.isWaitingForAI) return;

            clearTimeout(endOfSpeechTimeout);
            let final_transcript = '';
            let interim_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            const currentBaseText = Array.from(event.results).slice(0, event.resultIndex).map(r => r[0].transcript).join('');
            document.getElementById('f3-interview-input').value = currentBaseText + final_transcript + interim_transcript;

            endOfSpeechTimeout = setTimeout(() => {
                if (recognition) recognition.stop();
            }, 4000);
        };
        recognition.onstart = () => {
            simulationState.isRecognizing = true;
            document.getElementById('f3-speech-status').classList.remove('hidden');
            document.getElementById('f3-mic-btn').classList.add('recording');
            document.getElementById('f3-interview-input').value = '';

            if (!simulationState.answerTimer) {
                startAnswerTimer();
            }
        };
        recognition.onend = () => {
            simulationState.isRecognizing = false;
            document.getElementById('f3-speech-status').classList.add('hidden');
            document.getElementById('f3-mic-btn').classList.remove('recording');

            if (simulationState.isManualStop) {
                simulationState.isManualStop = false;
                return;
            }

            if (document.getElementById('f3-interview-input').value.trim() && !simulationState.isWaitingForAI) {
                handleInterviewSend();
            }
        };
        recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
    }

    async function startVideo() {
        const videoEl = document.getElementById('f3-video-feed');
        const statusEl = document.getElementById('f3-face-api-status');

        try {
            statusEl.textContent = "카메라 준비 중...";
            simulationState.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoEl.srcObject = simulationState.stream;
            videoEl.onloadedmetadata = () => {
                statusEl.textContent = "면접 영상 녹화 중...";
                statusEl.style.color = "red";

                simulationState.recordedChunks = [];
                const options = { mimeType: 'video/webm; codecs=vp9' };
                simulationState.mediaRecorder = new MediaRecorder(simulationState.stream, options);

                simulationState.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        simulationState.recordedChunks.push(event.data);
                    }
                };

                simulationState.onStopPromise = new Promise(resolve => {
                    simulationState.mediaRecorder.onstop = async () => {
                        const blob = new Blob(simulationState.recordedChunks, { type: 'video/webm' });
                        const fileName = `public/${appState.currentUser}_${new Date().getTime()}.webm`;
                        let videoURL = null;
    
                        try {
                            // 1. 영상 업로드
                            const { data, error } = await supabaseClient.storage
                                .from('interview_videos')
                                .upload(fileName, blob, {
                                    cacheControl: '3600',
                                    upsert: false
                                });
    
                            if (error) throw error;
    
                            const { data: urlData } = supabaseClient.storage
                                .from('interview_videos')
                                .getPublicUrl(fileName);
    
                            videoURL = urlData.publicUrl;
    
                            // 2. 결과 화면에 즉시 영상 재생 및 다운로드 버튼 설정
                            const playbackVideoEl = document.getElementById('f3-playback-video');
                            const playbackContainer = document.getElementById('f3-video-playback-container');
                            playbackVideoEl.src = videoURL;
                            playbackContainer.classList.remove('hidden');
    
                            const downloadBtn = document.getElementById('f3-download-video-btn');
                            downloadBtn.onclick = () => {
                                window.open(videoURL, '_blank');
                            };
    
                        } catch (error) {
                            console.error('영상 업로드 실패:', error);
                            alert('면접 영상 클라우드 저장에 실패했습니다.');
                        } finally {
                            // 3. 스트림 중지 (중요)
                            if (simulationState.stream) {
                                simulationState.stream.getTracks().forEach(track => track.stop());
                                simulationState.stream = null;
                            }
    
                            // 4. [핵심] Promise를 videoURL과 함께 resolve
                            //    (generateAndDisplayReport 호출은 여기서 삭제)
                            resolve(videoURL);
                        }
                    };
                });
                // --- [수정 완료] ---

                simulationState.mediaRecorder.start();
            };
        } catch (err) {
            console.error("카메라/마이크 접근 오류:", err);
            alert("카메라/마이크 접근에 실패했습니다. 브라우저의 권한을 확인해주세요.");
            statusEl.textContent = "장치 접근 오류";
        }
    }

    function startTotalInterviewTimer() {
        clearInterval(simulationState.totalInterviewTimer);
        simulationState.alert5minShown = false;
        simulationState.alert1minShown = false;

        const timerElement = document.getElementById('f3-total-timer');
        if (!timerElement) return;

        const endTime = Date.now() + 600 * 1000;

        const updateTimerDisplay = (secondsValue) => {
            const minutes = Math.floor(secondsValue / 60);
            const seconds = secondsValue % 60;
            const displayMinutes = Math.max(0, minutes);
            const displaySeconds = Math.max(0, seconds);
            timerElement.textContent = `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
        };

        updateTimerDisplay(600);

        simulationState.totalInterviewTimer = setInterval(() => {
            const remainingMs = endTime - Date.now();
            const totalSeconds = Math.round(remainingMs / 1000);

            updateTimerDisplay(totalSeconds);

            if (totalSeconds <= 300 && !simulationState.alert5minShown) {
                alert("면접 시간이 5분 남았습니다.");
                simulationState.alert5minShown = true;
            }

            if (totalSeconds <= 60 && !simulationState.alert1minShown) {
                alert("면접 시간이 1분 남았습니다. 면접을 마무리해주세요.");
                simulationState.alert1minShown = true;
            }

            if (totalSeconds <= 0) {
                clearInterval(simulationState.totalInterviewTimer);

                if (document.getElementById('f3-result-screen').classList.contains('hidden')) {
                    alert("면접 시간이 종료되었습니다. AI가 최종 결과를 분석합니다.");
                    document.getElementById('f3-end-btn').click();
                }
            }
        }, 1000);
    }

    // --- [수정 2단계] stopAllSimulations 함수 수정 ---
    function stopAllSimulations(stopStream = true) { // [수정] stopStream 파라미터 추가 (기본값 true)
        if (recognition && simulationState.isRecognizing) recognition.stop();
        clearTimeout(endOfSpeechTimeout);
        clearInterval(simulationState.answerTimer);
        clearInterval(simulationState.totalInterviewTimer);

        if (stopStream && simulationState.stream) { // [수정] 파라미터가 true일 때만 스트림 중지
            simulationState.stream.getTracks().forEach(track => track.stop());
        }

        Object.assign(simulationState, {
            stream: stopStream ? null : simulationState.stream, // [수정] 스트림을 껐을 때만 null로 설정
            answerTimer: null,
            totalInterviewTimer: null,
            isRecognizing: false,
            isWaitingForAI: false
        });
    }
    // --- [수정 완료] ---


    const screens = document.querySelectorAll('.f3-screen');
    const showScreen = (screenId) => {
        screens.forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId)?.classList.remove('hidden');
    };

    const updateInterviewWindow = () => {
        const interviewWindow = document.getElementById('f3-interview-window');
        interviewWindow.innerHTML = simulationState.chatHistory.map(msg => {
            if (msg.type === 'loading') {
                return `<div class="flex justify-start"><div class="p-3 chat-bubble chat-bubble-ai italic text-gray-500">${msg.text}</div></div>`;
            }
            return `<div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                        <div class="p-3 chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">
                            ${msg.text.replace(/\n/g, '<br>')}
                        </div>
                    </div>`;
        }).join('');
        interviewWindow.scrollTop = interviewWindow.scrollHeight;
    };

    const handleInterviewSend = async () => {
        if (simulationState.isWaitingForAI) return;

        if (recognition && simulationState.isRecognizing) {
            simulationState.isManualStop = true;
            recognition.stop();
        }
        clearTimeout(endOfSpeechTimeout);
        clearInterval(simulationState.answerTimer);
        simulationState.answerTimer = null;
        document.getElementById('f3-timer').classList.add('hidden');

        const input = document.getElementById('f3-interview-input');
        const answer = input.value.trim();
        if (!answer) return;

        simulationState.isWaitingForAI = true;

        simulationState.chatHistory.push({ role: 'user', text: answer });
        simulationState.chatHistory.push({ role: 'ai', text: '면접관 레디가 답변을 생성 중입니다...', type: 'loading' });
        updateInterviewWindow();

        input.value = '';
        input.disabled = true;
        document.getElementById('f3-interview-send-btn').disabled = true;
        document.getElementById('f3-mic-btn').disabled = true;

        const historyForPrompt = simulationState.chatHistory.slice(0, -1)
            .map(m => `${m.role === 'user' ? '지원자' : '면접관'}: ${m.text}`)
            .join('\n');

        const priorityTypes = ['직장 경력', '인턴', '아르바이트', '수상 경력'];
        const prioritizedProfile = JSON.parse(JSON.stringify(appState.feature1Data));
        prioritizedProfile.socialExperiences.sort((a, b) => {
            const aIsPriority = priorityTypes.includes(a.type);
            const bIsPriority = priorityTypes.includes(b.type);
            if (aIsPriority && !bIsPriority) return -1;
            if (!aIsPriority && bIsPriority) return 1;
            return 0;
        });

        const nextQuestionPrompt = `
            당신은 전문 AI 면접관입니다. 아래 대화 내용을 바탕으로 다음 질문을 해주세요.
            [지원자 프로필] ${JSON.stringify(prioritizedProfile)}
            [이전 대화 내용] ${historyForPrompt}
            [지시사항]
            1. 지원자의 마지막 답변에 대해 반드시 다른 각도의 심층 질문(꼬리 질문)을 해주세요.
            2. 다음 질문 유형 중 하나를 선택하여 질문하세요:
               - 경험의 구체적인 결과나 성과를 묻는 질문
               - 경험 중 겪었던 어려움과 해결 과정을 묻는 질문
               - 그 경험을 통해 무엇을 배웠는지 묻는 질문
               - 지원자의 다른 프로필 정보(특히 사회 경험)와 연결하는 질문
            3. [매우 중요] 'socialExperiences'를 참고하여 질문할 때, '직장 경력', '인턴', '아르바이트', '수상 경력'을 '동아리 활동'이나 '기타' 경험보다 최우선으로 질문해주세요.
            4. 절대로 이전과 비슷하거나 같은 질문을 반복하지 마세요.
            5. 질문만 간결하게 해주세요. 부연 설명은 필요 없습니다.`;

        const nextQuestion = await callGeminiAPI(nextQuestionPrompt);
        simulationState.chatHistory.pop();
        simulationState.chatHistory.push({ role: 'ai', text: nextQuestion });
        updateInterviewWindow();

        simulationState.isWaitingForAI = false;

        input.disabled = false;
        document.getElementById('f3-interview-send-btn').disabled = false;
        document.getElementById('f3-mic-btn').disabled = false;
        input.focus();
    };

    function startAnswerTimer() {
        clearInterval(simulationState.answerTimer);
        const timerEl = document.getElementById('f3-timer');
        timerEl.classList.remove('hidden');
        let timeLeft = 59;
        timerEl.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
        simulationState.answerTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(simulationState.answerTimer);
                if (simulationState.isRecognizing) recognition.stop();
                else handleInterviewSend();
            }
        }, 1000);
    }

    const startInterview = async () => {
        simulationState.chatHistory = [];
        simulationState.isWaitingForAI = false;
        clearInterval(simulationState.answerTimer);
        simulationState.answerTimer = null;

        if (!appState.feature1Data.jobInfo || appState.feature1Data.socialExperiences.length === 0) {
            return alert("'자기 분석 & 프로필 생성'의 '희망 직무/산업'과 '나의 사회 경험'을 먼저 완료해주세요.");
        }

        document.getElementById('f3-mic-btn').classList.add('hidden');
        document.getElementById('f3-video-container').classList.add('hidden');
        document.getElementById('f3-total-timer').classList.add('hidden');

        if (simulationState.mode === 'voice') {
            document.getElementById('f3-mic-btn').classList.remove('hidden');
        } else if (simulationState.mode === 'video') {
            document.getElementById('f3-mic-btn').classList.remove('hidden');
            document.getElementById('f3-video-container').classList.remove('hidden');
            document.getElementById('f3-total-timer').classList.remove('hidden');
            await startVideo();
            startTotalInterviewTimer();
        }

        showScreen('f3-simulation-screen');
        document.getElementById('f3-interview-window').innerHTML = '<div class="flex justify-center my-4"><div class="loader"></div></div>';

        let firstQuestion;
        if (simulationState.type === 'taster') {
            const questions = interviewQuestions[simulationState.category];
            firstQuestion = questions[Math.floor(Math.random() * questions.length)];
        } else {
            firstQuestion = await callGeminiAPI(`당신은 전문 AI 면접관입니다. 실제 면접처럼 "1분 자기소개 부탁드립니다."로 면접을 시작해주세요.`);
        }
        simulationState.chatHistory.push({ role: 'ai', text: firstQuestion });
        updateInterviewWindow();

        startTotalInterviewTimer();
    };

    // --- [수정 1단계] 결과 보고서 생성 함수 추출 (및 videoURL 파라미터 추가) ---
    async function generateAndDisplayReport(videoURL = null) { // [수정] videoURL 파라미터 추가
        const transcript = simulationState.chatHistory.filter(m => m.type !== 'loading')
            .map(m => `${m.role === 'user' ? '지원자' : '면접관'}: ${m.text}`)
            .join('\n\n');
        const userAnswers = simulationState.chatHistory.filter(m => m.role === 'user').map(m => m.text);

        const evaluationPrompt = `
        당신은 채용 전문가입니다. 아래 면접 대화 내용을 바탕으로 종합적인 피드백을 제공해주세요. 피드백은 반드시 아래의 JSON 형식에 맞춰서, 다른 설명 없이 JSON 객체만 반환해주세요.
        [면접 대화 내용]
        ${transcript}
        [사용자 답변 목록]
        ${JSON.stringify(userAnswers)}
        [출력 형식]
        {
          "overall": "지원자에 대한 종합적인 평가를 2~3문장으로 구체적으로 작성해주세요.",
          "scores": { "직무 이해도": 100, "논리력": 100, "의사소통": 100, "경험의 구체성": 100, "인성/가치관": 100 },
          "tip": "지원자가 합격하기 위한 가장 핵심적인 조언이나 팁을 한 문장으로 작성해주세요.",
          "improved_scripts": [
            ${userAnswers.map(answer => `{ "user_answer": "${answer.replace(/"/g, '\\"')}", "improved_script": "해당 답변에 대한 구체적이고 전문적인 개선 스크립트" }`).join(',')}
          ]
        }`;

        const resultText = await callGeminiAPI(evaluationPrompt, true);

        try {
            let result;
            const cleanedResultText = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            result = JSON.parse(cleanedResultText);

            // --- [신규] videoURL이 있으면 result_json 객체에 추가 ---
            if (videoURL) {
                result.videoUrl = videoURL; // mypage.js가 이 'videoUrl' 키를 찾습니다.
            }
            // --- [신규] 수정 완료 ---

            try {
                const { error: dbError } = await supabaseClient
                    .from('starter_interview_results')
                    .insert({
                        user_username: appState.currentUser,
                        mode: simulationState.mode,
                        type: simulationState.type,
                        category: simulationState.category || '실전 면접', // 👈 [수정] null일 경우 '실전 면접' 텍스트를 대신 저장
                        result_json: result
                    });
                if (dbError) throw dbError;
            } catch (dbError) {
                console.error('F3 면접 결과 저장 실패:', dbError);
            }
            if (result.error) throw new Error(result.error);

            document.getElementById('f3-overall-evaluation').textContent = result.overall;
            document.getElementById('f3-tip').textContent = result.tip;

            const scriptsList = document.getElementById('f3-scripts-list');
            if (result.improved_scripts && result.improved_scripts.length > 0) {
                scriptsList.innerHTML = result.improved_scripts.map(item => `
                <div>
                    <p class="text-sm font-semibold text-gray-600 mb-1">나의 답변:</p>
                    <p class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md mb-2">${item.user_answer}</p>
                    <p class="text-sm font-semibold text-purple-700 mb-1">💡 레디의 개선 스크립트:</p>
                    <p class="text-sm text-purple-900 bg-purple-50 p-2 rounded-md">${item.improved_script}</p>
                </div>
            `).join('');
                document.getElementById('f3-scripts-container').classList.remove('hidden');
            } else {
                document.getElementById('f3-scripts-container').classList.add('hidden');
            }

            if (f3RadarChart) f3RadarChart.destroy();
            f3RadarChart = new Chart(document.getElementById('f3-radar-chart').getContext('2d'), {
                type: "radar",
                data: {
                    labels: Object.keys(result.scores),
                    datasets: [{
                        label: "역량 점수",
                        data: Object.values(result.scores),
                        backgroundColor: "rgba(160, 140, 218, 0.2)",
                        borderColor: "#A08CDA",
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { r: { beginAtZero: true, max: 100 } }
                }
            });

            document.getElementById('f3-result-loader').classList.add('hidden');
            document.getElementById('f3-result-content').classList.remove('hidden');

        } catch (e) {
            console.error("결과 파싱 또는 렌더링 오류:", e, "원본 AI 응답:", resultText);
            document.getElementById('f3-result-loader').classList.add('hidden');
            const contentDiv = document.getElementById('f3-result-content');
            contentDiv.classList.remove('hidden');

            // [수정] 에러 발생 시 버튼 2개 레이아웃으로 변경
            contentDiv.innerHTML = `
                <p class="text-center text-red-500">결과 보고서를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
                <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button id="f3-back-to-dashboard-btn-err" class="w-full bg-gray-500 text-white py-3 rounded-md font-bold hover:bg-gray-600">대시보드로</button>
                    <button id="f3-retry-btn-err" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-bold">다시하기</button>
                </div>
            `;

            // [수정] 에러 시 생성된 버튼에도 리스너 바인딩
            const retryFn = () => {
                const playbackVideoEl = document.getElementById('f3-playback-video');
                const playbackContainer = document.getElementById('f3-video-playback-container');
                if (playbackVideoEl && playbackVideoEl.src) {
                    URL.revokeObjectURL(playbackVideoEl.src);
                    playbackVideoEl.src = '';
                }
                if (playbackContainer) playbackContainer.classList.add('hidden');

                showScreen('f3-screen-1');
                document.querySelectorAll('.f3-selection-card.selected, .f3-category-btn.selected').forEach(el => el.classList.remove('selected'));
                document.getElementById('f3-start-btn')?.classList.add('hidden');
                document.getElementById('f3-taster-options')?.classList.add('hidden');
            };

            document.getElementById('f3-retry-btn-err').onclick = retryFn;
            document.getElementById('f3-back-to-dashboard-btn-err').onclick = () => {
                // 상단의 메인 '대시보드로 돌아가기' 버튼 클릭
                document.querySelector('.back-to-dashboard-btn').click();
            };
        }
    }
    // --- [함수 추출 완료] ---


    // --- 3. 이벤트 리스너 바인딩 ---

    document.querySelectorAll('#f3-screen-1 .f3-selection-card').forEach(card => {
        const mode = card.dataset.mode;
        if (mode === 'voice' && !SpeechRecognition) {
            card.classList.add('disabled');
            card.querySelector('h4').textContent = '🎙️ 음성 면접 (미지원 브라우저)';
            return;
        }
        card.onclick = () => {
            simulationState.mode = mode;
            document.querySelector('#f3-screen-1 .selected')?.classList.remove('selected');
            card.classList.add('selected');
            showScreen('f3-screen-2');
        };
    });

    const tasterOptions = document.getElementById('f3-taster-options');
    const startBtn = document.getElementById('f3-start-btn');
    document.querySelectorAll('#f3-screen-2 .f3-selection-card').forEach(card => {
        card.onclick = () => {
            simulationState.type = card.dataset.type;
            document.querySelector('#f3-screen-2 .selected')?.classList.remove('selected');
            card.classList.add('selected');
            if (simulationState.type === 'taster') {
                tasterOptions.classList.remove('hidden');
                startBtn.classList.add('hidden');
            } else {
                tasterOptions.classList.add('hidden');
                simulationState.category = null;
                startBtn.classList.remove('hidden');
            }
        };
    });

    document.querySelectorAll('#f3-taster-options .f3-category-btn').forEach(btn => {
        btn.onclick = () => {
            simulationState.category = btn.dataset.category;
            document.querySelector('#f3-taster-options .selected')?.classList.remove('selected');
            btn.classList.add('selected');
            startBtn.classList.remove('hidden');
        };
    });

    startBtn.onclick = startInterview;

    document.getElementById('f3-interview-send-btn').onclick = handleInterviewSend;
    const interviewInput = document.getElementById('f3-interview-input');
    interviewInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            handleInterviewSend();
        }
    };
    interviewInput.oninput = () => {
        if ((simulationState.mode === 'voice' || simulationState.mode === 'video') && !simulationState.answerTimer) {
            startAnswerTimer();
        }
    };

    const micBtn = document.getElementById('f3-mic-btn');
    const handleMicClick = () => {
        if (!recognition) return;
        if (simulationState.isRecognizing) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error("Mic start error:", e);
            }
        }
    };
    micBtn.onclick = handleMicClick;
    micBtn.ontouchstart = (e) => {
        e.preventDefault();
        handleMicClick();
    };

    document.getElementById('f3-exit-btn').onclick = () => {
        if (confirm('정말로 면접을 중단하고 이전 화면으로 돌아가시겠습니까?')) {
            stopAllSimulations();
            showScreen('f3-screen-1');
        }
    };


    // --- [수정 3단계] f3-end-btn.onclick 수정 ---
    document.getElementById('f3-end-btn').onclick = async () => {
        const userAnswerCount = simulationState.chatHistory.filter(m => m.role === 'user').length;
        if (userAnswerCount < 1) {
            return alert("최소 1개 이상의 답변을 하셔야 결과 분석이 가능합니다.");
        }

        const isVideoRecording = simulationState.mediaRecorder && simulationState.mediaRecorder.state === 'recording';

        // [수정] 타이머와 음성인식만 중지 (스트림은 끄지 않음)
        stopAllSimulations(!isVideoRecording);

        // [수정] 결과 화면 표시 및 로더 실행 (여기까지는 공통)
        showScreen('f3-result-screen');
        document.getElementById('f3-result-content').classList.add('hidden');
        document.getElementById('f3-result-loader').classList.remove('hidden');

        let videoURL = null; // videoURL을 저장할 변수

        // [수정] 분기 처리
        if (isVideoRecording) {
            // 1. 화상 면접이었으면: 녹화 중지를 호출
            simulationState.mediaRecorder.stop();
            
            // 2. [핵심] onStopPromise가 resolve(영상 업로드 완료)될 때까지 기다림
            videoURL = await simulationState.onStopPromise;

        } 
        
        // 3. [핵심] 영상 처리가 모두 끝나거나, (텍스트/음성 면접이었을 경우)
        //    이제서야 리포트 생성 및 DB 저장을 호출합니다.
        //    이 함수가 완료될 때까지 'await'하므로, DB 저장이 보장됩니다.
        await generateAndDisplayReport(videoURL); 
    };


    // '다시하기' 버튼
    document.getElementById('f3-retry-btn').onclick = () => {
        const playbackVideoEl = document.getElementById('f3-playback-video');
        const playbackContainer = document.getElementById('f3-video-playback-container');
        if (playbackVideoEl.src) {
            URL.revokeObjectURL(playbackVideoEl.src);
            playbackVideoEl.src = '';
        }
        playbackContainer.classList.add('hidden');

        showScreen('f3-screen-1');
        document.querySelectorAll('.f3-selection-card.selected, .f3-category-btn.selected').forEach(el => el.classList.remove('selected'));
        startBtn.classList.add('hidden');
        tasterOptions.classList.add('hidden');
    };

    // [신규] '대시보드로' 버튼
    document.getElementById('f3-back-to-dashboard-btn-2').onclick = () => {
        // 상단의 메인 '대시보드로 돌아가기' 버튼 클릭
        document.querySelector('.back-to-dashboard-btn').click();
    };
}

// --- F4 HTML 생성 함수 ---
export function getFeature4HTML() {
    return `
        <div class="mb-4">
            <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                &larr; 대시보드로 돌아가기
            </button>
        </div>
        <h2 class="text-3xl font-bold mb-8">개인 경력 관리</h2><p class="text-gray-600 mb-4">'자기 분석' 메뉴에서 입력한 나의 경험/역량 데이터를 이곳에서 확인하고, 최신 트렌드를 확인하며 경쟁력을 높여보세요.</p><div class="bg-white rounded-lg shadow"><div class="border-b border-gray-200"><nav id="f4-tabs" class="-mb-px flex space-x-8 p-4 overflow-x-auto" aria-label="Tabs"><button data-tab="experience" class="f4-tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm tab-btn active">나의 경험/역량</button><button data-tab="trends" class="f4-tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 tab-btn">산업/직무 트렌드</button></nav></div><div id="f4-tab-content" class="p-6"><div id="f4-experience-content" class="f4-tab-panel"><h3 class="text-xl font-bold mb-4">나의 경험 목록</h3><div id="f4-experience-list" class="space-y-4 max-h-96 overflow-y-auto pr-2"><p class="text-gray-500">아직 추가된 경험이 없습니다.</p></div></div><div id="f4-trends-content" class="f4-tab-panel hidden"><h3 class="text-xl font-bold mb-4">최신 산업/직무 트렌드</h3><div id="f4-trends-list" class="space-y-4"></div></div></div></div>`;
}

// --- F4 이벤트 리스너 ---
export function bindF4Listeners() {
    const tabs = document.querySelectorAll('.f4-tab-btn');
    const panels = document.querySelectorAll('.f4-tab-panel');

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active', 'border-indigo-500', 'text-indigo-600'));
            tabs.forEach(t => t.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300'));
            panels.forEach(p => p.classList.add('hidden'));

            tab.classList.add('active', 'border-indigo-500', 'text-indigo-600');
            tab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            const targetPanel = document.getElementById(`f4-${tab.dataset.tab}-content`);
            targetPanel.classList.remove('hidden');

            if (tab.dataset.tab === 'experience') {
                const listDiv = document.getElementById('f4-experience-list');
                const experiences = appState.feature1Data.socialExperiences;
                if (experiences.length === 0) {
                    listDiv.innerHTML = `<p class="text-gray-500">'자기 분석 & 프로필 생성' 메뉴에서 사회 경험을 추가해주세요.</p>`;
                } else {
                    listDiv.innerHTML = experiences.map(exp => `
                            <div class="experience-card !p-4"> 
                                <div class="flex items-center gap-4 mb-2"><span class="exp-type-badge">${exp.type}</span><h5 class="font-bold text-gray-800">${exp.org}</h5></div>
                                <p class="text-xs text-gray-500 mb-3">${exp.period.startY}.${String(exp.period.startM).padStart(2, '0')} ~ ${exp.period.isPresent ? '현재' : `${exp.period.endY}.${String(exp.period.endM).padStart(2, '0')}`} <span class="font-semibold text-gray-700 ml-1">(${exp.duration})</span></p>
                                <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">${exp.tasks.map(t => `<li>${t}</li>`).join('')}</ul>
                            </div>`).join('');
                }
            }
        };
    });

    const trendsList = document.getElementById('f4-trends-list');
    trendsList.innerHTML = appState.feature4Data.trends.map(trend => ` 
        <div class="p-4 border rounded-md bg-white shadow-sm">
            <h4 class="font-bold text-lg mb-1">${trend.title}</h4>
            <p class="text-gray-700 my-2 text-sm">${trend.summary}</p>
            <a href="${trend.link}" target="_blank" class="text-indigo-600 hover:underline text-sm font-medium">자세히 보기 &rarr;</a>
        </div>
    `).join('');

    const defaultTab = document.querySelector('.f4-tab-btn[data-tab="experience"]');
    if (defaultTab) {
        defaultTab.click();
    }
}