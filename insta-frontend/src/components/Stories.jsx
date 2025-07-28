import john from "../assets/profiles/profile1.jpg";
import jane from "../assets/profiles/profile2.jpg";
import alex from "../assets/profiles/profile3.jpg";
import emma from "../assets/profiles/profile4.jpg";
import mike from "../assets/profiles/profile5.jpg";
import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Stories() {
  const stories = [
    { username: "john_doe", profile: john },
    { username: "jane_smith", profile: jane },
    { username: "alex99", profile: alex },
    { username: "emma", profile: emma },
    { username: "mike", profile: mike },
  ];

  const containerRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);

  const scrollAmount = 100; // px

  const handleScroll = (dir) => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = containerRef.current;
    let newScroll = scrollLeft + dir * scrollAmount;
    if (newScroll < 0) newScroll = 0;
    if (newScroll > scrollWidth - clientWidth) newScroll = scrollWidth - clientWidth;
    containerRef.current.scrollTo({ left: newScroll, behavior: "smooth" });
    setScrollPos(newScroll);
  };

  const atStart = containerRef.current ? containerRef.current.scrollLeft <= 0 : true;
  const atEnd = containerRef.current ? (containerRef.current.scrollLeft + containerRef.current.clientWidth >= containerRef.current.scrollWidth - 1) : false;

  // Add this style to hide the scrollbar for all browsers
  const hideScrollbar = {
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE 10+
    overflowX: 'auto',
  };

  return (
    <div className="relative flex items-center p-4" style={{ minWidth: 0 }}>
      {/* Left Arrow */}
      <button
        className="absolute left-2 z-20 bg-white dark:bg-black rounded-full shadow p-1 text-2xl"
        onClick={() => handleScroll(-1)}
        aria-label="Scroll left"
      >
        <FiChevronLeft />
      </button>
      {/* Stories Container */}
      <div
        ref={containerRef}
        className="flex gap-4 px-12 w-full"
        style={{ ...hideScrollbar, scrollBehavior: 'smooth', minWidth: 0 }}
        onScroll={() => setScrollPos(containerRef.current.scrollLeft)}
      >
      {stories.map((story, index) => (
          <div key={index} className="flex flex-col items-center flex-shrink-0">
          <img
            src={story.profile}
            alt={story.username}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-500 mb-2"
          />
          <span className="text-xs">{story.username}</span>
        </div>
      ))}
      </div>
      {/* Right Arrow */}
      <button
        className="absolute right-2 z-20 bg-white dark:bg-black rounded-full shadow p-1 text-2xl"
        onClick={() => handleScroll(1)}
        aria-label="Scroll right"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
