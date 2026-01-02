import { CompanionActionEvent } from '@companion-module/base'

import type { ModuleInstance } from './main.js'
export function UpdateActions(self: ModuleInstance): void {
	const sources = (self.settings?.values?.display_conf?.basic?.source || []).map((s: any) => ({
		id: s,
		label: s,
	}))

	self.setActionDefinitions({
		Set_Power: {
			name: 'Set Power State',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'ON', label: 'On' },
						{ id: 'OFF', label: 'Off' },
						{ id: 'TOGGLE', label: 'Toggle' },
					],
					default: 'ON',
				},
			],
			callback: async (event: CompanionActionEvent) => {
				let desired = event.options.state
				if (desired === 'TOGGLE') {
					if (self.state.device?.power === 'on') {
						desired = 'OFF'
					} else {
						desired = 'ON'
					}
				}
				const body = {
					devices: [{ mac: self.macAddress }],
					state: desired, // "ON" oder "OFF"
				}

				try {
					const res = await self._apiRequest('/api/v1/devices/power', body, 'POST')
					const data: any = res

					if (!data?.results || data.results.length === 0) {
						throw new Error('No results returned from power API')
					}

					const deviceResult = data.results[0]
					if (deviceResult.result !== 'ok') {
						throw new Error(`Device ${deviceResult.mac} failed: ${deviceResult.result}`)
					}

					console.log(`Power ${desired} result:`, data.results)
				} catch (err: any) {
					self.log('error', `Set Power ${desired} error: ${err.message || err}`)
					throw err
				}
			},
		},
		Set_Pannel_Status: {
			name: 'Set Panel Status',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'ON', label: 'On' },
						{ id: 'OFF', label: 'Off' },
						{ id: 'TOGGLE', label: 'Toggle' },
					],
					default: 'ON',
				},
			],
			callback: async (event: CompanionActionEvent) => {
				let desired = event.options.state
				if (desired === 'TOGGLE') {
					if (self.state.display?.display_conf?.basic?.panel_status === 'ON') {
						desired = 'OFF'
					} else {
						desired = 'ON'
					}
				}
				const body = {
					devices: [{ mac: self.macAddress }],
					settings: { display_conf: { basic: { panel_status: desired } } },
				}

				try {
					const res = await self._apiRequest('/api/v1/devices/settings/set', body, 'POST')
					const data: any = res

					if (!data?.results || data.results.length === 0) {
						throw new Error('No results returned from power API')
					}

					const deviceResult = data.results[0]
					if (deviceResult.result !== 'ok') {
						throw new Error(`Device ${deviceResult.mac} failed: ${deviceResult.result}`)
					}

					console.log(`Display Pannel ${desired} result:`, data.results)
				} catch (err: any) {
					self.log('error', `Set Display Pannel ${desired} error: ${err.message || err}`)
					throw err
				}
			},
		},
		Set_Input_Source: {
			name: 'Set Input Source',
			options: [
				{
					id: 'source',
					type: 'dropdown',
					label: 'Source',
					choices: sources.length > 0 ? sources : [{ id: 'HDMI1', label: 'HDMI1' }],
					default: sources[0] || 'HDMI1',
				},
			],
			callback: async (event: CompanionActionEvent) => {
				const body = {
					devices: [{ mac: self.macAddress }],
					settings: { display_conf: { basic: { source: event.options.source } } },
				}

				try {
					const res = await self._apiRequest('/api/v1/devices/settings/set', body,'POST')
					const data: any = res

					if (!data?.results || data.results.length === 0) {
						throw new Error('No results returned from API')
					}

					const deviceResult = data.results[0]
					if (deviceResult.result !== 'ok') {
						throw new Error(`Device ${deviceResult.mac} failed: ${deviceResult.result}`)
					}

					console.log(`Display Input Source ${event.options.source} result:`, data.results)
				} catch (err: any) {
					self.log('error', `Set Display Input Source ${event.options.source} error: ${err.message || err}`)
					throw err
				}
			},
		},
		//TODO:
		// Set_Volume
		// Set_Mute
		//
	})
}
