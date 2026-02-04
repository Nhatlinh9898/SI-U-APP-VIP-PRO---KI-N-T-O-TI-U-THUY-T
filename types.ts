export enum NodeType {
  NOVEL = 'TiểuThuyết',
  PART = 'Phần',
  CHAPTER = 'Chương',
  ACT = 'Hồi',
  SECTION = 'Mục'
}

export interface StoryNode {
  id: string;
  type: NodeType;
  title: string;
  summary?: string;
  content?: string;
  children: StoryNode[];
  isExpanded?: boolean;
}

export interface GenerationRequest {
  idea: string;
  parts: number;
  chaptersPerPart: number;
  actsPerChapter: number;
}

export enum GeneratorStyle {
  ROMANTIC = 'Lãng Mạn',
  DRAMATIC = 'Kịch Tính',
  MYSTERY = 'Bí Ẩn',
  HUMOROUS = 'Hài Hước',
  SATIRE = 'Trào Phúng'
}

export interface ContentGenerationParams {
  nodeContext: string; // The full path/context e.g. "Phần 1 -> Chương 1"
  userPrompt?: string; // Additional instructions
  style?: GeneratorStyle;
  previousContentSummary?: string;
}

export interface VoiceConfig {
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
}
