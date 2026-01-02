import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		// ===== Device / Power =====
		{ variableId: 'power', name: 'Power State (ON/OFF)' },
		{ variableId: 'device_name', name: 'Device Name' },
		{ variableId: 'model', name: 'Model' },
		{ variableId: 'ip', name: 'IP Address' },
		{ variableId: 'mac', name: 'MAC Address' },
		{ variableId: 'firmware', name: 'Firmware Version' },
		{ variableId: 'panel_status', name: 'Panel Status' },

		// ===== Source / Audio =====
		{ variableId: 'source', name: 'Current Source' },
		{ variableId: 'volume', name: 'Volume' },
		{ variableId: 'mute', name: 'Mute State' },
		{ variableId: 'sound_mode', name: 'Sound Mode' },

		// ===== Picture =====
		{ variableId: 'brightness', name: 'Brightness' },
		{ variableId: 'contrast', name: 'Contrast' },
		{ variableId: 'sharpness', name: 'Sharpness' },
		{ variableId: 'color', name: 'Color' },
		{ variableId: 'tint', name: 'Tint (G/R)' },
		{ variableId: 'color_tone', name: 'Color Tone' },
		{ variableId: 'color_temperature', name: 'Color Temperature' },
		{ variableId: 'picture_size', name: 'Picture Size' },

		// ===== Diagnosis =====
		{ variableId: 'panel_on_time', name: 'Panel On Time (Hours)' },
		{ variableId: 'temperature', name: 'Monitor Temperature (°C)' },

		// ===== Storage / System =====
		{ variableId: 'disk_free', name: 'Disk Space Available' },
		{ variableId: 'disk_used', name: 'Disk Space Used' },
	])
}