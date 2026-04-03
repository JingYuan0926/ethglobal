# 🐟 [Project Name]

## 🧠 One-liner

**A human-verified AI-native prediction market where AI swarms research, verify, and resolve outcomes through reputation-weighted consensus and autonomous on-chain payouts.**

---

# 💡 Idea

[Project Name] is a **decentralized AI oracle + prediction market**, where outcomes are resolved by a **swarm of independent AI agents**, each backed by a verified human.

Instead of relying on:
- token-weighted voting (whales)  
- or a single AI model (centralized)  

[Project Name] transforms oracle resolution into a:

> **human-backed, AI-powered ensemble intelligence system**

---

# ⚙️ How it works

## 1. Human-backed agent pool

- Anyone can register as an oracle agent  
- Each agent is tied to a **unique verified human**  
- Agents build **reputation over time**  

👉 Prevents bots and Sybil attacks  

---

## 🎲 2. Reputation-weighted random selection

For each market:

- A **random committee of agents** is selected  
- Selection is **weighted by reputation**  

This ensures:
- high-quality agents are chosen more often  
- new agents can still participate  
- no fixed group controls outcomes (prevents oligarchy)

---

## ⚡ 3. Optimistic resolution (Fast path)

Markets resolve **quickly by default**, similar to UMA's optimistic oracle:

- Initial result is determined using:
  - simple rules  
  - data feeds  
  - or baseline consensus  

- This result is accepted as valid unless challenged  

👉 Fast UX, low latency  

---

## ⚖️ 4. Bonded dispute mechanism

If someone believes the result is wrong:

- They submit a **bond (stake)**  
- This triggers **dispute mode**

👉 Prevents spam challenges and aligns incentives  

---

## 🧠 5. Swarm dispute resolution

When dispute mode is triggered:

### Step 1 — Independent reasoning
Each selected agent:
- researches data (news, APIs, on-chain, user evidence)  
- verifies credibility  
- reasons over conflicting information  

---

### Step 2 — First vote (commit–reveal)
- agents submit private votes (YES / NO / UNSURE)  
- votes are revealed simultaneously  

---

### Step 3 — Consensus check

- If ≥70% agreement → finalize  
- Else → continue to discussion  

---

### Step 4 — Evidence-driven discussion

Agents:
- share sources and reasoning  
- challenge each other’s claims  
- introduce new evidence  

👉 This is **adversarial verification**, not blind discussion  

---

### Step 5 — Second vote

- agents vote again independently  
- updated consensus determines outcome  

---

### Step 6 — If still uncertain

- delay resolution  
- expand committee  
- or escalate  

👉 The system **never forces fake certainty**

---

## 💰 6. Autonomous payouts & incentives

- Settlement agent distributes payouts automatically  
- Oracle agents:
  - earn rewards if correct  
  - lose stake or reputation if wrong  

---

## ⭐ 7. Reputation system

Agents gain reputation based on:

- correctness of final decisions  
- quality of evidence  
- consistency over time  

Reputation affects:
- selection probability  
- trust level  

👉 Reputation improves system quality over time  

---

# 🎯 Key Innovations

### 🧠 AI swarm, not single oracle
- multiple agents reduce single-point failure  
- ensemble reasoning improves accuracy  

---

### 🎲 Open but controlled participation
- anyone can join  
- influence is probabilistic and earned  

---

### ⚖️ Optimistic + dispute model
- fast resolution by default  
- deep reasoning only when challenged  

---

### 💰 Agentic economy
- agents earn, compete, and build reputation  
- fully autonomous payouts  

---

### 🔍 Transparency
- reasoning, votes, and payouts are auditable  
- no black-box decisions  

---

# ❓ Q&A (Judge Defense)

---

## ❓ “AI agents aren’t capable enough”

> **“We don’t rely on a single agent. We use multiple independent agents, require consensus, and only resolve when confidence is high. The system is designed to work with imperfect AI.”**

---

## ❓ “What if agents collude?”

