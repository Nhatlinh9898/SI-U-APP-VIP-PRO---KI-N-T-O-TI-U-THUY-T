import { GoogleGenAI, Schema, Type } from "@google/genai";
import { StoryNode, NodeType, GeneratorStyle } from "../types";

// Helper to clean JSON string if Gemini adds markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
};

export const generateStructure = async (
  apiKey: string,
  idea: string
): Promise<StoryNode> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    Bạn là một kiến trúc sư tiểu thuyết đại tài (Linh Master AI). 
    Nhiệm vụ: Phân tích ý tưởng và tạo ra sơ đồ cấu trúc tiểu thuyết chi tiết.
    Cấu trúc bắt buộc: TiểuThuyết -> Phần -> Chương -> Hồi -> Mục.
    
    Yêu cầu đầu ra: JSON thuần túy, không markdown.
    Cấu trúc JSON phải là một đối tượng đệ quy với trường 'children'.
    Root node là TiểuThuyết.
    
    Ví dụ cấu trúc mong muốn:
    {
      "title": "Tên Truyện",
      "type": "TiểuThuyết",
      "children": [
        {
          "title": "Phần 1: Khởi Đầu",
          "type": "Phần",
          "children": [
             { "title": "Chương 1", "type": "Chương", "children": [...] }
          ]
        }
      ]
    }
  `;

  const userPrompt = `
    Ý tưởng tiểu thuyết: "${idea}".
    Hãy tạo ra một cấu trúc hoàn chỉnh. 
    Tiểu thuyết nên có ít nhất 2 Phần. Mỗi Phần 2 Chương. Mỗi Chương 2 Hồi. Mỗi Hồi 1-2 Mục.
    Đặt tên tiêu đề thật hấp dẫn cho từng node.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-latest",
    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n" + userPrompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) throw new Error("Không nhận được dữ liệu từ AI.");

  const rawData = JSON.parse(cleanJson(response.text));
  
  // Post-process to ensure IDs and Types are correct
  const processNode = (node: any, type: NodeType): StoryNode => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      title: node.title || node.TiểuThuyết || node.Phần || node.Chương || "Không tên",
      children: (node.children || []).map((child: any) => {
        let childType = NodeType.PART;
        if (type === NodeType.PART) childType = NodeType.CHAPTER;
        if (type === NodeType.CHAPTER) childType = NodeType.ACT;
        if (type === NodeType.ACT) childType = NodeType.SECTION;
        return processNode(child, childType);
      }),
      isExpanded: true
    };
  };

  return processNode(rawData, NodeType.NOVEL);
};

export const generateContent = async (
  apiKey: string,
  context: string,
  style: GeneratorStyle = GeneratorStyle.DRAMATIC,
  currentContent: string = ""
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Bạn là một nhà văn đại tài với phong cách ${style}.
    Nhiệm vụ: Viết tiếp hoặc viết mới nội dung cho: ${context}.
    
    Dữ liệu hiện tại (nếu có): "${currentContent.slice(-500)}"
    
    Yêu cầu:
    - Giữ đúng mạch truyện và phong cách ${style}.
    - Viết chi tiết, có miêu tả nhân vật, bối cảnh, cảm xúc sâu sắc.
    - Tạo ra đoạn văn dài ít nhất 300 từ.
    - Kết thúc mở để có thể viết tiếp.
    - Chỉ trả về nội dung văn bản, không trả về JSON hay lời dẫn.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-latest",
    contents: prompt,
  });

  return response.text || "";
};

export const generateBridge = async (
  apiKey: string,
  context: string,
  style: GeneratorStyle
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Bạn là một công cụ viết tiểu thuyết. Sau khi kết thúc node: ${context}.
    Hãy viết ra 3 lựa chọn "dẫn chuyện" để nối mạch sang phần tiếp theo.
    Phong cách: ${style}.
    
    Yêu cầu:
    - Mỗi lựa chọn dài 2-4 câu.
    - Xuất ra JSON Array of Strings: ["Lựa chọn 1...", "Lựa chọn 2...", "Lựa chọn 3..."]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  if (!response.text) return [];
  return JSON.parse(cleanJson(response.text));
};

export const generateTitle = async (apiKey: string, content: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Đọc nội dung sau và đặt một tiêu đề Tiếng Việt thật kêu, sang trọng, VIP PRO (3-8 từ):
      "${content.slice(0, 1000)}"
      Chỉ trả về text tiêu đề.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-latest",
        contents: prompt,
    });
    return response.text?.trim() || "Tiêu đề mới";
}
