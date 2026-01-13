// APIベースURL（相対パスを使用してnginxプロキシ経由でアクセス）
const API_BASE = '/api';

// アプリケーション状態
let currentUser = null;
let factories = [];
let departments = [];
let currentView = 'home';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        setupEventListeners();
        // 並列で読み込み（エラーが発生しても続行）
        Promise.allSettled([
            loadFactories(),
            loadCases()
        ]).then(results => {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.warn(`初期化エラー (${index === 0 ? 'factories' : 'cases'}):`, result.reason);
                }
            });
        });
    } catch (error) {
        console.error('Error initializing app:', error);
        // アラートは表示しない（個別のエラーハンドリングで処理）
    }
}

function setupEventListeners() {
    try {
        // ナビゲーション
        const homeBtn = document.getElementById('homeBtn');
        const postBtn = document.getElementById('postBtn');
        const summaryBtn = document.getElementById('summaryBtn');
        const loginBtn = document.getElementById('loginBtn');
        const backBtn = document.getElementById('backBtn');

        if (homeBtn) homeBtn.addEventListener('click', () => showView('home'));
        if (postBtn) postBtn.addEventListener('click', () => showView('post'));
        if (summaryBtn) summaryBtn.addEventListener('click', () => showView('summary'));
        if (loginBtn) loginBtn.addEventListener('click', () => showLoginModal());
        if (backBtn) backBtn.addEventListener('click', () => showView('home'));

        // モーダル
        const loginModal = document.getElementById('loginModal');
        const closeBtn = document.querySelector('.close');
        if (closeBtn && loginModal) {
            closeBtn.addEventListener('click', () => {
                loginModal.classList.remove('show');
            });
        }
        if (loginModal) {
            window.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    loginModal.classList.remove('show');
                }
            });
        }

        // フォーム
        const loginForm = document.getElementById('loginForm');
        const postForm = document.getElementById('postForm');
        const commentForm = document.getElementById('commentForm');
        
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (postForm) postForm.addEventListener('submit', handlePost);
        if (commentForm) commentForm.addEventListener('submit', handleComment);

        // フィルター
        const factoryFilter = document.getElementById('factoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        
        if (factoryFilter) factoryFilter.addEventListener('change', handleFactoryFilter);
        if (searchInput) searchInput.addEventListener('input', debounce(loadCases, 300));
        if (sortSelect) sortSelect.addEventListener('change', loadCases);

        // 画像プレビュー
        const postImages = document.getElementById('postImages');
        if (postImages) postImages.addEventListener('change', handleImagePreview);
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// ビュー切り替え
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    currentView = viewName;
    
    switch(viewName) {
        case 'home':
            document.getElementById('homeView').classList.remove('hidden');
            document.getElementById('homeBtn').classList.add('active');
            loadCases();
            break;
        case 'post':
            if (!currentUser) {
                showLoginModal();
                return;
            }
            document.getElementById('postView').classList.remove('hidden');
            document.getElementById('postBtn').classList.add('active');
            loadFactoriesForPost();
            break;
        case 'summary':
            document.getElementById('summaryView').classList.remove('hidden');
            document.getElementById('summaryBtn').classList.add('active');
            loadTopCases();
            break;
        case 'detail':
            document.getElementById('detailView').classList.remove('hidden');
            break;
    }
}

// ログインモーダル
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

// ログイン処理
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
            document.getElementById('loginModal').classList.remove('show');
            document.getElementById('loginForm').reset();
        } else {
            alert('ログインに失敗しました');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('エラーが発生しました');
    }
}

