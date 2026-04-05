import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Copy, Download, Trash2, Github } from 'lucide-react';
import { executionAPI } from '../../utils/api';
import githubAuth from '../../utils/githubAuth';
import '../../styles/terminal.css';

export default function Terminal({ code, language, roomId }) {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const outputRef = useRef(null);

  // Auto-scroll to bottom when output updates
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, error]);

  const handleExecute = async () => {
    try {
      setLoading(true);
      setError('');
      setOutput('');

      const response = await executionAPI.executeCode({
        code,
        language,
      });

      if (response.data.success) {
        setOutput(response.data.output || 'Program executed successfully.');
        if (response.data.error) {
          setError(response.data.error);
        }
      } else {
        setError(response.data.error || response.data.message);
        setOutput(response.data.output || '');
      }

      setHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          output: response.data.output,
          error: response.data.error,
          success: response.data.success,
        },
      ]);
    } catch (err) {
      console.error('Execution error:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to execute code';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOutput = () => {
    setOutput('');
    setError('');
  };

  const handleCopyOutput = () => {
    const fullOutput = output + (error ? '\n' + error : '');
    navigator.clipboard.writeText(fullOutput);
  };

  const handleDownloadOutput = () => {
    const fullOutput = output + (error ? '\n' + error : '');
    const element = document.createElement('a');
    const file = new Blob([fullOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `output_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePushClick = async () => {
    if (!githubAuth.isAuthenticated()) {
      setError('Please login with GitHub first');
      return;
    }

    try {
      setPushLoading(true);
      const repos = await githubAuth.getRepositories();
      setRepositories(repos);
      setShowPushModal(true);
    } catch (err) {
      setError('Failed to fetch repositories: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  const handlePushToGithub = async () => {
    if (!selectedRepo || !commitMessage.trim()) {
      setError('Please select a repository and enter a commit message');
      return;
    }

    try {
      setPushLoading(true);
      const result = await githubAuth.pushToGithub(
        roomId,
        selectedRepo.name,
        selectedRepo.owner,
        commitMessage
      );

      setOutput(`✓ Code pushed successfully!\nCommit: ${result.result.commit}`);
      setShowPushModal(false);
      setCommitMessage('');
      setSelectedRepo(null);
    } catch (err) {
      setError('Failed to push to GitHub: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className={`terminal-container ${isExpanded ? 'expanded' : 'compact'}`}>
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">⌘</span>
          <span className="terminal-label">Terminal</span>
          {output && <span className="output-badge">{output.length} chars</span>}
        </div>

        <div className="terminal-controls">
          <button
            className="btn-terminal btn-execute"
            onClick={handleExecute}
            disabled={loading}
            title="Execute Code (Ctrl+Enter)"
          >
            <Play size={18} />
            {loading ? 'Running...' : 'Run'}
          </button>

          {githubAuth.isAuthenticated() && (
            <button
              className="btn-terminal btn-github"
              onClick={handlePushClick}
              disabled={pushLoading}
              title="Push to GitHub"
            >
              <Github size={16} />
              {pushLoading ? 'Loading...' : 'Push'}
            </button>
          )}

          {(output || error) && (
            <>
              <button
                className="btn-terminal btn-copy"
                onClick={handleCopyOutput}
                title="Copy Output"
              >
                <Copy size={16} />
              </button>

              <button
                className="btn-terminal btn-download"
                onClick={handleDownloadOutput}
                title="Download Output"
              >
                <Download size={16} />
              </button>

              <button
                className="btn-terminal btn-clear"
                onClick={handleClearOutput}
                title="Clear Output"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          <button
            className="btn-terminal btn-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▲'}
          </button>

          <button
            className="btn-terminal btn-close"
            onClick={() => setIsExpanded(false)}
            title="Close Terminal"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="terminal-content">
          <div className="terminal-output" ref={outputRef}>
            {output && (
              <div className="output-section">
                <div className="output-text">{output}</div>
              </div>
            )}

            {error && (
              <div className="error-section">
                <div className="error-label">Error:</div>
                <div className="error-text">{error}</div>
              </div>
            )}

            {!output && !error && !loading && (
              <div className="terminal-placeholder">
                <p>Click "Run" to execute your code</p>
                <p className="hint">Language: {language}</p>
              </div>
            )}

            {loading && (
              <div className="terminal-loading">
                <span className="spinner"></span>
                <p>Executing code...</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="terminal-history">
              <div className="history-label">Execution History ({history.length})</div>
              <div className="history-list">
                {history.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <span className="history-time">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`history-status ${item.success ? 'success' : 'error'}`}>
                      {item.success ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showPushModal && (
        <div className="modal-overlay" onClick={() => setShowPushModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Push Code to GitHub</h3>

            <div className="form-group">
              <label>Select Repository:</label>
              <select
                value={selectedRepo?.id || ''}
                onChange={(e) => {
                  const repo = repositories.find((r) => r.id === parseInt(e.target.value));
                  setSelectedRepo(repo);
                }}
              >
                <option value="">-- Choose a repository --</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.owner}/{repo.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Commit Message:</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter commit message"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handlePushToGithub}
                disabled={pushLoading}
              >
                {pushLoading ? 'Pushing...' : 'Push'}
              </button>
              <button className="btn-secondary" onClick={() => setShowPushModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
