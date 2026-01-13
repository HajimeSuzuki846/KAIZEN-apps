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
    setupEventListeners();
    await loadFactories();
    await loadCases();
}

function setupEventListeners() {
    // ナビゲーション
    document.getElementById('homeBtn').addEventListener('click', () => showView('home'));
    document.getElementById('postBtn').addEventListener('click', () => showView('post'));
    document.getElementById('summaryBtn').addEventListener('click', () => showView('summary'));
    document.getElementById('loginBtn').addEventListener('click', () => showLoginModal());
    document.getElementById('backBtn').addEventListener('click', () => showView('home'));

    // モーダル
    const loginModal = document.getElementById('loginModal');
    document.querySelector('.close').addEventListener('click', () => {
        loginModal.classList.remove('show');
    });
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });

    // フォーム
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('postForm').addEventListener('submit', handlePost);
    document.getElementById('commentForm').addEventListener('submit', handleComment);

    // フィルター
    document.getElementById('factoryFilter').addEventListener('change', handleFactoryFilter);
    document.getElementById('searchInput').addEventListener('input', debounce(loadCases, 300));
    document.getElementById('sortSelect').addEventListener('change', loadCases);

    // 画像プレビュー
    document.getElementById('postImages').addEventListener('change', handleImagePreview);
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
        const response = await fetch(`${API_BASE}/factories`);
        factories = await response.json();
        
        const factoryFilter = document.getElementById('factoryFilter');
        factories.forEach(factory => {
            const option = document.createElement('option');
            option.value = factory.id;
            option.textContent = factory.name;
            factoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading factories:', error);
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
    const factoryId = document.getElementById('factoryFilter').value;
    const departmentId = document.getElementById('departmentFilter').value;
    const keyword = document.getElementById('searchInput').value;
    const sortBy = document.getElementById('sortSelect').value;

    let url = `${API_BASE}/cases?`;
    if (factoryId) url += `factoryId=${factoryId}&`;
    if (departmentId) url += `departmentId=${departmentId}&`;
    if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;

    try {
        const response = await fetch(url);
        const cases = await response.json();
        displayCases(cases);
    } catch (error) {
        console.error('Error loading cases:', error);
        document.getElementById('casesList').innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
    }
}

// ケース表示
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    
    if (cases.length === 0) {
        casesList.innerHTML = '<div class="loading">改善事例がありません</div>';
        return;
    }

    casesList.innerHTML = cases.map(case => `
        <div class="case-card" onclick="showCaseDetail(${case.id})">
            <img src="${case.images[0] || '/uploads/default.jpg'}" 
                 alt="${case.title}" 
                 class="case-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23f0f0f0\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3E画像なし%3C/text%3E%3C/svg%3E'">
            <div class="case-content">
                <h3 class="case-title">${escapeHtml(case.title)}</h3>
                <p class="case-description">${escapeHtml(case.description)}</p>
                <div class="case-meta">
                    <span>${case.factoryName} - ${case.departmentName}</span>
                    <span>${formatDate(case.createdAt)}</span>
                </div>
                <div class="case-stats">
                    <div class="stat-item">👁️ ${case.viewCount}</div>
                    <div class="stat-item">❤️ ${case.likeCount}</div>
                    <div class="stat-item">💬 ${case.commentCount}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ケース詳細表示
async function showCaseDetail(caseId) {
    try {
        const userId = currentUser ? currentUser.id : null;
        const url = userId ? `${API_BASE}/cases/${caseId}?userId=${userId}` : `${API_BASE}/cases/${caseId}`;
        const response = await fetch(url);
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
    }
}

// いいね切り替え
async function toggleLike(caseId) {
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
            showCaseDetail(caseId);
        }
    } catch (error) {
        console.error('Error toggling like:', error);
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

function openImageModal(imageUrl) {
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

