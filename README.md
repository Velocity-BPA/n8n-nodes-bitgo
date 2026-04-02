# n8n-nodes-bitgo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with BitGo's enterprise cryptocurrency platform, featuring 6 core resources for digital asset management. It enables secure wallet operations, address management, transaction monitoring, fund transfers, key management, and webhook configuration for institutional-grade cryptocurrency workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Cryptocurrency](https://img.shields.io/badge/crypto-BitGo-orange)
![Multi-Sig](https://img.shields.io/badge/multi--sig-enabled-green)
![Enterprise](https://img.shields.io/badge/enterprise-grade-purple)

## Features

- **Multi-Signature Wallet Management** - Create, configure, and manage enterprise-grade multi-signature wallets across multiple cryptocurrencies
- **Secure Address Generation** - Generate and validate cryptocurrency addresses with comprehensive metadata and balance tracking
- **Transaction Monitoring** - Real-time transaction tracking, verification, and detailed transaction history analysis
- **Automated Fund Transfers** - Execute secure transfers with multi-signature approval workflows and compliance controls
- **Advanced Key Management** - Enterprise key generation, rotation, and secure storage with hierarchical deterministic support
- **Real-Time Webhook Integration** - Configure and manage webhooks for transaction notifications, wallet events, and security alerts
- **Multi-Currency Support** - Native support for Bitcoin, Ethereum, and 100+ other cryptocurrencies and tokens
- **Compliance & Auditing** - Built-in compliance features with detailed audit trails and regulatory reporting capabilities

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-bitgo`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-bitgo
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-bitgo.git
cd n8n-nodes-bitgo
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-bitgo
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your BitGo API access key from the developer console | ✓ |
| Environment | Choose between 'test' (testnet) or 'prod' (mainnet) | ✓ |
| Base URL | BitGo API endpoint (auto-configured based on environment) | ✓ |
| Passphrase | Wallet passphrase for transaction signing operations | ✗ |

## Resources & Operations

### 1. Wallet

| Operation | Description |
|-----------|-------------|
| Create | Generate new multi-signature wallets with customizable security parameters |
| Get | Retrieve detailed wallet information including balances and configuration |
| List | Fetch all wallets associated with your account with filtering options |
| Update | Modify wallet settings, labels, and security configurations |
| Get Balance | Check current balance and pending transactions for specific wallets |
| Get Transactions | Retrieve transaction history with advanced filtering and pagination |

### 2. Address

| Operation | Description |
|-----------|-------------|
| Create | Generate new receiving addresses for wallets with optional labels |
| Get | Retrieve address details including balance and transaction history |
| List | Fetch all addresses for a wallet with filtering and search capabilities |
| Validate | Verify address format and network compatibility |
| Get Balance | Check balance for specific addresses across multiple confirmations |
| Get Transactions | View all transactions associated with specific addresses |

### 3. Transaction

| Operation | Description |
|-----------|-------------|
| Get | Retrieve detailed transaction information including confirmations and fees |
| List | Query transactions with advanced filtering by date, amount, and status |
| Get by Hash | Fetch transaction details using blockchain transaction hash |
| Verify | Validate transaction signatures and confirm blockchain inclusion |
| Get Confirmations | Check current confirmation count and estimated completion time |
| Get Fee Estimate | Calculate optimal transaction fees for different priority levels |

### 4. Transfer

| Operation | Description |
|-----------|-------------|
| Create | Initiate new cryptocurrency transfers with multi-signature requirements |
| Send | Execute pre-approved transfers with final signature authorization |
| Get | Retrieve transfer status and detailed execution information |
| List | View transfer history with comprehensive filtering and status tracking |
| Cancel | Cancel pending transfers before final signature completion |
| Approve | Provide additional signatures for multi-signature transfer approval |

### 5. Key

| Operation | Description |
|-----------|-------------|
| Create | Generate new cryptographic keys with secure entropy sources |
| Get | Retrieve public key information and associated metadata |
| List | View all keys associated with your account and their usage status |
| Backup | Export key backup information for disaster recovery purposes |
| Derive | Generate child keys using hierarchical deterministic derivation |
| Verify | Validate key integrity and cryptographic properties |

### 6. Webhook

| Operation | Description |
|-----------|-------------|
| Create | Set up new webhook endpoints for real-time event notifications |
| Get | Retrieve webhook configuration and delivery status information |
| List | View all configured webhooks with filtering and status monitoring |
| Update | Modify webhook URLs, events, and configuration parameters |
| Delete | Remove webhook subscriptions and clean up endpoint configurations |
| Test | Send test notifications to verify webhook endpoint functionality |

## Usage Examples

```javascript
// Create a new Bitcoin wallet
{
  "coin": "btc",
  "label": "Corporate Treasury Wallet",
  "passphrase": "secure-passphrase-123",
  "userKey": "xpub6C...",
  "backupKey": "xpub6D...",
  "enterprise": "enterprise-id-123"
}
```

```javascript
// Execute a Bitcoin transfer
{
  "walletId": "wallet-abc123",
  "amount": 50000000,
  "address": "3P14159f73E4gFr7JterCCQh9QjiTjiZrG",
  "walletPassphrase": "secure-passphrase-123",
  "comment": "Payment to supplier XYZ"
}
```

```javascript
// Set up transaction webhook
{
  "type": "transfer",
  "url": "https://your-app.com/webhooks/bitgo",
  "coin": "btc",
  "walletId": "wallet-abc123",
  "numConfirmations": 3,
  "label": "Transaction Notifications"
}
```

```javascript
// Get wallet transaction history
{
  "walletId": "wallet-abc123",
  "limit": 50,
  "skip": 0,
  "minValue": 1000000,
  "dateGte": "2024-01-01T00:00:00Z"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has proper permissions |
| Insufficient Balance | Wallet balance too low for requested transfer amount | Check wallet balance and reduce transfer amount or add funds |
| Invalid Address | Cryptocurrency address format is incorrect or unsupported | Validate address format matches the target cryptocurrency network |
| Signature Required | Multi-signature transaction requires additional approvals | Obtain required signatures from authorized wallet participants |
| Rate Limited | API request frequency exceeds allowed limits | Implement request throttling and retry with exponential backoff |
| Webhook Timeout | Webhook endpoint failed to respond within timeout period | Verify webhook URL accessibility and implement proper response handling |

## Development

```bash
npm install
npm run build
npm test
npm run lint
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

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-bitgo/issues)
- **BitGo API Documentation**: [BitGo Developer Portal](https://app.bitgo.com/docs/)
- **BitGo Support**: [BitGo Help Center](https://support.bitgo.com/)