import ExpoModulesCore
import MusicKit
import Foundation

public class ExpoMusicKitModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoMusicKit")
        
        Function("isAuthorized") { () -> Bool in
            if #available(iOS 15.0, *) {
                return MusicAuthorization.currentStatus == MusicAuthorization.Status.authorized
            }
            return false
        }


        Function("isQueueEmpty") { () -> Bool in
            if #available(iOS 15.0, *) {
                return ApplicationMusicPlayer.shared.queue.entries.isEmpty
            }
            return false
        }
        
        Function("playbackStatus") { () -> String in
            if #available(iOS 15.0, *) {
                return String(describing: ApplicationMusicPlayer.shared.state.playbackStatus)
            }
            return ""
        }
        
        AsyncFunction("signIn") { () -> Bool in
            if #available(iOS 15.0, *) {
                let musicAuthorizationStatus = await MusicAuthorization.request()
                return musicAuthorizationStatus == MusicAuthorization.Status.authorized
            }
            return false
        }
        
        AsyncFunction("signOut") { () in
            // todo
        }
        
        AsyncFunction("search") { (type: String, searchTerm: String) -> String in
            if #available(iOS 15.0, *) {
                let response = try await MusicCatalogSearchRequest(term: searchTerm, types: [types[type]!.self]).response()

                return toJsonString(value: response) ?? ""
            }
            return ""
        }
        
        // todo: support more types and cleanup
        AsyncFunction("queueUp") { (type: String, id: String) in
            if #available(iOS 15.0, *) {
                if (type == "song") {
                    let song = try await MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: MusicItemID(id)).response().items[0]
                    ApplicationMusicPlayer.shared.queue = [song]
                    return
                }
                
                if (type == "album") {
                    let album = try await MusicCatalogResourceRequest<Album>(matching: \.id, equalTo: MusicItemID(id)).response().items[0]
                    ApplicationMusicPlayer.shared.queue = [album]
                    return
                }
            }
        }
        
        AsyncFunction("play") { () in
            if #available(iOS 16.0, *) {
                try await ApplicationMusicPlayer.shared.play()

                // There's a weird bug where the playbackStatus doesn't update until seemingly the next cycle sometimes?
                // Becomes a problem because in order to sync the playbackState to React, we use playbackStatus as a source of truth
                // So add an artificial 100ms delay to get around this weird idiosynchrocy and allow for playbackStatus to update before this
                // method exits
                // todo: maybe this should live in the typescript bridge?
                // todo: artificial debounce or a queue ? ? ? useQueueState ? ? ?
                if (ApplicationMusicPlayer.shared.state.playbackStatus != MusicPlayer.PlaybackStatus.playing) {
                    try await Task.sleep(for: .milliseconds(100))
                }
            }
        }

        Function("pause") { () in
            if #available(iOS 15.0, *) {
                ApplicationMusicPlayer.shared.pause()
            }
        }
        
        AsyncFunction("prev") { () in
            if #available(iOS 15.0, *) {
                try await ApplicationMusicPlayer.shared.skipToPreviousEntry()
            }
        }
        
        AsyncFunction("next") { () in
            if #available(iOS 15.0, *) {
                try await ApplicationMusicPlayer.shared.skipToNextEntry()
            }
        }
        
        Function("shuffleMode") { () -> String in
            if #available(iOS 15.0, *) {
                // todo: prevent optional
                return String(describing: ApplicationMusicPlayer.shared.state.shuffleMode)
            }
            return ""
        }
        Function("switchShuffleMode") { () in
            if #available(iOS 15.0, *) {
                ApplicationMusicPlayer.shared.state.shuffleMode = ApplicationMusicPlayer.shared.state.shuffleMode == MusicPlayer.ShuffleMode.off ? MusicPlayer.ShuffleMode.songs : MusicPlayer.ShuffleMode.off
            }
        }
        
        Function("loopMode") { () -> String in
            if #available(iOS 15.0, *) {
                // todo: prevent optional
                return String(describing: ApplicationMusicPlayer.shared.state.repeatMode)
            }
            return ""
        }
        Function("switchLoopMode") { () in
            if #available(iOS 15.0, *) {
                ApplicationMusicPlayer.shared.state.repeatMode = ApplicationMusicPlayer.shared.state.repeatMode == MusicPlayer.RepeatMode.none ? MusicPlayer.RepeatMode.one : ApplicationMusicPlayer.shared.state.repeatMode == MusicPlayer.RepeatMode.one ? MusicPlayer.RepeatMode.all : MusicPlayer.RepeatMode.none
            }
        }
    }
}

@available(iOS 15.0, *)
let types: [String : MusicCatalogSearchable.Type] = [
    "songs": Song.self,
    "albums": Album.self,
    "artists": Artist.self,
]

let jsonEncoder = JSONEncoder()

func toJsonString<T: Encodable>(value: T) -> String? {
    guard let jsonData = try? jsonEncoder.encode(value) else { return nil }
    let jsonText = String(data: jsonData, encoding: String.Encoding.utf8)

    return jsonText
}
