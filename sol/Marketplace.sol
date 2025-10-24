// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 引入 OpenZeppelin 标准库
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title MetaCityLand
 * @dev MetaCity 地皮NFT智能合约 - 100个地块的买卖市场
 */
contract MetaCityLand is ERC721Enumerable, Ownable, ReentrancyGuard {
    // 常量定义
    uint256 public constant MAX_PLOTS = 100; // 最大地块数量
    uint256 public constant INITIAL_PRICE = 100 ether; // 初始价格 100 ETH（可改为USDT）
    
    // 地块信息结构体
    struct Plot {
        uint256 plotId;      // 地块编号 (1-100)
        uint256 price;       // 当前价格（0表示未上架）
        bool isHot;          // 是否为热门地块
        uint256 views;       // 浏览次数
        string customData;   // 自定义数据（用于未来扩展，如建筑信息）
    }
    
    // 存储地块信息
    mapping(uint256 => Plot) public plots;
    
    // 地块是否已铸造
    mapping(uint256 => bool) public plotMinted;
    
    // 用户购买历史
    mapping(address => uint256[]) public userPurchases;
    
    // 事件定义
    event PlotMinted(uint256 indexed plotId, address indexed owner, uint256 price);
    event PlotListed(uint256 indexed plotId, uint256 price);
    event PlotDelisted(uint256 indexed plotId);
    event PlotSold(uint256 indexed plotId, address indexed seller, address indexed buyer, uint256 price);
    event PlotViewed(uint256 indexed plotId, uint256 views);
    event PlotCustomized(uint256 indexed plotId, string customData);

    constructor() 
        ERC721("MetaCityLand", "MCLAND") 
        Ownable(msg.sender)
    {
        // 初始化热门地块（ID: 3, 7, 15, 22, 30, 45）
        _initializeHotPlots();
    }
    
    /**
     * @dev 初始化热门地块
     */
    function _initializeHotPlots() private {
        uint256[6] memory hotPlotIds = [uint256(3), 7, 15, 22, 30, 45];
        for (uint256 i = 0; i < hotPlotIds.length; i++) {
            plots[hotPlotIds[i]].isHot = true;
        }
    }

    /**
     * @dev 购买地块（首次购买会自动铸造NFT）
     * @param plotId 地块编号 (1-100)
     */
    function buyPlot(uint256 plotId) public payable nonReentrant {
        require(plotId >= 1 && plotId <= MAX_PLOTS, unicode"地块编号必须在1-100之间");
        
        if (!plotMinted[plotId]) {
            // 首次购买，铸造新NFT
            require(msg.value >= INITIAL_PRICE, unicode"支付金额不足");
            _mintPlot(plotId, msg.sender);
            
            // 退还多余金额
            if (msg.value > INITIAL_PRICE) {
                payable(msg.sender).transfer(msg.value - INITIAL_PRICE);
            }
        } else {
            // 二手交易
            uint256 price = plots[plotId].price;
            address seller = ownerOf(plotId);
            
            require(price > 0, unicode"该地块未上架出售");
            require(msg.value >= price, unicode"支付金额不足");
            require(seller != msg.sender, unicode"不能购买自己的地块");

            // 清除上架状态
            plots[plotId].price = 0;

            // 转移 NFT 所有权
            _transfer(seller, msg.sender, plotId);

            // 将款项转给卖家
            payable(seller).transfer(price);

            // 退还多余金额
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
            
            // 记录购买历史
            userPurchases[msg.sender].push(plotId);
            
            emit PlotSold(plotId, seller, msg.sender, price);
        }
    }
    
    /**
     * @dev 铸造地块NFT（内部函数）
     */
    function _mintPlot(uint256 plotId, address to) private {
        _mint(to, plotId);
        plotMinted[plotId] = true;
        
        plots[plotId] = Plot({
            plotId: plotId,
            price: 0,
            isHot: plots[plotId].isHot, // 保留热门标记
            views: 0,
            customData: ""
        });
        
        userPurchases[to].push(plotId);
        emit PlotMinted(plotId, to, INITIAL_PRICE);
    }

    /**
     * @dev 上架地块出售
     * @param plotId 地块编号
     * @param price 出售价格（单位为 wei）
     */
    function listPlot(uint256 plotId, uint256 price) public {
        require(plotMinted[plotId], unicode"该地块尚未铸造");
        require(ownerOf(plotId) == msg.sender, unicode"只有地块拥有者才能上架");
        require(price > 0, unicode"价格必须大于零");
        
        plots[plotId].price = price;
        emit PlotListed(plotId, price);
    }

    /**
     * @dev 下架地块
     * @param plotId 地块编号
     */
    function delistPlot(uint256 plotId) public {
        require(plotMinted[plotId], unicode"该地块尚未铸造");
        require(ownerOf(plotId) == msg.sender, unicode"只有地块拥有者才能下架");
        require(plots[plotId].price > 0, unicode"该地块未上架");
        
        plots[plotId].price = 0;
        emit PlotDelisted(plotId);
    }
    
    /**
     * @dev 增加地块浏览次数
     * @param plotId 地块编号
     */
    function viewPlot(uint256 plotId) public {
        require(plotId >= 1 && plotId <= MAX_PLOTS, unicode"地块编号无效");
        plots[plotId].views++;
        emit PlotViewed(plotId, plots[plotId].views);
    }
    
    /**
     * @dev 自定义地块数据（如建筑信息）
     * @param plotId 地块编号
     * @param customData 自定义数据
     */
    function customizePlot(uint256 plotId, string memory customData) public {
        require(plotMinted[plotId], unicode"该地块尚未铸造");
        require(ownerOf(plotId) == msg.sender, unicode"只有地块拥有者才能自定义");
        
        plots[plotId].customData = customData;
        emit PlotCustomized(plotId, customData);
    }
    
    /**
     * @dev 获取地块信息
     * @param plotId 地块编号
     */
    function getPlot(uint256 plotId) public view returns (Plot memory) {
        require(plotId >= 1 && plotId <= MAX_PLOTS, unicode"地块编号无效");
        return plots[plotId];
    }
    
    /**
     * @dev 获取所有已售地块
     */
    function getSoldPlots() public view returns (uint256[] memory) {
        uint256 soldCount = 0;
        for (uint256 i = 1; i <= MAX_PLOTS; i++) {
            if (plotMinted[i]) {
                soldCount++;
            }
        }
        
        uint256[] memory soldPlots = new uint256[](soldCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= MAX_PLOTS; i++) {
            if (plotMinted[i]) {
                soldPlots[index] = i;
                index++;
            }
        }
        
        return soldPlots;
    }
    
    /**
     * @dev 获取用户拥有的地块
     * @param user 用户地址
     */
    function getUserPlots(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory userPlots = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            userPlots[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return userPlots;
    }
    
    /**
     * @dev 获取用户购买历史
     * @param user 用户地址
     */
    function getUserPurchaseHistory(address user) public view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @dev 批量获取地块状态（用于前端展示）
     * @param startId 起始地块ID
     * @param endId 结束地块ID
     */
    function getPlotsBatch(uint256 startId, uint256 endId) public view returns (
        uint256[] memory plotIds,
        bool[] memory minted,
        uint256[] memory prices,
        bool[] memory isHot
    ) {
        require(startId >= 1 && startId <= MAX_PLOTS, unicode"起始ID无效");
        require(endId >= startId && endId <= MAX_PLOTS, unicode"结束ID无效");
        
        uint256 count = endId - startId + 1;
        plotIds = new uint256[](count);
        minted = new bool[](count);
        prices = new uint256[](count);
        isHot = new bool[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 plotId = startId + i;
            plotIds[i] = plotId;
            minted[i] = plotMinted[plotId];
            prices[i] = plotMinted[plotId] ? plots[plotId].price : INITIAL_PRICE;
            isHot[i] = plots[plotId].isHot;
        }
        
        return (plotIds, minted, prices, isHot);
    }
}