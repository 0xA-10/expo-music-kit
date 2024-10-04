// MusicKit.js Provider wrapper component
// Injects the hosted Apple MusicKit script into the DOM using the provided configuration

import React, { PropsWithChildren, useInsertionEffect, useState } from 'react';
import { Platform } from 'react-native';

export default ({
	configuration,
	children,
}: { configuration: MusicKit.Configuration } & PropsWithChildren) => {
	if (Platform.OS === 'web') {
		const [musicKitJsLoaded, setMusicKitJsLoaded] = useState(false);

		useInsertionEffect(() => {
			initializeWeb(configuration, (musicKitInstance) => {
				kit = musicKitInstance;

				// Inline destructuring assignment, isn't that neat?
				({ music: musicV3 } = musicKitInstance.api as MusicKit.API & {
					music: MusicV3;
				});

				setMusicKitJsLoaded(true);
			});
		}, []);

		if (!musicKitJsLoaded) {
			return;
		}
	}

	return <>{children}</>;
};

function initializeWeb(
	configuration: MusicKit.Configuration,
	callback: (musicKitInstance: MusicKit.MusicKitInstance) => any,
) {
	document.addEventListener('musickitloaded', async () => {
		try {
			// in v3 `configure` is now async
			//
			// see https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/tech-notes-migrating-to-v3--page#migrating-to-musickit-on-the-web-3
			await MusicKit.configure(configuration);

			callback(MusicKit.getInstance());
		} catch (err) {
			console.error(`Error initializing MusicKit.js:

${err}`);
		}
	});

	// Load `musickit.js` using DOM Manipulation
	// This ensures the script does not load before event listener is registered (e.g. bundle loads after)
	// This also makes things easier with Expo (i.e. don't need to customize index.html or babel or webpack)
	// Not ideal by any means, please don't use this in production without verifying it's not exploitable
	// todo: not prod ready
	var script = document.createElement('script');
	script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
	document.getElementsByTagName('head')[0].appendChild(script);
}

// in V3 the player API has been flattened to the top level of the kit
// see https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/tech-notes-migrating-to-v3--page#migrating-to-musickit-on-the-web-3
// type KitInstanceV3 = Omit<MusicKit.MusicKitInstance, 'player'> & MusicKit.Player;
type KitInstanceV3 = MusicKit.Player &
	Omit<MusicKit.MusicKitInstance, 'player'>;

/**
 * The shared MusicKit instance singleton
 */
let kit: MusicKit.MusicKitInstance | null = null;
export const getKit = () => {
	assertKitInstance(kit);
	return kit as unknown as KitInstanceV3;
};

function assertKitInstance(
	kit: MusicKit.MusicKitInstance | null,
): asserts kit is MusicKit.MusicKitInstance {
	if (!kit) throw new Error('MusicKitJS is not initialized.');
}

// @types/musickit-js are v1, but the actual script used is the later v3
// Manually type the MusicKit API pass through
// see https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/reference-javascript-api--page#passthrough-api-method-signature
interface MusicV3 {
	<const Types extends Array<keyof SearchableData>>(
		path: string,
		queryParameters?: Record<string, any>,
		options?: { fetchOptions?: any },
	): Promise<{
		data: {
			results: {
				[Key in Types[number]]: { data: Array<SearchableData[Key]> };
			};
		};
	}>;
}

let musicV3: MusicV3 | null = null;
const getMusicV3 = <const Types extends Array<keyof SearchableData>>(
	...args: Parameters<MusicV3>
) => {
	assertMusicV3(musicV3);
	return musicV3<Types>(...args);
};

function assertMusicV3(music: MusicV3 | null): asserts music is MusicV3 {
	if (!music) throw new Error('MusicV3 is not initialized.');
}

/**
 * The shared Apple Music API instance singleton with added convenience
 */
export const api = <const Types extends Array<keyof SearchableData>>(
	path: Parameters<MusicV3>[0],
	{ searchTerm, types }: { searchTerm: string; types?: Types },
) =>
	getMusicV3<Types>(path, {
		term: searchTerm,
		...(types && { types }),
	});

export type SearchableData = {
	albums: MusicKit.Albums;
	artists: MusicKit.Artists;
	songs: MusicKit.Songs;
	playlists: MusicKit.Playlists;
	'music-videos': MusicKit.MusicVideos;
};
