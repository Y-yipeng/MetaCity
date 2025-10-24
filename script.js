// script.js - MetaCity Land NFT Marketplace
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.12.0/+esm";

// 全局变量
let walletAddress = null;
let provider, signer;
let landContract;

// 合约地址 - 部署后需要更新
const CONTRACT_ADDRESS = "0x74a9eB094AD19459010d840EB5c4813fefbb1090";

// 合约 ABI（根据智能合约生成完整ABI）
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			}
		],
		"name": "buyPlot",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "customData",
				"type": "string"
			}
		],
		"name": "customizePlot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			}
		],
		"name": "delistPlot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ERC721EnumerableForbiddenBatchMint",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "ERC721OutOfBoundsIndex",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "listPlot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "customData",
				"type": "string"
			}
		],
		"name": "PlotCustomized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			}
		],
		"name": "PlotDelisted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "PlotListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "PlotMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "PlotSold",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "views",
				"type": "uint256"
			}
		],
		"name": "PlotViewed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			}
		],
		"name": "viewPlot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			}
		],
		"name": "getPlot",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "plotId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isHot",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "views",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "customData",
						"type": "string"
					}
				],
				"internalType": "struct MetaCityLand.Plot",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "startId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endId",
				"type": "uint256"
			}
		],
		"name": "getPlotsBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "plotIds",
				"type": "uint256[]"
			},
			{
				"internalType": "bool[]",
				"name": "minted",
				"type": "bool[]"
			},
			{
				"internalType": "uint256[]",
				"name": "prices",
				"type": "uint256[]"
			},
			{
				"internalType": "bool[]",
				"name": "isHot",
				"type": "bool[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getSoldPlots",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserPlots",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserPurchaseHistory",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INITIAL_PRICE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_PLOTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "plotMinted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "plots",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "plotId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isHot",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "views",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "customData",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenByIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenOfOwnerByIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userPurchases",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// 热门地块ID
const HOT_PLOT_IDS = [3, 7, 15, 22, 30, 45];

// ============= 初始化 =============
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  // 绑定钱包按钮事件
  document.getElementById('loginBtn').addEventListener('click', connectWallet);
  document.getElementById('logoutBtn').addEventListener('click', disconnectWallet);
  
  // 渲染地块（不需要连接钱包也能查看）
  await renderAllPlots();
  
  // 检查是否已连接钱包
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      await connectWallet();
    }
  }
}

// ============= 钱包连接 =============
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert('请安装 MetaMask 钱包！');
      return;
    }

    // 请求连接钱包
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];

    // 初始化 provider 和 signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    // 初始化合约
    landContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // 更新 UI
    updateWalletUI();
    
    // 加载用户地块
    await renderMyPlots();

    console.log('钱包已连接:', walletAddress);
  } catch (error) {
    console.error('连接钱包失败:', error);
    alert('连接钱包失败: ' + error.message);
  }
}

function disconnectWallet() {
  walletAddress = null;
  provider = null;
  signer = null;
  landContract = null;
  
  updateWalletUI();
  document.getElementById('my-plots-list').innerHTML = '';
  document.getElementById('loginNotice').textContent = '请先连接钱包查看你拥有的地块';
  
  console.log('钱包已断开');
}

function updateWalletUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const walletAddressSpan = document.getElementById('walletAddress');
  
  if (walletAddress) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    walletAddressSpan.classList.remove('hidden');
    walletAddressSpan.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    walletAddressSpan.classList.add('hidden');
  }
}

// ============= 地块渲染 =============
async function renderAllPlots() {
  const cityMap = document.getElementById('city-map');
  const hotPlotsContainer = document.getElementById('hot-plots');
  
  cityMap.innerHTML = '<p class="text-gray-400">加载中...</p>';
  hotPlotsContainer.innerHTML = '<p class="text-gray-400">加载中...</p>';
  
  try {
    // 渲染所有100个地块
    cityMap.innerHTML = '';
    for (let i = 1; i <= 100; i++) {
      const plotElement = await createPlotElement(i);
      cityMap.appendChild(plotElement);
    }
    
    // 渲染热门地块
    hotPlotsContainer.innerHTML = '';
    for (const id of HOT_PLOT_IDS) {
      const plotElement = await createPlotElement(id);
      hotPlotsContainer.appendChild(plotElement);
    }
  } catch (error) {
    console.error('渲染地块失败:', error);
    cityMap.innerHTML = '<p class="text-red-400">加载失败，请确保已部署合约</p>';
    hotPlotsContainer.innerHTML = '<p class="text-red-400">加载失败</p>';
  }
}

