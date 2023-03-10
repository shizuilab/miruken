import os
import tweepy
from dotenv import load_dotenv
# .envファイルを読み込む
load_dotenv()
picdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'pic')

# APIキーを環境変数から取得
consumer_key = os.environ.get('CONSUMER_KEY')
consumer_secret = os.environ.get('CONSUMER_SECRET')
access_token = os.environ.get('ACCESS_TOKEN')
access_token_secret = os.environ.get('ACCESS_TOKEN_SECRET')

def post():
  # 認証情報を設定
  auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
  auth.set_access_token(access_token, access_token_secret)

  # APIオブジェクトを取得
  api = tweepy.API(auth)

  # ツイートする画像のパスを設定
  image_path = os.path.join(picdir, 'output.bmp')

  # 画像をアップロード
  media = api.media_upload(image_path)

  # ツイートを投稿
  tweet = ''
  post_result = api.update_status(status=tweet, media_ids=[media.media_id])
  print(post_result.text)