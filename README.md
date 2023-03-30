# Ｍｉｒｕｋｅｎ（ミルケン）

# 概要

ラズパイでトランザクションを検知する。

トランザクションのメッセージをE-Paper上に表示する。

## なぜ作ったか

トランザクションの通知だけであればスマホで事足りるが、なぜわざわざHWを作ったかと言うと、楽しそうだったから（笑）

というのは冗談で（半分以上は本気）、スマホの通知は日常生活のなかで埋もれがちになる。

人は情報が多いと不要だと思うのもを遮断する生き物である（持論）

あえて飾り物として常時決まった場所においておくことにより、時計やカレンダーの様に常に気にかける存在としてなり得るのでは無いかと思ったためである。

情報過多なこの時代にアナログチックなものをコネクトしたかったのである。

また、メッセージに指令を込め、様々なHWやリソースとコネクトすることを最終目的として制作している。

# 処理の流れ

```
                       +---------------+
                       |  Block Chain  |
                       +------+--------+
                              |    
                              |    
                              |    WebSocketで特定アドレスを監視
                              |
 miruken for Rasberry Pi      |    
+-----------------------------v--+--+
|                                   |
| +-Nodejs listener-------+         |
| |                       |         |
| |                       |         |
| |     dist/main.js      |         |
| |                       |         |
| |                       |         |
| +-----------+-----------+         |
|             |                     |
| +-python----v-----------------+   |
| |                             |   |
| | - Generate image            |   |
| |                             |   |   QR Codeを読み込んでExplorer表示
| | - Generate QR Code          |   |   +-----------------------+
| |                             |   |   | Symbol Block Explorer |
| | - Show E-ink E-Paper        +---+--->                       |
| |                             |   |   +-----------------------+
| +-----------------------------+   |
|                                   |
+-----------------------------------+
```

# 実行環境

```
PRETTY_NAME="Raspbian GNU/Linux 11 (bullseye)"
NAME="Raspbian GNU/Linux"
VERSION_ID="11"
VERSION="11 (bullseye)"
VERSION_CODENAME=bullseye
ID=raspbian
ID_LIKE=debian
HOME_URL="http://www.raspbian.org/"
SUPPORT_URL="http://www.raspbian.org/RaspbianForums"
BUG_REPORT_URL="http://www.raspbian.org/RaspbianBugs"
```

# 環境構築

## 音声ツールのインストール

```
sudo apt update
sudo apt install mpg321

```

## SPIを有効にする

```
sudo raspi-config
sudo reboot
```

## 電子ペーパーを制御するためのツールインストール

```
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.60.tar.gz
tar zxvf bcm2835-1.60.tar.gz 
cd bcm2835-1.60/
sudo ./configure
sudo make
sudo make check
sudo make install

#wingpiインストール
sudo apt-get install wiringpi
wget https://project-downloads.drogon.net/wiringpi-latest.deb
sudo dpkg -i wiringpi-latest.deb
gpio -v

#wingpiは非推奨になったので下記を実行 参考：https://qiita.com/ma2shita/items/b11045717333bcd79d15

raspi-gpio get
raspi-gpio get 6 | awk -v RS=" " -F "=" -v k="level" '$1==k {print $2}'

# install Python3 libraries
sudo apt-get update
sudo apt-get install python3-pip
sudo apt-get install python3-pil
sudo apt-get install python3-numpy
```

## Nodejsインストール

ラズパイzero w nodejsを使う場合は普通にインストールするとv10.24.1がインストールされるので下記を使用する

https://github.com/tj/n#custom-source


```
$ N_NODE_MIRROR=https://unofficial-builds.nodejs.org/download/release/ n ls-remote
Listing remote... Displaying 20 matches (use --all to see all).
19.8.1
19.7.0
19.6.1
19.6.0
19.5.0
19.4.0
19.3.0
19.2.0
...
```

nをグローバルインストール

```
npm install -g n
```


.bashrcに書きを追記

```
export N_NODE_MIRROR=https://unofficial-builds.nodejs.org/download/release/
export N_PREFIX="$HOME/.n"; [[ :$PATH: == *":$N_PREFIX/bin:"* ]] || PATH+=":$N_PREFIX/bin"  # Added by n-install (see http://git.io/n-install-repo).
```

