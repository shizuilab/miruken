#!/usr/bin/python
# -*- coding:utf-8 -*-
import os
import subprocess

picdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'pic')
voicedir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'voice')

# 画像処理
from PIL import Image, ImageFont, ImageDraw
import cv2
import numpy as np

import time
import epd_42 as epd
import sys
import logging
import qrcode

if len(sys.argv) < 3:
  print("Usage: argv erro")
  sys.exit(1)
  
images = ['1.bmp', '2.bmp', '3.bmp', '4.bmp', '5.bmp']

logging.basicConfig(level=logging.DEBUG)

args = sys.argv

# 画像に入れる文章
text = args[1]

# QRコードに表示するアドレス
address = args[2]

# 画像に文字を入れる関数
def img_add_msg(img, message):

    # テキストの描画位置を指定
    text_x, text_y = 20, 100
    # フォントの指定
    font24 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 24)
    img = Image.fromarray(img)                          # cv2(NumPy)型の画像をPIL型に変換
    draw = ImageDraw.Draw(img)                          # 描画用のDraw関数を用意
    
    # 改行する文字数
    n = 24
    lines = ['']
    line_no = 0
    for word in message:
        if len(lines[line_no]) + len(word) > n:
            line_no += 1
            lines.append('')
        lines[line_no] += ' ' + word
    # 1行ずつテキストを描画

    for line in lines:
        # テキストの描画位置を指定
        org = (text_x, text_y)
        # テキストを描画
        # cv2.putText(img, line, org, cv2.FONT_HERSHEY_SIMPLEX, font_size, text_color, thickness)
        # テキストを描画（位置、文章、フォント、文字色（BGR+α）を指定）
        draw.text(org, line, font=font24, fill=(0, 0, 0, 0))
        # 行間を開ける
        text_y += int(24 * 1.2)
    
    img = np.array(img)                                 # PIL型の画像をcv2(NumPy)型に変換
    return img  

# 画像の読み込み
img = cv2.imread(os.path.join(picdir, 'message_background.bmp'))

# QRコードの生成
qr = qrcode.QRCode(version=1, box_size=2, border=2)
qr.add_data(address)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white")
qr_img = np.array(qr_img.getdata(), dtype=np.uint8).reshape(qr_img.size[1], qr_img.size[0])
qr_img = cv2.cvtColor(qr_img, cv2.COLOR_GRAY2BGR)
qr_width, qr_height = qr_img.shape[:2]

# QRコードの配置
qr_x = img.shape[1] - qr_width - 10
qr_y = 10
img[qr_y:qr_y+qr_height, qr_x:qr_x+qr_width] = qr_img

# 画像に文字を入れる関数を実行
out_put = img_add_msg(img, text)

# 画像の保存
cv2.imwrite(os.path.join(picdir, 'output.bmp'), out_put)

# アニメーション
for item in images:
    epd.show_image(item)
    time.sleep(0.5)

# 音声の再生
subprocess.Popen(['mpg321', os.path.join(voicedir) + '/level_up.mp3'])

# 最終画像の表示
epd.show_image('output.bmp')
# time.sleep(2)
# epd.display_clear()