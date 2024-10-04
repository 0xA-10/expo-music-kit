import { KJUR } from "jsrsasign";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import MusicKit from "expo-music-kit";

import Player from "./Player";

import { appIdPrefix, keyId, privateKey } from "./secrets";

export const appName = "muphoria";
export const appBuild = "0.0.1";

const developerToken = KJUR.jws.JWS.sign(
	"ES256",
	JSON.stringify({
		alg: "ES256",
		typ: "JWT",
		kid: keyId,
	}),
	JSON.stringify({
		iss: appIdPrefix,
		iat: KJUR.jws.IntDate.get("now"),
		exp: KJUR.jws.IntDate.get("now + 1day"),
	}),
	privateKey,
);

const MUSIC_KIT_WEB_CONFIG: MusicKit.Configuration = {
	developerToken,
	app: {
		name: appName,
		build: appBuild,
	},
	bitrate: 256,
};

function Demo() {
	const [debug, setDebug] = useState("--");
	const [isAuthorized, setAuthorized] = useState(MusicKit.isAuthorized());

	const signIn = () => MusicKit.signIn().then((did) => did && setAuthorized(true));

	const signOut = () => MusicKit.signOut().then((did) => did && setAuthorized(false));

	return (
		<View style={styles.demo}>
			<Text style={{ fontWeight: "bold", fontSize: 24 }}>expo-music-kit</Text>

			<View style={styles.readout}>
				<Text>debug: {debug}</Text>
			</View>

			<View style={styles.signInAndOut}>
				{!isAuthorized ? (
					<Button title="Sign in with Apple Music" onPress={signIn} />
				) : (
					Platform.OS === "web" && <Button title="Sign out" onPress={signOut} />
				)}
			</View>

			<Player {...{ setDebug }} />
		</View>
	);
}

export default function App() {
	return (
		<View style={styles.container}>
			{/* Wrapper enables MusicKit on the web */}
			<MusicKit.JsProvider configuration={MUSIC_KIT_WEB_CONFIG}>
				<Demo />
			</MusicKit.JsProvider>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	demo: {
		alignItems: "center",
		gap: 50,
	},
	readout: {
		gap: 10,
	},
	signInAndOut: {
		gap: 10,
	},
});
