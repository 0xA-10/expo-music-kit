import { Platform } from 'react-native';
import JsProvider, { SearchableData } from './MusicKit.JsProvider';
import ExpoMusicKit from './ExpoMusicKit';

export default {
	// Export everything
	...ExpoMusicKit,

	//
	// Bridges
	//

	isPlaying: () => {
		// todo: ios build error "Property 'MusicKit' doesn't exist"
		// const playing = MusicKit.PlaybackStates[
		// 	MusicKit.PlaybackStates.playing
		// ] as 'playing';

		return ExpoMusicKit.playbackStatus() === 'playing';
	},

	shuffleModeIndex: () =>
		['off', 'songs'].indexOf(ExpoMusicKit.shuffleMode()) as 0 | 1,
	loopModeIndex: () =>
		['none', 'one', 'all'].indexOf(ExpoMusicKit.loopMode()) as 0 | 1 | 2,

	//
	// Overrides
	//

	signIn: () => {
		// todo:
		// when user declines on first prompt (iOS) use openSettingsURL (see https://fluffy.es/open-settings-app/)
		// 								 or on second prompt (Android) use ? (see ?)
		// to navigate the user to the settings app to enable MusicKit permission
		//
		// The native method's response should indicate whether show a "Navigate to settings" prompt
		// Then, we can write prompt in React and have it hook into a separate library for figuring out the settings opening text and button
		return ExpoMusicKit.signIn();
	},

	queueUp: (type: Queueable) => (id: string) => ExpoMusicKit.queueUp(type, id),

	search: async <const Types extends Array<keyof SearchableData>>(
		types: Types,
		searchTerm: string,
	) => {
		const dataPairs = await Promise.all(
			// If the API's `types` query parameter wasn't broken then we wouldn't need to do this
			types.map((type) =>
				ExpoMusicKit.search(type, searchTerm)
					.then(parseJsonExceptOnWeb)
					.then(pairWithData(type)),
			),
		);

		return Object.fromEntries(dataPairs) as {
			[Type in Types[number]]: Array<SearchableData[Type]>;
		};
	},

	// Pass through methods for native compatibility with currying

	play: () => ExpoMusicKit.play(),
	pause: () => ExpoMusicKit.pause(),
	prev: () => ExpoMusicKit.prev(),
	next: () => ExpoMusicKit.next(),

	//
	// React wrapper component for MusicKit.js script loading
	//

	/**
	 * **Usage is required to enable MusicKit on the web.**
	 *
	 * Place this wrapper before the first usage of the module in your React tree to initialize
	 * Apple’s hosted version of MusicKit on the web.
	 *
	 * Because the web initialization is asynchronous, any **calls to the module on the web must be made
	 * from a component inside the wrapper** (though not necesarrily as a direct child).
	 * It only needs to be initialized once, so **this wrapper should only ever be used once** in your app!
	 *
	 * On the web, rendering children is disabled until initialization completes.
	 * On other platforms, children pass directly through the wrapper as if it doesn't exist, therefore leaving rendering unaffected.
	 *
	 * @example
	 *	import MusicKit from 'expo-music-kit';
	 *
	 * // Enable MusicKit on the web
	 *	export default function App() {
	 *		return (
	 *			<View style={styles.container}>
	 *				<MusicKit.JsWrapper>
	 *					<Demo />
	 *				</MusicKit.JsWrapper>
	 *			</View>
	 *		);
	 *	}
	 */
	JsProvider,
};

export type Queueable = 'song' | 'album';

const parseJsonExceptOnWeb = <T>(res: T): T =>
	Platform.OS !== 'web' ? JSON.parse(res as string) : res;

const pairWithData =
	<const Type extends keyof SearchableData>(type: Type) =>
	(data: Awaited<ReturnType<typeof ExpoMusicKit.search<Type>>>) =>
		[type, data.results[type].data] as const;
