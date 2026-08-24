# Games for Club Day

Bộ sưu tập mini-game dành cho Club Day theo chủ đề cybersecurity.

Repo hiện gồm 2 game:

- **Nonogram Cyber Lab** — game Nonogram tiếng Việt với các mức 8×8, 12×12 và 20×20.
- **Cyber Wordle — Decode the Threat** — Wordle theo chủ đề cybersecurity với hệ thống vòng chơi, điểm số và leaderboard.

## Cấu trúc repo

```text
Games-for-club-day/
├── Nonogram/
└── Wordle/
```

---

## 1. Nonogram Cyber Lab

Game Nonogram tiếng Việt của USTH Cybersecurity, gồm ba mức:

- 8×8
- 12×12
- 20×20

Game chạy trên trình duyệt, hỗ trợ PWA/offline và có thể triển khai trên máy chủ Linux bằng Docker.

### Chạy nhanh trên Linux

```bash
cd Nonogram
docker compose up -d --build
```

Sau đó mở:

```text
http://IP_MAY_CHU:3000
```

### Thêm ảnh và challenge

Nonogram hỗ trợ dùng ảnh riêng cho từng challenge.

Xem hướng dẫn chi tiết tại:

```text
Nonogram/HUONG-DAN-THEM-CHALLENGE.md
```

Công cụ hỗ trợ chuyển ảnh thành dữ liệu Nonogram:

```text
Nonogram/tools/image_to_nonogram.py
```

### Công nghệ / nền tảng

Project sử dụng:

- Node.js >= 22.13.0
- Vite / Vinext
- Drizzle
- Cloudflare D1 hỗ trợ tùy chọn
- Docker / Docker Compose

Một số lệnh hữu ích:

```bash
cd Nonogram

npm run install:ci
npm run dev
npm run build
npm run start
npm test
npm run db:generate
```

---

## 2. Cyber Wordle — Decode the Threat

Cyber Wordle là demo GUI cho Club Day với concept:

> **Decode the Threat**

Người chơi đoán các từ tiếng Anh liên quan đến cybersecurity và cố gắng đạt điểm cao nhất.

### Yêu cầu

- Linux
- Node.js 22 trở lên

### Chạy trên Linux

```bash
cd Wordle
chmod +x start.sh
./start.sh
```

Mặc định game có thể được truy cập tại:

```text
http://127.0.0.1:4173
```

Các thiết bị khác trong cùng mạng có thể truy cập bằng địa chỉ mạng được in trong terminal, ví dụ:

```text
http://192.168.1.20:4173
```

Nếu Linux đang bật UFW:

```bash
sudo ufw allow 4173/tcp
```

Có thể đổi cổng khi chạy:

```bash
PORT=3000 ./start.sh
```

Dừng server bằng:

```text
Ctrl+C
```

### Luật chơi

Cyber Wordle gồm 2 vòng:

1. **Campus Recon**
2. **Cyber Operation**

Quy tắc chính:

- Mỗi vòng bắt đầu với **200 điểm**.
- Mỗi vòng có tối đa **11 lượt**.
- Mỗi lần đoán sai bị trừ **5 điểm**.
- Gợi ý trả phí mở sau lần sai thứ **5** và **10**.
- Mỗi lần sử dụng gợi ý bị trừ **10 điểm**.
- Sai ở lượt thứ 11 khiến điểm của vòng bằng **0**.
- Thua vòng 1 sẽ không được ghi leaderboard.
- Thắng vòng 1 có thể dừng hoặc tiếp tục vòng 2.
- Kết thúc vòng 2 có thể nhập **Agent Codename**.
- Cùng một codename chỉ giữ điểm cao nhất.

### Sửa bộ từ

Danh sách puzzle nằm tại:

```text
Wordle/app/puzzles.ts
```

Mỗi puzzle có dạng:

```ts
{
  answer: "CIPHER",
  category: "club",
  missionBrief: "A method used to transform readable information.",
  intel: "A cipher is an algorithm used to encrypt or decrypt data."
}
```

`answer` phải là:

- một từ tiếng Anh;
- chỉ dùng ký tự `A-Z`;
- dài từ 4 đến 8 ký tự.

### Leaderboard

Trong bản demo hiện tại, leaderboard được lưu bằng:

```text
localStorage
```

của trình duyệt.

### Kiểm thử Wordle

```bash
cd Wordle

npm test
node --test tests/game-engine.test.mjs tests/leaderboard.test.mjs
npm run lint
```

---

## Chạy từng game

### Nonogram

```bash
cd Nonogram
docker compose up -d --build
```

Truy cập:

```text
http://localhost:3000
```

### Wordle

```bash
cd Wordle
chmod +x start.sh
./start.sh
```

Truy cập:

```text
http://localhost:4173
```

---

## Development

Sau khi clone repo:

```bash
git clone https://github.com/nguyen-quang-anh205/Games-for-club-day.git
cd Games-for-club-day
```

Sau đó chọn game muốn chạy:

```bash
cd Nonogram
```

hoặc:

```bash
cd Wordle
```

và làm theo hướng dẫn tương ứng ở trên.

## Repository

```text
https://github.com/nguyen-quang-anh205/Games-for-club-day
```
