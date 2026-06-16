import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getBackendHost() {
	if (Platform.OS === 'web') {
		return 'localhost';
	}

	const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.developer?.hostUri;
	if (hostUri) {
		return hostUri.split(':')[0];
	}

	return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_BASE_URL = `http://${getBackendHost()}:4000`;