import { UncontrolledPlyr, createPlyr } from "solid-plyr";
import { createEffect } from "solid-js";
import animalsUrl from "./assets/animals.mp4"

const SOURCE = {
  type: "video",
  sources: [
    {
      src: animalsUrl,
      type: "video/mp4",
      size: 1080,
    },
  ],
};

const OPTIONS = {
  autoplay: true,
  muted: true,
};

export default function Player({onPlaying}:{onPlaying: () => void}) {
  const [ref, setRef] = createPlyr({
    source: SOURCE,
    options: OPTIONS,
  });

  createEffect(() => {
    const player = ref()?.plyr;

    if (player) {
      player.on("playing", (event) => {
        // Log current time while playing the playback
        console.log(event.detail.plyr.currentTime);
        onPlaying();
      });
    }
  });

  return <UncontrolledPlyr ref={setRef} />;
}
