## はじめに
初めまして、Rollphesと言う者です。普段は原神で遊びまくってるただの社会人ニ年目です。<br>
このレポジトリは[テイワットマップ](https://act.hoyolab.com/ys/app/interactive-map/index.html)を自動でゲームと追尾させたいと思い2022/2に作った物になります。<br>
プログラミングは趣味でやってるだけで独学なので説明やコードに不備があるかと思いますが見なかったことにしてくださいｗ<br>
GPUを使ってないのもそのせいです(ただの勉強不足)ｗ<br>
もし問題点等あればissue等を用いて頂ければ幸いです。<br>
もちろんTwitter(ユーザー名とID一緒です)やDiscordでも対応できます。<br>

## 動作環境
・windows CPU:i7以上？<br>
・Chrome<br>
・Nodejs v16.17.0<br>
・npm v6.14.17<br>
・git v2.38.1.windows.1<br>
※1:自分の環境はこれなので別バージョンでの動作は保証しません。<br>
※2:実行時のメモリ消費量は約200MBです。

## 導入方法
まず、Node.jsとgitを使える環境にする必要があります。<br>
これについてはググれば沢山出てきますので省きます。<br>


Node.jsの環境を整えたらこのレポジトリをご自分のPCにコピーしましょう。<br>
コマンドプロンプトを起動させ、導入したい場所にcdで移動してください。<br>
次に以下を実行してコピーしましょう。
```
git clone https://github.com/Rollphes/Sync-teyvat-map.git
cd Sync-teyvat-map
npm i
```
開発者向け:yarn addでも問題ありません。多分opencv4nodejsの導入が難しいと思います。

次にchrome拡張機能を入れましょう。<br>
`chrome://extensions/`にアクセスして拡張機能の設定画面を開きます。<br>
`パッケージ化されていない拡張機能を読み込む`をクリックして、sync-teyvat-map-extensions.zipというファイルを読み込ませましょう。<br>
`テイワットマップ(同期)0.1.0`という拡張機能が追加されたら成功です。<br>

## 実行方法
1.まずはbatファイルを実行しましょう。<br>
通常マップの場合は`start_map.bat`を実行<br>
層岩巨淵の場合は`start_sougan.bat`を実行<br>
淵下宮の場合は`start_enkanomiya.bat`を実行<br>

2.[テイワットマップ](https://act.hoyolab.com/ys/app/interactive-map/index.html)を開きましょう。<br>
注意点<br>
・マップが読み込まれた後、少しスクロールする必要があります。<br>
・2を実行してから1を実行するとうまく行きません。<br>
・一度実行すると手動でスクロールは出来なくなるので注意してください。<br>

## 仕組み(如何せん10ヶ月前のコードなのでほぼ忘れてます。)
1.スクリーンショットをt.pngとして保管<br>
2.datとして保管してあるマップデータ(setupスクリプト内でAKAZE特徴量と特徴記述を保管した者)とマッチング<br>
3.精度を高めるためマッチングした結果のソートを実施<br>
4.特にマッチング距離が短かった40setを抽出<br>
5.角度違いを考え、更にマッチングを実施<br>
6.抽出した2つのマッチングからベクトルを取り出し、テイワットマップの原点からのベクトルを算出<br>
7.WebSocketを用いてローカル通信でChromeに送信<br>
8.拡張機能が受信してURLのパラメータ部分を書き換える。<br>
9.パラメータを書き換えた事によりテイワットマップが動く

## 開発者向け
動作を軽くするために拡張子dat内にjson形式でKeyPointsとDescriptorsを保管しています。<br>
もしマップが拡張された際に自分でマップ画像`src/???.png`を弄って更新したい場合は`setup`スクリプトを実行してください。<br>
32GBメモリを実装しているPCでもほぼ全部持ってかれるので注意してください。<br>
尚、事前にsetupを実行した物を保管しているので更新しなくても動きます。
