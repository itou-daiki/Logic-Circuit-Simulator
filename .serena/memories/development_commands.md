# 開発用コマンド

## プロジェクト特徴
このプロジェクトは**純粋なフロントエンドWebアプリケーション**で、ビルドプロセスやパッケージマネージャーを使用していません。

## 開発環境
- **開発方法**: 任意のWebサーバーでHTMLファイルを開く
- **推奨**: Live Serverやローカルサーバー環境

## 利用可能なLinuxコマンド
```bash
# ファイル一覧表示
ls -la

# ディレクトリ移動
cd /path/to/directory

# ファイル検索
find . -name "*.js" -o -name "*.html" -o -name "*.css"

# テキスト検索（ripgrep推奨）
rg "pattern" .

# ファイル内容表示
cat filename

# Git操作
git status
git add .
git commit -m "message"
git push
```

## 開発ワークフロー
1. **ファイル編集**: エディタでHTML/CSS/JSファイルを直接編集
2. **動作確認**: Webブラウザでindex.htmlを開いて確認
3. **バージョン管理**: Gitでコミット・プッシュ

## テスト方法
- **手動テスト**: ブラウザでの操作確認
- **デバッグ**: ブラウザ開発者ツールのConsole使用

## 注意事項
- **linting/formatting**: 設定なし（手動コードレビュー）
- **自動テスト**: 実装なし
- **依存関係**: なし（vanilla JavaScript）