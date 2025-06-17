export default function handler(req, res) {
  res.status(200).json({
    term: "測試詞語",
    hints: ["提示 A", "提示 B", "提示 C"],
    explanation: "這是一個測試解釋。"
  });
}
