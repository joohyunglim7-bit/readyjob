// --- [신규] Expert 모드 (expert.js) ---

// 1. core.js에서 공유 자원 import
import { appState, callGeminiAPI, supabaseClient } from './core.js';

// --- Expert 모드 상태 변수 ---
let expertRadarChart = null; // 차트 인스턴스
const expertState = {
    coverLetterItems: [],
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
    isManualStop: false,
    onStopPromise: null 
};
let expertRecognition;
let expertEndOfSpeechTimeout;

// --- Expert HTML 생성 함수 ---
export function getExpertHTML() {
    return `
        <div class="mb-4">
            <button class="back-to-dashboard-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm">
                &larr; 버전 선택으로 돌아가기
            </button>
        </div>
        <h2 class="text-3xl font-bold mb-2">🌟 Expert 모드</h2>
        <p class="text-gray-600 mb-8">기존 자소서를 분석하여 심층 면접을 진행하고, 최종 피드백과 함께 보완된 자소서를 제공합니다.</p>

        <div id="expert-step-1" class="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 class="font-bold text-xl mb-4">1. 자소서 분석 및 면접 준비</h3>
            <p class="text-gray-600">면접을 진행할 자소서 문항과 내용을 추가해 주세요. (최대 10개)</p>
            
            <div id="expert-cl-list-container" class="space-y-4">
                </div>

            <button id="expert-add-cl-btn" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border-2 border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                자소서 문항 추가 (<span id="expert-cl-count">0</span>/10)
            </button>

            <button id="expert-start-btn" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-bold text-lg">
                분석 및 AI 면접 시작하기
            </button>
        </div>

        <div id="expert-step-2" class="hidden">
         <div class="bg-white p-6 rounded-lg shadow">
            <div id="expert-video-container" class="relative mb-4 bg-black rounded-md overflow-hidden aspect-video max-w-xl mx-auto">
                <video id="expert-video-feed" autoplay playsinline muted class="w-full h-full transform scale-x-[-1]"></video>
                <div id="expert-face-api-status" class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded"></div>
            </div>
            
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-xl">AI 심층 면접 진행중...</h3>
                <div class="flex items-center gap-4">
                    <div id="expert-total-timer" class="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">10:00</div>
                    <div id="expert-timer" class="hidden text-2xl font-bold text-red-500">00:59</div>
                </div>
            </div>
            
            <div id="expert-interview-window" class="h-96 overflow-y-auto p-4 bg-gray-50 rounded-md border mb-4 space-y-4"></div>
            <div class="relative">
                <div id="expert-speech-status" class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm hidden animate-pulse">
                    🎙️ 듣고 있어요...
                </div>
                <div class="flex items-end gap-2">
                    <textarea id="expert-interview-input" class="flex-grow rounded-md border-gray-300 resize-none" placeholder="답변을 입력하거나 음성 버튼을 눌러 답변하세요..." rows="3"></textarea>
                    <div class="flex-shrink-0 flex items-center gap-2">
                        <button id="expert-mic-btn" class="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-400" title="음성으로 답변하기">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zM3 8a1 1 0 011-1h1a1 1 0 011 1v1a4 4 0 004 4h0a4 4 0 004-4V8a1 1 0 011-1h1a1 1 0 110 2v1a6 6 0 01-6 6h0a6 6 0 01-6-6V8z"/></svg>
                        </button>
                        <button id="expert-interview-send-btn" class="h-12 px-6 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                            답변 제출
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button id="expert-end-btn" class="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700">면접 종료</button>
            </div>
        </div>
    </div>

        <div id="expert-step-3" class="hidden">
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="font-bold text-xl mb-4 text-center">Expert 모드 AI 면접 결과 보고서</h3>
            <div id="expert-result-loader" class="flex justify-center my-4"><div class="loader"></div></div>

            <div id="expert-result-content" class="hidden space-y-6">
                
                <div id="expert-video-playback-container" class="hidden">
                    <h4 class="font-bold text-lg mb-2">📹 나의 면접 영상 다시보기</h4>
                    <video id="expert-playback-video" class="w-full rounded-md bg-black" controls></video>
                    <button id="expert-download-video-btn" class="w-full mt-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                        면접 영상 다운로드
                    </button>
                </div>

                <div class="p-6 border rounded-lg bg-purple-50">
                    <h4 class="font-bold text-lg mb-2 text-purple-700">💡 AI 최종 보완 자소서</h4>
                    <p class="text-sm text-gray-700 mb-3">면접에서 답변하신 내용을 바탕으로 AI가 기존 자소서 문항들을 보완했습니다. (이 내용은 '나의 활동' 페이지에서도 수정/관리할 수 있습니다.)</p>
                    <div id="expert-improved-cl-list" class="space-y-4">
                        </div>
                </div>
                <div class="p-6 border rounded-lg bg-white">
                    <h4 class="font-bold text-lg mb-2">📊 종합 평가</h4>
                    <p id="expert-overall-evaluation" class="text-gray-600"></p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="p-6 border rounded-lg bg-white">
                        <h4 class="font-bold text-lg mb-4">⭐ 역량 분석 그래프</h4>
                        <div class="h-80"><canvas id="expert-radar-chart"></canvas></div>
                    </div>
                    <div class="p-6 border rounded-lg bg-white flex flex-col justify-center">
                        <h4 class="font-bold text-lg mb-2 text-indigo-700">💡 합격을 위한 Tip</h4>
                        <p id="expert-tip" class="text-gray-700"></p>
                    </div>
                </div>

                <div class="p-6 border rounded-lg bg-white">
                    <h4 class="font-bold text-lg mb-4">✍️ 답변 개선 스크립트</h4>
                    <div id="expert-scripts-list" class="space-y-6"></div>
                </div>
                
                <button id="expert-retry-btn" class="w-full pastel-bg-primary pastel-bg-primary-hover text-white py-3 rounded-md font-bold">처음으로 돌아가기</button>

            </div>
        </div>
    </div>
    
    <style>
        #expert-mic-btn.recording {
            animation: pulse-animation 1.5s infinite;
        }
        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(160, 140, 218, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(160, 140, 218, 0); }
            100% { box-shadow: 0 0 0 0 rgba(160, 140, 218, 0); }
        }
        .expert-cl-item {
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 1rem;
            background-color: #f9fafb;
            position: relative;
        }
        .expert-delete-cl-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            color: #9ca3af;
            cursor: pointer;
        }
        .expert-delete-cl-btn:hover {
            color: #ef4444;
        }
    </style>
    `;
}

