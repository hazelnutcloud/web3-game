// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "trustus/Trustus.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./ClaimManager.sol";

/// @title Claim
/// @author nutcloud
/// @notice verifier contract for claiming rewards based on off-chain events using zefram.eth's Trustus
contract ClaimVerifier is Trustus, Ownable {
	///-------------------------------------------------------
	///	Storage
	///-------------------------------------------------------
	mapping(ClaimManager => bool) public isClaimManager;
	
	///-------------------------------------------------------
	///	Events
	///-------------------------------------------------------
	event UpdatedClaimManager(address indexed claimManager, bool isClaimManager);

	event UpdatedTrustedSigner(address indexed signer, bool isTrusted);

	event Claimed(address indexed claimer, address indexed claimManager);

	///-------------------------------------------------------
	///	Constructor
	///-------------------------------------------------------
	constructor() {}
	
	///-------------------------------------------------------
	///	Claim manager addition/removal logic
	///-------------------------------------------------------
	function setClaimManager(ClaimManager claimManager, bool isClaimManager_) external onlyOwner {
		require(address(claimManager) != address(0), "ClaimVerifier: zero address");

		isClaimManager[claimManager] = isClaimManager_;

		emit UpdatedClaimManager(address(claimManager), isClaimManager_);
	}

	///-------------------------------------------------------
	///	Claim manager addition/removal logic
	///-------------------------------------------------------
	function setIsTrusted(address signer, bool isTrusted) external onlyOwner {
		_setIsTrusted(signer, isTrusted);

		emit UpdatedTrustedSigner(signer, isTrusted);
	}
	
	///-------------------------------------------------------
	///	Claim logic
	///-------------------------------------------------------
	function claim(bytes32 request, TrustusPacket calldata packet) external verifyPacket(request, packet) {
		(address _owner, address _claimManager) = abi.decode(packet.payload, (address, address));
		require(_owner == msg.sender, "ClaimManager: not your packet");
		
		ClaimManager claimManager = ClaimManager(_claimManager);
		require(isClaimManager[claimManager], "ClaimManager: invalid claim manager address");

		claimManager.claim(_owner);

		emit Claimed(_owner, _claimManager);
	}
}
