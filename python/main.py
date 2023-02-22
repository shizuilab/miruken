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
message = args[1]
# QRコードに表示するアドレス
address = args[2]

qr_size = (80, 80)
# 画像サイズ（ top, bottom, left, right）
image_size = (5, (300-qr_size[0])-5, (400-qr_size[1])-5, 5)

# 画像に文字を入れる関数
def img_add_msg(img, message):
    font24 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 24)
    img = Image.fromarray(img)                          # cv2(NumPy)型の画像をPIL型に変換
    draw = ImageDraw.Draw(img)                          # 描画用のDraw関数を用意
 
    # テキストを描画（位置、文章、フォント、文字色（BGR+α）を指定）
    draw.text((10, 10), message, font=font24, fill=(0, 0, 0, 0))
    img = np.array(img)                                 # PIL型の画像をcv2(NumPy)型に変換
    return img                                          # 文字入りの画像をリターン

def qr_create(address):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    qr.add_data(address)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_coler="white")
    resized = img.resize(qr_size)
    resized.save(os.path.join(picdir) + "/qrcode.bmp")

# アニメーション
for item in images:
    epd.show_image(item)
    time.sleep(1)

subprocess.Popen(['mpg321', os.path.join(voicedir) + '/level_up.mp3'])

# アドレスQRの生成
qr_put = qr_create(address)

qr_img = cv2.imread(os.path.join(picdir, 'qrcode.bmp'), 1)  #QRコード画像読み込み

# 画像の大きさを変更
resize_qr = cv2.copyMakeBorder(qr_img, image_size[0], image_size[1], image_size[2], image_size[3], cv2.BORDER_CONSTANT, value=(255, 255, 255))

# 画像に文字を入れる関数を実行
out_put = img_add_msg(resize_qr, message)

# 画像出力
cv2.imwrite(os.path.join(picdir, 'output.bmp'), out_put) 

epd.show_image('output.bmp')
# time.sleep(2)
# epd.display_clear()