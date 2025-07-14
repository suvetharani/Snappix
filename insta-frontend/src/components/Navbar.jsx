export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b shadow-sm">
      <h1 className="text-2xl font-bold">InstaClone</h1>
      <input
        type="text"
        placeholder="Search"
        className="border px-2 py-1 rounded-md"
      />
      <div className="flex gap-4 text-xl">
        <span>🏠</span>
        <span>✉️</span>
        <span>❤️</span>
        <span>👤</span>
      </div>
    </header>
  );
}
