// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

///@title ClaimManager
///@author nutcloud🧙‍♂️.eth
///@notice Claim manager abstract contract to handle reward claiming logic
abstract contract ClaimManager {
    ///-------------------------------------------------------
    ///	Storage variables
    ///-------------------------------------------------------

    /// @notice The address of the claim verifier contract
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

    /// @notice Verifies if the caller is the claim verifier contract
    /// @param claimer Address of the claimer
    function claim(address claimer) external {
        require(msg.sender == claimVerifier, "ClaimManager: sender not claim verifier");
        _claim(claimer);
    }

    ///-------------------------------------------------------
    ///	Internal claim logic
    ///-------------------------------------------------------

    /// @notice This contains all the logic for distributing rewards to the claimer
    /// @param claimer Address of the claimer
    function _claim(address claimer) internal virtual;
}