// Deno Edge Function — calls Groq's Llama 3.3 API server-side so GROQ_API_KEY never
// reaches the browser. Invoked from the client via supabase.functions.invoke('generate-tips', ...).

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TipsRequestBody {
  monthlyIncome: number
  monthlyExpenses: number
  topExpenses: { name: string; amount: number }[]
  goals: {
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string | null
    onTrack: boolean
  }[]
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function buildSummary(body: TipsRequestBody): string {
  const { monthlyIncome, monthlyExpenses, topExpenses, goals } = body

  const expensesLine =
    topExpenses.length > 0
      ? `Top expenses: ${topExpenses.map((e) => `${e.name} ($${e.amount.toFixed(2)})`).join(', ')}`
      : 'No expenses logged yet.'

  const goalsLine =
    goals.length > 0
      ? `Savings goals: ${goals
          .map(
            (g) =>
              `${g.name} ($${g.currentAmount.toFixed(2)} of $${g.targetAmount.toFixed(2)}` +
              `${g.targetDate ? `, due ${g.targetDate}` : ''}, ${g.onTrack ? 'on track' : 'NOT on track'})`,
          )
          .join('; ')}`
      : 'No savings goals set yet.'

  return [
    `Monthly income: $${monthlyIncome.toFixed(2)}`,
    `Monthly expenses: $${monthlyExpenses.toFixed(2)}`,
    expensesLine,
    goalsLine,
  ].join('\n')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const groqApiKey = Deno.env.get('GROQ_API_KEY')
  if (!groqApiKey) {
    return jsonResponse({ error: 'GROQ_API_KEY is not configured on the server.' }, 500)
  }

  let body: TipsRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400)
  }

  const summary = buildSummary(body)

  let groqResponse: Response
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a concise, encouraging personal budgeting assistant inside a budgeting app ' +
              "called Budgy. Given a summary of a user's monthly income, expenses, and savings goals, " +
              'return 3 to 5 short, specific, actionable tips to help them save more or reach their ' +
              'goals faster. Respond ONLY with JSON in exactly this shape: {"tips": ["tip one", "tip two"]}. ' +
              'Each tip must be one sentence, under 160 characters, plain language, no markdown.',
          },
          { role: 'user', content: summary },
        ],
      }),
    })
  } catch {
    return jsonResponse({ error: 'Could not reach the Groq API.' }, 502)
  }

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text()
    return jsonResponse({ error: `Groq API error: ${errorText}` }, 502)
  }

  const groqData = await groqResponse.json()
  const content = groqData?.choices?.[0]?.message?.content

  let tips: string[] = []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed.tips)) {
      tips = parsed.tips.filter((tip: unknown): tip is string => typeof tip === 'string')
    }
  } catch {
    return jsonResponse({ error: 'Failed to parse the AI response.' }, 502)
  }

  if (tips.length === 0) {
    return jsonResponse({ error: 'The AI returned no usable tips.' }, 502)
  }

  return jsonResponse({ tips })
})
