import pytest
from app.services.assistant_service import AssistantService, STRICT_REFUSAL_MESSAGE

@pytest.mark.asyncio
async def test_assistant_in_domain_queries():
    queries = [
        "What does the Decision Tree do?",
        "Why is Gini used?",
        "Explain my confusion matrix.",
        "Which feature is most important in Iris classification?",
        "What is the Iris dataset?",
        "Tell me about Pooja V's internship review at Edu Tantr"
    ]
    for q in queries:
        assert AssistantService.is_within_domain(q) is True
        resp = await AssistantService.generate_response(q)
        assert resp["role"] == "assistant"
        assert len(resp["content"]) > 30
        assert STRICT_REFUSAL_MESSAGE not in resp["content"]

@pytest.mark.asyncio
async def test_assistant_out_of_domain_strict_rejection():
    out_of_domain_queries = [
        "Who is the president?",
        "Tell me a joke",
        "Write me a movie story",
        "What is the weather forecast for tomorrow?",
        "Give me a recipe for chocolate cake"
    ]
    for q in out_of_domain_queries:
        assert AssistantService.is_within_domain(q) is False
        resp = await AssistantService.generate_response(q)
        assert resp["content"] == STRICT_REFUSAL_MESSAGE

@pytest.mark.asyncio
async def test_assistant_multilingual_rejection():
    resp_te = await AssistantService.generate_response("Tell me a funny joke", language="Telugu")
    assert "నేను ఐరిస్ AI అసిస్టెంట్‌ని" in resp_te["content"]

    resp_hi = await AssistantService.generate_response("Who is the president?", language="Hindi")
    assert "मैं आइरिस एआई सहायक हूं" in resp_hi["content"]
