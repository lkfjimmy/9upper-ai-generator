import { useState } from 'react';

export default function Home() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCard = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-card');
    const data = await res.json();
    setCard(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">9upper AI Generator</h1>
      <button
        onClick={generateCard}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Generating...' : 'Generate Card'}
      </button>
      {card && (
        <div className="mt-6 p-4 border rounded bg-white shadow max-w-md">
          <h2 className="text-xl font-semibold mb-2">{card.term}</h2>
          <ul className="list-disc list-inside mb-2">
            {card.hints.map((hint, idx) => (
              <li key={idx}>{hint}</li>
            ))}
          </ul>
          <details>
            <summary className="cursor-pointer text-blue-500">Show explanation</summary>
            <p className="mt-2">{card.explanation}</p>
          </details>
        </div>
      )}
    </div>
  );
}
