export async function openaiChat(
  apiKey: string,
  messages: {role: string, content: string}[],
  onChunk?: (text: string) => void
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: !!onChunk,
      max_tokens: 2000
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI error: ${res.status}`);
  }

  if (onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
      for (const line of lines) {
        try {
          const delta = JSON.parse(line.slice(6)).choices[0]?.delta?.content || '';
          full += delta;
          onChunk(delta);
        } catch {}
      }
    }
    return full;
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
