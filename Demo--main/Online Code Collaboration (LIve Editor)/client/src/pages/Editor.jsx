import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { projectAPI, githubAPI, suggestionAPI } from '../utils/api';
import Navbar from '../components/common/Navbar';
import GitHubPushModal from '../components/editor/GitHubPushModal';
import Terminal from '../components/editor/Terminal';
import ChatSidebar from '../components/editor/ChatSidebar';
import { Share2, Github, Copy, Users, Play, MessageSquare } from 'lucide-react';
import '../styles/editor.css';

const LANGUAGE_OPTIONS = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'json', 'sql',
  'c', 'r', 'matlab', 'assembly', 'bash', 'shell', 'dockerfile', 'yaml',
  'xml', 'markdown', 'perl', 'lua', 'groovy', 'scala', 'clojure', 'objectivec',
  'visualbasic', 'dart', 'elixir', 'haskell', 'verilog'
];

export default function Editor() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const editorRef = useRef(null);
  const [code, setCode] = useState('// Start coding...');
  const [language, setLanguage] = useState('javascript');
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [monacoApi, setMonacoApi] = useState(null);
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const savingTimeoutRef = useRef(null);

  // Fetch project on mount
  useEffect(() => {
    fetchProject();
  }, [roomId]);

  // Setup socket events
  useEffect(() => {
    if (!user || !roomId) return;

    // Join room
    emit('join-room', {
      roomId,
      userId: user.id,
      username: user.username,
    });

    // Listen for room joined
    on('room-joined', (data) => {
      console.log(data.message);
    });

    // Listen for code updates from others
    on('code-updated', (data) => {
      setCode(data.code);
    });

    // Listen for language changes
    on('language-changed', (data) => {
      setLanguage(data.language);
    });

    // Listen for user joined
    on('user-joined', (data) => {
      console.log(`${data.username} joined the room`);
    });

    // Listen for user left
    on('user-left', (data) => {
      console.log(`User ${data.userId} left`);
    });

    // Cleanup
    return () => {
      off('room-joined');
      off('code-updated');
      off('language-changed');
      off('user-joined');
      off('user-left');
      
      if (roomId && user) {
        emit('leave-room', {
          roomId,
          userId: user.id,
        });
      }
    };
  }, [user, roomId, emit, on, off]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProject(roomId);
      setProjectData(response.data.project);
      setCode(response.data.project.code);
      setLanguage(response.data.project.language);
      setActiveUsers(response.data.project.activeUsers || []);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    setIsSaving(true);

    // Emit code change to others
    emit('code-change', {
      roomId,
      code: value,
      userId: user.id,
    });

    // Clear previous timeout
    if (savingTimeoutRef.current) {
      clearTimeout(savingTimeoutRef.current);
    }

    // Set new timeout
    savingTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    emit('language-change', {
      roomId,
      language: newLanguage,
    });
  };

  useEffect(() => {
    // Monaco completion provider for AI suggestion
    if (!monacoApi || !language || !editorRef.current || !autoSuggestEnabled) return;

    const disposable = monacoApi.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', ' ', '(', '\n', ','],
      provideCompletionItems: async (model, position) => {
        try {
          const codeText = model.getValue();
          const response = await suggestionAPI.getCodeSuggestion({
            code: codeText,
            language,
          });

          if (!response.data.success) {
            return { suggestions: [] };
          }

          let text = response.data.suggestion || '';
          text = text.replace(/```[\s\S]*?```/g, '').trim();

          return {
            suggestions: [
              {
                label: 'AI Code Suggestion',
                kind: monacoApi.languages.CompletionItemKind.Snippet,
                insertText: text,
                detail: 'AI generated suggestion',
                documentation: 'Generated by Ollama/Mistral',
              },
            ],
          };
        } catch (error) {
          console.error('Autocomplete error:', error);
          return { suggestions: [] };
        }
      },
    });

    return () => {
      disposable.dispose();
    };
  }, [monacoApi, language, code, autoSuggestEnabled]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isResizing) return;
      const newWidth = Math.min(650, Math.max(250, window.innerWidth - event.clientX));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing) return;
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="editor-loading">
          <div className="loading-spinner"></div>
          <p>Loading editor...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`editor-container ${showChat ? 'chat-open' : ''}`} style={{ '--chat-width': `${chatWidth}px` }}>
        <div className="editor-header">
          <div className="editor-title">
            <h2>{projectData?.title}</h2>
            <span className="room-id">
              {roomId.substring(0, 8)}
              <button 
                className="copy-btn"
                onClick={handleCopyRoomId}
                title="Copy room ID"
              >
                <Copy size={16} />
              </button>
            </span>
          </div>

          <div className="editor-toolbar">
            {/* Language Selector */}
            <div className="language-selector">
              <label>Language:</label>
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Users */}
            <div className="active-users-display">
              <Users size={18} />
              <span>{activeUsers.length} online</span>
            </div>

            {/* Saving indicator */}
            {isSaving && <span className="saving-indicator">Saving...</span>}

            {/* GitHub Push Button */}
            <button 
              className="btn btn-icon-text"
              onClick={() => setShowGitHubModal(true)}
            >
              <Github size={18} />
              Push to GitHub
            </button>

            {/* AI Chat Button */}
            {process.env.REACT_APP_ENABLE_AI_CHAT === 'true' && (
              <button 
                className={`btn btn-icon-text ${showChat ? 'active' : ''}`}
                onClick={() => setShowChat(!showChat)}
                title="Toggle AI Assistant"
              >
                <MessageSquare size={18} />
                AI Assistant
              </button>
            )}

            {/* Autocomplete toggle */}
            <button
              className={`btn btn-icon-text ${autoSuggestEnabled ? 'active' : ''}`}
              onClick={() => setAutoSuggestEnabled((prev) => !prev)}
              title="Toggle AI autocompletion"
            >
              {autoSuggestEnabled ? 'AutoComplete: On' : 'AutoComplete: Off'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Monaco Editor */}
        <div className="editor-wrapper">
          <MonacoEditor
            ref={editorRef}
            height="100%"
            language={language}
            value={code}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              setMonacoApi(monaco);
            }}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              wordWrap: 'on',
              fontSize: 14,
              fontFamily: "'Monaco', 'Courier New', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
              quickSuggestions: autoSuggestEnabled,
              suggestOnTriggerCharacters: autoSuggestEnabled,
            }}
          />
        </div>

        {/* Terminal Component */}
        {process.env.REACT_APP_ENABLE_TERMINAL === 'true' && (
          <Terminal code={code} language={language} roomId={roomId} />
        )}

        {showChat && (
          <div
            className="splitter"
            style={{ right: chatWidth + 'px', top: 'calc(var(--navbar-height) + var(--editor-header-height))' }}
            onMouseDown={() => setIsResizing(true)}
          />
        )}

        {/* Active Users Panel */}
        {activeUsers.length > 0 && (
          <div className="active-users-panel">
            <h4>Active Users</h4>
            <div className="users-list">
              {activeUsers.map((activeUser) => (
                <div key={activeUser.userId} className="user-item">
                  <span className="user-indicator"></span>
                  {activeUser.username}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GitHub Push Modal */}
      {showGitHubModal && (
        <GitHubPushModal
          roomId={roomId}
          onClose={() => setShowGitHubModal(false)}
          code={code}
        />
      )}

      {/* AI Chat Sidebar */}
      {process.env.REACT_APP_ENABLE_AI_CHAT === 'true' && showChat && (
        <ChatSidebar
          code={code}
          language={language}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          roomId={roomId}
          width={chatWidth}
        />
      )}
    </>
  );
}
