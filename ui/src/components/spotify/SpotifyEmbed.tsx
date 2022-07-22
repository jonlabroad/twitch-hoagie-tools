export interface SpotifyEmbedProps {
    songId: string
}

export const SpotifyEmbed = (props: SpotifyEmbedProps) => (
    <iframe
        style={{borderRadius: "12px"}}
        src={props.songId ? `https://open.spotify.com/embed/track/${props.songId}?utm_source=generator&theme=0` : "https://open.spotify.com/embed/track/2pglXFb3SXqmEDV2dV8CbT?utm_source=generator&theme=0"}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
    </iframe>
);
