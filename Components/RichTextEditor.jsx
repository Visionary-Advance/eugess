// Components/RichTextEditor.jsx - Complete Rewrite
import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Unlink,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Subscript,
  Superscript,
  Indent,
  Outdent,
  Table,
  Minus
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, disabled = false, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedSelection, setSavedSelection] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('16');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    subscript: false,
    superscript: false
  });

  const fontSizes = [
    '8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '48', '72'
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS',
    'Arial Black', 'Impact', 'Comic Sans MS'
  ];

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#FFFF00', '#99FF00', '#00FF00',
    '#00FFCC', '#00CCFF', '#0066FF', '#0000FF', '#6600FF', '#CC00FF',
    '#FF0099', '#FF3366', '#8B4513', '#A0522D', '#CD853F', '#DEB887'
  ];

  const highlightColors = [
    '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFB6C1', '#FFA500',
    '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FF6347', '#40E0D0'
  ];

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Only update from external changes when editor is not focused
  useEffect(() => {
    if (editorRef.current && isInitialized && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isInitialized]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    }
  };

  const updateFormatState = () => {
    if (!editorRef.current) return;
    
    try {
      // Get current formatting state
      const formats = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript')
      };
      
      setActiveFormats(formats);
      
      // Get current font family
      const fontFamily = document.queryCommandValue('fontName');
      if (fontFamily && fontFamily !== 'false') {
        setCurrentFontFamily(fontFamily.replace(/"/g, ''));
      }
      
      // Get current font size - check for inline styles first
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let node = selection.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
        }
        
        // Walk up the tree to find font size
        let foundSize = false;
        while (node && node !== editorRef.current && !foundSize) {
          if (node.style && node.style.fontSize) {
            const size = parseInt(node.style.fontSize);
            if (size && size > 0) {
              setCurrentFontSize(size.toString());
              foundSize = true;
            }
          }
          // Also check for font elements with size attribute
          if (node.tagName === 'FONT' && node.size) {
            const sizeMap = { '1': '8', '2': '10', '3': '12', '4': '14', '5': '18', '6': '24', '7': '36' };
            if (sizeMap[node.size]) {
              setCurrentFontSize(sizeMap[node.size]);
              foundSize = true;
            }
          }
          node = node.parentNode;
        }
        
        // If no font size found, reset to default
        if (!foundSize) {
          setCurrentFontSize('16');
        }
      }
    } catch (error) {
      console.log('Error updating format state:', error);
    }
  };

  const restoreSelection = () => {
    if (savedSelection) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    }
  };

  const execCommand = (command, value = null) => {
    if (disabled) return;
    
    restoreSelection();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
    // Update format state after a brief delay to ensure command has been applied
    setTimeout(updateFormatState, 10);
  };

  const updateContent = () => {
    if (editorRef.current && onChange) {
      // Process all links to ensure they have proper attributes
      const links = editorRef.current.querySelectorAll('a');
      links.forEach(link => {
        if (link.href && !link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
      
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
    // Delay format state update to allow content to settle
    setTimeout(updateFormatState, 50);
  };

  const handleSelectionChange = () => {
    updateFormatState();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  const handleLinkClick = () => {
    saveSelection();
    
    const selection = window.getSelection();
    let selectedText = selection.toString();
    let existingLink = null;
    
    // Check if we're inside a link
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
        existingLink = node;
        selectedText = node.textContent;
        break;
      }
      node = node.parentNode;
    }
    
    setLinkText(selectedText);
    setLinkUrl(existingLink ? existingLink.getAttribute('href') : '');
    setIsLinkModalOpen(true);
  };

  const insertLink = () => {
    if (!linkText.trim() || !linkUrl.trim()) return;
    
    restoreSelection();
    
    const selection = window.getSelection();
    
    // If no text is selected, insert the link text
    if (!selection.toString()) {
      document.execCommand('insertText', false, linkText);
      // Select the inserted text
      const range = document.createRange();
      const textNode = selection.anchorNode;
      if (textNode && textNode.textContent) {
        range.setStart(textNode, textNode.textContent.length - linkText.length);
        range.setEnd(textNode, textNode.textContent.length);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Create the link
    document.execCommand('createLink', false, linkUrl);
    
    // Add attributes after a brief delay to ensure the link is created
    setTimeout(() => {
      const links = editorRef.current?.querySelectorAll(`a[href="${linkUrl}"]`);
      links?.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
      updateContent();
    }, 10);
    
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setSavedSelection(null);
    
    editorRef.current?.focus();
  };

  const handleEditorClick = (e) => {
    // Make links clickable
    if (e.target.tagName === 'A' && e.target.href && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      saveSelection();
      execCommand('insertImage', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 5</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 6</td>
        </tr>
      </table>
    `;
    execCommand('insertHTML', tableHTML);
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={() => {
        saveSelection();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ColorPicker = ({ colors, onColorSelect, title, icon: Icon = Palette }) => (
    <div className="relative group">
      <button
        type="button"
        disabled={disabled}
        title={title}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
      >
        <Icon className="w-4 h-4" />
      </button>
      <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="grid grid-cols-6 gap-1 w-48">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                saveSelection();
                onColorSelect(color);
              }}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo (Ctrl+Z)" />
            <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo (Ctrl+Shift+Z)" />
          </div>

          {/* Font Family */}
          <select
            value={currentFontFamily}
            onChange={(e) => {
              const newFont = e.target.value;
              setCurrentFontFamily(newFont);
              saveSelection();
              execCommand('fontName', newFont);
            }}
            disabled={disabled}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={currentFontSize}
            onChange={(e) => {
              const newSize = e.target.value;
              setCurrentFontSize(newSize);
              saveSelection();
              restoreSelection();
              
              const selection = window.getSelection();
              if (selection.rangeCount > 0 && !selection.isCollapsed) {
                // Text is selected - wrap it in a span with the new font size
                const selectedText = selection.toString();
                const span = `<span style="font-size: ${newSize}px;">${selectedText}</span>`;
                document.execCommand('insertHTML', false, span);
              } else {
                // No text selected - set the font size for the current position
                // Use a temporary marker to set font size for future typing
                const marker = document.createElement('span');
                marker.style.fontSize = newSize + 'px';
                marker.innerHTML = '&#8203;'; // Zero-width space
                
                const range = selection.getRangeAt(0);
                range.insertNode(marker);
                range.setStartAfter(marker);
                range.setEndAfter(marker);
                selection.removeAllRanges();
                selection.addRange(range);
              }
              
              updateContent();
              updateFormatState();
              editorRef.current?.focus();
            }}
            disabled={disabled}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          {/* Text Formatting */}
          <div className="flex border-l border-gray-300 pl-2 ml-2">
            <ToolbarButton 
              onClick={() => execCommand('bold')} 
              icon={Bold} 
              title="Bold (Ctrl+B)" 
              isActive={activeFormats.bold}
            />
            <ToolbarButton 
              onClick={() => execCommand('italic')} 
              icon={Italic} 
              title="Italic (Ctrl+I)" 
              isActive={activeFormats.italic}
            />
            <ToolbarButton 
              onClick={() => execCommand('underline')} 
              icon={Underline} 
              title="Underline (Ctrl+U)" 
              isActive={activeFormats.underline}
            />
            <ToolbarButton 
              onClick={() => execCommand('strikeThrough')} 
              icon={Strikethrough} 
              title="Strikethrough" 
              isActive={activeFormats.strikeThrough}
            />
            <ToolbarButton 
              onClick={() => execCommand('subscript')} 
              icon={Subscript} 
              title="Subscript" 
              isActive={activeFormats.subscript}
            />
            <ToolbarButton 
              onClick={() => execCommand('superscript')} 
              icon={Superscript} 
              title="Superscript" 
              isActive={activeFormats.superscript}
            />
          </div>

          {/* Colors */}
          <div className="flex border-l border-gray-300 pl-2 ml-2">
            <ColorPicker 
              colors={colors} 
              onColorSelect={(color) => execCommand('foreColor', color)}
              title="Text Color"
            />
            <ColorPicker 
              colors={highlightColors} 
              onColorSelect={(color) => execCommand('hiliteColor', color)}
              title="Highlight Color"
              icon={Highlighter}
            />
          </div>

          {/* Alignment */}
          <div className="flex border-l border-gray-300 pl-2 ml-2">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
            <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
            <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
            <ToolbarButton onClick={() => execCommand('justifyFull')} icon={AlignJustify} title="Justify" />
          </div>

          {/* Lists and Indentation */}
          <div className="flex border-l border-gray-300 pl-2 ml-2">
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
            <ToolbarButton onClick={() => execCommand('indent')} icon={Indent} title="Increase Indent" />
            <ToolbarButton onClick={() => execCommand('outdent')} icon={Outdent} title="Decrease Indent" />
          </div>

          {/* Special Elements */}
          <div className="flex border-l border-gray-300 pl-2 ml-2">
            <ToolbarButton onClick={handleLinkClick} icon={Link} title="Insert Link" />
            <ToolbarButton onClick={() => execCommand('unlink')} icon={Unlink} title="Remove Link" />
            <ToolbarButton onClick={() => execCommand('insertHorizontalRule')} icon={Minus} title="Insert Horizontal Line" />
            <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} icon={Quote} title="Quote" />
            <ToolbarButton onClick={() => execCommand('formatBlock', 'pre')} icon={Code} title="Code Block" />
            <ToolbarButton onClick={insertTable} icon={Table} title="Insert Table" />
          </div>

          {/* Image Upload */}
          <div className="border-l border-gray-300 pl-2 ml-2">
            <label className="p-2 rounded hover:bg-gray-100 cursor-pointer text-gray-600 inline-block">
              <Image className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={disabled}
              />
            </label>
          </div>

          {/* Format Blocks */}
          <div className="border-l border-gray-300 pl-2 ml-2">
            <select
              onChange={(e) => {
                saveSelection();
                execCommand('formatBlock', e.target.value);
              }}
              disabled={disabled}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              defaultValue=""
            >
              <option value="">Format</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="p">Paragraph</option>
              <option value="div">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
          onMouseUp={() => {
            saveSelection();
            updateFormatState();
          }}
          onKeyUp={() => {
            saveSelection();
            updateFormatState();
          }}
          onSelect={handleSelectionChange}
          className={`p-4 min-h-[400px] focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          style={{ lineHeight: '1.6' }}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder */}
        {(!value || value.trim() === '') && (
          <div 
            className="absolute top-4 left-4 text-gray-400 pointer-events-none"
            style={{ lineHeight: '1.6' }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Text to display"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div className="text-sm text-gray-600">
                Links will open in a new tab for better SEO and user experience.
                Hold Ctrl/Cmd and click links in the editor to test them.
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                  setSavedSelection(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!linkText.trim() || !linkUrl.trim()}
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        [contenteditable] h4 { font-size: 1em; font-weight: bold; margin: 1.12em 0; }
        [contenteditable] h5 { font-size: 0.83em; font-weight: bold; margin: 1.5em 0; }
        [contenteditable] h6 { font-size: 0.75em; font-weight: bold; margin: 1.67em 0; }
        [contenteditable] p { margin: 1em 0; }
        [contenteditable] blockquote { 
          margin: 1em 0; 
          padding: 0 1em; 
          border-left: 4px solid #ddd; 
          background: #f9f9f9;
        }
        [contenteditable] pre { 
          background: #f4f4f4; 
          padding: 1em; 
          border-radius: 4px; 
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        [contenteditable] table td, [contenteditable] table th { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        [contenteditable] table th { background-color: #f2f2f2; font-weight: bold; }
        [contenteditable] ul, [contenteditable] ol { margin: 1em 0; padding-left: 2em; }
        [contenteditable] li { margin: 0.5em 0; }
        [contenteditable] hr { margin: 2em 0; border: none; border-top: 1px solid #ddd; }
        [contenteditable] a { 
          color: #0066cc; 
          text-decoration: underline; 
          cursor: pointer;
        }
        [contenteditable] a:hover { 
          color: #004499; 
          text-decoration: underline;
        }
        [contenteditable] img { max-width: 100%; height: auto; margin: 1em 0; }
        [contenteditable] span[style*="font-size"] { 
          display: inline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;