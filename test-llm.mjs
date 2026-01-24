import { invokeLLM } from "./server/_core/llm.ts";

console.log("🧪 Testando LLM...");

try {
  const response = await invokeLLM({
    messages: [
      { role: "user", content: "Olá, você está funcionando?" }
    ]
  });
  
  console.log("✅ LLM funcionando!");
  console.log("Resposta:", response.choices[0]?.message?.content);
} catch (error) {
  console.error("❌ Erro no LLM:");
  console.error(error.message);
  console.error(error.stack);
}
