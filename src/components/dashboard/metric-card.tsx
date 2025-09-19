import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card className="bg-card/90">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-[0.3em] text-muted">{title}</CardDescription>
        <CardTitle className="text-4xl font-semibold text-text">{value}</CardTitle>
      </CardHeader>
      {description ? <CardContent className="text-xs text-muted">{description}</CardContent> : null}
    </Card>
  );
}
