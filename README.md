# ルミナ ホームページ

日常にひっそりといる着ぐるみさん、ルミナ（[@KiguRumina](https://x.com/KiguRumina)）の紹介ページです。

## 写真の追加・入れ替え

1. `images/photos/` に大きい写真、`images/thumbs/` に小さい写真（横幅480px程度）を同じファイル名で置く
2. `script.js` の先頭にある `PHOTOS` に `{ file: "19", caption: "キャプション" }` を足す

並び順もキャプションも `PHOTOS` を書き換えるだけで変わります。

## GitHub Pages で公開

1. このフォルダを GitHub のリポジトリに push する
2. リポジトリの Settings → Pages → Branch を `main` / `(root)` にして Save
3. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で見られます
