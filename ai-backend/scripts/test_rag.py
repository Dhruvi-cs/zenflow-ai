from rag.chatbot import ask_chatbot

question = input("Ask a question: ")

result = ask_chatbot(question)

print("\n========== RESULT ==========\n")

print("Confidence Score :", result["confidence_score"])
print("Requires Human   :", result["requires_human_agent"])

print("\nAI Response:\n")
print(result["response"])