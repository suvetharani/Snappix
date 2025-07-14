import john from "../assets/profiles/profile1.jpg";
import jane from "../assets/profiles/profile2.jpg";
import alex from "../assets/profiles/profile3.jpg";
import emma from "../assets/profiles/profile4.jpg";
import mike from "../assets/profiles/profile5.jpg";

export default function Stories() {
  const stories = [
    { username: "john_doe", profile: john },
    { username: "jane_smith", profile: jane },
    { username: "alex99", profile: alex },
    { username: "emma", profile: emma },
    { username: "mike", profile: mike },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {stories.map((story, index) => (
        <div key={index} className="flex flex-col items-center">
          <img
            src={story.profile}
            alt={story.username}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-500 mb-2"
          />
          <span className="text-xs">{story.username}</span>
        </div>
      ))}
    </div>
  );
}
