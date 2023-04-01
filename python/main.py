#!/usr/bin/python
# -*- coding:utf-8 -*-
import sys
import os
import subprocess
#import tweet_bot as tweetbot

libdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'lib')
if os.path.exists(libdir):
    sys.path.append(libdir)

picdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'pic')
voicedir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'voice')

# 画像処理
from PIL import Image, ImageFont, ImageDraw
import cv2
import numpy as np

import time
from waveshare_epd import epd2in7
import logging
import qrcode

epd = epd2in7.EPD()

if len(sys.argv) < 3:
  print("Usage: argv erro")
  sys.exit(1)

images = ['shizui.bmp', 'blank.bmp']

logging.basicConfig(level=logging.DEBUG)

args = sys.argv

# 画像に入れる文章
text = args[1]
print (text)

# 音声の再生
subprocess.Popen(['mpg321', os.path.join(voicedir) + '/src_views_resources_audio_ding.mp3'])

# QRコードに表示するアドレス
address = args[2]
print (address)

# 画像に文字を入れる関数
def img_add_msg(img, message):

    # テキストの描画位置を指定
    text_x, text_y = 10, 40
    # フォントの指定
    font20 = ImageFont.truetype(os.path.join(picdir, 'NotoSansCJK-Regular.ttc'), 20)
    img = Image.fromarray(img)                          # cv2(NumPy)型の画像をPIL型に変換
    draw = ImageDraw.Draw(img)                          # 描画用のDraw関数を用意

    # 改行する文字数
    if len(message) != len(message.encode('utf-8')):
        n = 12
    else:
        n = 20

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
        draw.text(org, line, font=font20, fill=(0, 0, 0, 0))
        # 行間を開ける
        text_y += int(20 * 1.2)

    img = np.array(img)                                 # PIL型の画像をcv2(NumPy)型に変換
    return img

# 画像の読み込み
img = cv2.imread(os.path.join(picdir, 'shizui_v.bmp'))

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
qr_y = img.shape[2] - qr_width - 10
img[qr_y:qr_y+qr_height, qr_x:qr_x+qr_width] = qr_img

# 画像に文字を入れる関数を実行
out_put = img_add_msg(img, text)

# 画像の保存
cv2.imwrite(os.path.join(picdir, 'output.bmp'), out_put)

# アニメーション
for item in images:
    epd.init()
    # epd.Clear(0xFF)
    Himage = Image.open(os.path.join(picdir, item))
    epd.display(epd.getbuffer(Himage))
    time.sleep(0.5)

# 音声の再生
subprocess.Popen(['mpg321', os.path.join(voicedir) + '/src_views_resources_audio_ding2.mp3'])

# 最終画像の表示
Himage = Image.open(os.path.join(picdir, 'output.bmp'))
epd.display(epd.getbuffer(Himage))
time.sleep(2)

# Clear and Sleep
# epd.Clear(0xFF)
epd.sleep()

# tweetbot.post()
# time.sleep(2)
# epd.display_clear()
