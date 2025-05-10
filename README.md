# [wip] expo-music-kit

> [!NOTE]
> Updates to Expo and iOS since creating this repo have rendered it incompatible with newer iOS. Recommendation to developers would be to start a fresh Expo Module and migrate over code from this repo, making minor adjustments as necessary.

Apple MusicKit for React Native/Expo. Supports iOS and Web platforms.

Integrates [MusicKit on the Web](https://js-cdn.music.apple.com/musickit/v3/docs) and native [MusicKit](https://developer.apple.com/documentation/musickit).

https://github.com/user-attachments/assets/5a686c0c-17eb-4679-b847-c8e63150e528

## Usage

> [!WARNING]
> This package is not yet available on npm.
> 
> Also, in the current development-only implementation, **the Web API is loaded through script injection**. This is _probably_ not a great idea for a production application.

From [example/App.tsx](example/App.tsx):

```ts
import MusicKit from "expo-music-kit";
import { KJUR } from "jsrsasign";

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

const MUSIC_KIT_JS_CONFIG: MusicKit.Configuration = {
	developerToken,
	app: {
		name: appName,
		build: appBuild,
	},
	bitrate: 256,
};

export default function App() {
	return (
		<View style={styles.container}>
			{/* Wrapper enables MusicKit on the web */}
			<MusicKit.JsProvider configuration={MUSIC_KIT_JS_CONFIG}>
				<Demo />
			</MusicKit.JsProvider>
		</View>
	);
}
```

### API

| API |
| --- |
| playbackStatus() |
| isPlaying() |
| isQueueEmpty() |
| async signIn() |
| async signOut() |
| isAuthorized() |
| async play() |
| pause() |
| async prev() |
| async next() |
| shuffleMode() |
| shuffleModeIndex() |
| switchShuffleMode() |
| loopMode() |
| loopModeIndex() |
| switchLoopMode() |
| async queueUp(type: "song" \| "album", id: string) |
| async search(type: "songs" \| "albums", searchTerm: string) |


## Development 

MusicKit is not available on the iOS simulator, it can only be tested on an actual iOS device.
