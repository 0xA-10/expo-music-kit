import { Queueable } from './MusicKit';
import { SearchableData, getKit, api } from './MusicKit.JsProvider';

/**
 * Web API
 *
 * Must be used in tandem with `<MusicKit.JsWrapper>` (see its doc).
 *
 * **Used as a source of truth for function signatures for all platforms**.
 * That means all platforms must conform to the function signatures found here.
 */
export default {
	isAuthorized: () => getKit().isAuthorized,

	isQueueEmpty: () =>
		// v1 types are desynced with v3 sdk
		(getKit() as unknown as { queue: { isEmpty: boolean } }).queue.isEmpty,

	playbackStatus: () => MusicKit.PlaybackStates[getKit().playbackState],

	signIn: async () => {
		try {
			await getKit().authorize();
			return true;
		} catch (err) {
			return false;
		}
	},

	signOut: async () => {
		try {
			await getKit().unauthorize();
			return true;
		} catch (err) {
			return false;
		}
	},

	play: () => getKit().play(),
	pause: () => getKit().pause(),
	prev: () => getKit().skipToNextItem(),
	next: () => getKit().skipToPreviousItem(),

	shuffleMode: () => (['off', 'songs'] as const)[getKit().shuffleMode],
	switchShuffleMode: () => {
		const flipped = Number(!Boolean(getKit().shuffleMode));

		getKit().shuffleMode = flipped as MusicKit.PlayerShuffleMode;
	},

	loopMode: () => (['none', 'one', 'all'] as const)[getKit().repeatMode],
	switchLoopMode: () => {
		const incremented = (getKit().repeatMode + 1) % 3;

		getKit().repeatMode = incremented as MusicKit.PlayerRepeatMode;
	},

	queueUp: (type: Queueable, id: string) => getKit().setQueue({ [type]: id }),

	search: async <const Type extends keyof SearchableData>(
		type: Type,
		searchTerm: string,
	) => {
		const { data } = await api(`/v1/catalog/{{storefrontId}}/search`, {
			searchTerm,
			types: [type],
		});

		return data;
	},
};
