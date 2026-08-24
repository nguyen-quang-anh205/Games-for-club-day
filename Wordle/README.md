# Cyber Wordle Demo

Demo GUI cho Club Day theo concept **Cyber Wordle — Decode the Threat**.

## Chạy trên Linux

1. Cài Node.js 22 trở lên.
2. Giải nén project.
3. Mở terminal tại thư mục project và chạy:

```bash
chmod +x start.sh
./start.sh
```

Trên máy chủ, mở `http://127.0.0.1:4173`. Thiết bị khác trong cùng mạng truy cập bằng địa chỉ `Other devices` được in trong terminal, ví dụ `http://192.168.1.20:4173`.

Nếu Linux đang bật UFW, cho phép cổng của game bằng:

```bash
sudo ufw allow 4173/tcp
```

Dừng server bằng `Ctrl+C`. Có thể đổi cổng khi cần, ví dụ `PORT=3000 ./start.sh`.

## Luật trong demo

- Hai vòng: **Campus Recon** và **Cyber Operation**.
- Mỗi vòng bắt đầu với 200 điểm và có tối đa 11 lượt.
- Sai một lần trừ 5 điểm.
- Gợi ý trả phí mở sau lần sai thứ 5 và thứ 10; mỗi lần dùng trừ 10 điểm.
- Sai lượt 11 khiến điểm vòng bằng 0.
- Thua vòng một không được ghi BXH.
- Thắng vòng một có thể dừng hoặc chơi tiếp.
- Kết thúc vòng hai luôn được nhập Agent Codename.
- Cùng codename chỉ giữ điểm cao nhất.

## Sửa bộ từ

Mở `app/puzzles.ts`. Mỗi câu gồm:

```ts
{
  answer: "CIPHER",
  category: "club",
  missionBrief: "A method used to transform readable information.",
  intel: "A cipher is an algorithm used to encrypt or decrypt data."
}
```

`answer` phải là một từ tiếng Anh viết bằng A–Z, dài từ 4 đến 8 chữ cái.

## Dữ liệu demo

BXH hiện được lưu trong `localStorage` của trình duyệt để duyệt nhanh giao diện. Bản chính thức sẽ thay lớp lưu trữ này bằng Node.js/Express và SQLite như thiết kế đã chốt.

## Kiểm thử

```bash
npm test
node --test tests/game-engine.test.mjs tests/leaderboard.test.mjs
npm run lint
```
