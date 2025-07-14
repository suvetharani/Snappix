import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function ReelItem({ index, reel, videoRefs, isActive, setCurrentReel }) {
  const [ref, inView] = useInView({
    threshold: 0.8,
  });

  useEffect(() => {
    if (inView) {
      setCurrentReel(index);
    }
  }, [inView, index, setCurrentReel]);

  return (
    <video
      ref={(el) => {
        videoRefs.current[index] = el;
        ref(el);
      }}
      src={reel.video}
      muted
      playsInline
      loop
      className={`absolute inset-0 w-full h-full object-cover ${
        isActive ? "block" : "hidden"
      }`}
    />
  );
}
