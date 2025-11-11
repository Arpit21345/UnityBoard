const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiAiQnA(question, context = '') {
  console.log('AI Request:', { question: question.substring(0, 50), context: context.substring(0, 100) });
  
  const res = await fetch(`${API}/api/ai/qna`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', ...authHeaders() }, 
    body: JSON.stringify({ question, context }) 
  });
  
  const data = await res.json();
  console.log('AI Response:', { ok: data.ok, textLength: data.text?.length || 0 });
  
  if (!res.ok || !data.ok) throw new Error(data.error || 'AI error');
  return data.text;
}

export async function apiAiSummarize(text) {
  const res = await fetch(`${API}/api/ai/summarize`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ text }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'AI error');
  return data.text;
}

export async function apiAiSuggestTasks(context = '') {
  const res = await fetch(`${API}/api/ai/suggest-tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ context }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'AI error');
  return data.text;
}
