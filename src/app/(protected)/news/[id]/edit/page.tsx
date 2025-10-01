import { NewsForm } from "@/components/news/news-form";
import { fetchNews } from "@/lib/data";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Announcement",
};

interface EditAnnouncementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const { id } = await params;
  const items = await fetchNews();
  const item = items.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Premium Header Section */}
      <div className="relative animate-fade-in-up">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Edit Announcement
              </h1>
              <p className="text-sm text-muted/80">
                Update your announcement for the mobile app and in-gym displays
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl animate-fade-in-up animate-stagger-1">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-card/95 to-surface/90 border-primary/20 shadow-2xl rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface/30">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Editing: {item.title}
              </h2>
            </div>
            <NewsForm item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

