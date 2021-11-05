import NodeMediaServer from "node-media-server";
import { config } from "./src/config/stream_default";
import { User } from "./src/models";
import { generateStreamThumbnail } from "./src/utility";

const configStreamServer = config.rtmp_server;

const nms = new NodeMediaServer(configStreamServer);

nms.on("prePublish", async (id: any, StreamPath: any, args: any) => {
  let stream_key = getStreamKeyFromStreamPath(StreamPath);
  console.log(
    "[NodeEvent on prePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  User.findOne({ stream_key: stream_key }, (err: any, user: any) => {
    if (!err) {
      if (!user) {
        let session = nms.getSession(id);
        session.reject();
      } else {
        generateStreamThumbnail(stream_key);
      }
    }
  });
});

const getStreamKeyFromStreamPath = (path: any) => {
  let parts = path.split("/");
  return parts[parts.length - 1];
};

module.exports = nms;
