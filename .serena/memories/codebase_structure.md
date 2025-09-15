# コードベース構造

## ファイル構成
```
Logic-Circuit-Simulator/
├── index.html          # メインHTMLファイル（UIとレイアウト）
├── script.js           # メインJavaScriptファイル（全ロジック）
├── style.css           # スタイルシート（レスポンシブデザイン）
├── CLAUDE.MD           # プロジェクト詳細仕様書
├── LICENSE             # MITライセンス
└── スクリーンショット.png # デモ画像
```

## 主要クラス構造（script.js）

### LogicGate クラス
- **目的**: 論理回路ゲートの基本クラス
- **主要メソッド**:
  - `constructor(type, x, y, id)`: ゲート初期化
  - `calculate()`: 論理演算実行
  - `draw(ctx)`: Canvas描画
  - `getClickedPin(x, y)`: ピンクリック判定
  - `containsPoint(x, y)`: 点含有判定

### Connection クラス
- **目的**: ゲート間の接続管理
- **機能**: 信号伝播、接続線描画

### Simulator クラス
- **目的**: シミュレーション実行管理
- **機能**: ステップ実行、状態管理、真理値表生成

## アーキテクチャパターン
- **単一HTMLファイル構成**: 依存関係なしで完全動作
- **Canvas-based UI**: HTML5 Canvasによる描画
- **イベント駆動**: マウス・キーボードイベント処理
- **状態管理**: グローバル変数によるアプリケーション状態管理