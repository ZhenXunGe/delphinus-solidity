// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Transaction.sol";

contract Withdraw is Transaction {
    function bytesToUint(bytes memory bs, uint256 start, uint256 len)
        internal
        pure
        returns (uint256)
    {
        require(bs.length >= start + 32, "slicing out of range");
        uint256 x;
        assembly {
            x := mload(add(bs, add(start, 0x20)))
        }
        return x >> (32 - len) * 8;
    }

    function sideEffect(bytes memory witness, uint256 cursor)
        public
        pure
        override
        returns (uint256[] memory)
    {
        uint256[] memory ops = new uint256[](4);
        uint256 tokenIdx = bytesToUint(witness, cursor + 12, 4);
        uint256 transferAmount = bytesToUint(witness, cursor + 16, 32);
        uint256 l1recipent = bytesToUint(witness, cursor + 48, 32);

        ops[0] = _WITHDRAW;
        ops[1] = tokenIdx;
        ops[2] = transferAmount;
        ops[3] = l1recipent;
        return ops;
    }
}
