import { KnowledgeDoc } from "@prisma/client";

function keywordScore(content: string, question: string) {
  const keywords = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  let score = 0;
  for (const word of keywords) {
    if (content.toLowerCase().includes(word)) {
      score += 1;
    }
  }
  return score;
}

export function retrieveDocs(question: string, docs: KnowledgeDoc[]) {
  return docs
    .map((doc) => ({ doc, score: keywordScore(doc.content, question) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.doc);
}

export function buildAnswer(question: string, docs: KnowledgeDoc[]) {
  if (!docs.length) {
    return {
      answer:
        "当前知识库未命中可用条目。建议先联系人工顾问，并在后台补充对应政策文档后再次咨询。",
      sources: []
    };
  }

  const brief = docs
    .map((d, i) => `${i + 1}. ${d.title}：${d.content.slice(0, 70)}...`)
    .join("\n");

  return {
    answer: `针对你的问题“${question}”，已从泰国出海知识库中匹配到以下依据：\n${brief}\n\n建议：以上为百科型参考结论，实际政策以最新官方文件与窗口要求为准。`,
    sources: docs.map((d) => d.title)
  };
}
