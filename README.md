# Ｍｉｒｕｋｅｎ（ミルケン）

# 環境構築

以下の環境にて構築

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

# 音声ツールのインストール

```
sudo apt update
sudo apt install mpg321

```

# SPIを有効にする

```
sudo raspi-config
sudo reboot
```

# 電子ペーパーを制御するためのツールインストール

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
```

# Nodejsインストール

```
sudo apt-get install nodejs npm
```

## nインストール

```
sudo npm install -g n
```

## apt-getで入れたnodejsをアンインストール

```
sudo apt-get remove nodejs npm
```

## バージョンを指定してnodejsをインストール

```
sudo n 18

sudo reboot

node -v
npm -v
```