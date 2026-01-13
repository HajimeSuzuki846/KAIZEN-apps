# 工場改善事例共有アプリ 要件書

## 1. プロジェクト概要

### 1.1 目的
工場の生産現場における改善事例を気軽にアップロードし、情報共有することで、それに対して「いいね」やコメントを付与し、今月のTOP閲覧記事などをサマリーすることで、工場の改善を促進するアプリケーションを開発する。

### 1.2 対象ユーザー
- 工場の生産現場で働く従業員
- 改善活動に携わる管理者
- 工場の各係のメンバー

### 1.3 主要な価値
- 改善事例の可視化と共有による改善活動の活性化
- 工場・係単位での情報管理による組織的な改善促進
- 写真を活用したわかりやすい事例掲載

## 2. 機能要件

### 2.1 認証機能
- **ログイン機能**
  - ユーザー名とパスワードによる認証
  - セッション管理による認証状態の維持
  - ログアウト機能

### 2.2 改善事例管理機能

#### 2.2.1 改善事例の投稿
- 改善事例の新規投稿
  - タイトル（必須）
  - 説明文（必須）
  - 写真のアップロード（複数枚可、必須）
  - 工場の選択（必須）
  - 係の選択（必須）
  - 投稿日時の自動記録
  - 投稿者の自動記録
- 写真の表示要件
  - 写真を大きくきれいに表示
  - 複数写真の場合はスライド表示またはギャラリー表示
  - 画像のリサイズ・最適化（アップロード時）

#### 2.2.2 改善事例の閲覧
- 改善事例一覧の表示
  - 工場・係によるフィルタリング
  - 投稿日時の降順表示（最新順）
  - サムネイル表示
- 改善事例の詳細表示
  - タイトル、説明文、写真の詳細表示
  - 投稿者情報、投稿日時の表示
  - いいね数、コメント数の表示

#### 2.2.3 改善事例の編集・削除
- 投稿者のみが自分の投稿を編集・削除可能
- 管理者はすべての投稿を編集・削除可能

### 2.3 いいね機能
- 改善事例に対する「いいね」の付与・解除
- いいね数の集計と表示
- ユーザーごとのいいね履歴管理（重複いいね防止）

### 2.4 コメント機能
- 改善事例に対するコメントの投稿
- コメント一覧の表示（投稿日時順）
- コメントの編集・削除（投稿者のみ）
- コメント数の集計と表示

### 2.5 サマリー機能
- **今月のTOP閲覧記事**
  - 今月の閲覧数が多い記事をランキング表示
  - TOP 10など、上位記事の表示
  - 閲覧数、いいね数、コメント数の表示
- **統計情報**
  - 工場別の投稿数
  - 係別の投稿数
  - 月別の投稿数推移

### 2.6 検索・フィルタリング機能
- **検索機能**
  - キーワード検索（タイトル、説明文から検索）
- **フィルタリング機能**
  - 工場によるフィルタリング
  - 係によるフィルタリング
  - 投稿日時によるフィルタリング（期間指定）
  - いいね数によるソート
  - 閲覧数によるソート

### 2.7 管理者機能
- **ユーザー管理**
  - ユーザー一覧の表示
  - ユーザーの新規登録
  - ユーザー情報の編集・削除
  - 管理者権限の付与・解除
- **コンテンツ管理**
  - すべての改善事例の閲覧・編集・削除
  - 不適切なコメントの削除
- **工場・係管理**
  - 工場の新規登録・編集・削除
  - 係の新規登録・編集・削除
  - 工場と係の紐付け管理

### 2.8 閲覧数カウント機能
- 改善事例の詳細ページ閲覧時に閲覧数を自動カウント
- 同一ユーザーの重複閲覧は1日1回のみカウント

## 3. 非機能要件

### 3.1 UI/UX要件
- **デザイン**
  - ライトトーンのデザイン
  - モダンで使いやすいUI
  - レスポンシブデザイン（PC・タブレット・スマートフォン対応）
- **パフォーマンス**
  - ページ読み込み時間：3秒以内
  - 画像の遅延読み込み（Lazy Loading）
  - ページネーションによる一覧表示の最適化

### 3.2 セキュリティ要件
- パスワードのハッシュ化（BCrypt等）
- SQLインジェクション対策
- XSS（クロスサイトスクリプティング）対策
- CSRF（クロスサイトリクエストフォージェリ）対策
- ファイルアップロードの検証（ファイル形式、サイズ制限）

### 3.3 データ管理要件
- 改善情報は工場毎、係毎に管理
- データのバックアップ機能
- データの整合性維持

