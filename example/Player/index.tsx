import { Button, StyleSheet, View } from "react-native";
import { useState } from "react";

import MusicKit, { Queueable } from "expo-music-kit";

import PlayerButton from "./Button";

export default function Player({ setDebug }: { setDebug: React.Dispatch<React.SetStateAction<string>> }) {
	const songTitle = "all my exes live in texas";
	const defaultButtonTitle = `Play "${songTitle}"`;

	const [buttonTitle, setButtonTitle] = useState(defaultButtonTitle);
	const [isPlaying, setPlaying] = useState(MusicKit.isPlaying());
	const [shuffleMode, setShuffleMode] = useState(MusicKit.shuffleModeIndex());
	const [loopMode, setLoopMode] = useState(MusicKit.loopModeIndex());

	const syncPlayingState = () => setPlaying(() => MusicKit.isPlaying());
	const syncShuffleState = () => setShuffleMode(() => MusicKit.shuffleModeIndex());
	const syncLoopState = () => setLoopMode(() => MusicKit.loopModeIndex());

	const play = async () => {
		setPlaying(true);

		await MusicKit.play();

		syncPlayingState();
	};

	const pause = () => {
		setPlaying(false);

		MusicKit.pause();
	};

	const next = () => MusicKit.next().then(syncPlayingState);

	const prev = () => MusicKit.prev().then(syncPlayingState);

	const switchShuffleMode = () => {
		MusicKit.switchShuffleMode();

		syncShuffleState();
	};

	const switchLoopMode = () => {
		MusicKit.switchLoopMode();

		syncLoopState();
	};

	const queueAndPlay =
		<Type extends Queueable>(type: Type, name: string) =>
		async () => {
			setButtonTitle(() => `Searching for ${type} ${name}...`);

			await MusicKit.search([`${type}s`], name)
				.then(({ [`${type}s` as `${Type}s`]: [firstItem] }) => firstItem.id)
				.then((id) => {
					setButtonTitle(() => `Queueing up ${type} ${id}...`);
					return id;
				})
				.then(MusicKit.queueUp(type))
				.then(() => setButtonTitle(() => `Playing ${type}...`))
				.then(play)
				.then(() => setButtonTitle(() => defaultButtonTitle))
				.catch((err) => setDebug(err.message));
		};

	return (
		<View style={styles.player}>
			<Button
				title={buttonTitle}
				onPress={queueAndPlay("song", songTitle)}
				disabled={buttonTitle !== defaultButtonTitle}
			/>

			<View style={styles.playerButtons}>
				{/* prettier-ignore */}
				<PlayerButton mode={shuffleMode} icon="🔀" onPress={switchShuffleMode} />

				<PlayerButton icon="⏪" onPress={prev} />

				{isPlaying ? <PlayerButton icon="⏸️" onPress={pause} /> : <PlayerButton icon="▶️" onPress={play} />}

				<PlayerButton icon="⏩" onPress={next} />

				<PlayerButton mode={loopMode} icon="🔁" onPress={switchLoopMode} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	player: {
		alignItems: "center",
		gap: 50,
	},
	playerButtons: {
		flexDirection: "row",
		gap: 5,
	},
});
