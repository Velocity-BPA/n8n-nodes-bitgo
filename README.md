# n8n-nodes-bitgo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for BitGo's enterprise cryptocurrency wallet and security platform. With 6 comprehensive resources, this node enables automated wallet management, transaction processing, approval workflows, webhook handling, enterprise administration, and policy enforcement for institutional cryptocurrency operations.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![BitGo API](https://img.shields.io/badge/BitGo-API%20v2-orange)
![Cryptocurrency](https://img.shields.io/badge/Crypto-Wallet%20Management-green)
![Security](https://img.shields.io/badge/Enterprise-Security-red)

## Features

- **Multi-Signature Wallets** - Create, manage, and operate enterprise-grade multi-signature cryptocurrency wallets
- **Transaction Automation** - Send, receive, and track cryptocurrency transactions with automated workflows
- **Approval Workflows** - Manage pending approvals for transactions and policy changes with automated decision logic
- **Webhook Integration** - Receive real-time notifications for wallet events, transactions, and security alerts
- **Enterprise Management** - Administer users, permissions, and organizational settings across your BitGo enterprise
- **Policy Enforcement** - Create and manage spending policies, velocity limits, and security rules
- **Multi-Currency Support** - Support for Bitcoin, Ethereum, and 200+ other cryptocurrencies and tokens
- **Compliance Ready** - Built-in compliance features for institutional cryptocurrency operations

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
| Access Token | BitGo API access token from your account settings | Yes |
| Environment | Production or Test environment | Yes |
| Express Server | Custom BitGo Express server URL (optional) | No |

## Resources & Operations

### 1. Wallet

| Operation | Description |
|-----------|-------------|
| Create | Create a new multi-signature wallet |
| Get | Retrieve wallet information and balances |
| List | List all wallets for the authenticated user |
| Update | Update wallet settings and labels |
| Delete | Remove a wallet (requires approval) |
| Get Balance | Get current balance and unconfirmed balance |
| Get Addresses | List receiving addresses for the wallet |
| Generate Address | Create new receiving address |
| Get Transactions | Retrieve transaction history |
| Get Transfers | Get transfer history with detailed information |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send | Send cryptocurrency to one or more recipients |
| Build | Build an unsigned transaction |
| Sign | Sign a transaction with wallet keys |
| Submit | Submit a signed transaction to the network |
| Get | Retrieve transaction details by ID |
| List | List transactions for a wallet |
| Estimate Fee | Calculate transaction fees |
| Get UTXO | Get unspent transaction outputs |
| Accelerate | Increase transaction fee (RBF) |

### 3. PendingApproval

| Operation | Description |
|-----------|-------------|
| Get | Retrieve pending approval details |
| List | List all pending approvals |
| Approve | Approve a pending transaction or policy change |
| Reject | Reject a pending approval |
| Update | Update approval with additional information |

### 4. Webhook

| Operation | Description |
|-----------|-------------|
| Create | Set up webhook for wallet events |
| Get | Retrieve webhook configuration |
| List | List all configured webhooks |
| Update | Modify webhook settings |
| Delete | Remove webhook subscription |
| Test | Test webhook delivery |
| Get Notifications | Retrieve webhook notification history |

### 5. Enterprise

| Operation | Description |
|-----------|-------------|
| Get | Retrieve enterprise information |
| List Users | Get all users in the enterprise |
| Invite User | Send invitation to new user |
| Update User | Modify user permissions and settings |
| Remove User | Remove user from enterprise |
| Get Audit Log | Retrieve security and activity logs |
| Get Settings | Get enterprise configuration |
| Update Settings | Modify enterprise settings |

### 6. Policy

| Operation | Description |
|-----------|-------------|
| Create | Create new spending or security policy |
| Get | Retrieve policy details |
| List | List all policies for wallet or enterprise |
| Update | Modify existing policy rules |
| Delete | Remove policy (requires approval) |
| Test | Validate policy against transaction |

## Usage Examples

### Create Multi-Signature Wallet

```javascript
{
  "label": "Treasury Wallet",
  "passphrase": "secure-passphrase",
  "userKey": "xpub...",
  "backupKey": "xpub...",
  "coin": "btc",
  "m": 2,
  "n": 3,
  "enterprise": "5f8c1d2e3b4a5c6d7e8f9012"
}
```

### Send Bitcoin Transaction

```javascript
{
  "walletId": "5f1e2d3c4b5a6789012345ab",
  "recipients": [
    {
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "amount": 1000000
    }
  ],
  "feeRate": 15,
  "memo": "Payment to supplier"
}
```

### Set Up Transaction Webhook

```javascript
{
  "type": "transfer",
  "url": "https://api.yourcompany.com/bitgo-webhook",
  "coin": "btc",
  "walletId": "5f1e2d3c4b5a6789012345ab",
  "numConfirmations": 1,
  "allToken": false
}
```

### Create Spending Policy

```javascript
{
  "rules": [
    {
      "condition": {
        "amount": 10000000
      },
      "action": {
        "type": "getApproval",
        "approvalsRequired": 2
      }
    }
  ],
  "coin": "btc",
  "type": "velocity"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or expired API token | Check access token and regenerate if needed |
| 403 Forbidden | Insufficient permissions | Verify user has required permissions for operation |
| 404 Not Found | Wallet or resource doesn't exist | Verify wallet ID and resource existence |
| 400 Bad Request | Invalid parameters or malformed request | Check parameter format and required fields |
| 429 Too Many Requests | Rate limit exceeded | Implement request throttling and retry logic |
| 500 Internal Error | BitGo service error | Check BitGo status page and retry after delay |

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
- **BitGo SDK**: [BitGo JavaScript SDK](https://github.com/BitGo/BitGoJS)