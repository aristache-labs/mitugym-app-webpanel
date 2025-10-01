import { NewsManager } from "@/app/(protected)/news/news-manager";
import { fetchNews } from "@/lib/data";
import { getTimeFormat } from "@/lib/timezone";

export const metadata = {
  title: "News",
};

export default async function NewsPage() {
  const [items, timeFormat] = await Promise.all([
    fetchNews(),
    getTimeFormat(),
  ]);
  return <NewsManager items={items} timeFormat={timeFormat} />;
}
