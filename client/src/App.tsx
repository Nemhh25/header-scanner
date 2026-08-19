import { useState } from "react";
import "./App.css";

interface CheckResult {
  header: string;
  passed: boolean;
  description: string;
  recommendation: string;
  actualValue: string | null;
}

interface ScanResult {
  url: string;
  status: number;
  grade: string;
  score: number;
  results: CheckResult[];
}

const API_URL = import.meta.env.VITE_API_URL;

function gradeColor(grade: string) {
  if (grade === "A" || grade === "B") return "var(--color-accent)";
  if (grade === "C") return "#d9a441";
  return "var(--color-error)";
}

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao analisar a URL");
        return;
      }

      setResult(data);
    } catch {
      setError("Não foi possível conectar ao servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Security Headers Scanner</h1>
      <p className="subtitle">
        Analise os cabeçalhos de segurança HTTP de qualquer site público
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://exemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analisando..." : "Analisar"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="result">
          <div className="grade-badge" style={{ borderColor: gradeColor(result.grade) }}>
            <span className="grade-letter" style={{ color: gradeColor(result.grade) }}>
              {result.grade}
            </span>
            <span className="grade-score">{result.score}/100</span>
          </div>

          <p className="scanned-url">{result.url}</p>

          <ul className="checks">
            {result.results.map((check) => (
              <li key={check.header} className={check.passed ? "passed" : "failed"}>
                <div className="check-header">
                  <span className="check-icon">{check.passed ? "✓" : "✕"}</span>
                  <code>{check.header}</code>
                </div>
                <p className="check-description">{check.description}</p>
                {!check.passed && (
                  <p className="check-recommendation">{check.recommendation}</p>
                )}
                {check.actualValue && (
                  <code className="check-value">{check.actualValue}</code>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;