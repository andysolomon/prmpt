import { PromptSpec } from '../schema';
import { formatChatText } from './chatText';

export interface ApiMessages {
  system: string;
  user: string;
  developer?: string;
}

export function formatApiMessages(spec: PromptSpec): ApiMessages {
  const systemLines = [
    spec.persona ? `You are ${spec.persona}.` : 'You are a senior software engineer assistant.',
    'Produce concrete, correct, and reviewable output.',
    'Follow the requested output contract and constraints exactly.',
  ];

  const user = formatChatText(spec);

  return {
    system: systemLines.join(' '),
    user,
  };
}
