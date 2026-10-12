// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// litvmai OG badge. 4000 content rewards, 1000 paid mints, one per wallet.
/// Standalone so Remix compiles it on 0.8.20 without OpenZeppelin.
contract LitvmaiOG {
    string public constant name = "litvmai OG";
    string public constant symbol = "LVAI-OG";
    uint256 public constant CONTENT_SUPPLY = 4000;
    uint256 public constant SALE_SUPPLY = 1000;

    address public owner;
    uint256 public contentMinted;
    uint256 public saleMinted;
    uint256 public price;
    string public baseTokenUri;

    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;
    mapping(address => bool) public claimed;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(uint256 initialPrice, string memory baseUri) {
        owner = msg.sender;
        price = initialPrice;
        baseTokenUri = baseUri;
    }

    function totalSupply() public view returns (uint256) {
        return contentMinted + saleMinted;
    }

    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "zero address");
        return balances[account];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = owners[tokenId];
        require(tokenOwner != address(0), "missing token");
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(owners[tokenId] != address(0), "missing token");
        return baseTokenUri;
    }

    function mint() external payable {
        require(msg.value == price, "wrong price");
        require(saleMinted < SALE_SUPPLY, "sale sold out");
        require(!claimed[msg.sender], "already claimed");
        claimed[msg.sender] = true;
        saleMinted += 1;
        _mint(msg.sender, 4000 + saleMinted);
    }

    function mintContent(address to) external onlyOwner {
        require(to != address(0), "zero address");
        require(contentMinted < CONTENT_SUPPLY, "content sold out");
        require(!claimed[to], "already claimed");
        claimed[to] = true;
        contentMinted += 1;
        _mint(to, contentMinted);
    }

    function setPrice(uint256 nextPrice) external onlyOwner {
        price = nextPrice;
    }

    function setBaseUri(string calldata nextUri) external onlyOwner {
        baseTokenUri = nextUri;
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    function _mint(address to, uint256 tokenId) internal {
        owners[tokenId] = to;
        balances[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }
}
