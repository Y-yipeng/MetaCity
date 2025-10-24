# MetaCity - 地皮NFT交易市场

基于区块链的虚拟地块NFT买卖平台，支持100个独特地块的铸造、交易和管理。

## 项目特点

- 🏗️ **100个独特地块**: 编号1-100的虚拟地皮NFT
- 🎨 **3D可视化**: 基于CSS 3D的地块展示效果
- 🔥 **热门地块**: 预设热门地块（#3, #7, #15, #22, #30, #45）
- 💰 **自由交易**: 用户可以购买、上架、下架自己的地块
- 👛 **Web3集成**: 使用MetaMask进行钱包连接和交易
- 📊 **用户管理**: 查看拥有的地块和购买历史

## 技术栈

### 智能合约
- Solidity ^0.8.0
- OpenZeppelin 合约库
- ERC721 Enumerable 标准

### 前端
- HTML5 + Tailwind CSS
- JavaScript ES6+ (Modules)
- ethers.js v6.12.0
- CSS 3D Transform

## 项目结构

```
NFT_marketplace-main/
├── sol/
│   └── Marketplace.sol          # MetaCityLand 智能合约
├── index.html                   # 主页面（整合MetaCity设计）
├── script.js                    # Web3交互逻辑
├── style.css                    # 样式（包含3D地块样式）
├── MetaCity.html               # 原始设计参考
└── METACITY_README.md          # 本文档
```

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 编译智能合约

使用 Remix IDE, Hardhat 或 Truffle 编译 `sol/Marketplace.sol`:

**使用 Remix IDE（推荐新手）:**
1. 访问 https://remix.ethereum.org/
2. 创建新文件 `MetaCityLand.sol`
3. 复制 `sol/Marketplace.sol` 的内容
4. 在 Solidity Compiler 中编译（版本 ^0.8.0）
5. 部署到测试网络（如 Sepolia）

**使用 Hardhat:**
```bash
# 安装 Hardhat
npm install --save-dev hardhat @openzeppelin/contracts

# 初始化 Hardhat 项目
npx hardhat

# 编译合约
npx hardhat compile

# 部署到本地测试网络
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 3. 部署合约

**部署到测试网（Sepolia）:**
1. 获取测试ETH: https://sepoliafaucet.com/
2. 在Remix中选择 "Injected Provider - MetaMask"
3. 点击 "Deploy" 部署合约
4. 复制合约地址

**部署到主网（需要真实ETH）:**
- 仅在充分测试后部署到主网
- 确保合约已经过审计

### 4. 配置前端

编辑 `script.js` 文件，更新合约地址：

```javascript
// 替换为你部署的合约地址
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

### 5. 启动前端

**本地测试:**
```bash
# 使用Python简单HTTP服务器
python -m http.server 8000

# 或使用Node.js http-server
npx http-server -p 8000
```

访问: http://localhost:8000

**生产部署:**
- 部署到 Netlify、Vercel 或 GitHub Pages
- 确保合约地址已正确配置

## 使用说明

### 用户操作流程

1. **连接钱包**
   - 点击"连接钱包"按钮
   - 在MetaMask中确认连接
   - 确保钱包连接到正确的网络

2. **浏览地块**
   - 在"城市地图"查看所有100个地块
   - 绿色：可购买
   - 灰色：已售出
   - 金色：热门地块

3. **购买地块**
   - 点击心仪的地块
   - 查看价格和状态
   - 点击"购买地块"
   - 在MetaMask中确认交易
   - 等待交易确认

4. **管理地块**
   - 在"我的地块"查看拥有的地块
   - 点击地块可以上架出售
   - 设置自定义价格
   - 随时可以下架

### 智能合约功能

**核心功能:**
- `buyPlot(uint256 plotId)` - 购买地块
- `listPlot(uint256 plotId, uint256 price)` - 上架地块
- `delistPlot(uint256 plotId)` - 下架地块

**查询功能:**
- `getPlot(uint256 plotId)` - 获取地块信息
- `getUserPlots(address user)` - 获取用户拥有的地块
- `getPlotsBatch(uint256 startId, uint256 endId)` - 批量获取地块状态

## 合约参数

- **最大地块数量**: 100
- **初始价格**: 100 ETH (可在合约中修改)
- **热门地块**: #3, #7, #15, #22, #30, #45

## 安全说明

1. **合约安全**
   - 使用OpenZeppelin安全库
   - 实现ReentrancyGuard防止重入攻击
   - 所有权检查确保只有拥有者可以操作

2. **前端安全**
   - 输入验证
   - 错误处理
   - 交易确认提示

3. **测试建议**
   - 先在测试网络充分测试
   - 检查所有交易流程
   - 验证价格计算和退款逻辑

## 常见问题

**Q: 如何修改初始价格？**
A: 在合约中修改 `INITIAL_PRICE` 常量，然后重新部署。

**Q: 可以增加地块数量吗？**
A: 可以修改 `MAX_PLOTS` 常量，但需要重新部署合约。

**Q: 支持哪些钱包？**
A: 目前主要支持MetaMask，其他支持Web3的钱包也应该可以使用。

**Q: 交易失败怎么办？**
A: 检查钱包余额、网络连接、Gas费用设置，确保连接到正确的网络。

## 开发路线图

- [x] 基础地块NFT功能
- [x] 3D可视化展示
- [x] 买卖交易功能
- [ ] 地块自定义功能（建筑、装饰等）
- [ ] USDT/USDC支付支持
- [ ] 地块租赁功能
- [ ] 社交功能（评论、点赞）
- [ ] 移动端适配优化

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]

---

**注意**: 这是一个演示项目，请在充分测试后再用于生产环境。智能合约一旦部署不可修改，请谨慎操作。
