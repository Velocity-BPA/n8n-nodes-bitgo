import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class BitGoApi implements ICredentialType {
	name = 'bitGoApi';
	displayName = 'BitGo API';
	documentationUrl = 'https://app.bitgo.com/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.bitgo.com/api/v2',
			required: true,
			description: 'The base URL for BitGo API. Use https://test.bitgo.com/api/v2 for testnet.',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			description: 'BitGo access token generated from your BitGo dashboard',
		},
		{
			displayName: 'Enterprise ID',
			name: 'enterpriseId',
			type: 'string',
			default: '',
			description: 'Optional: Enterprise ID for enterprise operations',
		},
	];
}