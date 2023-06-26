import requests
from bs4 import BeautifulSoup
import pandas as pd

# ウェブページのURL
url = "https://gamewith.jp/zelda-totk/article/show/400647"

# URLにアクセスしHTMLを解析
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# リンクを抽出
links = soup.find_all('a')

# URLと表示名を取得し、辞書に保存
data = []
for link in links:
    href = link.get('href')
    text = link.text
    data.append({'URL': href, 'Display_Name': text})

# データをpandasのDataFrameに変換
df = pd.DataFrame(data)

# Excelファイルに書き出し
df.to_excel('output.xlsx', index=False)
