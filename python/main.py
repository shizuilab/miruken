#!/usr/bin/python
# -*- coding:utf-8 -*-
# 現在は2.13inchのe-Paperに対応中
# その他のサイズのe-Paperに対応させるには、miruken/python/lib/の中の対応する物を使うこと
# e-Paperのサイズに応じて、そのサイズおスプラッシュ画像、ブランク画像、長辺x長辺の背景画像を用意すること

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
from waveshare_epd import epd2in13_V3 #e-Paperごとに適合する物に置き換える
import logging
import qrcode

#epd = epd2in13_V3.EPD() #e-Paperごとに適合する物に置き換える
#print (epd2in13_V3.EPD_WIDTH, epd2in13_V3.EPD_HEIGHT) #e-Paperごとに適合する物に置き換える
epd = epd2in13_V3.EPD() #e-Paperごとに適合する物に置き換える
print ("Library supported size:", epd2in13_V3.EPD_WIDTH, epd2in13_V3.EPD_HEIGHT) #e-Paperごとに適合する物に置き換える

if len(sys.argv) < 3:
  print("Usage: argv error")
  sys.exit(1)

images = ['shizui_2in13.bmp', 'shizui_2in13blank.bmp'] #e-Paperごとに適合する物に置き換える

logging.basicConfig(level=logging.DEBUG)

args = sys.argv

# 画像に入れる文章
text = args[1]
print (text)

# QRコードに表示するアドレス
address = args[2]
print (address)

# 画像に文字を入れる関数
def img_add_msg(img, message):

    # テキストの描画位置を指定
    text_x, text_y = 10, 74 #e-Paperごとに適合する座標に置き換える
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
        elif word == '>':
            line_no += 1
            lines.append('')
            word = ''
        elif word == ' ':
            line_no += 1
            lines.append('')
        lines[line_no] += word
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
img = cv2.imread(os.path.join(picdir, 'shizui_2in13background.bmp')) #適切なサイズのブランク正方形画像を指定
print (img.shape[0], img.shape[1])

# QRコードの生成
qr = qrcode.QRCode(version=1, box_size=2, border=2)
qr.add_data(address)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white")
qr_img = np.array(qr_img.getdata(), dtype=np.uint8).reshape(qr_img.size[1], qr_img.size[0])
qr_img = cv2.cvtColor(qr_img, cv2.COLOR_GRAY2BGR)
qr_width, qr_height = qr_img.shape[:2]

# QRコードの配置
qr_x = img.shape[1] - qr_height - 10 #e-Paperごとに適合する位置に置き換える
qr_y = img.shape[2] - qr_width - 84 #e-Paperごとに適合する位置に置き換える
img[qr_y:qr_y+qr_height, qr_x:qr_x+qr_width] = qr_img

# 画像に文字を入れる関数を実行
out_put = img_add_msg(img, text)
print (out_put.shape)

# 画像の移動、回転と保存 e-Paperごとに適合するように調整する

# 2.7 inch
# Rotation is not needed

# 2.13 inchi
center_location = (124, 124)
angle = 270
M = cv2.getRotationMatrix2D(center_location, angle, 1)
out_put = cv2.warpAffine(out_put, M, (out_put.shape[0], out_put.shape[1]))
print ("output shape 1:", out_put.shape)
M2 = np.float32([[1,0,0],[0,1,0]])
out_put = cv2.warpAffine(out_put, M2, (out_put.shape[1], out_put.shape[0]))
print ("output shape 2:", out_put.shape)
cv2.imwrite(os.path.join(picdir, 'output.bmp'), out_put[0:250, 64:186])

# 音声の再生
# subprocess.Popen(['mpg321', os.path.join(voicedir) + '/src_views_resources_audio_ding.mp3'])

# 最終画像の表示
epd.init()
epd.Clear(0xFF)
Himage = Image.open(os.path.join(picdir, 'output.bmp'))
epd.display(epd.getbuffer(Himage))
time.sleep(2)

# 音声の再生
# subprocess.Popen(['mpg321', os.path.join(voicedir) + '/src_views_resources_audio_ding2.mp3'])

# Clear and Sleep
# epd.Clear(0xFF)
epd.sleep()
