#!/usr/bin/env python3
"""Generate public/favicon.ico (multi-size 16/32/48) from public/icon-512x512.png.

Pure-stdlib PNG decoder/encoder so it runs without Pillow/sharp.
Usage: python3 scripts/gen-favicon.py
"""
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "icon-512x512.png"
OUT = ROOT / "public" / "favicon.ico"
SIZES = (16, 32, 48)
RADIUS_RATIO = 0.1875


def _paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    return a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)


def decode_png(path):
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    pos, width, height, ct, idat = 8, 0, 0, None, b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        typ = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        if typ == b"IHDR":
            width, height, bit, ct = struct.unpack(">IIBB", chunk[:10])
            assert bit == 8
        elif typ == b"IDAT":
            idat += chunk
        pos += 12 + length
    raw = zlib.decompress(idat)
    bpp = {0: 1, 2: 3, 6: 4}[ct]
    stride = width * bpp
    prev = bytearray(stride)
    rows = []
    for r in range(height):
        ft = raw[r * (stride + 1)]
        line = bytearray(raw[r * (stride + 1) + 1 : (r + 1) * (stride + 1)])
        if ft == 1:
            for i in range(bpp, stride):
                line[i] = (line[i] + line[i - bpp]) & 255
        elif ft == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif ft == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif ft == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b, c = prev[i], prev[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + _paeth(a, b, c)) & 255
        prev = line
        rows.append(bytes(line))
    return width, height, ct, rows


def to_rgba(ct, rows):
    bpp = {0: 1, 2: 3, 6: 4}[ct]
    if ct == 0:
        return [bytes(v for _ in range(3)) + b"\xff" for row in rows for v in row]
    if ct == 2:
        return [
            bytes(v for i in range(0, len(row), 3) for v in (row[i], row[i + 1], row[i + 2], 255))
            for row in rows
        ]
    return [bytes(row) for row in rows]


def downscale(src_rows, sw, sh, tw, th):
    out = []
    for ty in range(th):
        sy = max(0.0, (ty + 0.5) * (sh / th) - 0.5)
        y0, y1 = int(sy), min(int(sy) + 1, sh - 1)
        fy = sy - y0
        oline = bytearray()
        for tx in range(tw):
            sx = max(0.0, (tx + 0.5) * (sw / tw) - 0.5)
            x0, x1 = int(sx), min(int(sx) + 1, sw - 1)
            fx = sx - x0
            for ch in range(4):
                v = (
                    (1 - fx) * (1 - fy) * src_rows[y0][x0 * 4 + ch]
                    + fx * (1 - fy) * src_rows[y0][x1 * 4 + ch]
                    + (1 - fx) * fy * src_rows[y1][x0 * 4 + ch]
                    + fx * fy * src_rows[y1][x1 * 4 + ch]
                )
                oline.append(int(v + 0.5))
        out.append(bytes(oline))
    return out


def round_corners(rows, size):
    radius = size * RADIUS_RATIO
    out = []
    for y in range(size):
        dy = min(y, size - 1 - y)
        oline = bytearray(rows[y])
        for x in range(size):
            dx = min(x, size - 1 - x)
            if dx < radius and dy < radius:
                d = ((radius - dx) ** 2 + (radius - dy) ** 2) ** 0.5
                if d > radius:
                    oline[x * 4 + 3] = 0
        out.append(bytes(oline))
    return out


def encode_png(width, height, rows):
    def chunk(typ, payload):
        return (
            struct.pack(">I", len(payload))
            + typ
            + payload
            + struct.pack(">I", zlib.crc32(typ + payload) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = b"".join(b"\x00" + row for row in rows)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")


def build_ico(pngs, sizes):
    count = len(pngs)
    header = struct.pack("<HHH", 0, 1, count)
    entries = b""
    offset = 6 + 16 * count
    for size, png in zip(sizes, pngs):
        entries += struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(png), offset)
        offset += len(png)
    return header + entries + b"".join(pngs)


def main():
    sw, sh, ct, rows = decode_png(SRC)
    src = to_rgba(ct, rows)
    print(f"source: {SRC.name} {sw}x{sh} color_type={ct}")

    pngs = []
    for size in SIZES:
        scaled = downscale(src, sw, sh, size, size)
        rounded = round_corners(scaled, size)
        pngs.append(encode_png(size, size, rounded))
        print(f"  {size}px -> {len(pngs[-1])} bytes")

    OUT.write_bytes(build_ico(pngs, SIZES))
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    sys.exit(main())
