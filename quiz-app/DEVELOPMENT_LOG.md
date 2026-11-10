# Quiz App 开发日志

## 项目概述
类似 Blooket 的多人在线答题游戏，支持主持人控制和参与者答题。

## 技术栈
- **前端**: React 18 + Vite + TypeScript + Tailwind CSS v4
- **状态管理**: React Context
- **多人同步**: BroadcastChannel API（单机模拟模式）
- **题目来源**: 本地 CSV 文件

## 设计规范
| 元素 | 值 |
|------|-----|
| 主色调 | `#a855f7`（紫色顶栏） |
| 背景色 | `#00c2cb`（青色） |
| 正确答案 | `#22C55E`（绿色） |
| 错误选择 | `#EF4444`（红色） |
| 标题字体 | Titan One |
| 正文字体 | Nunito |
| 阴影 | `shadow-cartoon: 0 4px 0 rgba(0,0,0,0.2)` |

## 项目结构
```
quiz-app/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Input, Header, BackgroundPattern
│   │   ├── game/            # OptionButton, Timer, Countdown, Leaderboard
│   │   └── feedback/        # CorrectBanner, IncorrectBanner
│   ├── pages/
│   │   ├── player/          # JoinPage, NicknamePage, WaitingPage, CountdownPage, QuestionPage, ResultPage
│   │   └── host/            # CreateGamePage, LobbyPage, ControlPage, FinalResultPage
│   ├── context/
│   │   └── GameContext.tsx  # 游戏状态管理
│   ├── services/
│   │   └── csvParser.ts     # CSV 解析器
│   ├── types/game.ts
│   └── App.tsx, router.tsx
├── test-questions.csv       # 测试题库（3题）
└── vite.config.ts
```

## 页面流程

### 参与者端
1. `/join` - 输入 Game ID
2. `/nickname` - 输入昵称
3. `/waiting` - 等待主持人开始
4. `/countdown` - 3-2-1 倒计时
5. `/question` - 答题（题目+4选项，答对绿色/答错红色反馈）
6. `/result` - 结算（个人得分 + 前三名）

### 主持人端
1. `/host/create` - 创建游戏（上传 CSV，生成 Game ID）
2. `/host/lobby` - 等待大厅（显示 Game ID、玩家列表、开始按钮）
3. `/host/control` - 游戏控制（当前题目、下一题、实时统计）
4. `/host/final` - 最终结果（排行榜）

## 游戏规则
- **总时间**: 5 分钟
- **计分**: 答对 +100 分，答错 0 分
- **同步**: 所有参与者统一看同一道题，由主持人控制节奏
- **答题反馈**: 答对自动切换下一题（1.5秒后），答错需点击按钮切换

## CSV 格式
```csv
Question #,Question Text,Answer 1,Answer 2,Answer 3,Answer 4,Time Limit (sec),Correct Answer(s)
1,问题文本,选项A,选项B,选项C,选项D,15,2
```

---

## 开发记录

### 2026-01-14 Session 1: 项目初始化与基础实现

#### 完成的功能
- [x] 创建 Vite + React + TypeScript 项目
- [x] 配置 Tailwind CSS v4（使用 `@theme` 指令）
- [x] 添加 Google Fonts（Titan One, Nunito）
- [x] 创建基础目录结构
- [x] 实现通用组件：BackgroundPattern, Header, Button, Input
- [x] 实现游戏组件：Countdown, OptionButton, Timer, Leaderboard
- [x] 实现反馈组件：CorrectBanner, IncorrectBanner
- [x] 实现 GameContext 状态管理
- [x] 实现 CSV 解析器
- [x] 实现所有参与者页面
- [x] 实现所有主持人页面

### 2026-01-14 Session 2: Bug 修复

#### Bug 1: CSV 解析错误
**问题**: 上传 CSV 时报错 "Invalid time limit" 和 "Invalid correct answer"
**原因**: 用户的 CSV 文件第一行为空，表头在第二行
**修复**: 修改 `csvParser.ts`，添加逻辑查找以 "Question" 开头的表头行，而不是假设第一行是表头

#### Bug 2: Game ID 找不到
**问题**: 玩家输入正确的 Game ID 后显示 "Game not found"
**原因**: `joinGame` 函数的比较逻辑不够健壮
**修复**:
- 添加大小写标准化（`toUpperCase().trim()`）
- 添加空值检查
- 添加调试日志

