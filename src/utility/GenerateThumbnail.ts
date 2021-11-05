
const spawn = require("child_process").spawn,
  config = require("../config/stream_default"),
  cmd = config.rtmp_server?.trans.ffmpeg;

export const generateStreamThumbnail = (stream_key: any) => {
  const args = [
    "-y",
    "-i",
    `${process.env.HOST}:8888/live/${stream_key}/index.m3u8`,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    "-vf",
    "scale=-2:300",
    "Livestreaming/thumbnails/" + stream_key + ".png",
  ];

  spawn(cmd, args, {
    detached: true,
    stdio: "ignore",
  }).unref();
};
