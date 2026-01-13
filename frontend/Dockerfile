FROM nginx:alpine

# カスタムnginx設定をコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# フロントエンドファイルをコピー
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