// 認証UI更新
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    if (currentUser) {
        authSection.innerHTML = `
            <span>${currentUser.username}</span>
            <button id="logoutBtn" class="btn btn-secondary">ログアウト</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    } else {
        authSection.innerHTML = '<button id="loginBtn" class="btn btn-primary">ログイン</button>';
        document.getElementById('loginBtn').addEventListener('click', () => showLoginModal());
    }
}

// ログアウト
function handleLogout() {
    currentUser = null;
    updateAuthUI();
    showView('home');
}

// 工場データ読み込み
async function loadFactories() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
        
        const response = await fetch(`${API_BASE}/factories`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 502 || response.status === 503) {
                console.warn('バックエンドサーバーが起動中です。しばらく待ってから再読み込みしてください。');
                // 5秒後にリトライ
                setTimeout(loadFactories, 5000);
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        factories = await response.json();
        
        const factoryFilter = document.getElementById('factoryFilter');
        if (factoryFilter) {
            factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name;
                factoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('バックエンドサーバーへの接続がタイムアウトしました。再試行します...');
            setTimeout(loadFactories, 5000);
            return;
        }
        console.error('Error loading factories:', error);
        // エラーを表示しない（APIが利用できない場合でもアプリは動作する）
    }
}

// 投稿用工場・係読み込み
async function loadFactoriesForPost() {
    try {
        const response = await fetch(`${API_BASE}/factories`);
        const factoriesData = await response.json();
        
        const factorySelect = document.getElementById('postFactory');
        factorySelect.innerHTML = '<option value="">選択してください</option>';
        factoriesData.forEach(factory => {
            const option = document.createElement('option');
            option.value = factory.id;
            option.textContent = factory.name;
            factorySelect.appendChild(option);
        });

        factorySelect.addEventListener('change', async (e) => {
            const factoryId = e.target.value;
            if (factoryId) {
                await loadDepartmentsForPost(factoryId);
            }
        });
    } catch (error) {
        console.error('Error loading factories:', error);
    }
}

async function loadDepartmentsForPost(factoryId) {
    try {
        const response = await fetch(`${API_BASE}/departments?factoryId=${factoryId}`);
        const departmentsData = await response.json();
        
        const departmentSelect = document.getElementById('postDepartment');
        departmentSelect.innerHTML = '<option value="">選択してください</option>';
        departmentsData.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// 工場フィルター
function handleFactoryFilter() {
    const factoryId = document.getElementById('factoryFilter').value;
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.innerHTML = '<option value="">すべての係</option>';
    
    if (factoryId) {
        fetch(`${API_BASE}/departments?factoryId=${factoryId}`)
            .then(res => res.json())
            .then(depts => {
                depts.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.name;
                    departmentFilter.appendChild(option);
                });
            });
    }
    loadCases();
}

// ケース読み込み
async function loadCases() {
    const factoryId = document.getElementById('factoryFilter')?.value || '';
    const departmentId = document.getElementById('departmentFilter')?.value || '';
    const keyword = document.getElementById('searchInput')?.value || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'date';

    let url = `${API_BASE}/cases?`;
    if (factoryId) url += `factoryId=${factoryId}&`;
    if (departmentId) url += `departmentId=${departmentId}&`;
    if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
        
        const response = await fetch(url, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 502 || response.status === 503) {
                const casesList = document.getElementById('casesList');
                if (casesList) {
                    casesList.innerHTML = '<div class="error">バックエンドサーバーが起動中です。しばらく待ってから再読み込みしてください。</div>';
                }
                // 5秒後にリトライ
                setTimeout(loadCases, 5000);
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cases = await response.json();
        displayCases(cases);
    } catch (error) {
        if (error.name === 'AbortError') {
            const casesList = document.getElementById('casesList');
            if (casesList) {
                casesList.innerHTML = '<div class="error">バックエンドサーバーへの接続がタイムアウトしました。再試行します...</div>';
            }
            setTimeout(loadCases, 5000);
            return;
        }
        console.error('Error loading cases:', error);
        const casesList = document.getElementById('casesList');
        if (casesList) {
            casesList.innerHTML = '<div class="error">データの読み込みに失敗しました。APIサーバーに接続できません。</div>';
        }
    }
}

// ケース表示
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    
    if (cases.length === 0) {
        casesList.innerHTML = '<div class="loading">改善事例がありません</div>';
        return;
    }

    casesList.innerHTML = cases.map(caseItem => `
        <div class="case-card" onclick="showCaseDetail(${caseItem.id})">
            <img src="${caseItem.images[0] || '/uploads/default.jpg'}" 
                 alt="${caseItem.title}" 
                 class="case-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23f0f0f0\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3E画像なし%3C/text%3E%3C/svg%3E'">
            <div class="case-content">
                <h3 class="case-title">${escapeHtml(caseItem.title)}</h3>
                <p class="case-description">${escapeHtml(caseItem.description)}</p>
                <div class="case-meta">
                    <span>${caseItem.factoryName} - ${caseItem.departmentName}</span>
                    <span>${formatDate(caseItem.createdAt)}</span>
                </div>
                <div class="case-stats">
                    <div class="stat-item">👁️ ${caseItem.viewCount}</div>
                    <div class="stat-item">❤️ ${caseItem.likeCount}</div>
                    <div class="stat-item">💬 ${caseItem.commentCount}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ケース詳細表示（グローバルスコープに公開）
window.showCaseDetail = async function(caseId) {
    try {
        const userId = currentUser ? currentUser.id : null;
        const url = userId ? `${API_BASE}/cases/${caseId}?userId=${userId}` : `${API_BASE}/cases/${caseId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const caseData = await response.json();

        const detailDiv = document.getElementById('caseDetail');
        detailDiv.innerHTML = `
            <h2 class="case-detail-title">${escapeHtml(caseData.title)}</h2>
            <div class="case-detail-meta">
                <span>${caseData.factoryName} - ${caseData.departmentName}</span>
                <span>投稿者: ${escapeHtml(caseData.username)}</span>
                <span>${formatDate(caseData.createdAt)}</span>
            </div>
            <div class="case-detail-description">${escapeHtml(caseData.description).replace(/\n/g, '<br>')}</div>
            <div class="case-images">
                ${caseData.images.map(img => `
                    <img src="${img}" 
                         alt="${escapeHtml(caseData.title)}" 
                         class="case-image-large"
                         onclick="openImageModal('${img}')">
                `).join('')}
            </div>
            <div class="case-stats" style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="toggleLike(${caseData.id})">
                    ❤️ いいね (${caseData.likeCount})
                </button>
            </div>
        `;

        await loadComments(caseId);
        showView('detail');
        window.currentCaseId = caseId;
    } catch (error) {
        console.error('Error loading case detail:', error);
        alert('詳細の読み込みに失敗しました: ' + error.message);
    }
}

// いいね切り替え（グローバルスコープに公開）
window.toggleLike = async function(caseId) {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    try {
        const formData = new FormData();
        formData.append('userId', currentUser.id);

        const response = await fetch(`${API_BASE}/cases/${caseId}/like`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            window.showCaseDetail(caseId);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('いいねの処理に失敗しました: ' + error.message);
    }
}

// コメント読み込み
async function loadComments(caseId) {
    try {
        const response = await fetch(`${API_BASE}/cases/${caseId}/comments`);
        const comments = await response.json();
        
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.username)}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// コメント投稿
async function handleComment(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLoginModal();
        return;
    }

    const content = document.getElementById('commentContent').value;
    const caseId = window.currentCaseId;

    try {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('userId', currentUser.id);

        const response = await fetch(`${API_BASE}/cases/${caseId}/comments`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('commentContent').value = '';
            await loadComments(caseId);
            await showCaseDetail(caseId);
        }
    } catch (error) {
        console.error('Error posting comment:', error);
    }
}

// 投稿処理
async function handlePost(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLoginModal();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('postTitle').value);
    formData.append('description', document.getElementById('postDescription').value);
    formData.append('factoryId', document.getElementById('postFactory').value);
    formData.append('departmentId', document.getElementById('postDepartment').value);
    formData.append('userId', currentUser.id);

    const images = document.getElementById('postImages').files;
    for (let i = 0; i < images.length && i < 10; i++) {
        formData.append('images', images[i]);
    }

    try {
        const response = await fetch(`${API_BASE}/cases`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('投稿が完了しました');
            document.getElementById('postForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
            showView('home');
        } else {
            alert('投稿に失敗しました');
        }
    } catch (error) {
        console.error('Error posting case:', error);
        alert('エラーが発生しました');
    }
}

// 画像プレビュー
function handleImagePreview(e) {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    for (let i = 0; i < files.length && i < 10; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// TOP閲覧記事読み込み
async function loadTopCases() {
    try {
        const response = await fetch(`${API_BASE}/summary/top-views`);
        const cases = await response.json();
        
        const topCasesList = document.getElementById('topCasesList');
        if (cases.length === 0) {
            topCasesList.innerHTML = '<div class="loading">データがありません</div>';
            return;
        }

        topCasesList.innerHTML = cases.map((c, index) => `
            <div class="case-card" onclick="showCaseDetail(${c.id})">
                <div class="case-content">
                    <h3 class="case-title">#${index + 1} ${escapeHtml(c.title)}</h3>
                    <div class="case-meta">
                        <span>${c.factoryName} - ${c.departmentName}</span>
                    </div>
                    <div class="case-stats">
                        <div class="stat-item">👁️ ${c.viewCount}</div>
                        <div class="stat-item">❤️ ${c.likeCount}</div>
                        <div class="stat-item">💬 ${c.commentCount}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading top cases:', error);
    }
}

// ユーティリティ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 画像モーダル表示（グローバルスコープに公開）
window.openImageModal = function(imageUrl) {
    // シンプルな画像拡大表示
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <img src="${imageUrl}" style="width: 100%; height: auto; border-radius: 8px;">
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

