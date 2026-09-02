const baseUrl = "https://chat-app-ikw8.onrender.com";
const password = "LoadTest123!";

for (let i = 1; i <= 50; i++) {
  const email = `loadtest${String(i).padStart(2, "0")}@gecskp.ac.in`;

  const response = await fetch(`${baseUrl}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await response.json();

  console.log(
    `${email} -> ${response.status} ${data.message || ""}`
  );
}