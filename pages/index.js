import { useState } from 'react';

export default function Home() {
  const [card, setCard] = useState(null); // 存隨機抽到的卡牌
  const [loading, setLoading] = useState(false); // Loading 狀態
  const [error, setError] = useState(null); // 錯誤訊息

  // 從 Supabase 抽隨機卡
  const fetchRandomCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cards/random'); // 呼叫新 API
      if (!res.ok) {
        throw new Error(`Failed to fetch card: ${res.status}`);
      }
      const data = await res.json();
      setCard(data);
    } catch (err) {
      console.error(err);
      setError('Error loading card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">9upper Card Generator</h1>

      {/* Generate 按鈕 */}
      <button
        onClick={fetchRandomCard}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition"
      >
        {loading ? 'Loading...' : 'Draw Random Card'}
      </button>

      {/* 錯誤提示 */}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* 顯示卡片 */}
      {card && (
        <div className="mt-6 p-4 border rounded bg-white shadow max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2">{card.term}</h2>
          <ul className="list-disc list-inside mb-2">
            {Array.isArray(card.hints) &&
              card.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
          </ul>

          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500">Show Explanation</summary>
            <p className="mt-2">{card.explanation}</p>
          </details>
        </div>
      )}

      {/* 空資料提示 */}
      {!loading && !card && !error && (
        <p className="mt-4 text-gray-500">Click "Draw Random Card" to start!</p>
      )}
    </div>
  );
}
