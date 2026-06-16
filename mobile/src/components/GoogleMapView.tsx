import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  from: string;
  to: string;
  height?: number;
  userLat?: number;
  userLng?: number;
}

export default function GoogleMapView({ from, to, height = 200, userLat, userLng }: Props) {
  /* URL Google Maps embed gratuit — affiche l'itinéraire sans clé API */
  const origin      = encodeURIComponent(`${from}, Maroc`);
  const destination = encodeURIComponent(`${to}, Maroc`);
  const mapUrl      = `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&output=embed`;

  return (
    <View style={[s.wrapper, { height }]}>
      <WebView
        source={{ uri: mapUrl }}
        style={s.map}
        startInLoadingState
        renderLoading={() => (
          <View style={s.loader}>
            <ActivityIndicator size="large" color="#C1272D" />
            <Text style={s.loaderTxt}>Chargement Google Maps…</Text>
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        scrollEnabled={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#f0ede8' },
  map:     { flex: 1 },
  loader:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loaderTxt: { fontSize: 13, color: '#888' },
});