// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MyToken is ERC721, ERC721Burnable, ERC2981, Ownable, ReentrancyGuard {

    uint256 private _nextTokenId;
    uint256 public Token_Price;
    uint256 public constant MAX_SUPPLY = 9;

    bool public paused;

    mapping(address => uint256) public minted;

    constructor(address initialOwner)
        ERC721("MyToken", "MTK")
        Ownable(initialOwner)
    {
        _setDefaultRoyalty(initialOwner, 500); // 5% royalty
    }

    modifier WhenNotPaused {
        require(!paused, "mint paused");
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/QmYhgnEAQDEtbrTdqnZxCnS1xUcL7YNrmrjNeCPShJngnv/";
    }

    function OwnerMint(address to)
        public
        onlyOwner
        WhenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        return tokenId;
    }

    function Mint()
        public
        payable
        WhenNotPaused
        nonReentrant
    {
        require(minted[msg.sender] < 2, "Exceed the limits");
        require(msg.value == Token_Price, "insufficient token price");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");

        minted[msg.sender]++;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        if (tokenId == 0) {
        _setTokenRoyalty(tokenId, owner(), 1000); // 10%
    }
    }

    function withdraw(uint256 _amount)
        public
        onlyOwner
        nonReentrant
    {
        require(address(this).balance >= _amount, "insufficient Funds");

        (bool success,) = payable(msg.sender).call{value: _amount}("");
        require(success, "transfer failed");
    }

    function changeTokenPrice(uint256 _price) public onlyOwner {
        Token_Price = _price;
    }

    function setPause(bool _pause) external onlyOwner {
        paused = _pause;
    }

    function ChangeRoyalty(uint96 _fee) external onlyOwner {
    require(_fee > 0 && _fee <= 10000, "Royalty too high");
    _setDefaultRoyalty(owner(), _fee);
    }

    // 🔥 REQUIRED FOR ROYALTIES
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}