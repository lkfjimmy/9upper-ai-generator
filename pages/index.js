import { useState } from 'react';

export default function Home() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);

  // helper function：將 popularity 數字轉成星星難度
  const renderDifficulty = (popularity) => {
    if (!popularity) return null;
    const stars = "★".repeat(popularity) + "☆".repeat(3 - popularity);
    return stars;
  };

  // 抽取隨機卡牌
  const drawRandomCard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards/random');
      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setCard(data.randomCard);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">9upper Random Card</h1>

      <button
        onClick={drawRandomCard}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Drawing...' : 'Draw Random Card'}
      </button>

      {card && (
        <div className="mt-6 p-4 border rounded bg-white shadow max-w-md">
          <h2 className="text-xl font-semibold mb-2">{card.term}</h2>
          
          {/* 難度顯示 */}
          <p className="text-sm text-gray-600 mb-2">
            難度：{renderDifficulty(card.popularity)}
          </p>

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