### 3.4 ファイル管理要件
- アップロード画像の保存
- 画像のリサイズ・最適化（サムネイル生成）
- 画像ファイルの形式：JPEG、PNG
- 画像ファイルの最大サイズ：10MB
- 1投稿あたりの最大画像数：10枚

## 4. 技術スタック

### 4.1 フロントエンド
- **言語**: JavaScript
- **フレームワーク**: （未指定の場合は、Vanilla JSまたはReact/Vue.js等を推奨）
- **スタイリング**: CSS3（ライトトーンデザイン）

### 4.2 バックエンド
- **言語**: Java
- **フレームワーク**: Spring Boot（推奨）
- **ビルドツール**: Maven または Gradle

### 4.3 データベース
- **RDBMS**: PostgreSQL
- **バージョン**: PostgreSQL 14以上

### 4.4 インフラストラクチャ
- **デプロイ環境**: AWS EC2
- **コンテナ**: Docker
- **コンテナオーケストレーション**: Docker Compose

### 4.5 その他
- **画像処理**: Java ImageIO または ImageMagick
- **認証**: Spring Security（推奨）

## 5. データベース設計

### 5.1 エンティティ一覧

#### 5.1.1 users（ユーザー）
- `id`: BIGSERIAL PRIMARY KEY
- `username`: VARCHAR(50) UNIQUE NOT NULL
- `password`: VARCHAR(255) NOT NULL（ハッシュ化）
- `email`: VARCHAR(100)
- `is_admin`: BOOLEAN DEFAULT FALSE
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.2 factories（工場）
- `id`: BIGSERIAL PRIMARY KEY
- `name`: VARCHAR(100) NOT NULL
- `code`: VARCHAR(20) UNIQUE
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.3 departments（係）
- `id`: BIGSERIAL PRIMARY KEY
- `factory_id`: BIGINT REFERENCES factories(id)
- `name`: VARCHAR(100) NOT NULL
- `code`: VARCHAR(20)
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.4 improvement_cases（改善事例）
- `id`: BIGSERIAL PRIMARY KEY
- `title`: VARCHAR(200) NOT NULL
- `description`: TEXT NOT NULL
- `factory_id`: BIGINT REFERENCES factories(id) NOT NULL
- `department_id`: BIGINT REFERENCES departments(id) NOT NULL
- `user_id`: BIGINT REFERENCES users(id) NOT NULL
- `view_count`: INTEGER DEFAULT 0
- `like_count`: INTEGER DEFAULT 0
- `comment_count`: INTEGER DEFAULT 0
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.5 case_images（改善事例画像）
- `id`: BIGSERIAL PRIMARY KEY
- `case_id`: BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE
- `image_path`: VARCHAR(500) NOT NULL
- `image_order`: INTEGER DEFAULT 0
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.6 likes（いいね）
- `id`: BIGSERIAL PRIMARY KEY
- `case_id`: BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE
- `user_id`: BIGINT REFERENCES users(id) ON DELETE CASCADE
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(case_id, user_id)

#### 5.1.7 comments（コメント）
- `id`: BIGSERIAL PRIMARY KEY
- `case_id`: BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE
- `user_id`: BIGINT REFERENCES users(id) ON DELETE CASCADE
- `content`: TEXT NOT NULL
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 5.1.8 view_logs（閲覧ログ）
- `id`: BIGSERIAL PRIMARY KEY
- `case_id`: BIGINT REFERENCES improvement_cases(id) ON DELETE CASCADE
- `user_id`: BIGINT REFERENCES users(id) ON DELETE CASCADE
- `viewed_date`: DATE NOT NULL
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(case_id, user_id, viewed_date)

### 5.2 インデックス
- `improvement_cases.factory_id`
- `improvement_cases.department_id`
- `improvement_cases.user_id`
- `improvement_cases.created_at`
- `improvement_cases.view_count`
- `improvement_cases.like_count`
- `likes.case_id`
- `likes.user_id`
- `comments.case_id`
- `view_logs.case_id`
- `view_logs.viewed_date`

## 6. API設計

### 6.1 認証API
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報取得

### 6.2 改善事例API
- `GET /api/cases` - 改善事例一覧取得（検索・フィルタリング対応）
- `GET /api/cases/{id}` - 改善事例詳細取得
- `POST /api/cases` - 改善事例投稿
- `PUT /api/cases/{id}` - 改善事例更新
- `DELETE /api/cases/{id}` - 改善事例削除

