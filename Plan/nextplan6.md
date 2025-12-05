# 　次の実装プラン
>
> 一旦Apexを例に下記を列挙

フロントエンド系

- RecruitDetailの作成
  - モーダルで作成する。
  - 募集者の名前と参加者の名前を表示する。
  - 名前にリンクを貼りクリック可能
  - avatarにdiscordavatar採用
  - playernameはdiscordusername採用

- DiscordRecruitmedCardの変更
  - ゲーム名 = アイコンに
  - カード全体をコンパクトに
  - 名前表示は消してアイコン表示のみに変更
  - playeravatarはdiscordavatar採用

- Currentgamesectionの変更
  - selectedgameの画面遷移時のアニメーション追加
  - ~~CurrentGameSectionに現在のゲームの退出ボタンを配置する。~~
  - 参加者がいる状態で募集者が退出ボタンをおすと解散する旨のメッセージをだす
  - ~~全員退出でclosedに設定する。~~
  - サイズをコンパクトに
  - 名前にリンク作成

- PFのロゴ変更

- Navbarの変更
  - buttonをGAME名ではなくiconに変更
バックエンド系
- DMで配信するURLを変更
- ViewspyのRecruitDetailAPI作成

Discord系
-
