import { Platform } from 'react-native';

// Android emulator → 10.0.2.2 maps to host localhost
// iOS simulator   → localhost works directly
// Physical device → replace with your machine's LAN IP
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:4000',
  ios:     'http://localhost:4000',
  default: 'http://10.0.2.2:4000',
}) as string;