async function createPlotElement(id) {
  let status = 'available';
  let isMinted = false;
  
  // 如果合约已连接，查询真实状态
  if (landContract) {
    try {
      isMinted = await landContract.plotMinted(id);
      if (isMinted) {
        status = 'sold';
      } else if (HOT_PLOT_IDS.includes(id)) {
        status = 'hot';
      }
    } catch (error) {
      // 如果查询失败，使用默认状态
      if (HOT_PLOT_IDS.includes(id)) {
        status = 'hot';
      }
    }
  } else {
    // 未连接合约，使用默认状态
    if (HOT_PLOT_IDS.includes(id)) {
      status = 'hot';
    }
  }
  
  const container = document.createElement('div');
  container.className = `block-container status-${status}`;
  
  const block = document.createElement('div');
  block.className = 'block';
  
  // 创建3D立方体的六个面
  const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  faces.forEach(faceName => {
    const face = document.createElement('div');
    face.className = `face ${faceName}`;
    face.textContent = id;
    block.appendChild(face);
  });
  
  container.appendChild(block);
  container.onclick = () => openPlotModal(id);
  
  return container;
}

async function renderMyPlots() {
  const myPlotsList = document.getElementById('my-plots-list');
  const loginNotice = document.getElementById('loginNotice');
  
  if (!walletAddress || !landContract) {
    myPlotsList.innerHTML = '';
    loginNotice.textContent = '请先连接钱包查看你拥有的地块';
    return;
  }
  
  try {
    myPlotsList.innerHTML = '<p class="text-gray-400">加载中...</p>';
    
    const userPlots = await landContract.getUserPlots(walletAddress);
    
    if (userPlots.length === 0) {
      myPlotsList.innerHTML = '<p class="text-gray-400">你还没有拥有任何地块</p>';
      loginNotice.textContent = '你还没有拥有任何地块，去城市地图购买吧！';
    } else {
      myPlotsList.innerHTML = '';
      loginNotice.textContent = `你拥有 ${userPlots.length} 个地块`;
      
      for (const plotId of userPlots) {
        const plotElement = await createPlotElement(Number(plotId));
        myPlotsList.appendChild(plotElement);
      }
    }
  } catch (error) {
    console.error('加载用户地块失败:', error);
    myPlotsList.innerHTML = '<p class="text-red-400">加载失败</p>';
  }
}