// --- Expert 이벤트 리스너 ---
export function bindExpertListeners() {
    // 헬퍼 1: 현재 자소서 항목 개수 업데이트
    const updateCLItemCount = () => {
        const count = document.querySelectorAll('#expert-cl-list-container .expert-cl-item').length;
        document.getElementById('expert-cl-count').textContent = count;
        document.getElementById('expert-add-cl-btn').disabled = (count >= 10);
        return count;
    };

    // 헬퍼 2: 새 자소서 항목 UI 렌더링
    const renderNewCLItem = () => {
        if (updateCLItemCount() >= 10) {
            alert("자소서 문항은 최대 10개까지 추가할 수 있습니다.");
            return;
        }

        const listContainer = document.getElementById('expert-cl-list-container');
        const newItem = document.createElement('div');
        newItem.className = 'expert-cl-item space-y-2';
        newItem.innerHTML = `
            <button type="button" class="expert-delete-cl-btn" title="삭제">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div>
                <label class="block text-sm font-medium text-gray-700">문항</label>
                <input type="text" class="expert-cl-question w-full rounded-md border-gray-300 shadow-sm" placeholder="자소서 문항을 입력하세요 (예: 지원동기)">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">내용</label>
                <textarea class="expert-cl-content w-full rounded-md border-gray-300 shadow-sm" rows="5" placeholder="문항에 대한 답변 내용을 입력하세요"></textarea>
            </div>
        `;
        listContainer.appendChild(newItem);
        updateCLItemCount();
    };

    // 헬퍼 3: DOM에서 자소서 항목 수집하여 state에 저장
    const collectCLItems = () => {
        expertState.coverLetterItems = [];
        let totalLength = 0;
        const items = document.querySelectorAll('#expert-cl-list-container .expert-cl-item');

        for (const item of items) {
            const question = item.querySelector('.expert-cl-question').value.trim();
            const content = item.querySelector('.expert-cl-content').value.trim();

            if (!question || !content) {
                alert("비어있는 문항이나 내용이 있습니다. 모두 입력해주세요.");
                return false; // 유효성 검사 실패
            }
            expertState.coverLetterItems.push({ question, content });
            totalLength += content.length;
        }

        if (expertState.coverLetterItems.length === 0) {
            alert("최소 1개 이상의 자소서 문항을 추가해주세요.");
            return false;
        }
        if (totalLength < 100) {
            alert("자소서 내용의 총 합이 100자 이상이어야 합니다.");
            return false;
        }

        return true; // 유효성 검사 성공
    };
    // --- [1단계] 이벤트 리스너 ---
    document.getElementById('expert-start-btn').onclick = async () => {
        if (!collectCLItems()) {
            return;
        }
        document.getElementById('expert-step-1').classList.add('hidden');
        document.getElementById('expert-step-2').classList.remove('hidden');
        await startExpertInterview();
    };

    document.getElementById('expert-add-cl-btn').onclick = renderNewCLItem;
    document.getElementById('expert-cl-list-container').addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.expert-delete-cl-btn');
        if (deleteBtn) {
            deleteBtn.closest('.expert-cl-item').remove();
            updateCLItemCount();
        }
    });

    renderNewCLItem();

    // --- [2단계] 이벤트 리스너 (F3 복사/수정) ---

    // 2-1. 음성 인식 초기화
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        expertRecognition = new SpeechRecognition();
        expertRecognition.continuous = true;
        expertRecognition.lang = 'ko-KR';
        expertRecognition.interimResults = true;

        expertRecognition.onresult = (event) => {
            if (expertState.isWaitingForAI) return;
            clearTimeout(expertEndOfSpeechTimeout);
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
            document.getElementById('expert-interview-input').value = currentBaseText + final_transcript + interim_transcript;

            expertEndOfSpeechTimeout = setTimeout(() => {
                if (expertRecognition) expertRecognition.stop();
            }, 4000); 
        };
        expertRecognition.onstart = () => {
            expertState.isRecognizing = true;
            document.getElementById('expert-speech-status').classList.remove('hidden');
            document.getElementById('expert-mic-btn').classList.add('recording');
            document.getElementById('expert-interview-input').value = '';
            if (!expertState.answerTimer) startExpertAnswerTimer();
        };
        expertRecognition.onend = () => {
            expertState.isRecognizing = false;
            document.getElementById('expert-speech-status').classList.add('hidden');
            document.getElementById('expert-mic-btn').classList.remove('recording');
            if (expertState.isManualStop) {
                expertState.isManualStop = false;
                return;
            }
            if (document.getElementById('expert-interview-input').value.trim() && !expertState.isWaitingForAI) {
                handleExpertInterviewSend();
            }
        };
        expertRecognition.onerror = (event) => console.error("Expert speech recognition error:", event.error);
    } else {
        document.getElementById('expert-mic-btn').classList.add('hidden');
    }

    // 2-2. 화상 면접 시작
    async function startExpertVideo() {
        const videoEl = document.getElementById('expert-video-feed');
        const statusEl = document.getElementById('expert-face-api-status');
        const videoContainer = document.getElementById('expert-video-container');
        videoContainer.classList.remove('hidden'); 

        try {
            statusEl.textContent = "카메라 준비 중...";
            expertState.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoEl.srcObject = expertState.stream;
            videoEl.onloadedmetadata = () => {
                statusEl.textContent = "면접 영상 녹화 중...";
                statusEl.style.color = "red";
                expertState.recordedChunks = [];
                const options = { mimeType: 'video/webm; codecs=vp9' };
                expertState.mediaRecorder = new MediaRecorder(expertState.stream, options);

                expertState.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) expertState.recordedChunks.push(event.data);
                };

                expertState.onStopPromise = new Promise(resolve => {
                    expertState.mediaRecorder.onstop = async () => {
                        const blob = new Blob(expertState.recordedChunks, { type: 'video/webm' });
                        const fileName = `public/expert_${appState.currentUser}_${new Date().getTime()}.webm`;
                        let videoURL = null;

                        try {
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

                            const playbackVideoEl = document.getElementById('expert-playback-video');
                            const playbackContainer = document.getElementById('expert-video-playback-container');
                            playbackVideoEl.src = videoURL;
                            playbackContainer.classList.remove('hidden');

                            const downloadBtn = document.getElementById('expert-download-video-btn');
                            downloadBtn.onclick = () => {
                                window.open(videoURL, '_blank');
                            };

                        } catch (error) {
                            console.error('Expert 영상 업로드 실패:', error);
                            alert('Expert 면접 영상 클라우드 저장에 실패했습니다.');
                        } finally {
                            if (expertState.stream) {
                                expertState.stream.getTracks().forEach(track => track.stop());
                                expertState.stream = null;
                            }
                            resolve(videoURL);
                        }
                    };
                });
                expertState.mediaRecorder.start();
            };
        } catch (err) {
            console.error("Expert 카메라/마이크 접근 오류:", err);
            statusEl.textContent = "장치 접근 오류";
            videoContainer.classList.add('hidden');
        }
    }

    // 2-3. 전체 면접 타이머
    function startExpertTotalTimer() {
        clearInterval(expertState.totalInterviewTimer);
        expertState.alert5minShown = false;
        expertState.alert1minShown = false;

        const timerElement = document.getElementById('expert-total-timer');
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

        expertState.totalInterviewTimer = setInterval(() => {
            const remainingMs = endTime - Date.now();
            const totalSeconds = Math.round(remainingMs / 1000);

            updateTimerDisplay(totalSeconds);

            if (totalSeconds <= 300 && !expertState.alert5minShown) {
                alert("면접 시간이 5분 남았습니다.");
                expertState.alert5minShown = true;
            }

            if (totalSeconds <= 60 && !expertState.alert1minShown) {
                alert("면접 시간이 1분 남았습니다. 면접을 마무리해주세요.");
                expertState.alert1minShown = true;
            }

            if (totalSeconds <= 0) {
                clearInterval(expertState.totalInterviewTimer);
                if (document.getElementById('expert-step-3').classList.contains('hidden')) {
                    alert("면접 시간이 종료되었습니다. AI가 최종 결과를 분석합니다.");
                    document.getElementById('expert-end-btn').click();
                }
            }
        }, 1000);
    }

    // 2-4. 모든 시뮬레이션 중지
    function stopAllExpertSimulations(stopStream = true) {
        if (expertRecognition && expertState.isRecognizing) expertRecognition.stop();
        clearTimeout(expertEndOfSpeechTimeout);
        clearInterval(expertState.answerTimer);
        clearInterval(expertState.totalInterviewTimer);
        
        if (stopStream && expertState.stream) { 
            expertState.stream.getTracks().forEach(track => track.stop());
        }

        Object.assign(expertState, {
            stream: stopStream ? null : expertState.stream, 
            answerTimer: null, totalInterviewTimer: null,
            isRecognizing: false, isWaitingForAI: false
        });
    }

    // 2-5. 인터뷰 창 업데이트
    const updateExpertInterviewWindow = () => {
        const interviewWindow = document.getElementById('expert-interview-window');
        interviewWindow.innerHTML = expertState.chatHistory.map(msg => {
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

    // 2-6. 답변 제출 처리
    const handleExpertInterviewSend = async () => {
        if (expertState.isWaitingForAI) return;
        if (expertRecognition && expertState.isRecognizing) {
            expertState.isManualStop = true;
            expertRecognition.stop();
        }
        clearTimeout(expertEndOfSpeechTimeout);
        clearInterval(expertState.answerTimer);
        expertState.answerTimer = null; 
        document.getElementById('expert-timer').classList.add('hidden');

        const input = document.getElementById('expert-interview-input');
        const answer = input.value.trim();
        if (!answer) return;

        expertState.isWaitingForAI = true;
        expertState.chatHistory.push({ role: 'user', text: answer });
        expertState.chatHistory.push({ role: 'ai', text: '면접관 레디가 답변을 생성 중입니다...', type: 'loading' });
        updateExpertInterviewWindow();

        input.value = '';
        input.disabled = true;
        document.getElementById('expert-interview-send-btn').disabled = true;
        document.getElementById('expert-mic-btn').disabled = true;

        const historyForPrompt = expertState.chatHistory.slice(0, -1)
            .map(m => `${m.role === 'user' ? '지원자' : '면접관'}: ${m.text}`)
            .join('\n');

        const nextQuestionPrompt = `
            당신은 전문 AI 면접관입니다. 아래 대화 내용과 지원자의 자소서 목록을 바탕으로 다음 질문을 해주세요.
            [지원자 자소서 목록 (문항/답변)]
            ${JSON.stringify(expertState.coverLetterItems)}
            
            [이전 대화 내용]
            ${historyForPrompt}
            
            [지시사항]
            1. 지원자의 마지막 답변에 대해 반드시 다른 각도의 심층 질문(꼬리 질문)을 해주세요.
            2. 자소서 목록에 있는 내용과 지원자의 답변을 비교하며 날카로운 질문을 해주세요.
            3. 절대로 이전과 비슷하거나 같은 질문을 반복하지 마세요.
            4. 질문만 간결하게 해주세요. 부연 설명은 필요 없습니다.`;

        const nextQuestion = await callGeminiAPI(nextQuestionPrompt);
        expertState.chatHistory.pop(); // 로딩 제거
        expertState.chatHistory.push({ role: 'ai', text: nextQuestion });
        updateExpertInterviewWindow();

        expertState.isWaitingForAI = false;
        input.disabled = false;
        document.getElementById('expert-interview-send-btn').disabled = false;
        document.getElementById('expert-mic-btn').disabled = false;
        input.focus();
    };

    // 2-7. 답변 제한 시간 타이머
    function startExpertAnswerTimer() {
        clearInterval(expertState.answerTimer);
        const timerEl = document.getElementById('expert-timer');
        timerEl.classList.remove('hidden');
        let timeLeft = 59;
        timerEl.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
        expertState.answerTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(expertState.answerTimer);
                if (expertState.isRecognizing) expertRecognition.stop();
                else handleExpertInterviewSend();
            }
        }, 1000);
    }

    // 2-8. 인터뷰 시작 함수
    const startExpertInterview = async () => {
        expertState.chatHistory = [];
        expertState.isWaitingForAI = false;
        clearInterval(expertState.answerTimer);
        expertState.answerTimer = null;

        await startExpertVideo(); 

        document.getElementById('expert-interview-window').innerHTML = '<div class="flex justify-center my-4"><div class="loader"></div></div>';

        const firstQuestionPrompt = `
            당신은 전문 AI 면접관입니다.
            제가 방금 아래의 자기소개서 문항과 답변 목록을 제출했습니다.
            [제출한 자소서 목록 (문항/답변)]
            ${JSON.stringify(expertState.coverLetterItems)}
            
            [지시사항]
            이 자소서 목록 내용 전체를 바탕으로, 저에게 가장 궁금한 **첫 번째 면접 질문**을 1개만 해주세요.
            (예: "OOO 문항에 OOO 경험을 작성해주셨는데, 구체적으로 어떤 역할이셨나요?" 등)
        `;
        const firstQuestion = await callGeminiAPI(firstQuestionPrompt);

        expertState.chatHistory.push({ role: 'ai', text: firstQuestion });
        updateExpertInterviewWindow();

        startExpertTotalTimer(); 
    };

    // 2-9. [2단계] 버튼 이벤트 바인딩
    document.getElementById('expert-interview-send-btn').onclick = handleExpertInterviewSend;
    const expertInput = document.getElementById('expert-interview-input');
    expertInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            handleExpertInterviewSend();
        }
    };
    expertInput.oninput = () => {
        if (!expertState.answerTimer) startExpertAnswerTimer();
    };

    const expertMicBtn = document.getElementById('expert-mic-btn');
    const handleExpertMicClick = () => {
        if (!expertRecognition) return;
        if (expertState.isRecognizing) expertRecognition.stop();
        else {
            try { expertRecognition.start(); } catch (e) { }
        }
    };
    expertMicBtn.onclick = handleExpertMicClick;
    expertMicBtn.ontouchstart = (e) => { e.preventDefault(); handleExpertMicClick(); };

    // --- [3단계] 이벤트 리스너 (면접 종료 및 결과 처리) ---

    // 3-1. 면접 종료 버튼
    document.getElementById('expert-end-btn').onclick = async () => {
        const userAnswerCount = expertState.chatHistory.filter(m => m.role === 'user').length;
        if (userAnswerCount < 1) {
            return alert("최소 1개 이상의 답변을 하셔야 결과 분석이 가능합니다.");
        }

        const isVideoRecording = expertState.mediaRecorder && expertState.mediaRecorder.state === 'recording';
        stopAllExpertSimulations(!isVideoRecording); 

        document.getElementById('expert-step-2').classList.add('hidden');
        document.getElementById('expert-step-3').classList.remove('hidden');
        document.getElementById('expert-result-content').classList.add('hidden');
        document.getElementById('expert-result-loader').classList.remove('hidden');
        
        let videoURL = null; 

        if (isVideoRecording) {
            expertState.mediaRecorder.stop();
            videoURL = await expertState.onStopPromise;
        } 
        
        await generateAndDisplayReport(videoURL); 
    };

    /**
     * 면접 종료 시 결과 리포트 생성, 표시, 및 DB 저장
     * [수정] 자소서와 면접 피드백을 분리하여 저장
     */
    async function generateAndDisplayReport(videoURL = null) {
        const transcript = expertState.chatHistory.filter(m => m.type !== 'loading')
            .map(m => `${m.role === 'user' ? '지원자' : '면접관'}: ${m.text}`)
            .join('\n\n');
        const userAnswers = expertState.chatHistory.filter(m => m.role === 'user').map(m => m.text);

        const evaluationPrompt = `
        당신은 채용 전문가입니다. 아래의 [원본 자소서 목록]과 [면접 대화 내용]을 바탕으로 종합적인 피드백을 제공해주세요.
        피드백은 반드시 아래의 JSON 형식에 맞춰서, 다른 설명 없이 JSON 객체만 반환해주세요.
        
        [원본 자소서 목록 (문항/답변)]
        ${JSON.stringify(expertState.coverLetterItems)}
        
        [면접 대화 내용]
        ${transcript}
        
        [사용자 답변 목록]
        ${JSON.stringify(userAnswers)}
        
        [출력 JSON 형식]
        {
          "overall": "지원자에 대한 종합적인 평가를 2~3문장으로 구체적으로 작성해주세요.",
          "scores": { "직무 이해도": 100, "논리력": 100, "의사소통": 100, "경험의 구체성": 100, "인성/가치관": 100 },
          "tip": "지원자가 합격하기 위한 가장 핵심적인 조언이나 팁을 한 문장으로 작성해주세요.",
          "improved_scripts": [
            ${userAnswers.map(answer => `{ "user_answer": "${answer.replace(/"/g, '\\"')}", "improved_script": "해당 답변에 대한 구체적이고 전문적인 개선 스크립트" }`).join(',')}
          ],
          "improved_cover_letters": [
            ${expertState.coverLetterItems.map(item => `{ "question": "${item.question.replace(/"/g, '\\"')}", "improved_content": "면접 대화 내용을 바탕으로 해당 문항의 [원본 답변]을 더 매력적으로 보완한 [최종 보완 답변]을 이곳에 작성해주세요." }`).join(',')}
          ]
        }`;

        const resultText = await callGeminiAPI(evaluationPrompt, true); 

        try {
            const cleanedResultText = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            const result = JSON.parse(cleanedResultText);

            if (result.error) throw new Error(result.error);

            // --- ▼▼▼ [신규] 데이터 분리 저장 로직 ▼▼▼ ---

            // 1. 첨삭 자소서(improved_cover_letters)를 분리
            const revisedResumes = result.improved_cover_letters || [];
            delete result.improved_cover_letters; // 원본 result 객체에서 자소서 제거

            // 2. 영상 URL을 면접 피드백 객체에 추가
            if (videoURL) {
                result.videoUrl = videoURL; 
            }

            // 3. 면접 피드백(자소서 제외됨)을 'expert_session_results'에 저장
            try {
                const { error: dbError } = await supabaseClient
                    .from('expert_session_results')
                    .insert({
                        user_username: appState.currentUser,
                        result_json: result // 자소서 내용이 제거된 면접 피드백
                    });
                if (dbError) throw dbError;
            } catch (dbError) {
                console.error('Expert (면접 피드백) 저장 실패:', dbError);
                // 여기서 실패하면 치명적이므로 알릴 수 있지만, 일단 콘솔 로그만
            }

            // 4. 분리한 첨삭 자소서를 'generated_cover_letters'에 (F2와 동일하게) 저장
            if (revisedResumes.length > 0) {
                const coverLettersToInsert = revisedResumes.map(item => ({
                    user_username: appState.currentUser,
                    category: "Expert 첨삭", // F2와 구분하기 위한 카테고리
                    question: item.question,
                    generated_text: item.improved_content
                }));

                // F2 자소서 테이블에 삽입
                const { error: clError } = await supabaseClient
                    .from('generated_cover_letters')
                    .insert(coverLettersToInsert);

                if (clError) {
                    console.error('Expert (첨삭 자소서) 저장 실패:', clError);
                    // 이건 실패해도 면접 피드백은 저장되었으므로 계속 진행
                }
            }
            // --- ▲▲▲ 데이터 분리 저장 로직 끝 ▲▲▲ ---


            // ▼▼▼ 즉시 결과 화면 렌더링 (이 부분은 기존 로직 유지) ▼▼▼
            // (mypage.js와 달리, 여기서는 방금 생성된 첨삭 자소서를 보여줌)
            const improvedListContainer = document.getElementById('expert-improved-cl-list');
            if (revisedResumes.length > 0) { // [수정] 분리된 변수 사용
                improvedListContainer.innerHTML = revisedResumes.map(item => `
                    <div class="bg-white p-4 rounded-md shadow-sm">
                        <p class="text-sm font-semibold text-gray-700 mb-2">${item.question}</p>
                        <p class="text-gray-600"><textarea class="w-full h-40 border rounded-md p-2 text-sm bg-gray-50" readonly>${item.improved_content}</textarea></p>
                    </div>
                `).join('');
            } else {
                improvedListContainer.innerHTML = "<p class='text-gray-600'>AI가 자소서를 보완하는 데 실패했습니다.</p>";
            }

            document.getElementById('expert-overall-evaluation').textContent = result.overall;
            document.getElementById('expert-tip').textContent = result.tip;

            const scriptsList = document.getElementById('expert-scripts-list');
            if (result.improved_scripts && result.improved_scripts.length > 0) {
                scriptsList.innerHTML = result.improved_scripts.map(item => `
                <div>
                    <p class="text-sm font-semibold text-gray-600 mb-1">나의 답변:</p>
                    <p class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md mb-2">${item.user_answer}</p>
                    <p class="text-sm font-semibold text-purple-700 mb-1">💡 레디의 개선 스크립트:</p>
                    <p class="text-sm text-purple-900 bg-purple-50 p-2 rounded-md">${item.improved_script}</p>
                </div>
            `).join('');
            }

            if (expertRadarChart) expertRadarChart.destroy();
            expertRadarChart = new Chart(document.getElementById('expert-radar-chart').getContext('2d'), {
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
                    responsive: true, maintainAspectRatio: false,
                    scales: { r: { beginAtZero: true, max: 100 } }
                }
            });

            document.getElementById('expert-result-loader').classList.add('hidden');
            document.getElementById('expert-result-content').classList.remove('hidden');

        } catch (e) { // (오류 처리 로직)
            
            // [수정] 폴백 저장 시 자소서 관련 키 제거
            try {
                console.warn('Expert 리포트 생성 실패. 원본 대화 내용만이라도 저장합니다.');
                const fallbackResult = {
                    error: "AI report generation failed.",
                    overall: "AI 리포트 생성에 실패했습니다. 면접 이력은 저장되었으나 분석에 실패했습니다.",
                    scores: { "직무 이해도": 0, "논리력": 0, "의사소통": 0, "경험의 구체성": 0, "인성/가치관": 0 },
                    tip: "오류 발생",
                    improved_scripts: [],
                    // improved_cover_letters: [], // 이 키 자체를 제거
                    videoUrl: videoURL || null 
                };

                await supabaseClient
                    .from('expert_session_results')
                    .insert({
                        user_username: appState.currentUser,
                        result_json: fallbackResult 
                    });

            } catch (dbError) {
                console.error('Expert "폴백" 결과 저장도 실패:', dbError);
            }

            console.error("Expert 결과 파싱 오류:", e, "원본:", resultText);
            document.getElementById('expert-result-loader').classList.add('hidden');
            const contentDiv = document.getElementById('expert-result-content');
            contentDiv.classList.remove('hidden');
            contentDiv.innerHTML = `<p class="text-center text-red-500">결과 보고서 생성에 실패했습니다.</p> <button id="expert-retry-btn" class="mt-6 w-full pastel-bg-primary ...">처음으로 돌아가기</button>`;

            document.getElementById('expert-retry-btn').onclick = () => {
                document.getElementById('expert-step-3').classList.add('hidden');
                document.getElementById('expert-step-1').classList.remove('hidden');
                const listContainer = document.getElementById('expert-cl-list-container');
                listContainer.innerHTML = ''; 
                expertState.coverLetterItems.forEach(item => {
                    renderNewCLItem(); 
                    const lastItem = listContainer.lastChild;
                    if (lastItem) {
                        lastItem.querySelector('.expert-cl-question').value = item.question;
                        lastItem.querySelector('.expert-cl-content').value = item.content;
                    }
                });
                if (listContainer.children.length === 0) renderNewCLItem(); 
                updateCLItemCount();
            };
        }
    }


    // 3-2. 다시하기 버튼
    document.getElementById('expert-retry-btn').onclick = () => {
        const playbackVideoEl = document.getElementById('expert-playback-video');
        if (playbackVideoEl.src) {
            URL.revokeObjectURL(playbackVideoEl.src);
            playbackVideoEl.src = '';
        }
        document.getElementById('expert-video-playback-container').classList.add('hidden');

        document.getElementById('expert-step-3').classList.add('hidden');
        document.getElementById('expert-step-1').classList.remove('hidden');

        const listContainer = document.getElementById('expert-cl-list-container');
        listContainer.innerHTML = ''; 

        expertState.coverLetterItems.forEach(item => {
            renderNewCLItem(); 
            const lastItem = listContainer.lastChild;
            if (lastItem) {
                lastItem.querySelector('.expert-cl-question').value = item.question;
                lastItem.querySelector('.expert-cl-content').value = item.content;
            }
        });
        if (listContainer.children.length === 0) renderNewCLItem(); 
        updateCLItemCount();
    };
}