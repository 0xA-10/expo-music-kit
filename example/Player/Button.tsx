import { Pressable, Text } from "react-native";

export default function PlayerButton({
	icon,
	onPress,
	mode = 0,
}: {
	icon: "⏪" | "▶️" | "⏸️" | "⏩" | "🔀" | "🔁";
	onPress: () => void | Promise<void>;
	mode?: 0 | 1 | 2;
}) {
	const { [mode]: circleIcon } = [null, "●", "○"]; // destructuring is nifty, eh? Though I realize not the most intuitive at first glance

	const fontSize = 64;
	const circleFontSize = fontSize / 4;

	return (
		<Pressable {...{ onPress }}>
			<Text
				style={{
					fontSize,
					width: fontSize + 2, // web emojis are fontSize wide but ios emojis are fontSize tall and can be oblong, add 2 margin to compensate for wider ios emojis
					height: fontSize + 2,
					// ...('▶️' == icon && { textIndent: 6 }), // play icon renders as unicode on the web instead of an emoji, indent it such that it's centered. text-indent is implicitly web only too :D
					...noTouch,
				}}
			>
				{icon}
			</Text>

			{circleIcon && (
				<Text
					style={{
						fontSize: circleFontSize,
						position: "absolute",
						top: fontSize + 20,
						left: fontSize / 2 - (circleFontSize - 2) / 2,
						...noTouch,
					}}
				>
					{circleIcon}
				</Text>
			)}
		</Pressable>
	);
}

/**
 * Prevents text (used in buttons) from highlighting on double click on the web
 */
const noTouch = {
	WebkitUserSelect: "none" /* Safari */,
	MsUserSelect: "none" /* IE 10 and IE 11 */,
	userSelect: "none" /* Standard syntax */,
};
