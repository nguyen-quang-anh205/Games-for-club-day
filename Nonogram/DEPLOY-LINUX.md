# Triển khai Nonogram Cyber Lab trên Linux

## Cách khuyên dùng: Docker

Máy chủ cần Docker Engine và Docker Compose phiên bản mới.

```bash
cd nonogram-viet
docker compose up -d --build
docker compose ps
```

Game chạy tại `http://IP_MAY_CHU:3000`. Có thể đổi cổng ngoài bằng biến môi
trường, ví dụ:

```bash
NONOGRAM_PORT=8080 docker compose up -d --build
```

Xem log và cập nhật:

```bash
docker compose logs -f --tail=100
docker compose up -d --build
```

## Tên miền và HTTPS

PWA/offline cần HTTPS khi chạy trên tên miền thật. Nên đặt Caddy hoặc Nginx phía
trước container và chỉ công khai cổng 80/443. Ví dụ Caddy:

```caddyfile
game.example.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
```

Thay `game.example.com` bằng tên miền trỏ về máy chủ. Caddy sẽ tự xin và gia hạn
chứng chỉ TLS.

## Chạy trực tiếp bằng Node.js

Nếu không dùng Docker, cài Node.js 22.13 trở lên rồi chạy:

```bash
npm ci
npm run build
npm run start -- --hostname 0.0.0.0 --port 3000
```

Khi dùng lâu dài, đặt lệnh `npm run start` dưới systemd hoặc một trình quản lý
tiến trình tương đương để game tự khởi động lại sau khi máy chủ reboot.
