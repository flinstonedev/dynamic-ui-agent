import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { respond } from '../../../src/agent/index';
import type { ChatMessage } from '../../../src/agent/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Convert messages to ChatMessage format for history
    const history: ChatMessage[] = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
      content: msg.content,
    }));

    // Generate structured UI response
    const agentResponse = await respond(lastMessage.content, { history });

    // Create a readable stream that sends the structured response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the agent response as a data event
        const data = JSON.stringify({
          type: 'ui',
          data: agentResponse,
        });
        
        controller.enqueue(encoder.encode(`0:${JSON.stringify(data)}\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
