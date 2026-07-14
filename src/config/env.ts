const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  socketUrl: (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
  ).replace("/api/v1", ""),
} as const;

export default env;
