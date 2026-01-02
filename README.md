# n8n-nodes-bitgo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **BitGo**, the leading institutional digital asset custody and wallet infrastructure platform. This node provides enterprise-grade access to BitGo's multi-signature wallets, custody solutions, and API infrastructure for institutional cryptocurrency operations.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Features

- **12 Resource Categories** with 60+ operations
- **Multi-Signature Wallet Management** - Create, manage, and transact with enterprise-grade wallets
- **Institutional-Grade Security** - 2-of-3 multi-sig, policy controls, and pending approvals
- **Multi-Asset Support** - 20+ mainnet coins and their testnet variants
- **Real-Time Webhooks** - Trigger workflows on transfers, transactions, and approvals
- **Enterprise Features** - User management, policy rules, and organization controls
- **Staking Operations** - Stake, unstake, and track rewards

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install a community node**
4. Enter `n8n-nodes-bitgo`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or copy the node package
npm install n8n-nodes-bitgo

# Restart n8n
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-bitgo.zip
cd n8n-nodes-bitgo

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-bitgo

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-bitgo %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

Before using the BitGo node, you need to configure your API credentials.

### Getting Your Access Token

1. Log in to your BitGo account at [app.bitgo.com](https://app.bitgo.com) or [app.bitgo-test.com](https://app.bitgo-test.com) for testing
2. Navigate to **Settings** > **API Tokens**
3. Click **Add Access Token**
4. Configure the token with appropriate permissions
5. Copy the generated access token

### Configuring Credentials in n8n

| Field | Description |
|-------|-------------|
| **Access Token** | Your BitGo API access token (required) |
| **Environment** | Production (`app.bitgo.com`) or Test (`app.bitgo-test.com`) |
| **Enterprise ID** | Your enterprise identifier (optional, for organization operations) |
| **Wallet Passphrase** | Default passphrase for transaction signing (optional) |

## Resources & Operations

### Wallet

Manage multi-signature cryptocurrency wallets.

| Operation | Description |
|-----------|-------------|
| **List** | List all wallets for a coin |
| **Get** | Get wallet details by ID |
| **Create** | Create a new multi-sig wallet |
| **Update** | Update wallet settings |
| **Send** | Send cryptocurrency to an address |
| **Send Many** | Send to multiple recipients in one transaction |
| **Get Balance** | Get wallet balance (confirmed and pending) |
| **Freeze** | Freeze or unfreeze wallet activity |
| **Get Max Spendable** | Calculate maximum transferable amount |
| **Sweep** | Transfer entire wallet balance |

### Address

Manage wallet addresses.

| Operation | Description |
|-----------|-------------|
| **List** | List all wallet addresses |
| **Create** | Generate a new receiving address |
| **Get** | Get address details |
| **Verify** | Validate address format |

### Transaction

View and manage transactions.

| Operation | Description |
|-----------|-------------|
| **List** | List wallet transactions |
| **Get** | Get transaction details |
| **Get Fee Estimate** | Estimate transaction fees |

### Transfer

View transfer history.

| Operation | Description |
|-----------|-------------|
| **List** | List all transfers |
| **Get** | Get transfer details |

### Key

Manage keychains.

| Operation | Description |
|-----------|-------------|
| **List** | List all keys |
| **Get** | Get key details |
| **Create** | Create a new keychain |

### Pending Approval

Manage transaction approvals.

| Operation | Description |
|-----------|-------------|
| **List** | List pending approvals |
| **Get** | Get approval details |
| **Update** | Approve or reject |

### Policy

Manage wallet policies.

| Operation | Description |
|-----------|-------------|
| **List** | List wallet policies |
| **Get** | Get policy details |
| **Create** | Create a policy rule |
| **Update** | Update a policy rule |
| **Delete** | Remove a policy rule |

### Webhook

Manage webhook notifications.

| Operation | Description |
|-----------|-------------|
| **List** | List registered webhooks |
| **Get** | Get webhook details |
| **Create** | Register a new webhook |
| **Delete** | Remove a webhook |
| **Simulate** | Test webhook delivery |

### User

Manage users.

| Operation | Description |
|-----------|-------------|
| **Get Current** | Get authenticated user |
| **Get** | Get user by ID |
| **List** | List enterprise users |
| **Update** | Update user settings |

### Enterprise

Manage enterprise settings.

| Operation | Description |
|-----------|-------------|
| **Get** | Get enterprise details |
| **Update** | Update enterprise settings |
| **Get Wallets** | Get all enterprise wallets |

### Coin

Get coin information.

| Operation | Description |
|-----------|-------------|
| **List** | List supported coins |
| **Get** | Get coin details |
| **Get Market Data** | Get price and market info |

### Staking

Manage staking operations.

| Operation | Description |
|-----------|-------------|
| **List** | List staking wallets |
| **Get Details** | Get staking position info |
| **Create Staking** | Initiate staking |
| **Create Unstaking** | Begin unstaking |
| **Get Rewards** | Get earned rewards |

## Trigger Node

The **BitGo Trigger** node enables real-time webhook-based triggers for your workflows.

### Supported Events

| Event | Description |
|-------|-------------|
| **Transfer** | Any incoming or outgoing transfer |
| **Transaction** | Transaction events |
| **Pending Approval** | New pending approval created |
| **Address Confirmation** | Address receives first transaction |
| **Block** | New block mined on network |
| **Wallet Confirmation** | Wallet reaches confirmation threshold |

### Trigger Configuration

- **Coin**: The cryptocurrency to monitor
- **Wallet ID**: The wallet to receive events for
- **Event**: The event type to trigger on
- **Confirmations**: Number of confirmations before triggering (for transfer/transaction events)
- **Listen to Failure States**: Also trigger on failed transactions

## Usage Examples

### Automated Exchange Settlement

```javascript
// 1. BitGo Node - List pending transfers
// Resource: Transfer, Operation: List
// Filter by state: pending

// 2. Filter Node - Check for settlement criteria

// 3. BitGo Node - Send cryptocurrency
// Resource: Wallet, Operation: Send
// Use expressions to set recipient and amount
```

### Treasury Management

```javascript
// 1. Schedule Trigger - Every hour

// 2. BitGo Node - Get wallet balances
// Resource: Wallet, Operation: Get Balance

// 3. IF Node - Check if rebalancing needed

// 4. BitGo Node - Send to cold storage
// Resource: Wallet, Operation: Send
```

### Compliance-Driven Approval Workflow

```javascript
// 1. BitGo Trigger - Pending Approval event

// 2. Get approval details
// Resource: Pending Approval, Operation: Get

// 3. Send to compliance team (Slack/Email)

// 4. Wait for approval decision

// 5. BitGo Node - Approve or Reject
// Resource: Pending Approval, Operation: Update
```

### Batch Payment Processing

```javascript
// 1. Google Sheets - Read payment list

// 2. BitGo Node - Send Many
// Resource: Wallet, Operation: Send Many
// Map addresses and amounts from sheet
```

## BitGo Concepts

| Term | Description |
|------|-------------|
| **Hot Wallet** | Online wallet for active transactions |
| **Cold Wallet** | Offline wallet for secure storage |
| **Multi-sig** | 2-of-3 signature requirement for transactions |
| **User Key** | Client-controlled signing key |
| **Backup Key** | Recovery key stored securely |
| **BitGo Key** | BitGo-held signing key (institutional grade) |
| **Enterprise** | Organization-level container for wallets and users |
| **Pending Approval** | Transaction awaiting authorization |
| **Policy** | Automated rules for transaction control |
| **Spending Limit** | Maximum transfer thresholds |

## Supported Coins

### Mainnet

| Coin | Name |
|------|------|
| BTC | Bitcoin |
| ETH | Ethereum |
| LTC | Litecoin |
| XRP | Ripple |
| XLM | Stellar |
| EOS | EOS |
| TRX | Tron |
| SOL | Solana |
| AVAXC | Avalanche C-Chain |
| POLYGON | Polygon |
| ARBETH | Arbitrum |
| OPETH | Optimism |
| BSC | BNB Smart Chain |
| HBAR | Hedera |
| ALGO | Algorand |
| DOT | Polkadot |
| ATOM | Cosmos |
| NEAR | NEAR Protocol |
| SUI | Sui |
| APT | Aptos |

### Testnet

All mainnet coins have testnet variants prefixed with 't' (e.g., tbtc, teth).

## Error Handling

The node includes comprehensive error handling:

- **Authentication errors**: Invalid or expired access token
- **Permission errors**: Insufficient API token permissions
- **Validation errors**: Invalid parameters or amounts
- **Network errors**: API connectivity issues
- **Rate limiting**: BitGo API rate limit exceeded

Use the "Continue on Fail" option to handle errors gracefully in your workflows.

## Security Best Practices

1. **Use Test Environment First**: Always test workflows on BitGo's test environment before production
2. **Protect Access Tokens**: Store tokens securely and rotate regularly
3. **Enable Policy Rules**: Set up spending limits and approval requirements
4. **Use Webhooks Securely**: Validate webhook signatures when available
5. **Monitor Transactions**: Set up alerts for unexpected activity
6. **Limit Token Permissions**: Only grant necessary API permissions

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and tests before submitting.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-bitgo/issues)
- **Documentation**: [BitGo API Docs](https://docs.bitgo.com/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [BitGo](https://www.bitgo.com/) for their comprehensive API
- [n8n](https://n8n.io/) for the workflow automation platform
- The open-source community for continuous inspiration
