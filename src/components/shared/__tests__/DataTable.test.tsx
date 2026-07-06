import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DataTable from "../DataTable";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...rest }: any) => {
      const { variants, initial, animate, transition, ...htmlProps } = rest;
      return <div className={className} {...htmlProps}>{children}</div>;
    },
    h3: ({ children, className, ...rest }: any) => {
      const { variants, initial, animate, transition, ...htmlProps } = rest;
      return <h3 className={className} {...htmlProps}>{children}</h3>;
    },
    p: ({ children, className, ...rest }: any) => {
      const { variants, initial, animate, transition, ...htmlProps } = rest;
      return <p className={className} {...htmlProps}>{children}</p>;
    },
  },
}));

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
];

const data = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Doe", email: "jane@example.com" },
];

function renderTable(props: Partial<Parameters<typeof DataTable>[0]> = {}) {
  return render(
    <MemoryRouter>
      <DataTable
        columns={columns}
        data={[]}
        isLoading={false}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("DataTable", () => {
  it("renders rows when data is provided", () => {
    renderTable({ data, isLoading: false });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading is true", () => {
    renderTable({ isLoading: true });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when data is empty array", () => {
    renderTable({ data: [], isLoading: false });
    expect(screen.getByText("No data found")).toBeInTheDocument();
    expect(
      screen.getByText("There are no items to display at the moment.")
    ).toBeInTheDocument();
  });
});
