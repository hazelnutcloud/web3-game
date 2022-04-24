// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

///@title ClaimManager
///@author nutcloud
///@notice claim manager contract to handle claiming logic
abstract contract ClaimManager {
    ///-------------------------------------------------------
    ///	Storage variables
    ///-------------------------------------------------------
    address public immutable claimVerifier;

    ///-------------------------------------------------------
    ///	Constructor
    ///-------------------------------------------------------
    constructor (address _claimVerifier) {
        claimVerifier = _claimVerifier;
    }

    ///-------------------------------------------------------
    ///	Claim authority logic
    ///-------------------------------------------------------
    function claim(address claimer) external {
        require(msg.sender == claimVerifier, "ClaimManager: sender not claim verifier");
        _claim(claimer);
    }

    ///-------------------------------------------------------
    ///	Internal claim logic
    ///-------------------------------------------------------
    function _claim(address claimer) internal virtual;
}