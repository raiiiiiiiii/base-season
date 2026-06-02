// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseSeasons {
    struct Player {
        uint256 totalScore;
        uint256 bestScore;
        uint256 gamesPlayed;
        uint256 lastPlayed;
    }

    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    // EIP-712 Domain Separator and TypeHash
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant SCORE_TYPEHASH = keccak256(
        "ScorePayload(address player,uint256 gameId,uint256 score,uint256 timestamp,uint256 nonce)"
    );

    uint256 public currentSeason = 1;
    uint256 public seasonStartTime;
    uint256 public constant SEASON_DURATION = 7 days;

    mapping(address => Player) public players;
    mapping(uint256 => mapping(uint256 => Score[])) private leaderboards; // seasonId => gameId => scores
    mapping(address => uint256) public nonces; // Anti-replay nonce per player

    event ScoreSubmitted(address indexed player, uint256 indexed gameId, uint256 score, uint256 timestamp, uint256 seasonId);
    event NewSeasonStarted(uint256 seasonId, uint256 startTime);

    constructor() {
        seasonStartTime = block.timestamp;
        
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("BaseSeasons")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function submitScore(
        uint256 gameId, 
        uint256 score, 
        uint256 timestamp, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) external {
        // 1. Timestamp validity check (e.g., 5 min expiration)
        require(block.timestamp <= timestamp + 5 minutes, "Signature expired");
        require(timestamp <= block.timestamp + 1 minutes, "Invalid future timestamp");
        
        // 2. EIP-712 Signature Verification
        uint256 currentNonce = nonces[msg.sender];
        bytes32 structHash = keccak256(abi.encode(SCORE_TYPEHASH, msg.sender, gameId, score, timestamp, currentNonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        
        address signer = ecrecover(digest, v, r, s);
        require(signer == msg.sender, "Invalid signature");

        // 3. Increment nonce to prevent replay attacks
        nonces[msg.sender]++;
        
        // 4. Season tracking
        _checkAndStartSeason();

        // 5. Player Stats & Cooldown (Anti-spam)
        Player storage p = players[msg.sender];
        require(block.timestamp >= p.lastPlayed + 30 seconds, "Cooldown active");

        p.lastPlayed = block.timestamp;
        p.gamesPlayed++;
        p.totalScore += score;
        if (score > p.bestScore) {
            p.bestScore = score;
        }

        // 6. Record Score onchain
        leaderboards[currentSeason][gameId].push(Score({
            player: msg.sender,
            score: score,
            timestamp: block.timestamp
        }));

        emit ScoreSubmitted(msg.sender, gameId, score, block.timestamp, currentSeason);
    }

    function _checkAndStartSeason() internal {
        if (block.timestamp >= seasonStartTime + SEASON_DURATION) {
            currentSeason++;
            seasonStartTime = block.timestamp;
            emit NewSeasonStarted(currentSeason, seasonStartTime);
        }
    }

    function getLeaderboard(uint256 gameId, uint256 seasonId) external view returns (Score[] memory) {
        return leaderboards[seasonId][gameId];
    }
}
