// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 引入 OpenZeppelin 标准库
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Marketplace is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // 用于生成 tokenId

    // 修改后的构造函数
    constructor() 
        ERC721("MarketplaceNFT", "MKNFT") 
        Ownable(msg.sender)  // 关键修复：传递初始所有者地址
    {
        // 初始化代码（若有）
    }

    // 商品信息结构体
    struct Product {
        string name;         // 商品名称
        string metadataUri;  // 存储商品图片、详情等信息的 IPFS 地址
        string brand;        // 品牌（可选）
        string model;        // 型号（可选）
        string serial;       // 序列号（可选）
        string description;  // 详细描述（可选）
    }

    // tokenId 对应的产品信息
    mapping(uint256 => Product) public products;
    // tokenId 对应的上架价格，价格大于 0 表示该商品处于上架状态
    mapping(uint256 => uint256) public productPrices;

    // 事件定义
    event ProductMinted(uint256 indexed tokenId, address owner);
    event ProductListed(uint256 indexed tokenId, uint256 price);
    event ProductDelisted(uint256 indexed tokenId);
    // 修改 ProductSold 事件定义，增加 seller 参数
    event ProductSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);


    /**
     * @dev 用户调用该函数上链商品，同时铸造一个新的 NFT。
     * @param _name 商品名称
     * @param _metadataUri IPFS 地址，用于存储图片或其他元数据
     * @param _brand 品牌信息（可为空）
     * @param _model 型号（可为空）
     * @param _serial 序列号（可为空）
     * @param _description 商品描述（可为空）
     */
    function mintProduct(
      string memory _name,
      string memory _metadataUri,
      string memory _brand,
      string memory _model,
      string memory _serial,
      string memory _description
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);

        products[newTokenId] = Product({
            name: _name,
            metadataUri: _metadataUri,
            brand: _brand,
            model: _model,
            serial: _serial,
            description: _description
        });

        emit ProductMinted(newTokenId, msg.sender);
        return newTokenId;
    }

    /**
     * @dev 商品上架，将商品挂单出售。
     * @param tokenId NFT 的 tokenId
     * @param price 出售价格（单位为 wei，必须大于 0）
     */
    function listProduct(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, unicode"只有商品拥有者才能上架");
        require(price > 0, unicode"价格必须大于零");
        productPrices[tokenId] = price;
        emit ProductListed(tokenId, price);
    }

    /**
     * @dev 商品下架。
     * @param tokenId NFT 的 tokenId
     */
    function delistProduct(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, unicode"只有商品拥有者才能下架");
        require(productPrices[tokenId] > 0, unicode"该商品未上架");
        productPrices[tokenId] = 0;
        emit ProductDelisted(tokenId);
    }

    /**
     * @dev 购买商品，调用该函数需要支付足够的金额，且该商品必须处于上架状态。
     * @param tokenId NFT 的 tokenId
     */
    function buyProduct(uint256 tokenId) public payable nonReentrant {
        uint256 price = productPrices[tokenId];
        address seller = ownerOf(tokenId);
        require(price > 0, unicode"该商品未上架");
        require(msg.value >= price, unicode"支付金额不足");
        require(seller != msg.sender, unicode"不能购买自己的商品");

        // 清除上架状态
        productPrices[tokenId] = 0;

        // 转移 NFT 所有权
        _transfer(seller, msg.sender, tokenId);

        // 将款项转给卖家
        payable(seller).transfer(price);

        // 如果多余金额退还给买家
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit ProductSold(tokenId, seller, msg.sender, price); // 增加 seller 参数
    }

    // 添加totalSupply方法
    function totalSupply() public view override returns (uint256) {
        return _tokenIds.current();
    }
}