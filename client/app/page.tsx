import Dashboard from "../components/Dashboard";
import { API_ENDPOINTS } from "../utils/constants";
import { Movie } from "../utils/types";

// Force dynamic rendering on the server (ensures it queries fresh movie lists from ClickHouse on request)
export const dynamic = "force-dynamic";

async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(API_ENDPOINTS.MOVIES, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch movies: status ${res.status}`);
    }
    return (await res.json()) as Movie[];
  } catch (err) {
    console.error("Error fetching movies during server-side render:", err);
    return [];
  }
}

export default async function Page() {
  const initialMovies = await getMovies();
  return <Dashboard initialMovies={initialMovies} />;
}
