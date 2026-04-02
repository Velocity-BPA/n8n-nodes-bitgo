import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BitGoApi implements ICredentialType {
	name = 'bitGoApi';
	displayName = 'BitGo API';
	documentationUrl = 'https://app.bitgo.com/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The BitGo access token for authentication',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.bitgo.com/api/v2',
			required: true,
			description: 'The base URL for BitGo API requests',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Test',
					value: 'test',
				},
			],
			default: 'test',
			required: true,
			description: 'The BitGo environment to use',
		},
	];
}