> **“Collusion is possible in any system. The difference is cost. Instead of buying tokens, an attacker must coordinate many verified humans and build reputation, which is significantly harder.”**

---

## ❓ “What if someone brings 1000 people?”

> **“Joining the pool doesn’t guarantee influence. Agents are selected randomly per market, weighted by reputation. New participants have low probability of being selected, making coordinated attacks ineffective.”**

---

## ❓ “Why not just use one AI model?”

> **“A single model is a single point of failure. We treat oracle resolution as an ensemble problem, improving robustness and reducing correlated errors.”**

---

## ❓ “Isn’t discussion biased?”

> **“Agents first vote independently to avoid bias. Discussion only happens in dispute mode when uncertainty is high, allowing influence to improve accuracy rather than distort outcomes.”**

---

## ❓ “What if the system still can’t decide?”

> **“We don’t force a result. We delay, expand the committee, or escalate. Uncertainty is treated as a signal, not a failure.”**

---

## ❓ “AI has no legal accountability”

> **“Each agent is tied to a verified human identity and builds reputation over time. This is an economic oracle system, not a legal authority.”**

---

## ❓ “Why is this better than token-based systems?”

> **“Token systems allow capital to control outcomes. We cap influence at one human per agent and use reputation-weighted selection, making manipulation much harder.”**

---

## ❓ “What does the swarm actually do?”

> **“Agents don’t just vote—they research, verify evidence, reason over uncertainty, and then produce a consensus.”**

---

# 🔥 Closing Line

> **”[Project Name] is not just a prediction market — it’s a decentralized, human-backed AI system that verifies reality and moves value without centralized trust.”**

---

# Architecture

## High-Level System Architecture

```mermaid
graph TB
    subgraph USER[“USER LAYER - World App”]
        U[“User<br/>World ID 4.0 Verified”]
        WA[“World Mini App<br/>MiniKit 2.0”]
        U --> WA
    end

    subgraph SWARM[“Project Name SWARM - 0G Network”]
        direction TB
        subgraph AGENTS[“OpenClaw Agent Nodes - each is iNFT ERC-7857”]
            N1[“Node 1<br/>Human A, Rep 92%”]
            N2[“Node 2<br/>Human B, Rep 87%”]
            N3[“Node 3<br/>Human C, Rep 95%”]
            NN[“Node N<br/>Human N, Rep 78%”]
        end
        OGC[“0G Compute TEE<br/>Sealed AI Inference”]
        OGS[“0G Storage<br/>Memory, Evidence, Reputation”]
        OGX[“0G Chain<br/>iNFT Registry, Agent Identity”]
    end

    subgraph HEDERA[“SETTLEMENT LAYER - Hedera”]
        HTS[“Hedera Token Service<br/>YES/NO Outcome Tokens”]
        HCS[“Hedera Consensus Service<br/>Votes, Debate, Audit Trail”]
        HAK[“Hedera Agent Kit<br/>Autonomous Payouts”]
        HST[“Scheduled Transactions<br/>Deadline + Periodic Triggers”]
    end

    WA -->|”Place Bets HBAR”| HTS
    WA -->|”Browse Markets”| OGS
    U -.->|”1 Human = 1 Node<br/>World Agent Kit”| AGENTS

    N1 -->|”Run Inference”| OGC
    N2 -->|”Run Inference”| OGC
    N3 -->|”Run Inference”| OGC
    NN -->|”Run Inference”| OGC
    N1 -->|”Evidence”| OGS
    N2 -->|”Evidence”| OGS
    N3 -->|”Evidence”| OGS
    NN -->|”Evidence”| OGS
    N1 -->|”Vote”| HCS
    N2 -->|”Vote”| HCS
    N3 -->|”Vote”| HCS
    NN -->|”Vote”| HCS

    HST -->|”Trigger Resolution”| AGENTS
    HCS -->|”Final Result”| HAK
    HAK -->|”Payout Winners”| U
```

---

## Sponsor Technology Map

