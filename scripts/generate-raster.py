"""One-off raster asset generator (favicon PNGs + Open Graph image).
Requires: pip install opencv-python-headless numpy
Run: python scripts/generate-raster.py
"""
import os
import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
BG = (18, 11, 7)  # BGR for #070B12
CYAN = (241, 196, 46)
AMBER = (3, 183, 255)
WHITE = (248, 246, 244)
GREY = (153, 144, 138)


def icon(size):
    img = np.full((size, size, 3), BG, np.uint8)
    s = size / 32
    m = int(3.5 * s)
    cv2.rectangle(img, (m, m), (size - m, size - m), CYAN, max(1, int(1.2 * s)), cv2.LINE_AA)
    t = max(1, int(2.2 * s))
    # J
    cv2.line(img, (int(14 * s), int(8.5 * s)), (int(14 * s), int(21 * s)), WHITE, t, cv2.LINE_AA)
    cv2.ellipse(img, (int(11.5 * s), int(21 * s)), (int(2.5 * s), int(2.5 * s)), 0, 0, 180, WHITE, t, cv2.LINE_AA)
    # B
    cv2.line(img, (int(18 * s), int(8.5 * s)), (int(18 * s), int(23.5 * s)), WHITE, t, cv2.LINE_AA)
    cv2.ellipse(img, (int(20.5 * s), int(12.25 * s)), (int(3 * s), int(3.75 * s)), 0, -90, 90, WHITE, t, cv2.LINE_AA)
    cv2.ellipse(img, (int(21 * s), int(19.75 * s)), (int(3.5 * s), int(3.75 * s)), 0, -90, 90, WHITE, t, cv2.LINE_AA)
    cv2.line(img, (int(18 * s), int(8.5 * s)), (int(20.5 * s), int(8.5 * s)), WHITE, t, cv2.LINE_AA)
    cv2.line(img, (int(18 * s), int(16 * s)), (int(21 * s), int(16 * s)), WHITE, t, cv2.LINE_AA)
    cv2.line(img, (int(18 * s), int(23.5 * s)), (int(21 * s), int(23.5 * s)), WHITE, t, cv2.LINE_AA)
    return img


def og():
    w, h = 1200, 630
    rng = np.random.default_rng(3)
    noise = rng.normal(0, 7, (h, w, 1))
    img = np.clip(np.full((h, w, 3), BG, np.float32) + noise, 0, 255).astype(np.uint8)
    for x in range(0, w, 100):
        cv2.line(img, (x, 0), (x, h), (40, 32, 26), 1)
    # crack + glowing sealant
    pts = np.array([[620, 470], [700, 430], [760, 450], [840, 380], [930, 400], [1010, 330], [1120, 310]], np.int32)
    glow = np.zeros_like(img)
    cv2.polylines(glow, [pts], False, AMBER, 14, cv2.LINE_AA)
    glow = cv2.GaussianBlur(glow, (0, 0), 12)
    img = cv2.add(img, glow)
    cv2.polylines(img, [pts], False, (180, 230, 255), 3, cv2.LINE_AA)
    f = cv2.FONT_HERSHEY_DUPLEX
    cv2.putText(img, 'SEQ 001 - THE SURFACE', (70, 110), cv2.FONT_HERSHEY_PLAIN, 1.6, GREY, 1, cv2.LINE_AA)
    cv2.putText(img, 'JANVI', (64, 270), f, 4.4, WHITE, 7, cv2.LINE_AA)
    cv2.putText(img, 'BUILDCON', (64, 390), f, 4.4, WHITE, 7, cv2.LINE_AA)
    cv2.putText(img, 'Sealed. Strong. Built to Last.', (70, 470), f, 1.25, CYAN, 2, cv2.LINE_AA)
    cv2.putText(img, 'WATERPROOFING  /  EPOXY  /  INJECTION GROUTING  /  CRACK REPAIR  -  SURAT', (70, 560), cv2.FONT_HERSHEY_PLAIN, 1.3, GREY, 1, cv2.LINE_AA)
    cv2.rectangle(img, (20, 20), (w - 20, h - 20), (60, 50, 42), 1)
    return img


cv2.imwrite(os.path.join(ROOT, 'favicon-32.png'), cv2.resize(icon(256), (32, 32), interpolation=cv2.INTER_AREA))
cv2.imwrite(os.path.join(ROOT, 'apple-touch-icon.png'), cv2.resize(icon(512), (180, 180), interpolation=cv2.INTER_AREA))
cv2.imwrite(os.path.join(ROOT, 'icon-512.png'), icon(512))
cv2.imwrite(os.path.join(ROOT, 'og-image.jpg'), og(), [cv2.IMWRITE_JPEG_QUALITY, 84])
print('raster assets written')
