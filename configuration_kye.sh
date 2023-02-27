#!/bin/sh

sudo echo "set nocompatible" >> /etc/skel/.vimrc
sudo echo "set backspace=indent,eol,start" >> /etc/skel/.vimrc
sudo echo "set nocompatible" >> /root/.vimrc
sudo echo "set backspace=indent,eol,start" >> /root/.vimrc
echo "set nocompatible" >> /home/pi/.vimrc
echo "set backspace=indent,eol,start" >> /home/pi/.vimrc