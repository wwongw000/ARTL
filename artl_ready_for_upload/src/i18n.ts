// i18n.ts - Internationalization support for ARTL application

export type AnalysisLanguage = 'en' | 'zh-TW' | 'zh-CN';

interface Translations {
  [key: string]: {
    en: string;
    'zh-TW': string;
    'zh-CN': string;
  };
}

// All UI text translations
export const translations: Translations = {
  // Header
  'slogan': {
    'en': 'Art. Decoded.',
    'zh-TW': '藝術 · 解碼',
    'zh-CN': '艺术 · 解码'
  },
  
  // Main sections
  'analyzing_artwork': {
    'en': 'Analyzing Artwork...',
    'zh-TW': '正在分析藝術品...',
    'zh-CN': '正在分析艺术品...'
  },
  'please_wait': {
    'en': 'Please wait while the AI processes your submission. This may take a moment.',
    'zh-TW': '請稍候，AI正在處理您的提交。這可能需要一點時間。',
    'zh-CN': '请稍候，AI正在处理您的提交。这可能需要一点时间。'
  },
  
  // Artwork section
  'artwork': {
    'en': 'Artwork',
    'zh-TW': '藝術品',
    'zh-CN': '艺术品'
  },
  'artwork_photo': {
    'en': 'Artwork Photo',
    'zh-TW': '藝術品照片',
    'zh-CN': '艺术品照片'
  },
  'take_upload_photo': {
    'en': 'Take or upload a clear photo of the artwork.',
    'zh-TW': '拍攝或上傳清晰的藝術品照片。',
    'zh-CN': '拍摄或上传清晰的艺术品照片。'
  },
  'take_artwork_photo': {
    'en': 'Take Artwork Photo',
    'zh-TW': '拍攝藝術品照片',
    'zh-CN': '拍摄艺术品照片'
  },
  'upload_artwork_photo': {
    'en': 'Upload Artwork Photo',
    'zh-TW': '上傳藝術品照片',
    'zh-CN': '上传艺术品照片'
  },
  'original': {
    'en': 'Original',
    'zh-TW': '原始尺寸',
    'zh-CN': '原始尺寸'
  },
  
  // Information section
  'submitted_information': {
    'en': 'Submitted Information',
    'zh-TW': '提交的資訊',
    'zh-CN': '提交的信息'
  },
  'artwork_information': {
    'en': 'Artwork Information',
    'zh-TW': '藝術品資訊',
    'zh-CN': '艺术品信息'
  },
  'processing_label': {
    'en': '(Processing Label...)',
    'zh-TW': '(正在處理標籤...)',
    'zh-CN': '(正在处理标签...)'
  },
  'provide_details': {
    'en': 'Provide details about the artwork. If you upload a label photo, we\'ll try to fill this automatically.',
    'zh-TW': '提供有關藝術品的詳細資訊。如果您上傳標籤照片，我們將嘗試自動填寫。',
    'zh-CN': '提供有关艺术品的详细信息。如果您上传标签照片，我们将尝试自动填写。'
  },
  'artist_name': {
    'en': 'Artist Name:',
    'zh-TW': '藝術家名稱：',
    'zh-CN': '艺术家名称：'
  },
  'artwork_title': {
    'en': 'Artwork Title:',
    'zh-TW': '作品標題：',
    'zh-CN': '作品标题：'
  },
  'medium': {
    'en': 'Medium:',
    'zh-TW': '媒材：',
    'zh-CN': '媒材：'
  },
  'year': {
    'en': 'Year:',
    'zh-TW': '年份：',
    'zh-CN': '年份：'
  },
  'dimensions': {
    'en': 'Dimensions:',
    'zh-TW': '尺寸：',
    'zh-CN': '尺寸：'
  },
  'other_notes': {
    'en': 'Other Notes:',
    'zh-TW': '其他備註：',
    'zh-CN': '其他备注：'
  },
  
  // Label photo section
  'label_photo': {
    'en': 'Artwork Label',
    'zh-TW': '作品標籤',
    'zh-CN': '作品标签'
  },
  'take_upload_label': {
    'en': 'Take or upload a photo of the artwork label to automatically extract information.',
    'zh-TW': '拍攝或上傳作品標籤照片，以自動提取資訊。',
    'zh-CN': '拍摄或上传作品标签照片，以自动提取信息。'
  },
  'take_label_photo': {
    'en': 'Take Artwork Label Photo',
    'zh-TW': '拍攝作品標籤照片',
    'zh-CN': '拍摄作品标签照片'
  },
  'upload_label_photo': {
    'en': 'Upload Artwork Label Photo',
    'zh-TW': '上傳作品標籤照片',
    'zh-CN': '上传作品标签照片'
  },
  
  // Analysis section
  'ai_analysis': {
    'en': 'AI Analysis',
    'zh-TW': 'AI 分析',
    'zh-CN': 'AI 分析'
  },
  'analyze_artwork': {
    'en': 'Analyze Artwork',
    'zh-TW': '分析藝術品',
    'zh-CN': '分析艺术品'
  },
  'analyze_another': {
    'en': 'Analyze Another Artwork',
    'zh-TW': '分析另一件藝術品',
    'zh-CN': '分析另一件艺术品'
  },
  
  // Error messages
  'error': {
    'en': 'Error',
    'zh-TW': '錯誤',
    'zh-CN': '错误'
  },
  'close_error': {
    'en': 'Close Error',
    'zh-TW': '關閉錯誤',
    'zh-CN': '关闭错误'
  },
  'upload_artwork_first': {
    'en': 'Please upload an artwork photo.',
    'zh-TW': '請上傳藝術品照片。',
    'zh-CN': '请上传艺术品照片。'
  },
  'ocr_error': {
    'en': 'Error during OCR processing. Please try again or input manually.',
    'zh-TW': 'OCR處理過程中出錯。請重試或手動輸入。',
    'zh-CN': 'OCR处理过程中出错。请重试或手动输入。'
  },
  'api_error': {
    'en': 'Failed to get analysis from AI. Please check your API key or network connection and try again.',
    'zh-TW': '無法從AI獲取分析。請檢查您的API密鑰或網絡連接，然後重試。',
    'zh-CN': '无法从AI获取分析。请检查您的API密钥或网络连接，然后重试。'
  },
  
  // Field labels in result view
  'artist': {
    'en': 'Artist:',
    'zh-TW': '藝術家：',
    'zh-CN': '艺术家：'
  },
  'title': {
    'en': 'Title:',
    'zh-TW': '標題：',
    'zh-CN': '标题：'
  },
  'year_label': {
    'en': 'Year:',
    'zh-TW': '年份：',
    'zh-CN': '年份：'
  },
  'notes': {
    'en': 'Notes:',
    'zh-TW': '備註：',
    'zh-CN': '备注：'
  },
  'na': {
    'en': 'N/A',
    'zh-TW': '無資料',
    'zh-CN': '无数据'
  },
  
  // Placeholder texts
  'artist_placeholder': {
    'en': 'e.g., Vincent van Gogh',
    'zh-TW': '例如：梵谷',
    'zh-CN': '例如：梵高'
  },
  'title_placeholder': {
    'en': 'e.g., The Starry Night',
    'zh-TW': '例如：星夜',
    'zh-CN': '例如：星夜'
  },
  'medium_placeholder': {
    'en': 'e.g., Oil on canvas',
    'zh-TW': '例如：油彩畫布',
    'zh-CN': '例如：油彩画布'
  },
  'year_placeholder': {
    'en': 'e.g., 1889',
    'zh-TW': '例如：1889',
    'zh-CN': '例如：1889'
  },
  'dimensions_placeholder': {
    'en': 'e.g., 73.7 cm × 92.1 cm',
    'zh-TW': '例如：73.7 公分 × 92.1 公分',
    'zh-CN': '例如：73.7 厘米 × 92.1 厘米'
  },
  'notes_placeholder': {
    'en': 'Any additional context or questions about the artwork...',
    'zh-TW': '關於藝術品的任何額外背景或問題...',
    'zh-CN': '关于艺术品的任何额外背景或问题...'
  },
  
  // Additional descriptions
  'provide_details_simple': {
    'en': 'Provide details about the artwork.',
    'zh-TW': '提供藝術品的詳細資訊。',
    'zh-CN': '提供艺术品的详细信息。'
  },
  'auto_fill_help': {
    'en': 'This helps us auto-fill artwork information below.',
    'zh-TW': '這有助於我們自動填寫下方的藝術品資訊。',
    'zh-CN': '这有助于我们自动填写下方的艺术品信息。'
  },
  
  // Footer content
  'disclaimer_title': {
    'en': 'Disclaimer:',
    'zh-TW': '免責聲明：',
    'zh-CN': '免责声明：'
  },
  'disclaimer_text': {
    'en': 'Artl.app provides AI-generated interpretations of artwork for educational, creative, and entertainment purposes. The insights are subjective and should not be considered professional art critique or academic analysis. Users are responsible for the content they upload and share.',
    'zh-TW': 'Artl.app 提供 AI 生成的藝術品詮釋，用於教育、創意和娛樂目的。這些見解是主觀的，不應被視為專業藝術評論或學術分析。用戶對其上傳和分享的內容負責。',
    'zh-CN': 'Artl.app 提供 AI 生成的艺术品诠释，用于教育、创意和娱乐目的。这些见解是主观的，不应被视为专业艺术评论或学术分析。用户对其上传和分享的内容负责。'
  },
  'copyright_text': {
    'en': '© 2025 Artl.app. All rights reserved.',
    'zh-TW': '© 2025 Artl.app. 版權所有。',
    'zh-CN': '© 2025 Artl.app. 版权所有。'
  }
};

// Function to get translation
export function getTranslation(key: string, language: AnalysisLanguage): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translations[key][language];
}