```mermaid
graph TB
    subgraph WORLD[“WORLD - $20,000”]
        direction TB
        W1[“Agent Kit $8k<br/>Oracle node = AI agent backed by verified human<br/>Settlement + market creation agent identity”]
        W2[“World ID 4.0 $8k<br/>1 person = 1 betting account<br/>1 person = 1 oracle iNFT node<br/>Dual sybil resistance”]
        W3[“MiniKit 2.0 $4k<br/>Betting UI as Mini App<br/>World wallet payments”]
    end

    subgraph ZG[“0G - $15,000”]
        direction TB
        Z1[“OpenClaw Agent $6k<br/>Research + Oracle swarms<br/>0G Compute, Storage, iNFTs”]
        Z2[“DeFi App $6k<br/>AI prediction market<br/>Verifiable inference + settlement”]
        Z3[“Wildcard $3k<br/>Novel AI swarm oracle<br/>Self-improving reputation”]
    end

    subgraph HEDERA[“HEDERA - $11,500”]
        direction TB
        H1[“AI and Agentic Payments $6k<br/>Multi-agent payment flows<br/>Hedera Agent Kit settlement<br/>HTS tokens, HCS audit trail”]
        H2[“Tokenization $2.5k<br/>YES/NO outcome tokens via HTS<br/>Custom fee schedules<br/>Token lifecycle management”]
        H3[“No Solidity Allowed $3k<br/>SDK-only, no smart contracts<br/>HTS + HCS + Scheduled Txns<br/>Built for Hedera-native devs”]
    end
```

---

## Three Swarm Roles

```mermaid
graph TD
    subgraph RS[“SWARM 1: RESEARCH”]
        direction TB
        R1[“Agent A<br/>News Scraper”]
        R2[“Agent B<br/>On-chain Data”]
        R3[“Agent C<br/>API Monitor”]
        R4[“Agent D<br/>Social Signals”]
        R1 --> EP[“Evidence Pool<br/>0G Storage”]
        R2 --> EP
        R3 --> EP
        R4 --> EP
    end

    subgraph MS[“SWARM 2: MARKET CREATION”]
        direction TB
        M1[“Trend Detector”] --> M2[“Criteria Definer”]
        M2 --> M3[“Market Validator”]
        M3 --> MKT[“Deploy Market<br/>0G Chain + Hedera HTS”]
    end

    subgraph OS[“SWARM 3: ORACLE RESOLUTION”]
        direction TB
        O1[“Node 1 iNFT”]
        O2[“Node 2 iNFT”]
        O3[“Node 3 iNFT”]
        O4[“Node N iNFT”]
        O1 --> CV[“Phase 1: Commit<br/>Hidden Votes”]
        O2 --> CV
        O3 --> CV
        O4 --> CV
        CV --> RV[“Phase 2: Reveal<br/>Votes on HCS”]
        RV --> DP[“Phase 3: Discussion<br/>Reasoning on HCS”]
        DP --> RESULT[“Consensus Result”]
    end

    EP -.->|”Feeds evidence”| OS
    RS -.->|”Trending topics”| MS
    MKT -.->|”Deadline trigger”| OS
    RESULT --> SA[“Settlement Agent<br/>Hedera Agent Kit”]
    SA --> W[“Winners get HBAR”]
    SA --> REP[“Reputation Updated”]
```

---

## Resolution Flow (Sequence)

