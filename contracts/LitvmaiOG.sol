// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// litvmai OG badge. 4000 content rewards, 1000 paid mints, one per wallet.
contract LitvmaiOG is ERC721, Ownable {
    uint256 public constant CONTENT_SUPPLY = 4000;
    uint256 public constant SALE_SUPPLY = 1000;
    uint256 public contentMinted;
    uint256 public saleMinted;
    uint256 public price;
    string private baseTokenUri;
    mapping(address => bool) public claimed;

    constructor(uint256 initialPrice, string memory baseUri) ERC721("litvmai OG", "LVAI-OG") Ownable(msg.sender) {
        price = initialPrice;
        baseTokenUri = baseUri;
    }

    function totalSupply() public view returns (uint256) {
        return contentMinted + saleMinted;
    }

    function mint() external payable {
        require(msg.value == price, "wrong price");
        require(saleMinted < SALE_SUPPLY, "sale sold out");
        require(!claimed[msg.sender], "already claimed");
        claimed[msg.sender] = true;
        saleMinted += 1;
        _safeMint(msg.sender, 4000 + saleMinted);
    }

    function mintContent(address to) external onlyOwner {
        require(contentMinted < CONTENT_SUPPLY, "content sold out");
        require(!claimed[to], "already claimed");
        claimed[to] = true;
        contentMinted += 1;
        _safeMint(to, contentMinted);
    }

    function setPrice(uint256 nextPrice) external onlyOwner {
        price = nextPrice;
    }

    function setBaseUri(string calldata nextUri) external onlyOwner {
        baseTokenUri = nextUri;
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenUri;
    }
}
