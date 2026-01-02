import type { ModuleInstance } from './main.js'
import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	presets['toggle_power'] = {
		type: 'button',
		category: 'default',
		name: 'Toggle Power',
		style: {
			text: 'Toggle Power',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			show_topbar: true,
		},
		steps: [
			{
				down: [],
				up: [
					{
						actionId: 'Set_Power',
						options: {
							state: 'TOGGLE',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'PowerState',
				options: {
					state: 'on',
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
					text: 'Power: ON',
				},
			},
			{
				feedbackId: 'PowerState',
				options: {
					state: 'off',
				},
				style: {
					bgcolor: combineRgb(255, 0, 0),
					color: combineRgb(0, 0, 0),
					text: 'Power: OFF',
				},
			},
		],
	},
	presets['toggle_display_panel'] = {
		type: 'button',
		category: 'default',
		name: 'Toggle Display Panel',
		style: {
			text: 'Toggle Display Panel',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			show_topbar: true,
		},
		steps: [
			{
				down: [],
				up: [
					{
						actionId: 'Set_Panel_Status',
						options: {
							state: 'TOGGLE',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'PanelState',
				options: {
					state: 'ON',
				},
				style: {
					bgcolor: combineRgb(0, 255, 0),
					color: combineRgb(0, 0, 0),
					text: 'Panel: ON',
				},
			},
			{
				feedbackId: 'PanelState',
				options: {
					state: 'OFF',
				},
				style: {
					bgcolor: combineRgb(255, 0, 0),
					color: combineRgb(0, 0, 0),
					text: 'Panel: OFF',
				},
			},
		],
	}

	self.setPresetDefinitions(presets)
}
