import json


async def test_get_example(jp_fetch):
    # When
    response = await jp_fetch("backend", "get-example")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "data": "This is /backend/get-example endpoint!"
    }

async def test_call_llm(jp_fetch):
    response = await jp_fetch(
        "backend", "llm", 
        method="POST",
        body=json.dumps({"sender":"User", "content": "Response with Hello and only Hello"}),
        headers={"Content-Type": "application/json"}
    )

    assert response.code == 200

    payload = json.loads(response.body.decode("utf-8"))
    
    print(payload["response"])
    assert payload["response"] == "Hello"
    