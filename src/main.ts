import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'

import got from 'got' //http library
import https from 'https' //https library

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()

	public _samsung_token?: string
	//private _samsung_token_expiry?: number
	public _samsung_refresh_timer?: NodeJS.Timeout
	public macAddress?: string

	public state: {
		device?: any
		info?: any
		display?: any
	} = {}

	public settings: {
		items?: any
		values?: any
	} = {}

	constructor(internal: unknown) {
		super(internal)
	}

	_updateVariableValues(): void {
		const device = this.state.device
		const info = this.state.info
		const display = this.state.display

		if (!info || !display) return

		this.setVariableValues({
			// ===== Device / Power =====
			power: device.power ?? '-',
			device_name: device.name ?? '-',
			model: device.model ?? '-',
			ip: device.ipaddr ?? '-',
			mac: device.mac ?? '-',
			firmware: info.device_conf?.general?.firmware_version ?? '-',
			panel_status: display.display_conf?.basic?.panel_status ?? '-',

			// ===== Source / Audio =====
			source: device.source ?? '-',
			volume: display.display_conf?.basic?.volume ?? '-',
			mute: display.display_conf?.basic?.mute ?? '-',
			sound_mode: display.display_conf?.sound?.mode ?? '-',

			// ===== Picture =====
			brightness: display.picture_video?.brightness ?? '-',
			contrast: display.picture_video?.contrast ?? '-',
			sharpness: display.picture_video?.sharpness ?? '-',
			color: display.picture_video?.color ?? '-',
			tint: display.picture_video?.tint ?? '-',
			color_tone: display.picture_video?.color_tone ?? '-',
			color_temperature: display.picture_video?.color_temperature ?? '-',
			picture_size: display.picture_video?.size ?? '-',

			// ===== Diagnosis =====
			panel_on_time: info.display_conf?.diagnosis?.panel_on_time ?? '-',
			temperature: info.display_conf?.diagnosis?.monitor_temperature ?? '-',

			// ===== Storage / System =====
			disk_free: info.device_conf?.system_info?.disk_space_available ?? '-',
			disk_used: info.device_conf?.system_info?.disk_space_usage ?? '-',
		})
	}

	//Default API Request
	_baseUrl(): string {
		const scheme = this.config && this.config.use_https === true ? 'https' : 'http'
		const host = (this.config && this.config.host) || ''
		const port = this.config && this.config.port ? `:${this.config.port}` : ''
		if (!host) return ''
		return `${scheme}://${host}${port}`
	}

	_agent(): { https: https.Agent } {
		// Self-signed Zertifikate zulassen
		return { https: new https.Agent({ rejectUnauthorized: false }) }
	}

	async _defaultapirequest(
		urlsuffix: string,
		body?: Record<string, unknown>,
		additionaloptions: any = {},
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
	): Promise<any> {
		//URL zusammenbauen
		const base = this._baseUrl()
		if (!base) throw new Error('Host not configured')
		const url = `${base}${urlsuffix}`

		//Optionen zusammenbauen
		const options: any = {
			method,
			timeout: { request: 7000 },
			throwHttpErrors: false,
			agent: this._agent(),
			headers: {
				Authorization: this._samsung_token, // nur Token
				Accept: 'application/json',
			},
			responseType: 'json',

			...additionaloptions,
		}

		if (body && method !== 'GET') {
			options.json = body
		}

		//console.log('API Request to', url)
		//console.log('Options:', options)

		try {
			const res = await got(url, options)

			if (res.statusCode >= 400) {
				const err: any = new Error(`Api Request failed ${res.statusCode}`)
				err.status = res.statusCode
				err.data = res.body
				throw err
			}
			return res.body
		} catch (err: any) {
			this.log('error', `Error: ${err.message || err}`)
			throw err
		}
	}
	//Feedbacks and Variables
	async fetchDeviceState(): Promise<void> {
		const res_device = await this._defaultapirequest(`/api/v1/devices`, undefined, undefined, 'GET')
		this.state.device = res_device.devices?.find(
			(d: any) => d.mac && d.mac.toLowerCase() === this.macAddress?.toLowerCase(),
		)
		//console.log('Using Device:', this.state.device)

		const res_info = await this._defaultapirequest(
			`/api/v1/devices/settings/info?mac=${this.macAddress}`,
			undefined,
			undefined,
			'GET',
		)
		this.state.info = res_info
		//console.log('Display Info:', res_info)

		const res_display = await this._defaultapirequest(
			`/api/v1/devices/settings/display?mac=${this.macAddress}`,
			undefined,
			undefined,
			'GET',
		)
		this.state.display = res_display
		//console.log('Display Status:', res_display)

		this._updateVariableValues()
		this.checkFeedbacks()
	}

	async fetchDeviceSettings(): Promise<void> {
		const res_settings = await this._defaultapirequest(
			`/api/v1/devices/settings/config?mac=${this.macAddress}`,
			undefined,
			undefined,
			'GET',
		)
		this.settings.items = res_settings.items
		this.settings.values = res_settings.values
		//console.log('Display Settings:', res_settings)

		this.updateActions()
	}

	// Polling starten ?? - ist das best practice?
	pollTimer?: NodeJS.Timeout
	startPolling(): void {
		if (this.pollTimer) return

		this.pollTimer = setInterval(() => {
			void this.fetchDeviceState().catch(() => {
				this.log('warn', 'Polling failed')
			})
		}, 2000)
	}

	// Login
	async login(): Promise<void> {
		const id = this.config?.login_id ?? 'admin'
		const password = this.config?.password
		if (!password) throw new Error('Password not set in module config')

		const base = this._baseUrl()
		if (!base) throw new Error('Host not configured')
		const url = `${base}/api/v1/auth/login`

		const options: any = {
			method: 'POST',
			json: { id, password },
			timeout: { request: 7000 },
			throwHttpErrors: false,
			//https: { rejectUnauthorized: false }, // Self-signed Zertifikate erlauben
			agent: this._agent(),
		}

		this.log('debug', `Login to ${url}`)

		try {
			const res = await got(url, options)

			let data: any = null
			if (res.body) {
				try {
					data = JSON.parse(res.body)
				} catch (_e) {
					// fallback: leave data as null
				}
			}

			if (res.statusCode >= 400) {
				const err: any = new Error(`Login failed ${res.statusCode}`)
				err.status = res.statusCode
				err.data = data
				throw err
			}

			if (!data?.access_token) {
				throw new Error('Login did not return access_token')
			}

			// Token speichern
			this._samsung_token = data.access_token
			const expires = data.expires_in ? Number(data.expires_in) : 86400
			//this._samsung_token_expiry = Date.now() + expires * 1000

			this.log('info', 'Login succeeded')
			this.log('debug', 'Token is ' + data.access_token + ', expires in ' + expires + ' seconds')
			try {
				this.updateStatus(InstanceStatus.Ok, 'Connected')
			} catch (_e) {
				// ignored
			}

			// Token-Refresh planen
			const refreshInMs = Math.max(10000, expires * 1000 - 30000)
			if (this._samsung_refresh_timer) clearTimeout(this._samsung_refresh_timer)
			this._samsung_refresh_timer = setTimeout(() => {
				this.log('debug', 'Refreshing token before expiry')
				this.login().catch((err: any) => {
					this.log('error', `Token refresh failed: ${err.message || err}`)
					try {
						this.updateStatus(InstanceStatus.AuthenticationFailure, `Authentication failure: ${err.message || err}`)
					} catch (_e) {
						// ignored
					}
				})
			}, refreshInMs)
		} catch (err: any) {
			this.log('error', `Login error: ${err.message || err}`)
			try {
				this.updateStatus(InstanceStatus.ConnectionFailure, `Connection failure: ${err.message || err}`)
			} catch (_e) {
				// ignored
			}
			throw err
		}
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		if (!this.config.macadress) {
			this.updateStatus(InstanceStatus.BadConfig, 'MAC address not set')
			this.log('warn', 'MAC address missing – waiting for user configuration')
			return
		}

		this.macAddress = this.config.macadress.replace(/:/g, '-').toLowerCase()

		this.log('info', `Using MAC Address: ${this.macAddress}`)

		// Initialize Variables
		this.setVariableValues({
			// Device / Power
			power: 'UNKNOWN',
			device_name: '-',
			model: '-',
			ip: '-',
			mac: this.macAddress,
			firmware: '-',
			panel_status: '-',

			// Source / Audio
			source: '-',
			volume: '-',
			mute: '-',
			sound_mode: '-',

			// Picture
			brightness: '-',
			contrast: '-',
			sharpness: '-',
			color: '-',
			tint: '-',
			color_tone: '-',
			color_temperature: '-',
			picture_size: '-',

			// Diagnosis
			panel_on_time: '-',
			temperature: '-',

			// Storage / System
			disk_free: '-',
			disk_used: '-',
		})

		// Initial login
		try {
			this.log('info', 'Starting login')
			await this.login().catch((err) => {
				this.log('error', `Login failed: ${err.message || err}`)
			})
		} catch (_e) {
			this.login().catch((err) => {
				this.log('error', `Login failed: ${err.message || err}`)
			})
		}
		await this.fetchDeviceSettings()
		this.startPolling()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.init(config)
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
