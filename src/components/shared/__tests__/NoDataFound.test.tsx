import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NoDataFound } from "../NoDataFound";
import { Button } from "@/components/ui/button";

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

describe("NoDataFound", () => {
  it("renders title and description", () => {
    render(
      <MemoryRouter>
        <NoDataFound title="Custom Title" description="Custom description text" />
      </MemoryRouter>
    );
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
  });

  it("renders action button when action prop provided", () => {
    const handleClick = vi.fn();
    render(
      <MemoryRouter>
        <NoDataFound
          title="Test"
          action={<Button onClick={handleClick}>Add Item</Button>}
        />
      </MemoryRouter>
    );
    const button = screen.getByRole("button", { name: "Add Item" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders default icon when no icon prop", () => {
    render(
      <MemoryRouter>
        <NoDataFound title="Test Title" />
      </MemoryRouter>
    );
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
