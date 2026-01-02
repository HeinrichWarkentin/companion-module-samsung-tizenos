import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		// ========================
		// POWER
		// ========================
		PowerState: {
			name: 'Monitor Power State',
			type: 'boolean',
			description: 'True when monitor power matches selected state',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'Power State',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
					],
					default: 'on',
				},
			],
			callback: (feedback) => {
				const power = self.state?.device?.power
				if (!power) return false

				return String(power).toUpperCase() === String(feedback.options.state).toUpperCase()
			},
		},

		PanelState: {
			name: 'Monitor Pannel State',
			type: 'boolean',
			description: 'True when monitor panel matches selected state',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'Panel State',
					choices: [
						{ id: 'ON', label: 'On' },
						{ id: 'OFF', label: 'Off' },
					],
					default: 'ON',
				},
			],
			callback: (feedback) => {
				const power = self.state?.display?.display_conf?.basic?.panel_status
				if (!power) return false

				return String(power).toUpperCase() === String(feedback.options.state).toUpperCase()
			},
		},

		MuteState: {
			name: 'Mute State',
			type: 'boolean',
			description: 'True when monitor is muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'Mute',
					choices: [
						{ id: 'ON', label: 'Muted' },
						{ id: 'OFF', label: 'Unmuted' },
					],
					default: 'ON',
				},
			],
			callback: (feedback) => {
				const mute = self.state?.display?.basic?.mute
				if (!mute) return false

				return String(mute).toUpperCase() === String(feedback.options.state).toUpperCase()
			},
		},

		// ========================
		// SOURCE
		// ========================

		SourceState: {
			name: 'Input Source',
			type: 'boolean',
			description: 'True when selected input source is active',
			defaultStyle: {
				bgcolor: combineRgb(0, 100, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'source',
					type: 'dropdown',
					choices: [
						{ id: 'HDMI1', label: 'HDMI1' },
						{ id: 'HDMI2', label: 'HDMI2' },
						{ id: 'HDMI3', label: 'HDMI3' },
						{ id: 'HDMI4', label: 'HDMI4' },
						{ id: 'DISPLAY_PORT', label: 'DisplayPort' },
						{ id: 'INTERNAL/USB', label: 'Internal/USB' },
						{ id: 'WEB_BROWSER', label: 'Web Browser' },
						{ id: 'MAGICINFO_S', label: 'MagicInfo S' },
					],
					label: 'Source (e.g. HDMI1)',
					default: 'HDMI1',
				},
			],
			callback: (feedback) => {
				const source = self.state?.display?.basic?.source
				if (!source) return false

				return String(source).toUpperCase() === String(feedback.options.source).toUpperCase()
			},
		},

		// ========================
		// DIAGNOSIS
		// ========================

		TemperatureAbove: {
			name: 'Temperature above °C',
			type: 'boolean',
			description: 'True when monitor temperature exceeds value',
			defaultStyle: {
				bgcolor: combineRgb(255, 69, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'temp',
					type: 'number',
					label: 'Temperature ≥ °C',
					default: 60,
					min: 0,
					max: 100,
				},
			],
			callback: (feedback) => {
				const temp = Number(self.state?.info?.display_conf?.diagnosis?.monitor_temperature)
				if (isNaN(temp)) return false

				return temp >= Number(feedback.options.temp)
			},
		},

		// ========================
		// SYSTEM
		// ========================

		DeviceOnline: {
			name: 'Device Online',
			type: 'boolean',
			description: 'True when device data is available',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return !!self.state?.display
			},
		},
	})
}
