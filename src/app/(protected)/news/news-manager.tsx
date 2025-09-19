"use client";

import { useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteNewsAction } from "@/app/(protected)/actions";
import { NewsForm } from "@/components/news/news-form";
import type { NewsItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface NewsManagerProps {
  items: NewsItem[];
}

export function NewsManager({ items }: NewsManagerProps) {
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [isDeleting, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<NewsItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => row.original.priority,
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => (row.original.expires_at ? formatDate(row.original.expires_at) : "—"),
      },
      {
        accessorKey: "created_at",
        header: "Published",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              disabled={isDeleting}
              onClick={() =>
                startTransition(async () => {
                  const confirmed = window.confirm(
                    `Delete announcement "${row.original.title}"?`
                  );
                  if (!confirmed) return;
                  const result = await deleteNewsAction(row.original.id);
                  if (!result.success) {
                    alert(result.error);
                  }
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [isDeleting]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text">News & announcements</h1>
        <p className="text-sm text-muted">
          Published announcements sync to the member mobile app and in-gym displays. Use the priority flag for urgent notices.
        </p>
        <DataTable columns={columns} data={items} />
      </div>
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>{selected ? `Edit ${selected.title}` : "Create announcement"}</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsForm
            item={selected}
            onCompleted={() => {
              setSelected(null);
            }}
          />
          {selected ? (
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setSelected(null)}>
              Create new announcement
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
