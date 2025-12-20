export async function sha256(data) {
  const buffer =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data;

  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
