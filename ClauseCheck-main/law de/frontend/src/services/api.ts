import axios from 'axios';

// Point to the dedicated Law Simulation backend port
const API_BASE_URL = 'http://localhost:5173';

export interface CaseData {
  case_type: string;
  facts: string;
  charges: string;
  evidence?: string;
}

export interface CaseResponse {
  id: number;
  case_type: string;
  facts: string;
  charges: string;
  evidence?: string;
  session_id: string;
}

export interface HelpRequest {
  session_id: string;
  help_type: 'understand' | 'custom';
  custom_query?: string;
}

export interface AnalysisResponse {
  win_probability: number;
  case_cons: string[];
}

export interface DocumentUploadResponse {
  success: boolean;
  case_details: CaseData;
  document_text_preview?: string;
}

export interface HelpResponse {
  content: string;
  ready_response?: string;
}

export const api = {
  createCase: async (caseData: CaseData): Promise<CaseResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/case/create`, caseData);
    return response.data;
  },

  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/document/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHelp: async (helpRequest: HelpRequest): Promise<HelpResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/help`, helpRequest);
    return response.data;
  },

  analyzeCase: async (sessionId: string): Promise<AnalysisResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/analyze/${sessionId}`);
    return response.data;
  },

  getWebSocketUrl: (sessionId: string): string => {
    return `ws://localhost:5173/ws/simulation/${sessionId}`;
  }
};