```typescript
// src/context/GameContext.tsx
const joinGame = useCallback((gameId: string) => {
  const normalizedInput = gameId.toUpperCase().trim();
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    console.log('[joinGame] No game state in localStorage');
    return false;
  }

  try {
    const hostState = JSON.parse(stored) as GameState;
    const storedGameId = (hostState.gameId || '').toUpperCase().trim();

    if (storedGameId && storedGameId === normalizedInput) {
      dispatch({ type: 'JOIN_GAME', gameId: storedGameId });
      dispatch({ type: 'SYNC_STATE', state: hostState });
      return true;
    }
  } catch (e) {
    console.error('[joinGame] Failed to parse stored state:', e);
  }

  return false;
}, []);
```

#### Bug 3: 答对显示为答错
**问题**: 答对题目后，界面显示 "INCORRECT" 而不是 "CORRECT"
**原因**: 状态同步的竞态条件 - 玩家提交答案后，主机广播的旧状态覆盖了玩家的本地状态
**修复**: 修改 `SYNC_STATE` reducer，保留当前玩家的答案状态

```typescript
case 'SYNC_STATE': {
  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId);
  const syncedPlayers = action.state.players.map((p) => {
    if (p.id === state.currentPlayerId && currentPlayer && currentPlayer.currentAnswer !== null) {
      return {
        ...p,
        currentAnswer: currentPlayer.currentAnswer,
        isCorrect: currentPlayer.isCorrect,
        score: currentPlayer.score,
      };
    }
    return p;
  });

  return {
    ...action.state,
    players: syncedPlayers,
    currentPlayerId: state.currentPlayerId,
    isHost: state.isHost,
  };
}
```

#### Bug 4: 题目跳转后又返回
**问题**: 答完第二题后跳到第三题，然后又快速返回第二题
**原因**: 玩家本地调用 `nextQuestion()` 更新状态后，主机的状态同步覆盖了 `currentQuestionIndex`
**修复**: 修改 `nextQuestion` 函数，非主机玩家通过 BroadcastChannel 请求主机切换题目

```typescript
const nextQuestion = useCallback(() => {
  if (state.isHost) {
    dispatch({ type: 'NEXT_QUESTION' });
  } else {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'REQUEST_NEXT_QUESTION' });
    channel.close();
  }
}, [state.isHost]);
```

同时在主机端添加消息处理：
```typescript
} else if (type === 'REQUEST_NEXT_QUESTION' && state.isHost) {
  dispatch({ type: 'NEXT_QUESTION' });
}
```

### 功能增强: 答题反馈差异化
- **答对**: 显示 "+100 points!" + "Moving to next question..."，1.5秒后自动切换下一题
- **答错**: 显示 "Better luck next time!" + "Next Question" 按钮，需手动点击切换

---

## 关键技术点

### 1. BroadcastChannel 状态同步
使用 BroadcastChannel API 实现跨标签页通信：
- `STATE_SYNC`: 主机广播游戏状态给所有玩家
- `PLAYER_JOINED`: 玩家加入时通知主机
- `ANSWER_SUBMITTED`: 玩家提交答案时通知主机
- `REQUEST_NEXT_QUESTION`: 玩家请求切换下一题

### 2. 竞态条件处理
在多人游戏中，状态同步可能导致竞态条件。解决方案：
- 主机作为单一数据源（Single Source of Truth）
- 玩家本地状态在同步时保留关键数据（如答案状态）
- 玩家的操作通过消息请求主机执行，而不是直接修改本地状态

### 3. Tailwind CSS v4 配置
使用 `@theme` 指令定义自定义主题变量：
```css
@theme {
  --color-primary: #a855f7;
  --color-secondary: #00c2cb;
  --font-display: "Titan One", cursive;
  --font-body: "Nunito", sans-serif;
}
```

---

## 测试方法
1. **单人测试**: 打开两个标签页，一个主持人、一个参与者，验证完整流程
2. **多人测试**: 多开参与者标签页，验证同步和排行榜
3. **边界测试**: 超时未答、断开重连、无效 Game ID

## 测试题库
文件: `test-questions.csv`（3道题目）
| # | 题目 | 正确答案 |
|---|------|----------|
| 1 | React 中用于管理组件状态的 Hook 是哪个？ | useState |
| 2 | CSS 中 flex-direction: column 的作用是？ | 垂直排列元素 |
| 3 | JavaScript 中哪个方法可以将数组转换为字符串？ | join() |
