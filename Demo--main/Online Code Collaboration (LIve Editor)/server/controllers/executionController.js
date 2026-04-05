const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { platform } = require('os');

const execAsync = promisify(exec);
const isWindows = platform() === 'win32';

// Supported languages and their execution commands
const LANGUAGE_COMMANDS = {
  javascript: {
    fileExt: '.js',
    command: 'node',
    getCmd: (file) => `node "${file}"`,
    installed: () => checkCommand('node'),
  },
  typescript: {
    fileExt: '.ts',
    command: 'ts-node',
    getCmd: (file) => `ts-node "${file}"`,
    installed: () => checkCommand('ts-node'),
  },
  python: {
    fileExt: '.py',
    command: isWindows ? 'python' : 'python3',
    getCmd: (file) => `${isWindows ? 'python' : 'python3'} "${file}"`,
    installed: () => checkCommand(isWindows ? 'python' : 'python3'),
  },
  java: {
    fileExt: '.java',
    command: 'javac',
    getCmd: (file) => `javac "${file}" && ${isWindows ? '' : './'}java -cp . Main`,
    installed: () => checkCommand('javac'),
  },
  cpp: {
    fileExt: '.cpp',
    command: 'g++',
    getCmd: (file) => isWindows 
      ? `g++ "${file}" -o out.exe && out.exe`
      : `g++ "${file}" -o out && ./out`,
    installed: () => checkCommand('g++'),
  },
  c: {
    fileExt: '.c',
    command: 'gcc',
    getCmd: (file) => isWindows 
      ? `gcc "${file}" -o out.exe && out.exe`
      : `gcc "${file}" -o out && ./out`,
    installed: () => checkCommand('gcc'),
  },
  csharp: {
    fileExt: '.cs',
    command: 'dotnet',
    getCmd: (file) => `dotnet "${file}"`,
    installed: () => checkCommand('dotnet'),
  },
  php: {
    fileExt: '.php',
    command: 'php',
    getCmd: (file) => `php "${file}"`,
    installed: () => checkCommand('php'),
  },
  ruby: {
    fileExt: '.rb',
    command: 'ruby',
    getCmd: (file) => `ruby "${file}"`,
    installed: () => checkCommand('ruby'),
  },
  go: {
    fileExt: '.go',
    command: 'go',
    getCmd: (file) => `go run "${file}"`,
    installed: () => checkCommand('go'),
  },
  rust: {
    fileExt: '.rs',
    command: 'rustc',
    getCmd: (file) => isWindows
      ? `rustc "${file}" -o out.exe && out.exe`
      : `rustc "${file}" -o out && ./out`,
    installed: () => checkCommand('rustc'),
  },
  bash: {
    fileExt: '.sh',
    command: 'bash',
    getCmd: (file) => `bash "${file}"`,
    installed: () => checkCommand('bash'),
  },
  shell: {
    fileExt: '.sh',
    command: 'sh',
    getCmd: (file) => `sh "${file}"`,
    installed: () => checkCommand('sh'),
  },
  r: {
    fileExt: '.r',
    command: 'Rscript',
    getCmd: (file) => `Rscript "${file}"`,
    installed: () => checkCommand('Rscript'),
  },
  perl: {
    fileExt: '.pl',
    command: 'perl',
    getCmd: (file) => `perl "${file}"`,
    installed: () => checkCommand('perl'),
  },
  lua: {
    fileExt: '.lua',
    command: 'lua',
    getCmd: (file) => `lua "${file}"`,
    installed: () => checkCommand('lua'),
  },
  swift: {
    fileExt: '.swift',
    command: 'swift',
    getCmd: (file) => `swift "${file}"`,
    installed: () => checkCommand('swift'),
  },
  kotlin: {
    fileExt: '.kt',
    command: 'kotlinc',
    getCmd: (file) => `kotlinc "${file}" -include-runtime -d out.jar && java -jar out.jar`,
    installed: () => checkCommand('kotlinc'),
  },
  groovy: {
    fileExt: '.groovy',
    command: 'groovy',
    getCmd: (file) => `groovy "${file}"`,
    installed: () => checkCommand('groovy'),
  },
  scala: {
    fileExt: '.scala',
    command: 'scala',
    getCmd: (file) => `scala "${file}"`,
    installed: () => checkCommand('scala'),
  },
  dart: {
    fileExt: '.dart',
    command: 'dart',
    getCmd: (file) => `dart "${file}"`,
    installed: () => checkCommand('dart'),
  },
  elixir: {
    fileExt: '.exs',
    command: 'elixir',
    getCmd: (file) => `elixir "${file}"`,
    installed: () => checkCommand('elixir'),
  },
  haskell: {
    fileExt: '.hs',
    command: 'runhaskell',
    getCmd: (file) => `runhaskell "${file}"`,
    installed: () => checkCommand('runhaskell'),
  },
};

