import fs from "fs";

const baseUrl = "https://chat-app-ikw8.onrender.com";
const password = "LoadTest123!";

const users = [
  "loadtest01@gecskp.ac.in",
  "loadtest02@gecskp.ac.in",
  "loadtest03@gecskp.ac.in",
  "loadtest06@gecskp.ac.in",
  "loadtest07@gecskp.ac.in",
  "loadtest09@gecskp.ac.in"
];

const tokens = [];

for (const email of users) {
  const response = await fetch(`${baseUrl}/login`, {
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

  if (!response.ok || !data.data?.token) {
  console.log(`${email} -> LOGIN FAILED (${response.status})`);
  console.log(data);
  continue;
}

  tokens.push({
    email,
    token: data.data.token
  });

  console.log(`${email} -> LOGIN SUCCESS`);
}

fs.writeFileSync(
  "tokens.json",
  JSON.stringify(tokens, null, 2)
);

console.log(`\nSaved ${tokens.length} tokens to tokens.json`);