# 工場改善事例共有アプリ

工場の生産現場における改善事例を気軽にアップロードして、情報共有することで改善を促進するアプリケーションです。

## 機能

- 改善事例の投稿・閲覧・編集・削除
- 写真のアップロード（複数枚対応）
- いいね機能
- コメント機能
- 今月のTOP閲覧記事のサマリー
- 検索・フィルタリング機能（工場、係、キーワード）
- 工場・係ごとの管理
- 管理者機能

## 技術スタック

- **フロントエンド**: JavaScript (Vanilla JS), HTML, CSS
- **バックエンド**: Java 17, Spring Boot 3.1.5
- **データベース**: PostgreSQL 14
- **コンテナ**: Docker, Docker Compose
- **デプロイ環境**: AWS EC2

## プロジェクト構成

```
kaizen-apps/
├── frontend/              # フロントエンド
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── Dockerfile
│   └── nginx.conf
├── backend/               # バックエンド
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── database/              # データベース
│   └── init/
│       └── schema.sql
├── docker-compose.yml     # Docker Compose設定
└── README.md
```

## ローカル環境での起動方法

### 前提条件

- Docker Desktop または Docker Engine 20.10以上
- Docker Compose 1.29以上
- Maven 3.6以上（バックエンドを直接ビルドする場合）
- Java 17以上（バックエンドを直接ビルドする場合）

### 手順

1. **リポジトリのクローンまたはダウンロード**

```bash
cd kaizen-apps
```

2. **Docker Composeで起動**

```bash
docker-compose up -d
```

このコマンドで以下が起動します：
- PostgreSQL（ポート5432）
- Spring Bootバックエンド（ポート8080）
- Nginxフロントエンド（ポート80）

3. **アプリケーションへのアクセス**

ブラウザで以下のURLにアクセス：
- フロントエンド: http://localhost
- バックエンドAPI: http://localhost:8080/api

4. **初期ログイン情報**

データベース初期化時に以下の管理者アカウントが作成されます：
- ユーザー名: `admin`
- パスワード: `admin`（デフォルトパスワード、本番環境では変更してください）

5. **ログの確認**

```bash
# すべてのコンテナのログを確認
docker-compose logs -f

# 特定のコンテナのログを確認
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

6. **停止**

```bash
docker-compose down
```

データを保持したい場合：
```bash
docker-compose down -v  # ボリュームも削除
```

### トラブルシューティング

**ポートが既に使用されている場合**

`docker-compose.yml`のポート番号を変更してください。

**バックエンドが起動しない場合**

- PostgreSQLが正常に起動しているか確認: `docker-compose ps`
- バックエンドのログを確認: `docker-compose logs backend`
- データベース接続情報を確認: `backend/src/main/resources/application.properties`

**画像が表示されない場合**

- `backend/uploads`ディレクトリが存在し、書き込み権限があるか確認
- ファイルパスの設定を確認: `file.upload.dir`プロパティ

## EC2環境での本番デプロイ手順

### 前提条件

- AWS EC2インスタンス（Amazon Linux 2 または Ubuntu）
- セキュリティグループで以下のポートを開放：
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS) - オプション
- EC2インスタンスへのSSHアクセス権限

### 手順

1. **EC2インスタンスへの接続**

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
# または
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **必要なソフトウェアのインストール**

**Amazon Linux 2の場合:**
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Ubuntuの場合:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

3. **アプリケーションのデプロイ**

```bash
# プロジェクトディレクトリを作成
mkdir -p ~/kaizen-apps
cd ~/kaizen-apps

# プロジェクトファイルをアップロード（SCPまたはGit）
# 例: Gitを使用する場合
git clone your-repository-url .
# または、SCPでファイルを転送
```

4. **環境変数の設定（オプション）**

本番環境用の設定を変更する場合、`docker-compose.yml`を編集：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: your-secure-password  # 強力なパスワードに変更
  backend:
    environment:
      SPRING_DATASOURCE_PASSWORD: your-secure-password
      FILE_UPLOAD_DIR: /app/uploads
```

5. **Docker Composeで起動**

