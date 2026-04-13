from huggingface_hub import InferenceClient

client = InferenceClient(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    token="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"
)

print("Assessment Question Bot (LLaMA 3) Ready!")
print("Enter a topic | type 'exit' to quit\n")

while True:
    topic = input("Topic: ")

    if topic.lower() == "exit":
        break

    messages = [
        {
            "role": "system",
            "content": "You are an AI that generates assessment questions."
        },
        {
            "role": "user",
            "content": f"""
Create 5 assessment questions on the topic "{topic}":
- 2 Multiple Choice Questions (4 options each)
- 2 Short Answer Questions
- 1 Conceptual Question

Do not include explanations.
"""
        }
    ]

    response = client.chat_completion(
        messages=messages,
        max_tokens=300,
        temperature=0.7
    )

    print("\nAssessment Questions:\n")
    print(response.choices[0].message["content"])
    print("\n" + "-" * 50 + "\n")