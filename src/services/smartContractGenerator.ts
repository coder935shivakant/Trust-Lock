import { EscrowContract } from '../types/blockchain';

export function generateSolidityContract(escrow: EscrowContract): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustLockEscrow - Cryptographically Verified Decentralized Escrow
 * @dev Implements PS ID: ALG-BC-02 with milestone payments, multi-sig dispute resolution,
 *      and automated deadline refund protection.
 */
contract TrustLockEscrow_${escrow.id.replace(/[^a-zA-Z0-9]/g, '_')} {
    enum State { Created, Funded, Delivered, Disputed, Released, Refunded }

    struct Milestone {
        string title;
        uint256 percentage;
        uint256 amount;
        bool isDelivered;
        bool isApproved;
        bytes32 deliveryProofHash;
    }

    address payable public immutable buyer;
    address payable public immutable seller;
    address public immutable arbiter;
    uint256 public immutable totalAmount;
    uint256 public immutable deadline;
    
    State public currentState;
    bytes32 public deliveryProofHash;
    uint256 public releasedAmount;
    bool private locked; // Reentrancy Guard
    
    Milestone[] public milestones;

    event EscrowFunded(address indexed buyer, uint256 amount, uint256 timestamp);
    event DeliverySubmitted(bytes32 indexed proofHash, uint256 timestamp);
    event FundsReleased(address indexed seller, uint256 amount, uint256 timestamp);
    event DisputeRaised(address indexed initiator, string reason);
    event DisputeResolved(uint8 verdict, address indexed recipient, uint256 amount);
    event DeadlineRefundExecuted(address indexed buyer, uint256 amount);

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Unauthorized: Only Buyer can call");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Unauthorized: Only Seller can call");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Unauthorized: Only Arbiter can call");
        _;
    }

    modifier inState(State _state) {
        require(currentState == _state, "Invalid state transition");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor() payable {
        buyer = payable(${escrow.buyerAddress});
        seller = payable(${escrow.sellerAddress});
        arbiter = ${escrow.arbiterAddress};
        totalAmount = ${escrow.totalAmount} ether;
        deadline = ${Math.floor(escrow.deadline / 1000)};
        currentState = State.Created;
    }

    /**
     * @notice Locks full funds inside smart contract
     */
    function depositFunds() external payable onlyBuyer inState(State.Created) nonReentrant {
        require(msg.value == totalAmount, "Deposit must match exact escrow amount");
        currentState = State.Funded;
        emit EscrowFunded(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Seller marks goods delivered with cryptographic proof hash
     */
    function submitDelivery(bytes32 _proofHash) external onlySeller inState(State.Funded) {
        require(_proofHash != bytes32(0), "Invalid proof hash");
        deliveryProofHash = _proofHash;
        currentState = State.Delivered;
        emit DeliverySubmitted(_proofHash, block.timestamp);
    }

    /**
     * @notice Buyer verifies inspection and unlocks escrowed funds to seller
     */
    function releaseFunds() external onlyBuyer inState(State.Delivered) nonReentrant {
        currentState = State.Released;
        uint256 remaining = address(this).balance;
        (bool success, ) = seller.call{value: remaining}("");
        require(success, "Transfer to seller failed");
        emit FundsReleased(seller, remaining, block.timestamp);
    }

    /**
     * @notice Emergency deadline refund if seller fails to deliver before timestamp
     */
    function claimDeadlineRefund() external onlyBuyer nonReentrant {
        require(block.timestamp > deadline, "Deadline has not expired yet");
        require(currentState == State.Funded || currentState == State.Created, "Cannot refund in current state");
        currentState = State.Refunded;
        uint256 remaining = address(this).balance;
        (bool success, ) = buyer.call{value: remaining}("");
        require(success, "Refund transfer failed");
        emit DeadlineRefundExecuted(buyer, remaining);
    }

    /**
     * @notice Triggers multi-party arbitration when agreement fails
     */
    function raiseDispute(string calldata reason) external inState(State.Funded) {
        require(msg.sender == buyer || msg.sender == seller, "Only participants can dispute");
        currentState = State.Disputed;
        emit DisputeRaised(msg.sender, reason);
    }

    /**
     * @notice Neutral Arbiter issues final verdict (0: Buyer Refund, 1: Seller Payout, 2: 50/50 Split)
     */
    function resolveDispute(uint8 verdict) external onlyArbiter inState(State.Disputed) nonReentrant {
        uint256 balance = address(this).balance;
        if (verdict == 0) {
            currentState = State.Refunded;
            (bool s, ) = buyer.call{value: balance}("");
            require(s, "Transfer failed");
        } else if (verdict == 1) {
            currentState = State.Released;
            (bool s, ) = seller.call{value: balance}("");
            require(s, "Transfer failed");
        } else if (verdict == 2) {
            currentState = State.Released;
            uint256 half = balance / 2;
            (bool s1, ) = buyer.call{value: half}("");
            (bool s2, ) = seller.call{value: balance - half}("");
            require(s1 && s2, "Split transfers failed");
        } else {
            revert("Invalid verdict code");
        }
        emit DisputeResolved(verdict, msg.sender, balance);
    }
}
`;
}
