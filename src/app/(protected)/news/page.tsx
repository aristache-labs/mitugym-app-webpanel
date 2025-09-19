import { NewsManager } from "@/app/(protected)/news/news-manager";
import { fetchNews } from "@/lib/data";

export const metadata = {
  title: "News",
};

export default async function NewsPage() {
  const items = await fetchNews();
  return <NewsManager items={items} />;
}
