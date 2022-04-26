// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "forge-std/Test.sol";
import "../ClaimVerifier.sol";
import "../ClaimManagerERC721.sol";

contract ContractTest is Test {
    ClaimVerifier verifier;
    ClaimManagerERC721 manager;

    function setUp() public {
        verifier = new ClaimVerifier();
        manager = new ClaimManagerERC721(
            "Coin",
            "COIN",
            "example.xyz",
            address(verifier)
        );

        address trusted = vm.addr(
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );
        emit log_named_address("trusted address", trusted);

        verifier.setIsTrusted(trusted, true);
        verifier.setIsClaimManager(manager, true);
    }

    function getDigest() public view returns (bytes32) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                verifier.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "VerifyPacket(address request,uint256 deadline,address receiver)"
                        ),
                        address(manager),
                        (2 ^ 256) - 1,
                        address(this)
                    )
                )
            )
        );
        return digest;
    }

    function testClaim() public {
        bytes32 digest = getDigest();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            ),
            digest
        );

        verifier.claim(
            address(manager),
            Trustus.TrustusPacket({
                v: v,
                r: r,
                s: s,
                request: address(manager),
                deadline: (2 ^ 256) - 1,
                receiver: address(this)
            })
        );

        uint256 balance = manager.balanceOf(address(this));
        assertTrue(balance == 1);
    }

    function testClaimTwice() public {
        bytes32 digest = getDigest();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            ),
            digest
        );

        verifier.claim(
            address(manager),
            Trustus.TrustusPacket({
                v: v,
                r: r,
                s: s,
                request: address(manager),
                deadline: (2 ^ 256) - 1,
                receiver: address(this)
            })
        );

        vm.expectRevert(bytes("ClaimManagerMock: already claimed"));
        verifier.claim(
            address(manager),
            Trustus.TrustusPacket({
                v: v,
                r: r,
                s: s,
                request: address(manager),
                deadline: (2 ^ 256) - 1,
                receiver: address(this)
            })
        );
    }

    function testUntrustedSigner(uint256 privatekey) public {
        vm.assume(privatekey != 0);
        vm.assume(privatekey < (2 ^ 256) - 1);
        vm.assume(
            privatekey !=
                uint256(
                    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                )
        );

        bytes32 digest = getDigest();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privatekey, digest);

        vm.expectRevert(bytes4(keccak256("Trustus__InvalidPacket()")));
        verifier.claim(
            address(manager),
            Trustus.TrustusPacket({
                v: v,
                r: r,
                s: s,
                request: address(manager),
                deadline: (2 ^ 256) - 1,
                receiver: address(this)
            })
        );
    }
}
