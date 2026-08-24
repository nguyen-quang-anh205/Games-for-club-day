# Thêm ảnh và challenge mới

## Có thể thêm ảnh không?

Có. Mỗi challenge trong game gồm hai phần:

- **Ảnh màu**: xuất hiện sau khi người chơi giải xong.
- **Ma trận đáp án**: các số `0` và `1`; `1` là ô phải tô đen, `0` là ô trống.

Bản đóng gói này chưa có trang quản trị tải ảnh trực tiếp. Challenge được thêm
trong mã nguồn để người tổ chức kiểm soát trước nội dung và đáp án.

## 1. Chuẩn bị ảnh

Nên dùng ảnh vuông, rõ nét và có độ tương phản cao. Định dạng khuyên dùng là
WebP hoặc PNG.

Đặt ảnh vào thư mục `public/challenges/`, ví dụ:

```text
public/challenges/logo-clb.webp
```

Nếu thư mục chưa có, hãy tạo nó trước.

## 2. Chuyển ảnh thành ma trận Nonogram

Công cụ đi kèm cần Python 3 và Pillow:

```bash
python3 -m venv .venv-tools
. .venv-tools/bin/activate
pip install Pillow
```

Tạo ma trận 8×8:

```bash
python tools/image_to_nonogram.py public/challenges/logo-clb.webp --size 8
```

Các kích thước đang dùng trong game:

- Dễ: `--size 8`
- Trung bình: `--size 12`
- Khó: `--size 20`

Nếu vùng cần tô là phần sáng của ảnh, thêm `--filled light`. Có thể điều chỉnh
ngưỡng bằng `--threshold`, ví dụ:

```bash
python tools/image_to_nonogram.py public/challenges/logo-clb.webp \
  --size 12 --filled light --threshold 150
```

Công cụ sẽ in bản xem trước và mảng `grid`. Hãy kiểm tra hình dáng trước khi
dùng; ảnh quá nhiều chi tiết nên được đơn giản hóa trước.

## 3. Thêm cấu hình challenge

Mở `app/page.tsx`. Ở đầu tệp có kiểu `Difficulty` và đối tượng `PUZZLES`.

Nếu muốn thêm một lựa chọn mới, bổ sung tên khóa vào `Difficulty`, ví dụ:

```ts
type Difficulty = "easy" | "medium" | "hard" | "club";
```

Sau đó thêm mục mới trong `PUZZLES`:

```ts
club: {
  label: "CLB",
  codename: "BLUE TEAM",
  size: 12,
  time: "~ 7 phút",
  image: "/challenges/logo-clb.webp",
  revealTitle: "Tên ảnh",
  revealCaption: "Chú thích xuất hiện sau khi giải xong.",
  grid: [
    // Dán ma trận do công cụ tạo vào đây.
  ],
},
```

`size` phải bằng số hàng và số cột của `grid`. Danh sách nút chọn challenge sẽ
tự lấy các mục trong `PUZZLES`.

Nếu chỉ muốn thay ảnh của một độ khó hiện có, giữ nguyên khóa `easy`, `medium`
hoặc `hard`, rồi thay `image`, nội dung kết quả và `grid` tương ứng.

## 4. Chạy thử

```bash
npm ci
npm run dev
```

Hoặc kiểm tra đúng môi trường Linux/Docker:

```bash
docker compose up --build
```

Mở game, chọn challenge mới và xác nhận:

- Gợi ý hàng/cột khớp với ma trận.
- Tô sai ô bị trừ một mạng; đánh dấu X không bị trừ mạng.
- Hoàn thành lưới sẽ chạy hiệu ứng đen trắng → ảnh màu → kết quả và chú thích.

## Lưu ý thiết kế

- Lưới 8×8 phù hợp hình rất đơn giản.
- Lưới 12×12 giữ được nhiều chi tiết hơn nhưng vẫn dễ chơi tại booth.
- Lưới 20×20 nên dùng cho người chơi đã biết Nonogram.
- Mỗi số trong gợi ý là một nhóm ô đen liên tiếp; các nhóm phải cách nhau ít
  nhất một ô trống.
