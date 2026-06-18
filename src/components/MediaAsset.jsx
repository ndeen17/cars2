const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i

export default function MediaAsset({ src, alt = '', style = {} }) {
  if (VIDEO_EXT.test(src)) {
    return <video src={src} autoPlay loop muted playsInline style={style} />
  }
  return <img src={src} alt={alt} style={style} />
}