```bash
cd ~/kaizen-apps
docker-compose up -d
```

6. **起動確認**

```bash
# コンテナの状態確認
docker-compose ps

# ログ確認
docker-compose logs -f
```

7. **Nginxのリバースプロキシ設定（オプション）**

本番環境では、EC2インスタンス上にNginxをインストールしてリバースプロキシを設定することを推奨します：

```bash
# Nginxのインストール（Amazon Linux 2）
sudo amazon-linux-extras install nginx1 -y

# Nginxの設定ファイルを作成
sudo nano /etc/nginx/conf.d/kaizen.conf
```

設定内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

8. **SSL証明書の設定（推奨）**

Let's Encryptを使用してHTTPSを有効化：

```bash
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux 2
# または
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu

sudo certbot --nginx -d your-domain.com
```

9. **自動起動の設定**

EC2インスタンスの再起動時に自動的にアプリケーションが起動するように設定：

```bash
# systemdサービスファイルを作成
sudo nano /etc/systemd/system/kaizen-app.service
```

内容：
```ini
[Unit]
Description=Kaizen App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/kaizen-apps
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable kaizen-app.service
```

10. **バックアップの設定**

データベースとアップロードファイルの定期バックアップを設定：

```bash
# バックアップスクリプトを作成
nano ~/backup.sh
```

内容：
```bash
#!/bin/bash
BACKUP_DIR="/home/ec2-user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# データベースバックアップ
docker-compose exec -T postgres pg_dump -U kaizen_user kaizen_db > $BACKUP_DIR/db_$DATE.sql

# アップロードファイルのバックアップ
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/uploads/

# 古いバックアップの削除（30日以上）
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

```bash
chmod +x ~/backup.sh
mkdir -p ~/backups

# cronで定期実行（毎日午前2時）
crontab -e
# 以下を追加
0 2 * * * /home/ec2-user/backup.sh
```

### セキュリティのベストプラクティス

1. **強力なパスワードの使用**
   - データベースパスワード
   - 管理者アカウントのパスワード

2. **ファイアウォールの設定**
   - 必要なポートのみ開放
   - SSHアクセスを特定のIPからのみ許可

3. **定期的な更新**
   ```bash
   sudo yum update -y  # Amazon Linux 2
   # または
   sudo apt-get update && sudo apt-get upgrade -y  # Ubuntu
   ```

4. **ログの監視**
   - アプリケーションログの定期確認
   - 異常なアクセスの検知

5. **データベースのセキュリティ**
   - データベースを外部から直接アクセスできないように設定
   - 定期的なバックアップ

### パフォーマンス最適化

1. **リソースの監視**
   ```bash
   docker stats
   ```

2. **データベースのインデックス確認**
   - スロークエリの特定と最適化

3. **画像の最適化**
   - アップロード時の自動リサイズ（実装が必要な場合）

## 開発者向け情報

### バックエンドの直接ビルド

```bash
cd backend
mvn clean package
java -jar target/kaizen-backend-0.0.1-SNAPSHOT.jar
```

### データベースへの直接接続

```bash
docker-compose exec postgres psql -U kaizen_user -d kaizen_db
```

### APIエンドポイント

- `POST /api/auth/login` - ログイン
- `GET /api/cases` - 改善事例一覧
- `GET /api/cases/{id}` - 改善事例詳細
- `POST /api/cases` - 改善事例投稿
- `POST /api/cases/{id}/like` - いいね
- `GET /api/cases/{id}/comments` - コメント一覧
- `POST /api/cases/{id}/comments` - コメント投稿
- `GET /api/summary/top-views` - TOP閲覧記事
- `GET /api/factories` - 工場一覧
- `GET /api/departments` - 係一覧

詳細は`requirements.md`を参照してください。

## ライセンス

このプロジェクトは内部使用を目的としています。

## サポート

問題が発生した場合：
1. ログを確認: `docker-compose logs`
2. コンテナの状態を確認: `docker-compose ps`
3. データベース接続を確認
4. ポートの競合を確認

#   K A I Z E N - a p p s  
 