.bashrcを再読み込み

```
n lts
```

### nvmを入れる（raspi zero wでは失敗する）
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```
nvm install 18
```
※nvmが見つからないときはreboot

foreverインストール

```
sudo npm install -g forever
```

# インストール

## pip3 ライブラリのインストール

```
cd miruken/python
pip3 install -r requirements.txt
```
## npm ライブラリのインストール

```
cd miruken/node
npm install
```

## .envの設定

*python/.env*

```
# Twitter投稿用の設定
# TwitterAPIより取得して設定してください
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN=
ACCESS_TOKEN_SECRET=
```

*nodejs/.env*

```
# Symbolネットワーク設定 testnet or mainnet
NETWORK_TYPE=testnet
# SlackWebHookURL
SLACK_WEBHOOK_URL=
# 受信するアカウントのプライベートキー
PRIVATE_KEY=
```
※プライベートキーにしているのは今後の開発を見据えてのこと

# 使用方法

```
cd /home/pi/miruken/nodejs

# プログラムのビルド
npm run build

# 実行
node dist/main.js

# foreverにより永続化することも可能
forever start dist/main.js
```

# 部品

必須
- [電子ペーパー](https://amzn.to/3FtWSqU)
- [ラズベリーパイ](https://amzn.to/3FXrEs8)（試してないが3とかでもOKなはず）

オプション(普通にスピーカー繋ぐなら不要)
- [ミニブレッドボード　ＢＢ－６０１（白）](https://akizukidenshi.com/catalog/g/gP-05155/)
- [ＰＡＭ８０１２使用２ワットＤ級アンプモジュール](https://akizukidenshi.com/catalog/g/gK-08217/)
- [３．５ｍｍステレオミニジャックＤＩＰ化キット](https://akizukidenshi.com/catalog/g/gK-05363/)
- [ブレッドボード用ダイナミックスピーカー](https://akizukidenshi.com/catalog/g/gP-12587/)
- [小型ボリューム　１ＫΩＢ](https://akizukidenshi.com/catalog/g/gP-15812/)
- [小型ボリューム用ツマミ（ノブ）　１５ｍｍ　ＡＢＳ－２８](https://akizukidenshi.com/catalog/g/gP-00253/)

# 配線

**GPIO接続**

| e-Paper | Raspberry Pi |
| --- | --- |
| VCC | 1番ピン（3.3V） |
| GND | 6番ピン（GND） |
| DIN | 19番ピン（GPIO9） |
| CLK | 23番ピン（GPIO11） |
| CS | 24番ピン（GPIO8） |
| DC | 22番ピン（GPIO25） |
| RST | 11番ピン（GPIO17） |
| BUSY | 18番ピン（GPIO24） |

# 動作イメージ

## 実際の動きを確認する動画は[こちら](https://user-images.githubusercontent.com/98736633/226517356-089d1c30-fa14-41dd-b3b4-a71f65fdc6ef.mp4)をクリック

作成物イメージ

![PXL_20230321_042542649](https://user-images.githubusercontent.com/98736633/226517377-8f3a3e37-f95e-4dcb-95ee-a7a14c8f1587.jpg)


![PXL_20230225_093345947](https://user-images.githubusercontent.com/98736633/226517387-c98a0a82-b89a-4d66-b6a8-b95f653b602f.jpg)


![PXL_20230225_093349240](https://user-images.githubusercontent.com/98736633/226517397-a2e93d74-5ba4-4814-bab0-b0251a4c0021.jpg)


![PXL_20230225_093352699](https://user-images.githubusercontent.com/98736633/226517405-4344c69a-822b-4cfb-867c-d88a0f263272.jpg)


# 現在の監視アドレス

**NAKSFNW3VT45NEPU7NF4BVKCKKKXCNDQ3L22BZI**

こちらのアドレスにメッセージを投げるとmirukenに表示されます。
また、動作がわかりにくいのでTwitterにも生成したメッセージ画像を投稿しています。
➾[BotXym](https://twitter.com/BotXym)

# その他

現在はメッセージに半角文字列が交じると文字を正常に表示出来ません。
そのうち直します。