```mermaid
sequenceDiagram
    participant HST as Hedera Scheduled Tx
    participant HCS as Hedera HCS
    participant N1 as Node 1 (iNFT)
    participant N2 as Node 2 (iNFT)
    participant N3 as Node 3 (iNFT)
    participant OGC as 0G Compute (TEE)
    participant OGS as 0G Storage
    participant SA as Settlement Agent

    HST->>HCS: Market #123 needs resolution

    par Independent Analysis
        N1->>OGS: Fetch evidence
        N1->>OGC: Run sealed inference
        N2->>OGS: Fetch evidence
        N2->>OGC: Run sealed inference
        N3->>OGS: Fetch evidence
        N3->>OGC: Run sealed inference
    end

    Note over N1,N3: PHASE 1 — Commit (hidden votes)
    N1->>HCS: commit(hash(YES + salt))
    N2->>HCS: commit(hash(NO + salt))
    N3->>HCS: commit(hash(YES + salt))

    Note over N1,N3: PHASE 2 — Reveal
    N1->>HCS: reveal(YES + TEE attestation)
    N2->>HCS: reveal(NO + TEE attestation)
    N3->>HCS: reveal(YES + TEE attestation)

    Note over N1,N3: PHASE 3 — Discussion (transparency only)
    N1->>HCS: “Source X confirms event happened”
    N2->>HCS: “My source was outdated, concur YES”
    N3->>HCS: “Multiple sources confirm”

    Note over N1,N3: Consensus = YES (reputation-weighted majority)

    HCS->>SA: Result = YES
    SA->>SA: Calculate payouts
    SA->>HCS: Log payout audit trail
    SA-->>N1: Rep +1 (voted correctly)
    SA-->>N2: Rep -1 (voted incorrectly)
    SA-->>N3: Rep +1 (voted correctly)
    SA-->>HCS: Winners receive HBAR
```

---

## Payment Flows

```mermaid
graph LR
    subgraph F1[“FLOW 1 - User Bets”]
        U1[“User<br/>World ID”] -->|HBAR| MC[“Market Contract”]
        MC -->|Mint| T1[“YES/NO Tokens<br/>HTS”]
        T1 --> U1
    end

    subgraph F2[“FLOW 2 - Fee Split”]
        TRADE[“Every Trade”] -->|”HTS Auto-Fee”| SPLIT{“3% Split”}
        SPLIT -->|”2%”| POOL[“Oracle Node Pool”]
        SPLIT -->|”1%”| TREASURY[“Platform Treasury”]
    end

    subgraph F3[“FLOW 3 - Oracle Reward”]
        PA[“Platform Agent”] -->|”Hedera Agent Kit”| CORRECT[“Correct Nodes<br/>weighted by rep”]
    end

    subgraph F4[“FLOW 4 - Settlement”]
        SA2[“Settlement Agent”] -->|”Read HCS”| RESULT2[“Oracle Result”]
        SA2 -->|”Auto HBAR Transfer”| WIN[“Winners Paid”]
        SA2 -->|”Burn”| LOSE[“Losing Tokens Burned”]
    end

    subgraph F5[“FLOW 5 - Reputation”]
        RES[“Resolution Complete”] -->|”plus or minus 1”| REP[“Rep Scores<br/>0G Storage”]
        RES -->|”Log”| AUDIT[“HCS Audit Trail”]
    end
```

---

## Reputation System

```mermaid
graph TD
    subgraph REP[“REPUTATION ENGINE”]
        direction TB
        NEW[“New Node Joins<br/>Rep = 50%”]
        VOTE{“Voted with<br/>majority?”}
        NEW --> VOTE
        VOTE -->|YES| UP[“+Rep<br/>scaled by market size”]
        VOTE -->|NO| DOWN[“-Rep<br/>scaled by market size”]
        VOTE -->|”Did not vote”| PENALTY[“-Small Penalty”]

        UP --> EFFECTS
        DOWN --> EFFECTS
        PENALTY --> EFFECTS

        EFFECTS[“Reputation Affects:<br/>Vote weight in consensus<br/>Selection probability<br/>Reward share<br/>Trust level”]
    end

    subgraph STORAGE[“Where Rep Lives”]
        S1[“0G Storage - permanent scores”]
        S2[“Hedera HCS - auditable changes”]
        S3[“iNFT ERC-7857 - tied to identity”]
    end

    EFFECTS --> STORAGE
```

---

## TEE (Trusted Execution Environment)

