const CHANNEL_IDS: Record<"hitesh" | "piyush", string[]> = {
  hitesh: ["UCNQ6FEtztATuaVhZKCY28Yw", "UCXgGY0wkgOzynnHvSEVmE3A"],
  piyush: ["UCf9T51_FmMlfhiGpoes0yFA"],
};

export async function searchCreatorVideos(
  topic: string,
  persona: "hitesh" | "piyush",
  maxResults: number = 2
) {
  const channelIds = CHANNEL_IDS[persona];
  const apiKey = process.env.YOUTUBE_API_KEY;

  const allResults = [];

  for (const channelId of channelIds) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(topic)}&type=video&maxResults=${maxResults}&order=relevance&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const videos = (data.items ?? []).map((item: any) => ({
        title: item.snippet.title,
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
      }));

      allResults.push(...videos);
    } catch (err) {
      console.error(`YouTube search failed for channel ${channelId}:`, err);
    }
  }

  console.log(`🔎 (searchCreatorVideos): "${topic}" for ${persona}, max=${maxResults} →`, allResults.length, "results");

  return allResults.slice(0, maxResults);
}