import { NextResponse } from "next/server";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";
import { openai } from "@/lib/openai";

function clipText(text: string | null | undefined, maxLen = 240) {
  const value = (text ?? "").trim();
  if (!value) return "";
  return value.length > maxLen ? `${value.slice(0, maxLen)}...` : value;
}

export async function POST(request: Request) {
  try {
    const { garden } = await getCurrentGardenOrThrow();
    const body = await request.json();

    const rawMessage = String(body?.rawMessage ?? "").trim();
    const mood = String(body?.mood ?? "").trim();
    const entryContent = String(body?.entryContent ?? "").trim();

    if (!rawMessage) {
      return NextResponse.json(
        { error: "想说的话不能为空" },
        { status: 400 }
      );
    }

    const prompt = `
你是“共土”的委婉转译引擎。

你的任务：
把用户今天想对对方说的话，转译成一段更柔和、更容易被接住、但仍然保留原意的表达。

要求：
1. 不改变核心意思
2. 不要操控、施压、PUA
3. 不要过度煽情
4. 不要写得像道歉模板或鸡汤
5. 要自然、克制、真诚
6. 长度控制在 30-90 字
7. 直接输出纯文本，不要解释，不要加引号

补充上下文：
- 当前共土：${garden.name ?? "共土"}
- 用户今天情绪：${mood || "未提供"}
- 用户今天记录摘要：${clipText(entryContent, 140) || "未提供"}

用户原始想说的话：
${clipText(rawMessage, 240)}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "你擅长把直接的话转成更柔和、克制、可被接住的表达。只输出转译后的文本。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      top_p: 0.85,
      max_completion_tokens: 180,
    });

    const translated =
      response.choices[0]?.message?.content?.trim() || "";

    if (!translated) {
      throw new Error("AI 转译结果为空");
    }

    return NextResponse.json({
      success: true,
      translatedMessage: translated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "转译时发生未知错误";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}