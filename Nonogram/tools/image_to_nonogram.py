#!/usr/bin/env python3
"""Chuyển một ảnh thành ma trận đáp án Nonogram dạng TypeScript."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print(
        "Thiếu Pillow. Cài bằng lệnh: pip install Pillow",
        file=sys.stderr,
    )
    raise SystemExit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chuyển ảnh vuông thành ma trận 0/1 cho Nonogram.",
    )
    parser.add_argument("image", type=Path, help="Đường dẫn ảnh đầu vào")
    parser.add_argument("--size", type=int, required=True, help="Kích thước lưới")
    parser.add_argument(
        "--threshold",
        type=int,
        default=128,
        help="Ngưỡng sáng 0–255 (mặc định: 128)",
    )
    parser.add_argument(
        "--filled",
        choices=("dark", "light"),
        default="dark",
        help="Dùng vùng tối hoặc sáng làm ô cần tô (mặc định: dark)",
    )
    return parser.parse_args()


def load_grid(path: Path, size: int, threshold: int, filled: str) -> list[list[int]]:
    if size < 2 or size > 64:
        raise ValueError("Kích thước phải nằm trong khoảng 2–64.")
    if threshold < 0 or threshold > 255:
        raise ValueError("Threshold phải nằm trong khoảng 0–255.")

    source = Image.open(path).convert("RGBA")
    canvas = Image.new("RGBA", source.size, "white")
    canvas.alpha_composite(source)
    gray = ImageOps.autocontrast(ImageOps.grayscale(canvas.convert("RGB")))
    reduced = ImageOps.autocontrast(
        ImageOps.fit(gray, (size, size), method=Image.Resampling.LANCZOS),
    )

    def is_filled(value: int) -> int:
        return int(value < threshold) if filled == "dark" else int(value >= threshold)

    pixel_source = (
        reduced.get_flattened_data()
        if hasattr(reduced, "get_flattened_data")
        else reduced.getdata()
    )
    pixels = list(pixel_source)
    return [
        [is_filled(pixels[row * size + col]) for col in range(size)]
        for row in range(size)
    ]


def print_preview(grid: list[list[int]]) -> None:
    print("Bản xem trước:")
    for row in grid:
        print("".join("██" if value else "··" for value in row))


def print_typescript(grid: list[list[int]]) -> None:
    print("\nDán mảng sau vào trường grid:\n[")
    for row in grid:
        print(f"  [{','.join(map(str, row))}],")
    print("]")


def main() -> int:
    args = parse_args()
    try:
        grid = load_grid(args.image, args.size, args.threshold, args.filled)
    except (OSError, ValueError) as error:
        print(f"Không thể tạo ma trận: {error}", file=sys.stderr)
        return 1

    print_preview(grid)
    print_typescript(grid)
    filled_count = sum(sum(row) for row in grid)
    total = args.size * args.size
    print(f"\nÔ cần tô: {filled_count}/{total} ({filled_count / total:.1%})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
