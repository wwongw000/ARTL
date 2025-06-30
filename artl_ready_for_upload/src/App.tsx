import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import './App.css';
import logo from './assets/new_logo_update.jpeg';
import { AnalysisLanguage, getTranslation } from './i18n';

interface ArtworkInfo {
  artistName: string;
  title: string;
  medium: string;
  year: string;
  dimensions: string;
  notes: string;
}

interface AnalysisResult {
  description: string;
  summary?: string;
}

// Using AnalysisLanguage from i18n.ts

const API_KEY = "AIzaSyDInUDdULJRcYcaWV1FXJthEJQc1GS_MAk";
const genAI = new GoogleGenerativeAI(API_KEY);

function dataUrlToGenerativePart(dataUrl: string, mimeType: string): Part {
  return {
    inlineData: {
      data: dataUrl.split(',')[1],
      mimeType
    },
  };
}

function App() {
  const [selectedArtworkImage, setSelectedArtworkImage] = useState<string | null>(null);
  const [selectedLabelImage, setSelectedLabelImage] = useState<string | null>(null);
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo>({
    artistName: '',
    title: '',
    medium: '',
    year: '',
    dimensions: '',
    notes: '',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentView, setCurrentView] = useState<'form' | 'loading' | 'result'>('form');
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysisLanguage, setAnalysisLanguage] = useState<AnalysisLanguage>('en'); // Default to English
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  const artworkFileInputRef = useRef<HTMLInputElement>(null);
  const labelFileInputRef = useRef<HTMLInputElement>(null);

  const handleArtworkImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedArtworkImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseOcrText = (text: string): Partial<ArtworkInfo> => {
    const info: Partial<ArtworkInfo> = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('artist:')) {
        info.artistName = line.substring(line.toLowerCase().indexOf('artist:') + 'artist:'.length).trim();
      } else if (lowerLine.includes('title:')) {
        info.title = line.substring(line.toLowerCase().indexOf('title:') + 'title:'.length).trim();
      } else if (lowerLine.includes('medium:')) {
        info.medium = line.substring(line.toLowerCase().indexOf('medium:') + 'medium:'.length).trim();
      } else if (lowerLine.includes('year:')) {
        info.year = line.substring(line.toLowerCase().indexOf('year:') + 'year:'.length).trim();
      } else if (lowerLine.match(/\b(artist|by)\b/i) && !info.artistName) {
        const parts = line.split(/\b(artist|by)\b/i);
        if (parts.length > 1) info.artistName = parts.pop()?.trim();
      } else if (lowerLine.match(/\b(title|untitled)\b/i) && !info.title) {
        const parts = line.split(/\b(title|untitled)\b/i);
        if (parts.length > 1) info.title = parts.pop()?.trim() || (lowerLine.includes('untitled') ? 'Untitled' : '');
      }
    });
    if (!info.title && lines.length > 0) info.title = lines[0];
    if (!info.artistName && lines.length > 1) info.artistName = lines[1];
    return info;
  };

  const handleLabelImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        setSelectedLabelImage(imageDataUrl);
        setIsOcrProcessing(true);
        setApiError(null);
        try {
          const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', { logger: m => console.log(m) });
          const parsedInfo = parseOcrText(text);
          setArtworkInfo(prevInfo => ({ ...prevInfo, ...parsedInfo }));
        } catch (error) {
          console.error('OCR Error:', error);
          setApiError('Error during OCR processing. Please try again or input manually.');
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setArtworkInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedArtworkImage) {
      alert('Please upload an artwork photo.');
      return;
    }
    setCurrentView('loading');
    setAnalysisResult(null);
    setApiError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const imagePart = dataUrlToGenerativePart(selectedArtworkImage, 'image/jpeg');
      
      let promptText = '';
      const artworkDetails = `\n- Artwork Title: ${artworkInfo.title || 'Not Provided'}\n- Artist Name: ${artworkInfo.artistName || 'Not Provided'}\n- Medium: ${artworkInfo.medium || 'Not Provided'}\n- Year of Creation: ${artworkInfo.year || 'Not Provided'}`;

      if (analysisLanguage === 'en') {
        promptText = `You are a very experienced art critic with vast knowledge and good taste. After obtaining the artwork photo and label, search online for its information.

Analyze as an experienced art critic the following artwork based on the image and the provided details:
${artworkDetails}

Given the uploaded image of the artwork, along with details such as the title, artist name, medium, and year of creation, as an experienced art critic, provide a brief analysis. Summarize the key visual elements (such as colors, composition, and technique), offer insights into the artist's style and influences, and explain the artwork's significance in its historical or cultural context. Keep the analysis between 200 to 500 words, focusing on a general understanding of the artwork for a wide audience. Respond in English.`;
      } else if (analysisLanguage === 'zh-TW') {
        promptText = `您是一位經驗豐富的藝術評論家，擁有廣博的知識和良好的品味。在取得藝術品照片和標籤後，請先在網路上搜尋其相關資訊。

請以經驗豐富的藝術評論家身份，根據提供的圖片和以下藝術品資訊，對此藝術品進行分析：
${artworkDetails.replace('Artwork Title', '作品標題').replace('Artist Name', '藝術家名稱').replace('Medium', '媒材').replace('Year of Creation', '創作年份')}

根據上傳的藝術品圖片，以及作品標題、藝術家名稱、媒材和創作年份等詳細資訊，以經驗豐富的藝術評論家身份提供簡要分析。總結關鍵的視覺元素（例如顏色、構圖和技巧），提供對藝術家風格和影響的見解，並解釋該藝術品在其歷史或文化背景下的重要性。將分析內容控制在200到500字之間，著重於讓廣大觀眾對藝術品有概括性的理解。請以繁體中文回應。`;
      } else if (analysisLanguage === 'zh-CN') {
        promptText = `您是一位经验丰富的艺术评论家，拥有广博的知识和良好的品味。在获取艺术品照片和标签后，请先在网络上搜索其相关信息。

请以经验丰富的艺术评论家身份，根据提供的图片和以下艺术品信息，对此艺术品进行分析：
${artworkDetails.replace('Artwork Title', '作品标题').replace('Artist Name', '艺术家名称').replace('Medium', '媒材').replace('Year of Creation', '创作年份')}

根据上传的艺术品图片，以及作品标题、艺术家名称、媒材和创作年份等详细信息，以经验丰富的艺术评论家身份提供简要分析。总结关键的视觉元素（例如颜色、构图和技巧），提供对艺术家风格和影响的见解，并解释该艺术品在其历史或文化背景下的重要性。将分析内容控制在200到500字之间，着重于让广大观众对艺术品有概括性的理解。请以简体中文回应。`;
      }
      
      if (artworkInfo.notes) {
        if (analysisLanguage === 'en') {
          promptText += `\n- Additional Notes: ${artworkInfo.notes}`;
        } else if (analysisLanguage === 'zh-TW') {
          promptText += `\n- 其他備註: ${artworkInfo.notes}`;
        } else if (analysisLanguage === 'zh-CN') {
          promptText += `\n- 其他备注: ${artworkInfo.notes}`;
        }
      }

      const result = await model.generateContent([promptText, imagePart]);
      const response = result.response;
      const analysisText = response.text();
      
      // Generate summary immediately after getting the full analysis
      const summaryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      let summaryPrompt = '';
      if (analysisLanguage === 'en') {
        summaryPrompt = `Please provide a concise summary of the following art analysis in 50-100 words, focusing on the key points and main insights:\n\n${analysisText}`;
      } else if (analysisLanguage === 'zh-TW') {
        summaryPrompt = `請為以下藝術分析提供一個簡潔的摘要，控制在50-100字內，重點關注關鍵要點和主要見解：\n\n${analysisText}`;
      } else if (analysisLanguage === 'zh-CN') {
        summaryPrompt = `请为以下艺术分析提供一个简洁的摘要，控制在50-100字内，重点关注关键要点和主要见解：\n\n${analysisText}`;
      }
      
      try {
        const summaryResult = await summaryModel.generateContent(summaryPrompt);
        const summaryResponse = summaryResult.response;
        const summaryText = summaryResponse.text();
        setAnalysisResult({ description: analysisText, summary: summaryText });
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        setAnalysisResult({ description: analysisText });
      }
      
      setCurrentView('result');
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      let detailedErrorMessage = 'Failed to get analysis from AI. Please check your API key or network connection and try again.';
      if (error.message) {
        detailedErrorMessage += `\nError details: ${error.message}`;
      }
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        detailedErrorMessage += `\nAPI Error: ${error.response.data.error.message}`;
      }
      if (error.name === 'GoogleGenerativeAIError') {
        detailedErrorMessage += `\n(GoogleGenerativeAIError)`;
      }
      setApiError(detailedErrorMessage);
      setCurrentView('form');
    } finally {
      // Analysis loading complete
    }
  };

  const handleAnalyzeAnother = () => {
    setSelectedArtworkImage(null);
    setSelectedLabelImage(null);
    setArtworkInfo({ artistName: '', title: '', medium: '', year: '', dimensions: '', notes: '' });
    setAnalysisResult(null);
    setCurrentView('form');
    setApiError(null);
    setShowFullAnalysis(false);
    if(artworkFileInputRef.current) artworkFileInputRef.current.value = '';
    if(labelFileInputRef.current) labelFileInputRef.current.value = '';
  };

  const saveArtworkPhoto = async () => {
    if (!selectedArtworkImage) return;
    
    try {
      // For mobile devices, try to use the Web Share API to save to photos
      if (navigator.share && navigator.canShare) {
        // Convert image to blob
        const response = await fetch(selectedArtworkImage);
        const blob = await response.blob();
        const file = new File([blob], `artwork_${artworkInfo.title || 'untitled'}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Artwork Photo',
            text: 'Save this artwork photo to your photos'
          });
          return;
        }
      }
      
      // Fallback: Create download link
      const link = document.createElement('a');
      link.href = selectedArtworkImage;
      link.download = `artwork_${artworkInfo.title || 'untitled'}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Artwork photo saved! On mobile, you can save it to your photo gallery from the download.');
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Unable to save photo. Please try long-pressing the image and selecting "Save to Photos" or "Add to Photos".');
    }
  };

  const generateAnalysisImage = async (): Promise<Blob | null> => {
    if (!analysisResult || !selectedArtworkImage) return null;
    
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Set canvas dimensions (A4-like ratio)
      const canvasWidth = 800;
      const canvasHeight = 1200;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Fill background with dark color (matching website)
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Load and draw ARTL logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          // Draw camera aperture logo on the left side (like template)
          const logoSize = 80;
          const logoX = 60;
          const logoY = 40;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          
          // Add ARTL text immediately next to the logo (same horizontal line)
          ctx.fillStyle = '#c99383';
          ctx.font = 'bold 64px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('ARTL', logoX + logoSize + 20, logoY + 50);
          
          // Add website URL centered below both logo and text
          ctx.font = '20px Arial';
          ctx.fillStyle = '#c99383';
          ctx.textAlign = 'center';
          ctx.fillText('https://artl.app', canvasWidth / 2, logoY + logoSize + 50);
          
          resolve(null);
        };
        logoImg.onerror = reject;
        logoImg.src = logo;
      });
      
      // Load and draw artwork image
      const artworkImg = new Image();
      artworkImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        artworkImg.onload = () => {
          // Calculate artwork image dimensions (larger size like template)
          const maxArtworkWidth = 500;
          const maxArtworkHeight = 400;
          const artworkRatio = artworkImg.width / artworkImg.height;
          
          let artworkWidth, artworkHeight;
          if (artworkRatio > maxArtworkWidth / maxArtworkHeight) {
            artworkWidth = maxArtworkWidth;
            artworkHeight = maxArtworkWidth / artworkRatio;
          } else {
            artworkHeight = maxArtworkHeight;
            artworkWidth = maxArtworkHeight * artworkRatio;
          }
          
          const artworkX = (canvasWidth - artworkWidth) / 2;
          const artworkY = 180;
          
          // Draw artwork with rose gold border frame and rounded corners (matching template)
          const borderWidth = 6;
          const cornerRadius = 12;
          
          // Draw rounded rectangle frame
          ctx.strokeStyle = '#c99383';
          ctx.lineWidth = borderWidth;
          ctx.beginPath();
          ctx.roundRect(artworkX - borderWidth, artworkY - borderWidth, artworkWidth + borderWidth * 2, artworkHeight + borderWidth * 2, cornerRadius);
          ctx.stroke();
          
          // Clip and draw artwork with rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(artworkX, artworkY, artworkWidth, artworkHeight, cornerRadius - borderWidth);
          ctx.clip();
          ctx.drawImage(artworkImg, artworkX, artworkY, artworkWidth, artworkHeight);
          ctx.restore();
          
          // Add artwork title below image in rose gold (larger font like template)
          ctx.fillStyle = '#c99383';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          const infoY = artworkY + artworkHeight + 50;
          
          if (artworkInfo.title) {
            ctx.fillText(artworkInfo.title, canvasWidth / 2, infoY);
          }
          if (artworkInfo.artistName && artworkInfo.year) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`${artworkInfo.artistName}, ${artworkInfo.year}`, canvasWidth / 2, infoY + 40);
          } else if (artworkInfo.artistName) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(artworkInfo.artistName, canvasWidth / 2, infoY + 40);
          }
          
          resolve(null);
        };
        artworkImg.onerror = reject;
        artworkImg.src = selectedArtworkImage;
      });
      
      // Add analysis text at the bottom in white
      const analysisText = showFullAnalysis || !analysisResult.summary 
        ? analysisResult.description 
        : analysisResult.summary;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      
      // Word wrap the analysis text
      const maxWidth = canvasWidth - 80;
      const lineHeight = 22;
      let currentY = 750;
      
      // Split text into paragraphs
      const paragraphs = analysisText.split('\n').filter(p => p.trim());
      
      paragraphs.forEach(paragraph => {
        const words = paragraph.split(' ');
        let line = '';
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line.trim(), 40, currentY);
            line = word + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        });
        
        if (line.trim()) {
          ctx.fillText(line.trim(), 40, currentY);
          currentY += lineHeight;
        }
        
        currentY += 10; // Extra space between paragraphs
      });
      
      // Add footer in rose gold
      ctx.fillStyle = '#c99383';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Generated by ARTL - Instant AI Art Analysis', canvasWidth / 2, canvasHeight - 30);
      ctx.fillText(new Date().toLocaleDateString(), canvasWidth / 2, canvasHeight - 15);
      
      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
      
    } catch (error) {
      console.error('Error generating analysis image:', error);
      return null;
    }
  };

  const saveAnalysisImage = async () => {
    const blob = await generateAnalysisImage();
    if (!blob) {
      alert('Unable to generate analysis image. Please try again.');
      return;
    }
    
    try {
      const file = new File([blob], `artl_analysis_${artworkInfo.title || 'artwork'}_${Date.now()}.png`, { type: 'image/png' });
      
      // Try to use Web Share API for mobile photo saving
      if (navigator.share && navigator.canShare) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'ARTL Art Analysis',
              text: 'Save this art analysis to your photos'
            });
            return;
          }
        } catch (shareError) {
          console.log('Share failed, falling back to download');
        }
      }
      
      // Fallback: Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `artl_analysis_${artworkInfo.title || 'artwork'}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Analysis image saved! On mobile, you can save it to your photo gallery from the download.');
    } catch (error) {
      console.error('Error saving analysis image:', error);
      alert('Unable to save analysis image. Please try again.');
    }
  };

  const shareAnalysis = async () => {
    const blob = await generateAnalysisImage();
    if (!blob) {
      alert('Unable to generate analysis image. Please try again.');
      return;
    }
    
    try {
      const file = new File([blob], `artl_analysis_${artworkInfo.title || 'artwork'}_${Date.now()}.png`, { type: 'image/png' });
      
      const shareText = `Analyzed with ARTL - Instant AI Art Analysis
https://artl.app/`;

      if (navigator.share && navigator.canShare) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              text: shareText
            });
            return;
          }
        } catch (shareError) {
          console.log('Image share failed, falling back to text share');
        }
      }
      
      // Fallback: Share text and copy image to clipboard if possible
      fallbackShare(shareText);
    } catch (error) {
      console.error('Error sharing analysis:', error);
      // Fallback to text sharing
      const shareText = `Analyzed with ARTL - Instant AI Art Analysis
https://artl.app/`;
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Analysis details copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Analysis details copied to clipboard!');
    });
  };

  if (currentView === 'loading') {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="ARTL Logo" className="App-logo" />
          <p className="app-slogan">{getTranslation('slogan', analysisLanguage)}</p>
          <button 
            className="language-icon" 
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            aria-label="Change language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="globe-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
          {showLanguageMenu && (
            <div className="language-menu">
              <button 
                className={`language-menu-item ${analysisLanguage === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('en')}
              >
                English
              </button>
              <button 
                className={`language-menu-item ${analysisLanguage === 'zh-TW' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('zh-TW')}
              >
                繁體中文 (Traditional Chinese)
              </button>
              <button 
                className={`language-menu-item ${analysisLanguage === 'zh-CN' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('zh-CN')}
              >
                简体中文 (Simplified Chinese)
              </button>
            </div>
          )}
        </header>
        <main className="loading-view">
          <h2>{getTranslation('analyzing_artwork', analysisLanguage)}</h2>
          <div className="spinner"></div>
          <p>{getTranslation('please_wait', analysisLanguage)}</p>
        </main>
      </div>
    );
  }

  if (currentView === 'result' && analysisResult) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="ARTL Logo" className="App-logo" />
          <p className="app-slogan">{getTranslation('slogan', analysisLanguage)}</p>
          <button 
            className="language-icon" 
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            aria-label="Change language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="globe-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
          {showLanguageMenu && (
            <div className="language-menu">
              <button 
                className={`language-menu-item ${analysisLanguage === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('en')}
              >
                English
              </button>
              <button 
                className={`language-menu-item ${analysisLanguage === 'zh-TW' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('zh-TW')}
              >
                繁體中文 (Traditional Chinese)
              </button>
              <button 
                className={`language-menu-item ${analysisLanguage === 'zh-CN' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('zh-CN')}
              >
                简体中文 (Simplified Chinese)
              </button>
            </div>
          )}
        </header>
        <main className="result-view">
          {selectedArtworkImage && (
            <section className="preview-section card">
              <h2>{getTranslation('artwork', analysisLanguage)}</h2>
              <div className="image-preview-container">
                <img src={selectedArtworkImage} alt="Artwork" className="artwork-preview-image" />
              </div>
            </section>
          )}
          <section className="info-display-section card">
            <h2>{getTranslation('submitted_information', analysisLanguage)}</h2>
            <p><strong>{getTranslation('artist', analysisLanguage)}</strong> {artworkInfo.artistName || getTranslation('na', analysisLanguage)}</p>
            <p><strong>{getTranslation('title', analysisLanguage)}</strong> {artworkInfo.title || getTranslation('na', analysisLanguage)}</p>
            <p><strong>{getTranslation('medium', analysisLanguage)}</strong> {artworkInfo.medium || getTranslation('na', analysisLanguage)}</p>
            <p><strong>{getTranslation('year_label', analysisLanguage)}</strong> {artworkInfo.year || getTranslation('na', analysisLanguage)}</p>
            <p><strong>{getTranslation('dimensions', analysisLanguage)}</strong> {artworkInfo.dimensions || getTranslation('na', analysisLanguage)}</p>
            <p><strong>{getTranslation('notes', analysisLanguage)}</strong> {artworkInfo.notes || getTranslation('na', analysisLanguage)}</p>
          </section>
          <section className="analysis-display-section card">
            <h2>{getTranslation('ai_analysis', analysisLanguage)} ({analysisLanguage === 'en' ? 'English' : analysisLanguage === 'zh-TW' ? '繁體中文' : '简体中文'})</h2>
            
            {/* Show translation loading indicator */}
            {isGeneratingSummary && (
              <div className="translation-loading">
                <p>Translating analysis...</p>
              </div>
            )}
            
            {/* Summary View - Show by default if summary exists */}
            {analysisResult.summary && !showFullAnalysis && !isGeneratingSummary && (
              <div className="analysis-summary">
                <div className="summary-header">
                  <h3>Summary</h3>
                  <span className="reading-time">~30 sec read</span>
                </div>
                {analysisResult.summary.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ fontSize: '15px', marginBottom: '1em' }}>{paragraph}</p>
                ))}
                <div className="analysis-controls">
                  <button 
                    onClick={() => setShowFullAnalysis(true)} 
                    className="read-more-button"
                  >
                    Read Full Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Full Analysis View */}
            {(showFullAnalysis || (!analysisResult.summary && !isGeneratingSummary)) && (
              <div className="analysis-full">
                {analysisResult.summary && (
                  <div className="analysis-header">
                    <h3>Full Analysis</h3>
                    <span className="reading-time">~2-3 min read</span>
                  </div>
                )}
                {analysisResult.description.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ fontSize: '15px', marginBottom: '1em' }}>{paragraph}</p>
                ))}
                {analysisResult.summary && (
                  <div className="analysis-controls">
                    <button 
                      onClick={() => setShowFullAnalysis(false)} 
                      className="read-less-button"
                    >
                      Show Summary Only
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isGeneratingSummary && (
            <div className="action-buttons">
              <button onClick={saveArtworkPhoto} className="action-button photo-button">
                Save Photo
              </button>
              <button onClick={saveAnalysisImage} className="action-button save-button">
                Save Analysis
              </button>
              <button onClick={shareAnalysis} className="action-button share-button">
                Share Analysis
              </button>
            </div>
            )}
          </section>
          <button onClick={handleAnalyzeAnother} className="submit-button">{getTranslation('analyze_another', analysisLanguage)}</button>
        </main>
      </div>
    );
  }

  const handleLanguageSelect = async (language: AnalysisLanguage) => {
    const previousLanguage = analysisLanguage;
    setAnalysisLanguage(language);
    setShowLanguageMenu(false);
    
    console.log('Language changed from', previousLanguage, 'to', language);
    console.log('Analysis result exists:', !!analysisResult);
    
    // If there's existing analysis and language changed, translate it
    if (analysisResult && previousLanguage !== language) {
      console.log('Starting translation...');
      setIsGeneratingSummary(true);
      
      // Force a visible change immediately
      setAnalysisResult({
        description: `[Translating to ${language}...] ${analysisResult.description}`,
        summary: analysisResult.summary ? `[Translating summary...] ${analysisResult.summary}` : undefined
      });
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // Simple translation prompts
        let translatePrompt = '';
        if (language === 'en') {
          translatePrompt = `Translate to English:\n\n${analysisResult.description}`;
        } else if (language === 'zh-TW') {
          translatePrompt = `翻譯成繁體中文:\n\n${analysisResult.description}`;
        } else if (language === 'zh-CN') {
          translatePrompt = `翻译成简体中文:\n\n${analysisResult.description}`;
        }
        
        console.log('Sending translation request...');
        const translateResult = await model.generateContent(translatePrompt);
        const translatedText = translateResult.response.text();
        console.log('Translation completed');
        
        // Translate summary if it exists
        let translatedSummary = '';
        if (analysisResult.summary) {
          let summaryPrompt = '';
          if (language === 'en') {
            summaryPrompt = `Translate to English:\n\n${analysisResult.summary}`;
          } else if (language === 'zh-TW') {
            summaryPrompt = `翻譯成繁體中文:\n\n${analysisResult.summary}`;
          } else if (language === 'zh-CN') {
            summaryPrompt = `翻译成简体中文:\n\n${analysisResult.summary}`;
          }
          
          const summaryResult = await model.generateContent(summaryPrompt);
          translatedSummary = summaryResult.response.text();
        }
        
        // Update with translated content
        setAnalysisResult({
          description: translatedText,
          summary: translatedSummary || undefined
        });
        
        console.log('Translation completed successfully');
        
      } catch (error) {
        console.error('Translation failed:', error);
        
        // Fallback: Show language-specific placeholder
        let fallbackText = '';
        let fallbackSummary = '';
        
        if (language === 'zh-TW') {
          fallbackText = `【繁體中文分析】\n\n這是一件藝術作品的分析。由於翻譯服務暫時無法使用，請稍後再試或聯繫支援。\n\n原始分析：${analysisResult.description}`;
          fallbackSummary = analysisResult.summary ? `【繁體中文摘要】${analysisResult.summary}` : '';
        } else if (language === 'zh-CN') {
          fallbackText = `【简体中文分析】\n\n这是一件艺术作品的分析。由于翻译服务暂时无法使用，请稍后再试或联系支持。\n\n原始分析：${analysisResult.description}`;
          fallbackSummary = analysisResult.summary ? `【简体中文摘要】${analysisResult.summary}` : '';
        } else {
          fallbackText = `【English Analysis】\n\nThis is an artwork analysis. Translation service is temporarily unavailable, please try again later.\n\nOriginal analysis: ${analysisResult.description}`;
          fallbackSummary = analysisResult.summary ? `【English Summary】${analysisResult.summary}` : '';
        }
        
        setAnalysisResult({
          description: fallbackText,
          summary: fallbackSummary || undefined
        });
        
        alert('Translation service temporarily unavailable. Showing fallback content.');
        
      } finally {
        setIsGeneratingSummary(false);
      }
    } else {
      console.log('Translation not triggered');
      if (!analysisResult) {
        console.log('No analysis result available');
      }
      if (previousLanguage === language) {
        console.log('Language did not change');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="ARTL Logo" className="App-logo" />
        <p className="app-slogan">{getTranslation('slogan', analysisLanguage)}</p>
        <button 
          className="language-icon" 
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          aria-label="Change language"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="globe-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </button>
        {showLanguageMenu && (
          <div className="language-menu">
            <button 
              className={`language-menu-item ${analysisLanguage === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageSelect('en')}
            >
              English
            </button>
            <button 
              className={`language-menu-item ${analysisLanguage === 'zh-TW' ? 'active' : ''}`}
              onClick={() => handleLanguageSelect('zh-TW')}
            >
              繁體中文 (Traditional Chinese)
            </button>
            <button 
              className={`language-menu-item ${analysisLanguage === 'zh-CN' ? 'active' : ''}`}
              onClick={() => handleLanguageSelect('zh-CN')}
            >
              简体中文 (Simplified Chinese)
            </button>
          </div>
        )}
      </header>
      <main>
        {apiError && (
          <div className="error-message-box">
            <h3>{getTranslation('error', analysisLanguage)}</h3>
            <pre>{apiError}</pre>
            <button onClick={() => setApiError(null)} className="close-error-button">{getTranslation('close_error', analysisLanguage)}</button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <section className="upload-section card">
            <h2>1. {getTranslation('artwork_photo', analysisLanguage)}</h2>
            <p className="section-description">{getTranslation('take_upload_photo', analysisLanguage)}</p>
            <div className="input-group">
              <label htmlFor="captureArtworkPhoto" className="button-like-label">{getTranslation('take_artwork_photo', analysisLanguage)}</label>
              <input type="file" accept="image/*" capture="environment" onChange={handleArtworkImageChange} id="captureArtworkPhoto" style={{ display: 'none' }} ref={artworkFileInputRef} />
            </div>
            <div className="input-group">
              <label htmlFor="uploadArtworkPhoto" className="button-like-label">{getTranslation('upload_artwork_photo', analysisLanguage)}</label>
              <input type="file" accept="image/*" onChange={handleArtworkImageChange} id="uploadArtworkPhoto" style={{ display: 'none' }} ref={artworkFileInputRef} />
            </div>
            {selectedArtworkImage && (
              <div className="image-preview-container">
                <img src={selectedArtworkImage} alt="Artwork Preview" className="artwork-preview-image" />
              </div>
            )}
          </section>

          <section className="label-section card">
            <h2>2. {getTranslation('label_photo', analysisLanguage)} <span className="optional">(Optional)</span></h2>
            <p className="section-description">{getTranslation('take_upload_label', analysisLanguage)} <em>{getTranslation('auto_fill_help', analysisLanguage)}</em></p>
            <div className="input-group">
              <label htmlFor="captureLabelPhoto" className="button-like-label">{getTranslation('take_label_photo', analysisLanguage)}</label>
              <input type="file" accept="image/*" capture="environment" onChange={handleLabelImageChange} id="captureLabelPhoto" style={{ display: 'none' }} ref={labelFileInputRef} />
            </div>
            <div className="input-group">
              <label htmlFor="uploadLabelPhoto" className="button-like-label">{getTranslation('upload_label_photo', analysisLanguage)}</label>
              <input type="file" accept="image/*" onChange={handleLabelImageChange} id="uploadLabelPhoto" style={{ display: 'none' }} ref={labelFileInputRef} />
            </div>
            {selectedLabelImage && (
              <div className="image-preview-container">
                <img src={selectedLabelImage} alt="Label Preview" className="artwork-preview-image" />
              </div>
            )}
          </section>

          <section className="info-section card">
            <h2>3. {getTranslation('artwork_information', analysisLanguage)} <span className="optional">(Optional)</span> {isOcrProcessing && getTranslation('processing_label', analysisLanguage)}</h2>
            <p className="section-description">{getTranslation('provide_details_simple', analysisLanguage)}</p>
            <div className="form-field">
              <label htmlFor="artistName">{getTranslation('artist_name', analysisLanguage)}</label>
              <input type="text" id="artistName" name="artistName" value={artworkInfo.artistName} onChange={handleInfoInputChange} placeholder={getTranslation('artist_placeholder', analysisLanguage)} />
            </div>
            <div className="form-field">
              <label htmlFor="title">{getTranslation('artwork_title', analysisLanguage)}</label>
              <input type="text" id="title" name="title" value={artworkInfo.title} onChange={handleInfoInputChange} placeholder={getTranslation('title_placeholder', analysisLanguage)} />
            </div>
            <div className="form-field">
              <label htmlFor="medium">{getTranslation('medium', analysisLanguage)}</label>
              <input type="text" id="medium" name="medium" value={artworkInfo.medium} onChange={handleInfoInputChange} placeholder={getTranslation('medium_placeholder', analysisLanguage)} />
            </div>
            <div className="form-field">
              <label htmlFor="year">{getTranslation('year', analysisLanguage)}</label>
              <input type="text" id="year" name="year" value={artworkInfo.year} onChange={handleInfoInputChange} placeholder={getTranslation('year_placeholder', analysisLanguage)} />
            </div>
            <div className="form-field">
              <label htmlFor="dimensions">{getTranslation('dimensions', analysisLanguage)}</label>
              <input type="text" id="dimensions" name="dimensions" value={artworkInfo.dimensions} onChange={handleInfoInputChange} placeholder={getTranslation('dimensions_placeholder', analysisLanguage)} />
            </div>
            <div className="form-field">
              <label htmlFor="notes">{getTranslation('notes', analysisLanguage)}</label>
              <textarea id="notes" name="notes" value={artworkInfo.notes} onChange={handleInfoInputChange} placeholder={getTranslation('notes_placeholder', analysisLanguage)} rows={3}></textarea>
            </div>
          </section>

          <button type="submit" className="submit-button">{getTranslation('analyze_artwork', analysisLanguage)}</button>
        </form>

        <footer className="app-footer">
          <div className="disclaimer">
            <strong>{getTranslation('disclaimer_title', analysisLanguage)}</strong>
            <p>{getTranslation('disclaimer_text', analysisLanguage)}</p>
          </div>
          <div className="copyright">
            <p>{getTranslation('copyright_text', analysisLanguage)}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