// Check if a command is available in the system
function checkCommand(cmd) {
  return new Promise((resolve) => {
    const checkCmd = isWindows ? `where ${cmd}` : `which ${cmd}`;
    exec(checkCmd, (error) => {
      resolve(!error);
    });
  });
}

// Execute code in a specific language
exports.executeCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required',
      });
    }

    // Check if language is supported
    if (!LANGUAGE_COMMANDS[language]) {
      return res.status(400).json({
        success: false,
        message: `Language '${language}' is not supported. Supported: ${Object.keys(
          LANGUAGE_COMMANDS
        ).join(', ')}`,
      });
    }

    // Check if execution is allowed
    if (process.env.ALLOW_CODE_EXECUTION !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Code execution is disabled on this server',
      });
    }

    // Check if language is installed
    const langConfig = LANGUAGE_COMMANDS[language];
    const isInstalled = await langConfig.installed();
    
    if (!isInstalled) {
      const cmd = langConfig.command;
      return res.status(400).json({
        success: false,
        message: `Language '${language}' is not installed on this system`,
        error: `The '${cmd}' command is not available. Please install ${language} first.`,
        language,
      });
    }

    // Create temporary file
    const tempDir = os.tmpdir();
    const fileName = `nexus_${Date.now()}${langConfig.fileExt}`;
    const filePath = path.join(tempDir, fileName);

    // Write code to file
    await fs.writeFile(filePath, code);

    const command = langConfig.getCmd(filePath);
    const maxTimeout = parseInt(process.env.MAX_EXECUTION_TIME) || 5000;

    try {
      // Execute code with timeout and optional input
      const { stdout, stderr } = await execAsync(command, {
        timeout: maxTimeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        cwd: os.tmpdir(), // Run in temp directory for output files
      });

      // Clean up temporary file
      await fs.unlink(filePath).catch(() => {});

      res.status(200).json({
        success: true,
        output: stdout,
        error: stderr,
        language,
      });
    } catch (execError) {
      // Clean up temporary file
      await fs.unlink(filePath).catch(() => {});

      // Handle execution errors
      if (execError.killed) {
        return res.status(408).json({
          success: false,
          message: 'Code execution timeout exceeded',
          error: `Execution exceeded ${maxTimeout}ms`,
          language,
        });
      }

      res.status(200).json({
        success: false,
        output: execError.stdout || '',
        error: execError.stderr || execError.message || 'Unknown error',
        message: 'Code execution failed',
        language,
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message,
    });
  }
};

// Get supported languages
exports.getSupportedLanguages = async (req, res) => {
  try {
    const languages = [];
    
    for (const [lang, config] of Object.entries(LANGUAGE_COMMANDS)) {
      const installed = await config.installed();
      languages.push({
        name: lang,
        extension: config.fileExt,
        command: config.command,
        installed,
      });
    }

    res.status(200).json({
      success: true,
      languages,
      platform: platform(),
      os: isWindows ? 'Windows' : 'Unix/Linux',
    });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages',
      error: error.message,
    });
  }
};
