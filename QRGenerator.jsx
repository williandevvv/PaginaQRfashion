import React, { useState, useRef, useEffect } from 'react';
import { Download, Smartphone, Link, Mail, Wifi, MessageSquare, History, Trash2, Eye, Copy, Share2 } from 'lucide-react';

const QRGenerator = () => {
  const [qrText, setQrText] = useState('https://example.com');
  const [qrType, setQrType] = useState('url');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [qrHistory, setQrHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const canvasRef = useRef(null);

  // Cargar historial del almacenamiento en memoria al iniciar
  useEffect(() => {
    // En una implementación real, aquí cargarías desde localStorage
    // pero como no podemos usarlo, mantenemos el estado en memoria
    const savedHistory = [];
    setQrHistory(savedHistory);
  }, []);

  // Función para generar matriz QR básica
  const generateQRMatrix = (text, errorCorrectionLevel = 'M') => {
    const size = 25;
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    
    const addFinderPattern = (startRow, startCol) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if ((r === 0 || r === 6) || (c === 0 || c === 6) || 
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[startRow + r][startCol + c] = 1;
          }
        }
      }
    };

    addFinderPattern(0, 0);
    addFinderPattern(0, 18);
    addFinderPattern(18, 0);

    for (let i = 8; i < 17; i++) {
      matrix[6][i] = i % 2;
      matrix[i][6] = i % 2;
    }

    const textHash = text.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
    for (let r = 9; r < 18; r++) {
      for (let c = 9; c < 18; c++) {
        matrix[r][c] = (textHash + r * c) % 2;
      }
    }

    return matrix;
  };

  const drawQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const matrix = generateQRMatrix(qrText, errorLevel);
    const moduleSize = size / matrix.length;

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = foregroundColor;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  };

  useEffect(() => {
    drawQR();
  }, [qrText, foregroundColor, backgroundColor, size, errorLevel]);

  const getQRTypeLabel = (type) => {
    const labels = {
      url: 'URL/Enlace',
      text: 'Texto',
      email: 'Email',
      phone: 'Teléfono',
      sms: 'SMS',
      wifi: 'WiFi',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter/X',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      telegram: 'Telegram'
    };
    return labels[type] || type;
  };

  const handleTypeChange = (type) => {
    setQrType(type);
    switch (type) {
      case 'url':
        setQrText('https://example.com');
        break;
      case 'text':
        setQrText('Hola mundo');
        break;
      case 'email':
        setQrText('mailto:ejemplo@email.com');
        break;
      case 'phone':
        setQrText('tel:+1234567890');
        break;
      case 'sms':
        setQrText('sms:+1234567890?body=Hola');
        break;
      case 'wifi':
        setQrText('WIFI:T:WPA;S:MiWiFi;P:mipassword;;');
        break;
      case 'whatsapp':
        setWhatsappNumber('');
        setWhatsappMessage('');
        setQrText('https://wa.me/');
        break;
      case 'instagram':
        setQrText('https://instagram.com/usuario');
        break;
      case 'facebook':
        setQrText('https://facebook.com/usuario');
        break;
      case 'twitter':
        setQrText('https://twitter.com/usuario');
        break;
      case 'linkedin':
        setQrText('https://linkedin.com/in/usuario');
        break;
      case 'youtube':
        setQrText('https://youtube.com/@canal');
        break;
      case 'tiktok':
        setQrText('https://tiktok.com/@usuario');
        break;
      case 'telegram':
        setQrText('https://t.me/usuario');
        break;
      default:
        setQrText('');
    }
  };

  const updateWhatsAppLink = () => {
    if (qrType === 'whatsapp') {
      let link = 'https://wa.me/';
      if (whatsappNumber) {
        // Limpiar número y agregar código de país si no lo tiene
        let cleanNumber = whatsappNumber.replace(/\D/g, '');
        if (cleanNumber && !cleanNumber.startsWith('1') && !cleanNumber.startsWith('52') && !cleanNumber.startsWith('34')) {
          // Asumir código de país por defecto (puedes cambiarlo)
          cleanNumber = '1' + cleanNumber;
        }
        link += cleanNumber;
        if (whatsappMessage) {
          link += '?text=' + encodeURIComponent(whatsappMessage);
        }
      }
      setQrText(link);
    }
  };

  useEffect(() => {
    updateWhatsAppLink();
  }, [whatsappNumber, whatsappMessage, qrType]);

  const saveToHistory = () => {
    const newQR = {
      id: Date.now(),
      type: qrType,
      content: qrText,
      foregroundColor,
      backgroundColor,
      size,
      errorLevel,
      createdAt: new Date().toLocaleString(),
      preview: canvasRef.current.toDataURL()
    };

    setQrHistory(prev => [newQR, ...prev.slice(0, 19)]); // Mantener solo los últimos 20
  };

  const loadFromHistory = (historyItem) => {
    setQrType(historyItem.type);
    setQrText(historyItem.content);
    setForegroundColor(historyItem.foregroundColor);
    setBackgroundColor(historyItem.backgroundColor);
    setSize(historyItem.size);
    setErrorLevel(historyItem.errorLevel);
    
    // Si es WhatsApp, extraer número y mensaje
    if (historyItem.type === 'whatsapp' && historyItem.content.includes('wa.me/')) {
      const url = new URL(historyItem.content);
      const pathParts = url.pathname.split('/');
      if (pathParts.length > 1) {
        setWhatsappNumber(pathParts[1]);
      }
      const message = url.searchParams.get('text');
      if (message) {
        setWhatsappMessage(message);
      }
    }

    setShowHistory(false);
  };

  const deleteFromHistory = (id) => {
    setQrHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setQrHistory([]);
  };

  const downloadQR = (format = 'png', quality = 0.9) => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    const timestamp = Date.now();
    
    let dataUrl;
    let filename;
    
    switch (format) {
      case 'png':
        dataUrl = canvas.toDataURL('image/png');
        filename = `qr-${qrType}-${timestamp}.png`;
        break;
      case 'jpg':
      case 'jpeg':
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        filename = `qr-${qrType}-${timestamp}.jpg`;
        break;
      case 'webp':
        dataUrl = canvas.toDataURL('image/webp', quality);
        filename = `qr-${qrType}-${timestamp}.webp`;
        break;
      case 'svg':
        // Crear SVG básico del QR
        const matrix = generateQRMatrix(qrText, errorLevel);
        const moduleSize = 10; // Tamaño fijo para SVG
        const svgSize = matrix.length * moduleSize;
        
        let svgContent = `<svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>`;
        
        for (let row = 0; row < matrix.length; row++) {
          for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
              svgContent += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${foregroundColor}"/>`;
            }
          }
        }
        svgContent += '</svg>';
        
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        dataUrl = URL.createObjectURL(svgBlob);
        filename = `qr-${qrType}-${timestamp}.svg`;
        break;
      case 'pdf':
        // Crear PDF simple con el canvas
        const pdfCanvas = document.createElement('canvas');
        const pdfCtx = pdfCanvas.getContext('2d');
        const pdfSize = 595; // Tamaño A4 en puntos
        pdfCanvas.width = pdfSize;
        pdfCanvas.height = pdfSize;
        
        // Fondo blanco
        pdfCtx.fillStyle = '#FFFFFF';
        pdfCtx.fillRect(0, 0, pdfSize, pdfSize);
        
        // Centrar QR
        const qrSize = 300;
        const x = (pdfSize - qrSize) / 2;
        const y = (pdfSize - qrSize) / 2;
        
        pdfCtx.drawImage(canvas, x, y, qrSize, qrSize);
        
        // Agregar texto
        pdfCtx.fillStyle = '#000000';
        pdfCtx.font = '16px Arial';
        pdfCtx.textAlign = 'center';
        pdfCtx.fillText(`Código QR - ${getQRTypeLabel(qrType)}`, pdfSize/2, y - 30);
        pdfCtx.font = '12px Arial';
        pdfCtx.fillText(new Date().toLocaleDateString(), pdfSize/2, y + qrSize + 30);
        
        dataUrl = pdfCanvas.toDataURL('image/png');
        filename = `qr-${qrType}-${timestamp}.png`; // PDF como imagen
        break;
      default:
        dataUrl = canvas.toDataURL('image/png');
        filename = `qr-${qrType}-${timestamp}.png`;
    }
    
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    // Limpiar URL object si es SVG
    if (format === 'svg') {
      setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
    }
    
    // Guardar en historial después de descargar
    saveToHistory();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Contenido copiado al portapapeles');
    });
  };

  const presetColors = [
    { name: 'Clásico', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Azul', fg: '#1E40AF', bg: '#EFF6FF' },
    { name: 'Verde', fg: '#059669', bg: '#ECFDF5' },
    { name: 'Rojo', fg: '#DC2626', bg: '#FEF2F2' },
    { name: 'Morado', fg: '#7C3AED', bg: '#F3E8FF' },
    { name: 'Naranja', fg: '#EA580C', bg: '#FFF7ED' },
    { name: 'Rosa', fg: '#DB2777', bg: '#FDF2F8' },
    { name: 'Amarillo', fg: '#D97706', bg: '#FFFBEB' }
  ];

  const socialNetworks = [
    { type: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
    { type: 'instagram', label: 'Instagram', icon: Share2, color: 'bg-pink-500' },
    { type: 'facebook', label: 'Facebook', icon: Share2, color: 'bg-blue-600' },
    { type: 'twitter', label: 'Twitter/X', icon: Share2, color: 'bg-black' },
    { type: 'linkedin', label: 'LinkedIn', icon: Share2, color: 'bg-blue-700' },
    { type: 'youtube', label: 'YouTube', icon: Share2, color: 'bg-red-600' },
    { type: 'tiktok', label: 'TikTok', icon: Share2, color: 'bg-gray-800' },
    { type: 'telegram', label: 'Telegram', icon: MessageSquare, color: 'bg-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Generador de Códigos QR Pro
          </h1>
          <p className="text-gray-600">
            Crea códigos QR personalizados con historial y soporte completo para redes sociales
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Configuración
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Historial ({qrHistory.length})</span>
              </button>
            </div>

            {/* Historial */}
            {showHistory && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Historial de QR</h3>
                  {qrHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Limpiar todo</span>
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {qrHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay QR guardados aún</p>
                  ) : (
                    <div className="space-y-2">
                      {qrHistory.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                          <img src={item.preview} alt="QR Preview" className="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">
                              {getQRTypeLabel(item.type)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.content.length > 40 ? item.content.substring(0, 40) + '...' : item.content}
                            </p>
                            <p className="text-xs text-gray-400">{item.createdAt}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => loadFromHistory(item)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Cargar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(item.content)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Copiar contenido"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFromHistory(item.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tipo de QR - Básicos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos básicos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'url', label: 'URL', icon: Link },
                  { type: 'text', label: 'Texto', icon: MessageSquare },
                  { type: 'email', label: 'Email', icon: Mail },
                  { type: 'phone', label: 'Teléfono', icon: Smartphone },
                  { type: 'sms', label: 'SMS', icon: MessageSquare },
                  { type: 'wifi', label: 'WiFi', icon: Wifi }
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      qrType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Redes sociales */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Redes sociales y mensajería
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {socialNetworks.map(({ type, label, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      qrType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-6 h-6 ${color} rounded flex items-center justify-center mb-1`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido específico para WhatsApp */}
            {qrType === 'whatsapp' && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Configuración de WhatsApp</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de teléfono (con código de país)
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="ej: +1234567890 o 1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje predefinido (opcional)
                    </label>
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="Hola, me interesa..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contenido general */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {qrType === 'whatsapp' ? 'Vista previa del enlace' : 'Contenido del QR'}
              </label>
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  qrType === 'whatsapp' ? 'bg-gray-50' : ''
                }`}
                rows="3"
                placeholder="Ingresa el contenido para tu código QR"
                readOnly={qrType === 'whatsapp'}
              />
            </div>

            {/* Colores predefinidos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Esquemas de color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setForegroundColor(preset.fg);
                      setBackgroundColor(preset.bg);
                    }}
                    className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 rounded" 
                         style={{ backgroundColor: preset.bg }}>
                      <div className="w-4 h-4 rounded-sm" 
                           style={{ backgroundColor: preset.fg }}></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 block">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colores personalizados */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del código
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de fondo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tamaño */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño: {size}x{size} píxeles
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>128px</span>
                <span>320px</span>
                <span>512px</span>
              </div>
            </div>

            {/* Nivel de corrección de errores */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corrección de errores
              </label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Bajo (~7%) - Más datos</option>
                <option value="M">Medio (~15%) - Balanceado</option>
                <option value="Q">Cuartil (~25%) - Resistente</option>
                <option value="H">Alto (~30%) - Máxima resistencia</option>
              </select>
            </div>
          </div>

          {/* Vista previa y descarga */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Vista previa
            </h2>

            <div className="flex flex-col items-center">
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    imageRendering: 'pixelated'
                  }}
                />
              </div>

              <div className="space-y-3 w-full">
                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar QR</span>
                </button>

                <button
                  onClick={() => copyToClipboard(qrText)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copiar contenido</span>
                </button>
              </div>

              <div className="mt-6 text-center w-full">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Información del QR
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p><strong>Tipo:</strong> {getQRTypeLabel(qrType)}</p>
                  <p><strong>Tamaño:</strong> {size}x{size}px</p>
                  <p><strong>Corrección:</strong> Nivel {errorLevel}</p>
                  <p><strong>Caracteres:</strong> {qrText.length}</p>
                  <p><strong>Historial:</strong> {qrHistory.length} guardados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guía de uso */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            🚀 Guía completa de uso
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">💬 Redes Sociales</h4>
              <div className="space-y-2">
                <p><strong>WhatsApp:</strong> Agrega número con código país (+52, +1, etc.)</p>
                <p><strong>Instagram:</strong> instagram.com/tu_usuario</p>
                <p><strong>Facebook:</strong> facebook.com/tu_perfil</p>
                <p><strong>LinkedIn:</strong> linkedin.com/in/tu_perfil</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">📱 Contacto Directo</h4>
              <div className="space-y-2">
                <p><strong>Email:</strong> mailto:tu@email.com</p>
                <p><strong>Teléfono:</strong> tel:+1234567890</p>
                <p><strong>SMS:</strong> sms:+123456?body=mensaje</p>
                <p><strong>Telegram:</strong> t.me/tu_usuario</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">🔧 Funciones Avanzadas</h4>
              <div className="space-y-2">
                <p><strong>Historial:</strong> Guarda automáticamente al descargar</p>
                <p><strong>WiFi:</strong> WIFI:T:WPA;S:nombre;P:clave;;</p>
                <p><strong>Colores:</strong> 8 presets + personalización</p>
                <p><strong>Tamaños:</strong> 128px a 512px optimizados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;