// ============= 弹窗逻辑 =============
async function openPlotModal(plotId) {
  const modal = document.getElementById('plot-modal');
  const plotIdElement = document.getElementById('plot-id');
  const plotStatus = document.getElementById('plot-status');
  const plotOwner = document.getElementById('plot-owner');
  const plotPrice = document.getElementById('plot-price');
  const buyBtn = document.getElementById('buy-btn');
  const listBtn = document.getElementById('list-btn');
  const delistBtn = document.getElementById('delist-btn');
  const listPriceInput = document.getElementById('list-price-input');
  
  // 重置按钮状态
  buyBtn.classList.add('hidden');
  listBtn.classList.add('hidden');
  delistBtn.classList.add('hidden');
  listPriceInput.classList.add('hidden');
  
  plotIdElement.textContent = `地块 #${plotId}`;
  
  try {
    if (!landContract) {
      // 未连接合约，显示基本信息
      plotStatus.textContent = '状态：请连接钱包查看详情';
      plotOwner.textContent = '';
      plotPrice.textContent = '初始价格：100 ETH';
      modal.classList.remove('hidden');
      
      buyBtn.classList.remove('hidden');
      buyBtn.onclick = () => {
        alert('请先连接钱包');
        closeModal();
      };
      return;
    }
    
    const isMinted = await landContract.plotMinted(plotId);
    
    if (!isMinted) {
      // 未售出
      plotStatus.textContent = '状态：可购买';
      plotOwner.textContent = '';
      const initialPrice = await landContract.INITIAL_PRICE();
      plotPrice.textContent = `价格：${ethers.formatEther(initialPrice)} ETH`;
      
      buyBtn.classList.remove('hidden');
      buyBtn.onclick = () => buyPlot(plotId, initialPrice);
    } else {
      // 已售出
      const owner = await landContract.ownerOf(plotId);
      const plotData = await landContract.plots(plotId);
      const price = plotData[1]; // price is the second element
      const isListed = price > 0;
      
      plotOwner.textContent = `所有者：${owner.slice(0, 6)}...${owner.slice(-4)}`;
      
      if (isListed) {
        plotStatus.textContent = '状态：在售';
        plotPrice.textContent = `价格：${ethers.formatEther(price)} ETH`;
        
        // 如果是自己的地块，显示下架按钮
        if (walletAddress && owner.toLowerCase() === walletAddress.toLowerCase()) {
          delistBtn.classList.remove('hidden');
          delistBtn.onclick = () => delistPlot(plotId);
        } else {
          buyBtn.classList.remove('hidden');
          buyBtn.onclick = () => buyPlot(plotId, price);
        }
      } else {
        plotStatus.textContent = '状态：已售（未上架）';
        plotPrice.textContent = '';
        
        // 如果是自己的地块，显示上架按钮
        if (walletAddress && owner.toLowerCase() === walletAddress.toLowerCase()) {
          listBtn.classList.remove('hidden');
          listBtn.onclick = () => {
            listPriceInput.classList.remove('hidden');
            listBtn.classList.add('hidden');
          };
          
          document.getElementById('confirm-list-btn').onclick = () => {
            const priceInput = document.getElementById('list-price');
            const priceEth = priceInput.value;
            if (priceEth && parseFloat(priceEth) > 0) {
              listPlot(plotId, ethers.parseEther(priceEth));
            } else {
              alert('请输入有效的价格');
            }
          };
        }
      }
    }
    
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('获取地块信息失败:', error);
    alert('获取地块信息失败: ' + error.message);
  }
}

window.closeModal = function() {
  document.getElementById('plot-modal').classList.add('hidden');
}

// ============= 交易函数 =============
async function buyPlot(plotId, price) {
  if (!landContract || !walletAddress) {
    alert('请先连接钱包');
    return;
  }
  
  try {
    console.log(`购买地块 #${plotId}，价格：${ethers.formatEther(price)} ETH`);
    
    const tx = await landContract.buyPlot(plotId, { value: price });
    alert('交易已提交，等待确认...');
    console.log('交易哈希:', tx.hash);
    
    await tx.wait();
    alert('购买成功！');
    closeModal();
    
    // 刷新界面
    await renderAllPlots();
    await renderMyPlots();
  } catch (error) {
    console.error('购买失败:', error);
    alert('购买失败: ' + (error.reason || error.message));
  }
}

async function listPlot(plotId, price) {
  if (!landContract || !walletAddress) {
    alert('请先连接钱包');
    return;
  }
  
  try {
    console.log(`上架地块 #${plotId}，价格：${ethers.formatEther(price)} ETH`);
    
    const tx = await landContract.listPlot(plotId, price);
    alert('交易已提交，等待确认...');
    console.log('交易哈希:', tx.hash);
    
    await tx.wait();
    alert('上架成功！');
    closeModal();
    
    // 刷新界面
    await renderAllPlots();
    await renderMyPlots();
  } catch (error) {
    console.error('上架失败:', error);
    alert('上架失败: ' + (error.reason || error.message));
  }
}

async function delistPlot(plotId) {
  if (!landContract || !walletAddress) {
    alert('请先连接钱包');
    return;
  }
  
  try {
    console.log(`下架地块 #${plotId}`);
    
    const tx = await landContract.delistPlot(plotId);
    alert('交易已提交，等待确认...');
    console.log('交易哈希:', tx.hash);
    
    await tx.wait();
    alert('下架成功！');
    closeModal();
    
    // 刷新界面
    await renderAllPlots();
    await renderMyPlots();
  } catch (error) {
    console.error('下架失败:', error);
    alert('下架失败: ' + (error.reason || error.message));
  }
}

// ============= 监听账户变化 =============
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      location.reload();
    }
  });
  
  window.ethereum.on('chainChanged', () => {
    location.reload();
  });
}
