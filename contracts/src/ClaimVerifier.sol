// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "trustus/Trustus.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./ClaimManager.sol";

/// @title Claim
/// @author nutcloud🧙‍♂️.eth
/// @notice Verifier contract for claiming rewards based on off-chain events using zefram.eth's Trustus
contract ClaimVerifier is Trustus, Ownable {
	///-------------------------------------------------------
	///	Storage
	///-------------------------------------------------------

	/// @notice Records whether a contract is a valid claimManager
	mapping(ClaimManager => bool) public isClaimManager;
	
	///-------------------------------------------------------
	///	Events
	///-------------------------------------------------------

	/// @notice Emitted everytime a contract is added or removed as a valid claim manager
	event UpdatedClaimManager(address indexed claimManager, bool isClaimManager);

	/// @notice Emitted everytime an address is added or removed as a trusted signer
	event UpdatedTrustedSigner(address indexed signer, bool isTrusted);

	/// @notice Emitted everytime an address claims
	event Claimed(address indexed claimer, address indexed claimManager);

	///-------------------------------------------------------
	///	Constructor
	///-------------------------------------------------------
	constructor() Ownable() {}
	
	///-------------------------------------------------------
	///	Claim manager addition/removal logic
	///-------------------------------------------------------

	/// @notice Add or remove a contract as a valid claim manager
	/// @dev Set isClaimManager_ true to add, false to remove
	/// @param claimManager Address of the claim manager to contract to add/remove
	/// @param isClaimManager_ Flag to add or remove the contract given as a claim manager
	function setClaimManager(ClaimManager claimManager, bool isClaimManager_) external onlyOwner {
		require(address(claimManager) != address(0), "ClaimVerifier: zero address");

		isClaimManager[claimManager] = isClaimManager_;

		emit UpdatedClaimManager(address(claimManager), isClaimManager_);
	}

	///-------------------------------------------------------
	///	Claim manager addition/removal logic
	///-------------------------------------------------------


	/// @notice Add or remove an address as a trusted signer
	/// @dev set isTrusted to true to add, false to remove
	/// @param signer The address to add/remove as a trusted signer
	/// @param isTrusted The flag to add or remove the address
	function setIsTrusted(address signer, bool isTrusted) external onlyOwner {
		_setIsTrusted(signer, isTrusted);

		emit UpdatedTrustedSigner(signer, isTrusted);
	}
	
	///-------------------------------------------------------
	///	Claim logic
	///-------------------------------------------------------

	/// @notice Public function to claim
	/// @param request The identifier for the requested payload. this can be the claim manager address
	/// @param packet The packet containing the claim manager address and the address of the claimer provided by the off-chain server
	function claim(bytes32 request, TrustusPacket calldata packet) external verifyPacket(request, packet) {
		(address _owner, address _claimManager) = abi.decode(packet.payload, (address, address));
		require(_owner == msg.sender, "ClaimManager: not your packet");
		
		ClaimManager claimManager = ClaimManager(_claimManager);
		require(isClaimManager[claimManager], "ClaimManager: invalid claim manager address");

		claimManager.claim(_owner);

		emit Claimed(_owner, _claimManager);
	}
}
