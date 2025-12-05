import { NewsForm } from "@/components/news/news-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchNews } from "@/lib/data";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      {/* Premium Form Container */}
      <div className="max-w-4xl animate-fade-in-up">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl"></div>
          
          {/* Form Card */}
          <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-accent/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            <CardHeader className="relative p-8 pb-6 border-b border-surface/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 border border-primary/30">
                    <Pencil className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                      Edit Announcement
                    </CardTitle>
                    <p className="text-sm text-muted/70 mt-1 line-clamp-1">{item.title}</p>
                  </div>
                </div>
                <Link href="/news">
                  <Button variant="outline" className="gap-2">
                    ← Back
                  </Button>
                </Link>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-8">
              <NewsForm item={item} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

