// Member 3 — Student Home (placeholder)
function StudentHome() {
  const user = JSON.parse(localStorage.getItem('kuppi_user') || '{}');
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-500">Student Home — Module 3 (coming soon).</p>
    </div>
  );
}

export default StudentHome;
