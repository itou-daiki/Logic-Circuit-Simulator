# 推奨コマンド集

## ファイル操作コマンド
```bash
# プロジェクトルートでファイル一覧表示
ls -la

# 特定拡張子のファイル検索
find . -name "*.js" -o -name "*.html" -o -name "*.css"

# ファイル内容表示
cat index.html
cat script.js
cat style.css
```

## 検索コマンド
```bash
# コード内のパターン検索（ripgrep推奨）
rg "LogicGate" .
rg "function.*(" .
rg "class.*{" .

# 特定の関数やクラスの検索
rg "class LogicGate" .
rg "function.*calculate" .
```

## Git操作コマンド
```bash
# 現在の状態確認
git status

# 変更をステージング
git add .
git add index.html script.js style.css

# コミット
git commit -m "機能追加: [具体的な変更内容]"

# リモートにプッシュ
git push origin main

# ブランチ作成・切り替え
git checkout -b feature/new-feature
git checkout main

# 変更差分確認
git diff
git diff HEAD~1
```

## 開発・デバッグ用
```bash
# ローカルWebサーバー起動（Python）
python3 -m http.server 8000

# ローカルWebサーバー起動（Node.js）
npx http-server .

# ファイル監視（変更時に自動更新）
# 注意: このプロジェクトでは標準では利用できない
```

## ファイル編集・確認
```bash
# ファイル編集（推奨エディタで）
code index.html
code script.js
code style.css

# ファイルサイズ確認
ls -lh *.html *.js *.css

# 行数カウント
wc -l script.js
```

## プロジェクト固有
```bash
# バージョン確認（HTMLヘッダー内）
grep "Ver[0-9]" index.html

# 主要クラス・関数の確認
rg "class.*{" script.js
rg "function.*{" script.js
```