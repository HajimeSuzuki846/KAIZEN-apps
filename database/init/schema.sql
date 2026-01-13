-- データベーススキーマ初期化スクリプト

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工場テーブル
CREATE TABLE IF NOT EXISTS factories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 係テーブル
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    factory_id BIGINT REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 改善事例テーブル
CREATE TABLE IF NOT EXISTS improvement_cases (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    factory_id BIGINT REFERENCES factories(id) NOT NULL,
    department_id BIGINT REFERENCES departments(id) NOT NULL,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 改善事例画像テーブル
CREATE TABLE IF NOT EXISTS case_images (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, user_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 閲覧ログテーブル
CREATE TABLE IF NOT EXISTS view_logs (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    viewed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, user_id, viewed_date)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_improvement_cases_factory_id ON improvement_cases(factory_id);
CREATE INDEX IF NOT EXISTS idx_improvement_cases_department_id ON improvement_cases(department_id);
CREATE INDEX IF NOT EXISTS idx_improvement_cases_user_id ON improvement_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_improvement_cases_created_at ON improvement_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_improvement_cases_view_count ON improvement_cases(view_count);
CREATE INDEX IF NOT EXISTS idx_improvement_cases_like_count ON improvement_cases(like_count);
CREATE INDEX IF NOT EXISTS idx_likes_case_id ON likes(case_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_case_id ON comments(case_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_case_id ON view_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_viewed_date ON view_logs(viewed_date);

-- 初期データの投入（管理者ユーザー）
INSERT INTO users (username, password, email, is_admin) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ1m2', 'admin@example.com', true)
ON CONFLICT (username) DO NOTHING;

-- サンプル工場データ
INSERT INTO factories (name, code) VALUES 
    ('第一工場', 'FACTORY_001'),
    ('第二工場', 'FACTORY_002')
ON CONFLICT (code) DO NOTHING;

-- サンプル係データ
INSERT INTO departments (factory_id, name, code) VALUES 
    ((SELECT id FROM factories WHERE code = 'FACTORY_001'), '製造係', 'DEPT_001'),
    ((SELECT id FROM factories WHERE code = 'FACTORY_001'), '品質管理係', 'DEPT_002'),
    ((SELECT id FROM factories WHERE code = 'FACTORY_002'), '製造係', 'DEPT_003'),
    ((SELECT id FROM factories WHERE code = 'FACTORY_002'), '保全係', 'DEPT_004')
ON CONFLICT DO NOTHING;

