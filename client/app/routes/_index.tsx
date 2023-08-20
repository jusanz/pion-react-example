import type { V2_MetaFunction } from "@remix-run/node";
import { useRef, useEffect, useState } from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Play from disk renegotiation" },
    { name: "description", content: "Play from disk renegotiation" },
  ];
};

export default function Index() {
  // states
  const [logs, setLogs] = useState<string>("");

  // refs
  const videoDivRef = useRef<HTMLDivElement>(null);
  const activeVideosRef = useRef<number>(0);
  const pcRef = useRef<RTCPeerConnection | undefined>(undefined);

  const log = (msg: string) => {
    const now = new Date();
    setLogs(
      logs +
        `(${now.toLocaleDateString()} ${now.toLocaleTimeString()}) ${msg}` +
        "<br />"
    );
  };

  const doSignaling = (method: string) => {
    pcRef.current
      ?.createOffer()
      .then((offer) => {
        pcRef.current?.setLocalDescription(offer);

        return fetch(`http://localhost:8080/${method}`, {
          method: "POST",
          mode: "cors",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(offer),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => pcRef.current?.setRemoteDescription(res))
      .catch(log);
  };

  let forStrictModeFlag = false;
  useEffect(() => {
    if (forStrictModeFlag) return;

    /* main function */
    log("Initializing Pion WebRTC");

    pcRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    } as any);
    if (typeof pcRef.current === "undefined") {
      return;
    }
    pcRef.current.ontrack = (event) => {
      var el = document.createElement(event.track.kind) as HTMLVideoElement;
      el.srcObject = event.streams[0];
      el.autoplay = true;
      el.controls = true;

      event.track.onmute = (_) => {
        el.parentNode?.removeChild(el);
      };

      log("Append Video Element");
      videoDivRef.current?.appendChild(el);
    };

    pcRef.current.createDataChannel("noop");

    doSignaling("createPeerConnection");

    forStrictModeFlag = true;
  }, []);

  const addVideo = () => {
    if (typeof pcRef.current === "undefined") {
      return;
    }
    if (pcRef.current.getTransceivers().length <= activeVideosRef.current) {
      pcRef.current.addTransceiver("video");
      activeVideosRef.current = activeVideosRef.current + 1;
    }

    doSignaling("addVideo");
  };

  const removeVideo = () => {
    doSignaling("removeVideo");
  };

  return (
    <div className="w-full px-10 py-10">
      <button
        className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={addVideo}
      >
        Add Video
      </button>
      <br />
      <button
        className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={removeVideo}
      >
        Remove Video
      </button>
      <br />
      <h3> Video </h3>
      <div ref={videoDivRef}></div>
      <h3> Logs </h3>
      <div>
        <p dangerouslySetInnerHTML={{ __html: logs }}></p>
      </div>
    </div>
  );
}
