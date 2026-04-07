import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import ModelSettings from "./ModelSettings";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import("@tauri-apps/api/core");
const mockedInvoke = invoke as ReturnType<typeof vi.fn>;

const user = userEvent.setup();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ModelSettings", () => {
  describe("loading state", () => {
    test("renders loading state initially", async () => {
      mockedInvoke.mockImplementation(
        () => new Promise(() => {})
      );

      render(() => <ModelSettings />);

      expect(screen.getByText("Checking Ollama status...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /checking/i })).toBeDisabled();
    });
  });

  describe("error state", () => {
    test("shows error when Ollama not available", async () => {
      mockedInvoke.mockRejectedValue(new Error("Connection refused"));

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/failed to connect to ollama/i)).toBeInTheDocument();
      });

      expect(screen.getByRole("link", { name: /download ollama/i })).toHaveAttribute(
        "href",
        "https://ollama.com"
      );
    });
  });

  describe("connection status", () => {
    test("shows connection status when Ollama is available", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/connected to ollama/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/v0.1.0/)).toBeInTheDocument();
      expect(screen.getByText(/localhost:11434/)).toBeInTheDocument();
    });

    test("shows unavailable when Ollama is not running", async () => {
      mockedInvoke.mockResolvedValue({
        available: false,
        url: "http://localhost:11434",
        version: null,
        models: [],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/ollama is not running/i)).toBeInTheDocument();
      });

      expect(screen.getByRole("link", { name: /install ollama/i })).toHaveAttribute(
        "href",
        "https://ollama.com"
      );
    });
  });

  describe("installed models", () => {
    test("displays installed models list", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [
          { name: "qwen2.5-coder:3b", size: 2000000000, digest: "abc", modified_at: "2024-01-01" },
          { name: "nomic-embed-text", size: 500000000, digest: "def", modified_at: "2024-01-02" },
          { name: "llama3", size: 4000000000, digest: "ghi", modified_at: "2024-01-03" },
        ],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/installed models \(3\)/i)).toBeInTheDocument();
      });

      expect(screen.getAllByText("qwen2.5-coder:3b").length).toBeGreaterThan(0);
      expect(screen.getAllByText("nomic-embed-text").length).toBeGreaterThan(0);
      expect(screen.getAllByText("llama3").length).toBeGreaterThan(0);
    });

    test("shows empty models message when no models installed", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/no models installed/i)).toBeInTheDocument();
      });
    });

    test("formats model sizes correctly", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [
          { name: "small-model", size: 50000000, digest: "abc", modified_at: "2024-01-01" },
          { name: "medium-model", size: 500000000, digest: "def", modified_at: "2024-01-02" },
          { name: "large-model", size: 5000000000, digest: "ghi", modified_at: "2024-01-03" },
        ],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/48 MB/)).toBeInTheDocument();
        expect(screen.getByText(/477 MB/)).toBeInTheDocument();
        expect(screen.getByText(/4\.7 GB/)).toBeInTheDocument();
      });
    });
  });

  describe("recommended models", () => {
    test("shows recommended models with download buttons", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText("Recommended Models")).toBeInTheDocument();
      });

      expect(screen.getByText("qwen2.5-coder:3b")).toBeInTheDocument();
      expect(screen.getByText("nomic-embed-text")).toBeInTheDocument();
      expect(screen.getByText("NL-to-SQL Model")).toBeInTheDocument();
      expect(screen.getByText("Embedding Model")).toBeInTheDocument();

      const downloadButtons = screen.getAllByRole("button", { name: /download/i });
      expect(downloadButtons).toHaveLength(2);
    });

    test("shows installed badge when model is installed", async () => {
      mockedInvoke.mockResolvedValue({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [
          { name: "qwen2.5-coder:3b", size: 2000000000, digest: "abc", modified_at: "2024-01-01" },
        ],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText("✓ Installed")).toBeInTheDocument();
      });

      expect(screen.getByText(/installed \(1.9 gb\)/i)).toBeInTheDocument();

      const downloadButtons = screen.queryAllByRole("button", { name: /download/i });
      expect(downloadButtons).toHaveLength(1);
    });

    test("download button triggers pull_model invoke", async () => {
      mockedInvoke
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [],
        })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ status: "success", percent: 100 });

      render(() => <ModelSettings />);

      await waitFor(() => {
        const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
        return expect(downloadButton).toBeInTheDocument();
      });

      const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
      await user.click(downloadButton);

      expect(mockedInvoke).toHaveBeenCalledWith("ollama_pull_model", {
        model: "qwen2.5-coder:3b",
        ollamaUrl: null,
      });
    });

    test("download button is disabled when another download is in progress", async () => {
      mockedInvoke
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [],
        })
        .mockResolvedValueOnce(undefined);

      render(() => <ModelSettings />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByRole("button", { name: /download/i });
        expect(downloadButtons).toHaveLength(2);
      });

      const downloadButtons = screen.getAllByRole("button", { name: /download/i });
      await user.click(downloadButtons[0]);

      await waitFor(() => {
        expect(downloadButtons[1]).toBeDisabled();
      });
    });
  });

  describe("progress bar during download", () => {
    test("shows progress bar during download", async () => {
      mockedInvoke
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [],
        })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ status: "Downloading...", percent: 50 })
        .mockResolvedValueOnce({ status: "Success", percent: 100 })
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [{ name: "qwen2.5-coder:3b", size: 2000000000, digest: "abc", modified_at: "2024-01-01" }],
        });

      render(() => <ModelSettings />);

      await waitFor(() => {
        const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
        return expect(downloadButton).toBeInTheDocument();
      });

      const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText("Downloading...")).toBeInTheDocument();
      });

      const progressFill = document.querySelector(".progress-fill") as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "50%" });
    });

    test("clears progress after download completes", async () => {
      mockedInvoke
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [],
        })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ status: "success", percent: 100 })
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [{ name: "qwen2.5-coder:3b", size: 2000000000, digest: "abc", modified_at: "2024-01-01" }],
        });

      render(() => <ModelSettings />);

      await waitFor(() => {
        const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
        return expect(downloadButton).toBeInTheDocument();
      });

      const downloadButton = screen.getAllByRole("button", { name: /download/i })[0];
      await user.click(downloadButton);

      await waitFor(
        () => {
          expect(screen.getByText("✓ Installed")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const pullProgressWrapper = screen.queryByText(/pulling/i);
      expect(pullProgressWrapper).not.toBeInTheDocument();
    });
  });

  describe("refresh button", () => {
    test("refresh button re-checks status", async () => {
      mockedInvoke
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [],
        })
        .mockResolvedValueOnce({
          available: true,
          url: "http://localhost:11434",
          version: "0.1.0",
          models: [{ name: "llama3", size: 4000000000, digest: "abc", modified_at: "2024-01-01" }],
        });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByText(/connected to ollama/i)).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockedInvoke).toHaveBeenCalledTimes(2);
      expect(mockedInvoke).toHaveBeenNthCalledWith(2, "ollama_check_status", { ollamaUrl: null });
    });

    test("refresh button is disabled while loading", async () => {
      let resolveInvoke: (value: unknown) => void;
      mockedInvoke.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveInvoke = resolve;
          })
      );

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /checking/i })).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /checking/i })).toBeDisabled();

      resolveInvoke!({
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [],
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
      });
    });
  });

  describe("download Ollama link", () => {
    test("appears when error state", async () => {
      mockedInvoke.mockRejectedValue(new Error("Connection refused"));

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /download ollama/i })).toBeInTheDocument();
      });

      expect(screen.getByRole("link", { name: /download ollama/i })).toHaveAttribute(
        "href",
        "https://ollama.com"
      );
    });

    test("appears when Ollama unavailable", async () => {
      mockedInvoke.mockResolvedValue({
        available: false,
        url: "http://localhost:11434",
        version: null,
        models: [],
      });

      render(() => <ModelSettings />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /install ollama/i })).toBeInTheDocument();
      });

      expect(screen.getByRole("link", { name: /install ollama/i })).toHaveAttribute(
        "href",
        "https://ollama.com"
      );
    });
  });

  describe("unavailable state without error", () => {
    test("shows unable to connect when status is null and not loading", async () => {
      mockedInvoke.mockResolvedValue(null);

      render(() => <ModelSettings />);

      await waitFor(
        () => {
          expect(screen.getByText(/unable to connect to ollama/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });
});