### 6.3 いいねAPI
- `POST /api/cases/{id}/like` - いいね付与
- `DELETE /api/cases/{id}/like` - いいね解除
- `GET /api/cases/{id}/likes` - いいね一覧取得

### 6.4 コメントAPI
- `GET /api/cases/{id}/comments` - コメント一覧取得
- `POST /api/cases/{id}/comments` - コメント投稿
- `PUT /api/comments/{id}` - コメント更新
- `DELETE /api/comments/{id}` - コメント削除

### 6.5 サマリーAPI
- `GET /api/summary/top-views` - 今月のTOP閲覧記事取得
- `GET /api/summary/statistics` - 統計情報取得

### 6.6 工場・係API
- `GET /api/factories` - 工場一覧取得
- `GET /api/departments` - 係一覧取得（工場IDでフィルタリング可能）

### 6.7 管理者API
- `GET /api/admin/users` - ユーザー一覧取得
- `POST /api/admin/users` - ユーザー新規登録
- `PUT /api/admin/users/{id}` - ユーザー更新
- `DELETE /api/admin/users/{id}` - ユーザー削除
- `GET /api/admin/factories` - 工場管理
- `POST /api/admin/factories` - 工場新規登録
- `PUT /api/admin/factories/{id}` - 工場更新
- `DELETE /api/admin/factories/{id}` - 工場削除
- `GET /api/admin/departments` - 係管理
- `POST /api/admin/departments` - 係新規登録
- `PUT /api/admin/departments/{id}` - 係更新
- `DELETE /api/admin/departments/{id}` - 係削除

## 7. ファイル構成

### 7.1 プロジェクト構成
```
kaizen-apps/
├── frontend/              # フロントエンド（JavaScript）
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # バックエンド（Java）
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml (or build.gradle)
├── docker/                # Docker関連ファイル
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── database/              # データベース関連
│   ├── init/
│   │   └── schema.sql
│   └── migrations/
├── docs/                  # ドキュメント
└── README.md
```

### 7.2 Docker構成
- **PostgreSQLコンテナ**: データベースサーバー
- **バックエンドコンテナ**: Javaアプリケーション
- **フロントエンドコンテナ**: Webサーバー（Nginx等）または開発サーバー
- **ボリューム**: 画像ファイル保存用

## 8. デプロイ要件

### 8.1 EC2環境
- **OS**: Amazon Linux 2 または Ubuntu
- **Docker**: Docker Engine 20.10以上
- **Docker Compose**: 1.29以上

### 8.2 環境変数
- データベース接続情報
- JWT秘密鍵（認証用）
- ファイルアップロードパス
- アプリケーション設定

### 8.3 セキュリティグループ設定
- HTTP（ポート80）
- HTTPS（ポート443）
- 必要に応じてSSH（ポート22）

### 8.4 バックアップ
- データベースの定期バックアップ
- アップロード画像のバックアップ

## 9. 開発フェーズ

### フェーズ1: 基盤構築
- プロジェクト構成の作成
- Docker環境の構築
- データベーススキーマの作成
- 基本的な認証機能の実装

### フェーズ2: コア機能実装
- 改善事例の投稿・閲覧機能
- 画像アップロード機能
- いいね機能
- コメント機能

### フェーズ3: 拡張機能実装
- 検索・フィルタリング機能
- サマリー機能（TOP閲覧記事）
- 閲覧数カウント機能

### フェーズ4: 管理者機能実装
- ユーザー管理機能
- 工場・係管理機能
- コンテンツ管理機能

### フェーズ5: UI/UX改善
- ライトトーンデザインの適用
- レスポンシブデザインの実装
- パフォーマンス最適化

### フェーズ6: テスト・デプロイ
- 単体テスト
- 統合テスト
- EC2環境へのデプロイ
- 動作確認

## 10. 制約事項・前提条件

### 10.1 技術的制約
- フロントエンドはJavaScriptで実装
- バックエンドはJavaで実装
- データベースはPostgreSQLを使用
- EC2環境にデプロイ

### 10.2 運用制約
- 初期データ（工場、係）は管理者が登録
- ユーザーは管理者が登録するか、自己登録機能を追加するかは要検討

### 10.3 その他
- 写真は大きくきれいに表示することを重視
- 改善情報は工場毎、係毎に管理
- ライトトーンのデザインを採用

## 11. 今後の拡張検討事項

- 通知機能（コメントやいいねの通知）
- データエクスポート機能（レポート出力）
- 多言語対応
- モバイルアプリ版
- 改善事例のテンプレート機能
- 改善効果の数値化・グラフ表示