```mermaid
graph LR
    INPUT[“Market Question<br/>+ Data Sources”] --> TEE

    subgraph TEE[“0G COMPUTE - SECURE ENCLAVE”]
        direction TB
        AI[“AI Model Runs Here<br/>sealed, tamper-proof”]
        ANALYSIS[“Data Analysis<br/>node operator CANNOT modify”]
        DECISION[“Decision: YES / NO”]
        AI --> ANALYSIS --> DECISION
    end

    TEE --> OUTPUT[“Answer + TEE Attestation”]

    OUTPUT --> PROVES[“Attestation Proves:<br/>Specific AI model was used<br/>Specific data was analyzed<br/>Result was NOT tampered with<br/>Hardware signature confirms integrity”]

    PROVES --> HCS2[“Posted to Hedera HCS<br/>anyone can verify”]
```

---

## Tech Stack

| Layer | Technology | Sponsor |
|---|---|---|
| **Frontend** | Next.js + World MiniKit 2.0 | World |
| **User Identity** | World ID 4.0 | World |
| **Agent Identity** | World Agent Kit | World |
| **AI Agents** | OpenClaw framework | 0G |
| **AI Inference** | 0G Compute (TEE) | 0G |
| **Agent Memory** | 0G Storage | 0G |
| **Agent Ownership** | iNFTs (ERC-7857) on 0G Chain | 0G |
| **Market Tokens** | Hedera Token Service (HTS) | Hedera |
| **Voting/Audit** | Hedera Consensus Service (HCS) | Hedera |
| **Payouts** | Hedera Agent Kit | Hedera |
| **Scheduling** | Hedera Scheduled Transactions | Hedera |

---

## Track Qualification Checklist

### World — $20,000

| Track | Prize | Requirement | How We Qualify |
|---|---|---|---|
| **Agent Kit** | $8,000 | AgentKit to distinguish human-backed agents from bots | Each oracle iNFT is an AI agent backed by verified human via AgentKit |
| **World ID 4.0** | $8,000 | World ID as real constraint | 1 human = 1 bet account AND 1 human = 1 oracle node. Dual sybil resistance |
| **MiniKit 2.0** | $4,000 | Mini App with MiniKit SDK commands | Betting UI as World Mini App with wallet integration |

> **Warning:** MiniKit track says “project must not be gambling or chance based.” Frame as **information/forecasting market**.

### 0G — $15,000

| Track | Prize | Requirement | How We Qualify |
|---|---|---|---|
| **OpenClaw Agent** | $6,000 | OpenClaw + 0G infra (Compute, Storage, Chain, iNFTs) | Research + Oracle swarms are OpenClaw agents on full 0G stack |
| **DeFi App** | $6,000 | AI-native DeFi on 0G | AI prediction market with verifiable inference + autonomous settlement |
| **Wildcard** | $3,000 | Creative use of 0G stack | Novel swarm oracle with self-improving reputation economy |

### Hedera — $11,500

| Track | Prize | Requirement | How We Qualify |
|---|---|---|---|
| **AI & Agentic Payments** | $6,000 | AI agent with payment/token ops on Hedera Testnet + Hedera Agent Kit | Settlement agent + oracle reward payments. Agent-to-agent micropayments, HCS audit trail |
| **Tokenization** | $2,500 | Create/manage tokens via HTS with lifecycle ops | YES/NO outcome tokens minted per market via HTS. Custom fee schedules auto-split to oracle pool + treasury |
| **No Solidity Allowed** | $3,000 | Hedera SDK only, no smart contracts, 2+ native services | HTS for tokens + HCS for voting + Scheduled Transactions for deadlines. All via SDK, zero Solidity |

---

## Build Priority

```mermaid
graph LR
    P1[“PHASE 1<br/>0G Core<br/>OpenClaw agents<br/>Basic inference<br/>iNFT identity”] --> P2[“PHASE 2<br/>Hedera Layer<br/>HTS tokens<br/>HCS voting<br/>Agent Kit payouts”] --> P3[“PHASE 3<br/>World Layer<br/>World ID verify<br/>MiniKit frontend<br/>AgentKit agents”] --> P4[“PHASE 4<br/>Polish<br/>Reputation system<br/>Demo flow<br/>README + video”]
```