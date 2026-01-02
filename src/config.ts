import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	macadress: string
	use_https: boolean
	login_id: string
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'macadress',
			label: 'MAC Address',
			width: 8,
			regex: Regex.MAC_ADDRESS,
		},
		{
			type: 'checkbox',
			id: 'use_https',
			label: 'Use HTTPS',
			default: true,
			width: 4,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 4,
			default: '4000',
			regex: Regex.PORT,
		},
		{
			type: 'textinput',
			id: 'login_id',
			label: 'Login ID',
			width: 6,
			default: 'admin',
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 6,
			regex: Regex.SOMETHING,
		},
	]
}
