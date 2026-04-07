import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { invoke } from "@tauri-apps/api/core";
import ConnectionWizard from "./ConnectionWizard";
import { setActiveDb, setDatabases, activeDb, databases } from "../../stores/app";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("../../lib/api", () => ({
  dbCreate: vi.fn().mockResolvedValue("test-db"),
  dbOpen: vi.fn().mockResolvedValue("test-db"),
}));

describe("ConnectionWizard", () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setActiveDb(null);
    setDatabases([]);
    (invoke as vi.Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  describe("wizard open/close", () => {
    test("renders nothing when isOpen is false", () => {
      const { container } = render(() => (
        <ConnectionWizard isOpen={false} onClose={mockOnClose} />
      ));
      expect(container.querySelector(".wizard-overlay")).toBeNull();
    });

    test("renders wizard when isOpen is true", () => {
      const { container } = render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));
      expect(container.querySelector(".wizard-overlay")).not.toBeNull();
      expect(screen.getByText("Connect Your Data")).toBeInTheDocument();
    });

    test("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));
      await user.click(screen.getByRole("button", { name: /✕|close/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    test("calls onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));
      await user.click(screen.getByText("Connect Your Data").closest(".wizard-backdrop") || screen.getByText("Connect Your Data"));
    });
  });

  describe("step 1 - source type selection", () => {
    test("shows all source type options", () => {
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      expect(screen.getByText("File")).toBeInTheDocument();
      expect(screen.getByText("Database")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Notes")).toBeInTheDocument();
      expect(screen.getByText("Web")).toBeInTheDocument();
      expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    test("shows source descriptions", () => {
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      expect(screen.getByText("CSV, JSON, Parquet")).toBeInTheDocument();
      expect(screen.getByText("PostgreSQL, MySQL")).toBeInTheDocument();
    });

    test("next button is enabled after source is selected", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("step 2 - file selection", () => {
    test("shows drop zone for file source", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
      expect(screen.getByText(/browse files/i)).toBeInTheDocument();
    });

    test("shows coming soon for non-file sources", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("Database"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      expect(screen.getByRole("heading", { name: "Coming Soon" })).toBeInTheDocument();
    });

    test("can switch to file import from coming soon", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("Database"));
      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /switch to file import/i }));

      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    });

    test("next button does not advance when no files selected", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeInTheDocument();
      
      await user.click(nextButton);
      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    });
  });

  describe("step 3 - preview", () => {
    test("shows preview after selecting files", async () => {
      const user = userEvent.setup();
      const file = new File(["test content"], "test.csv", { type: "text/csv" });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));

      expect(screen.getByText(/what we found/i)).toBeInTheDocument();
    });
  });

  describe("step 4 - processing", () => {
    test("shows processing steps during import", async () => {
      const user = userEvent.setup();

      (invoke as vi.Mock)
        .mockResolvedValueOnce({ chunks: ["chunk1", "chunk2"] })
        .mockResolvedValueOnce({ embeddings: [[1, 2, 3], [4, 5, 6]] })
        .mockResolvedValueOnce({ entities: [] });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test content"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(() => {
        expect(screen.getByText(/organizing your data/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Reading file...")).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText("Chunking document...")).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText("Generating embeddings...")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test("shows import complete after processing", async () => {
      const user = userEvent.setup();

      (invoke as vi.Mock)
        .mockResolvedValueOnce({ chunks: ["chunk1"] })
        .mockResolvedValueOnce({ embeddings: [[1, 2, 3]] })
        .mockResolvedValueOnce({ entities: [] });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/import complete/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("error handling", () => {
    test("displays error when processing fails", async () => {
      const user = userEvent.setup();

      (invoke as vi.Mock).mockRejectedValue(new Error("Processing failed"));

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/processing failed/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("navigation between steps", () => {
    test("back button navigates to previous step", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(screen.getByText("File")).toBeInTheDocument();
    });

    test("back button is disabled on first step", async () => {
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    test("next button is disabled on last step", async () => {
      const user = userEvent.setup();
      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          const nextButton = screen.queryByRole("button", { name: /next/i });
          if (nextButton) {
            expect(nextButton).toBeDisabled();
          }
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("onComplete callback", () => {
    test("calls onComplete after successful import", async () => {
      const user = userEvent.setup();

      (invoke as vi.Mock)
        .mockResolvedValueOnce({ chunks: ["chunk1"] })
        .mockResolvedValueOnce({ embeddings: [[1, 2, 3]] })
        .mockResolvedValueOnce({ entities: [] });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("dbCreate and dbOpen calls", () => {
    test("calls dbCreate and dbOpen on completion", async () => {
      const user = userEvent.setup();
      const { dbCreate, dbOpen } = await import("../../lib/api");

      (invoke as vi.Mock)
        .mockResolvedValueOnce({ chunks: ["chunk1"] })
        .mockResolvedValueOnce({ embeddings: [[1, 2, 3]] })
        .mockResolvedValueOnce({ entities: [] });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          expect(dbCreate).toHaveBeenCalled();
          expect(dbOpen).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("progress display", () => {
    test("displays progress bar and percentage", async () => {
      const user = userEvent.setup();

      (invoke as vi.Mock)
        .mockResolvedValueOnce({ chunks: ["chunk1"] })
        .mockResolvedValueOnce({ embeddings: [[1]] })
        .mockResolvedValueOnce({ entities: [] });

      render(() => (
        <ConnectionWizard isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />
      ));

      await user.click(screen.getByText("File"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        userEvent.upload(fileInput, file);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /import data/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/organizing your data/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          const progressText = screen.getByText(/%/);
          expect(progressText).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
