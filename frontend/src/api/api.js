import axios from 'axios'
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../utils/constants'

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
})

let currentAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

export function setAccessToken(token) {
	currentAccessToken = token
}

api.interceptors.request.use((config) => {
	if (currentAccessToken) {
		config.headers.Authorization = `Bearer ${currentAccessToken}`
	}
	return config
})

export async function registerRequest(payload) {
	const { data } = await api.post('/auth/register/', payload)
	return data
}

export async function loginRequest(payload) {
	const { data } = await api.post('/auth/login/', payload)
	return data
}

export async function fetchChapters() {
	const { data } = await api.get('/chapters/')
	return data
}

export async function submitRecommendationPayload(payload) {
	const { data } = await api.post('/recommend/', payload)
	return data
}
