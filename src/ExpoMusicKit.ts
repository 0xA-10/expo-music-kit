import { requireNativeModule } from 'expo-modules-core';
import { type default as ExpoMusicKitWeb } from './ExpoMusicKit.web';

/**
 * Unless explicitly overridden in `MusicKit.ts`, all platforms should share the same function signatures.
 * Therefore, we can use the (locally available) web module's types as the source of truth.
 */
export default requireNativeModule('ExpoMusicKit') as typeof ExpoMusicKitWeb;
