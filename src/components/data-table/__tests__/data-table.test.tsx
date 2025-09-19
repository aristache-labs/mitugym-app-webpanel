import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/components/data-table/data-table";

type Row = {
  id: number;
  name: string;
};

describe("DataTable", () => {
  const columns: ColumnDef<Row>[] = [
    { accessorKey: "name", header: "Name" },
  ];

  it("renders rows", () => {
    const data: Row[] = [
      { id: 1, name: "First" },
      { id: 2, name: "Second" },
    ];

    render(<DataTable columns={columns} data={data} />);

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
