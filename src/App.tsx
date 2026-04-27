/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

// --- Types ---
interface WindowData {
  id: string;
  title: string;
  type: 'terminal' | 'process' | 'view';
}

interface FileSystemItem {
  name: string;
  type: 'dir' | 'file';
  url?: string;
  children?: Record<string, FileSystemItem>;
}

// --- Constants ---
const ROOT_FS: FileSystemItem = {
  name: '/',
  type: 'dir',
  children: {
    home: {
      name: 'home',
      type: 'dir',
      children: {
        qlegacy: {
          name: 'qlegacy',
          type: 'dir',
          children: {
            Desktop: { 
                name: 'Desktop', 
                type: 'dir',
                children: {
                    'all-passage.txt': { name: 'all-passage.txt', type: 'file' }
                }
            },
            Documents: { name: 'Documents', type: 'dir' },
            Downloads: { name: 'Downloads', type: 'dir' },
            Music: { name: 'Music', type: 'dir' },
            Pictures: { name: 'Pictures', type: 'dir' },
            Videos: { name: 'Videos', type: 'dir' },
            quadlegacyai: { name: 'quadlegacyai', type: 'dir', url: 'https://quadlegacyai.github.io' },
            bio: { name: 'bio', type: 'dir', url: 'https://qlegacy.github.io/bio' },
            mriyaenchancer: { name: 'mriyaenchancer', type: 'dir', url: 'https://github.com/qlegacy/mriyaenchancer' },
            adrod16: { name: 'adrod16', type: 'dir', url: 'https://github.com/qlegacy/adrod16' },
            'all-passage.txt': { name: 'all-passage.txt', type: 'file' },
            '.bashrc': { name: '.bashrc', type: 'file' },
            '.zshrc': { name: '.zshrc', type: 'file' },
          }
        },
        anonymous: {
          name: 'anonymous',
          type: 'dir',
          children: {
            secrets: { name: 'secrets', type: 'dir' }
          }
        }
      }
    },
    bin: {
      name: 'bin',
      type: 'dir',
      children: {
        zsh: { name: 'zsh', type: 'file' },
        ls: { name: 'ls', type: 'file' },
        rm: { name: 'rm', type: 'file' },
        sh: { name: 'sh', type: 'file' },
        cat: { name: 'cat', type: 'file' },
        mkdir: { name: 'mkdir', type: 'file' },
        pwd: { name: 'pwd', type: 'file' },
        clear: { name: 'clear', type: 'file' },
        neofetch: { name: 'neofetch', type: 'file' },
      }
    },
    etc: {
      name: 'etc',
      type: 'dir',
      children: {
        passwd: { name: 'passwd', type: 'file' },
        hostname: { name: 'hostname', type: 'file' },
        'issue.net': { name: 'issue.net', type: 'file' },
      }
    },
    usr: {
      name: 'usr',
      type: 'dir',
      children: {
        bin: { name: 'bin', type: 'dir' },
        lib: { name: 'lib', type: 'dir' },
        share: { name: 'share', type: 'dir' },
      }
    },
    var: {
      name: 'var',
      type: 'dir',
      children: {
        log: { name: 'log', type: 'dir' },
        www: { name: 'www', type: 'dir' },
      }
    },
    tmp: { name: 'tmp', type: 'dir', children: {} },
    dev: { name: 'dev', type: 'dir', children: { null: { name: 'null', type: 'file' }, random: { name: 'random', type: 'file' } } },
    proc: { name: 'proc', type: 'dir', children: { cpuinfo: { name: 'cpuinfo', type: 'file' }, meminfo: { name: 'meminfo', type: 'file' } } },
  }
};

const HELP_TEXT = `WebUX v14.88 core utils.
Commands: ls, cd, cat, mkdir, rm, date, cal, neofetch, tg, USE, zsh, clear, help, exit.
Shortcuts: Ctrl+L (clear), Ctrl+C (interrupt), Tab (complete).`;

const SYSTEM_DOCS = `System Documentation (v1.4.88)
==============================
Welcome to WebUX, a secure terminal-based environment.

File System:
/bin - System binaries
/etc - Configuration files
/home - User directories
/tmp - Temporary files
/var - Variable data
/dev - Device files
/proc - Process information

Available Commands:
- ls [path]: List directory contents
- cd [path]: Change current directory
- pwd: Print working directory (Security restricted)
- cat [file]: Display file contents
- mkdir [name]: Create directory
- rm [name]: Remove file/directory
- clear: Clear terminal screen
- help: Show this help message
- date: Display current system date
- cal: Display calendar
- tg: Open Telegram link
- USE: Launch project from directory URL
- zsh: Spawn a new tiling terminal window
- exit: Close current terminal
- neofetch: Display system information

Navigation:
- ~ : User home (/home/qlegacy)
- . : Current directory
- .. : Parent directory
- / : Root directory

Shortcuts:
- Ctrl+L: Clear screen
- Ctrl+C: Cancel current command
- Tab: Auto-complete paths and commands`;

const getNeofetchText = () => {
    const uptimeInSeconds = Math.floor(performance.now() / 1000);
    const minutes = Math.floor(uptimeInSeconds / 60);
    const seconds = uptimeInSeconds % 60;
    const uptimeStr = `${minutes}m ${seconds}s`;
    
    // Seeded random for "packages" based on date or just random
    const packages = 200 + Math.floor(Math.random() * 701);
    
    return `
       .---.          anonymous@git-host
      /     \\         ------------------
      | () () |        OS: WebUx 14.88-X x86_64
      \\  ^  /         Kernel: WebUX gcc unknown qlegacy@git-host-18857XG 2026-04 BUILD
       |||||           Uptime: ${uptimeStr}
       |||||           Packages: ${packages} (dpkg)
                       Shell: zah 5.8
                       Resolution: 1920x1080
                       WM: QWM (Tiling)
                       CPU: QEMU Virtual CPU version 6.8
                       Memory: N/A MiB / N/A MiB
`;
};

// --- Components ---

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const charSize = 20;
    const columns = Math.floor(width / charSize);
    const drops = new Array(columns).fill(1);

    const chars = "ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ234567890ABCDEFHIJKLMNOPQRSTUVWXYZ";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0F0";
      ctx.font = `${charSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * charSize;
        const y = drops[i] * charSize;

        const brightness = Math.random();
        ctx.fillStyle = brightness > 0.95 ? "#FFF" : brightness > 0.5 ? "#0F0" : "#0A0";
        
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40 z-0"
    />
  );
};

const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      className="custom-cursor"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    />
  );
};

interface WindowData {
  id: string;
  title: string;
  type: 'terminal' | 'process' | 'view';
  history: string[];
  currentPath: string[];
}

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([
    { 
      id: 'term-main', 
      title: 'zsh', 
      type: 'terminal',
      history: [],
      currentPath: ['home', 'qlegacy']
    },
  ]);
  const [isNukeActive, setIsNukeActive] = useState(false);
  const [nukeLogs, setNukeLogs] = useState<string[]>([]);
  const [fs, setFs] = useState<FileSystemItem>(ROOT_FS);

  const terminalEndRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [hostnameSuffix] = useState(() => Math.random().toString(36).substring(7));

  // Path resolution helpers
  const resolvePath = (pathStr: string, currentPath: string[]): string[] | null => {
    if (!pathStr) return [...currentPath];
    let parts = [...currentPath];
    if (pathStr === '~') return ['home', 'qlegacy'];
    if (pathStr.startsWith('~')) {
        parts = ['home', 'qlegacy', ...pathStr.substring(2).split('/').filter(x => x)];
        return parts;
    }
    if (pathStr.startsWith('/')) {
      parts = [];
      pathStr = pathStr.substring(1);
    }
    if (pathStr === '') return parts;

    const nav = pathStr.split('/');
    for (const seg of nav) {
      if (seg === '.' || seg === '') continue;
      if (seg === '..') {
        if (parts.length > 0) parts.pop();
        continue;
      }
      parts.push(seg);
    }
    return parts;
  };

  const getDirFromPath = (path: string[]): FileSystemItem | null => {
    let curr = fs;
    if (path.length === 0) return curr;
    for (const part of path) {
      if (curr.children && curr.children[part]) {
        curr = curr.children[part];
      } else {
        return null;
      }
    }
    return curr;
  };

  const getPathDisplay = (path: string[]) => {
    const p = path.join('/');
    if (p === 'home/qlegacy') return '~';
    if (p.startsWith('home/qlegacy/')) return '~/' + p.replace('home/qlegacy/', '');
    if (p === '') return '/';
    return '/' + p;
  };

  const getPrompt = (path: string[]) => {
      return `anonymous@git-host-${hostnameSuffix}:${getPathDisplay(path)}$`;
  };

  useEffect(() => {
    if (windows.length === 0 && !isNukeActive) {
      setWindows([{ 
        id: 'term-main', 
        title: 'zsh', 
        type: 'terminal',
        history: [],
        currentPath: ['home', 'qlegacy']
      }]);
    }
  }, [windows, isNukeActive]);

  useEffect(() => {
    if (isNukeActive) {
      const interval = setInterval(() => {
        setNukeLogs(prev => {
          const newLogs = [...prev];
          for (let i = 0; i < 50; i++) {
            newLogs.push(`rm: removing '/usr/bin/${Math.random().toString(36).substring(7)}'... OK`);
          }
          if (newLogs.length > 5000) {
              document.body.style.filter = 'invert(1) hue-rotate(90deg) blur(5px)';
              setTimeout(() => {
                document.body.innerHTML = "<div style='color: #0f0; font-family: monospace; padding: 20px; font-size: 5rem; text-align: center; margin-top: 20vh;'>SYSTEM HALTED.</div>";
              }, 1000);
              clearInterval(interval);
          }
          return newLogs.slice(-100);
        });

        const allElements = document.querySelectorAll('div, span, p, pre');
        if (allElements.length > 0) {
            const randomEl = allElements[Math.floor(Math.random() * allElements.length)];
            if (randomEl) {
                randomEl.innerHTML = Array.from({ length: 10 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join('');
            }
        }
      }, 50);
      
      const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
      audio.loop = true;
      audio.play().catch(() => {});
      
      return () => clearInterval(interval);
    }
  }, [isNukeActive]);

  const handleCommand = (cmdStr: string, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;

    const args = cmdStr.trim().split(/\s+/);
    const cmd = args[0];
    const newHistory = [...win.history, `${getPrompt(win.currentPath)} ${cmdStr}`];
    let newPath = [...win.currentPath];

    const push = (msg: string | string[]) => {
        if (Array.isArray(msg)) newHistory.push(...msg);
        else newHistory.push(msg);
    };

    switch (cmd) {
      case 'help': push(HELP_TEXT); break;
      case 'ls':
        const lsTarget = args[1] ? resolvePath(args[1], win.currentPath) : win.currentPath;
        if (lsTarget) {
            const dir = getDirFromPath(lsTarget);
            if (dir?.children) push(Object.keys(dir.children).join('  '));
            else push(`ls: cannot access '${args[1]}': No such file or directory`);
        } else push(`ls: cannot access '${args[1]}': Path resolve error`);
        break;
      case 'cd':
        const targetPath = resolvePath(args[1] || '~', win.currentPath);
        if (targetPath) {
          const targetDir = getDirFromPath(targetPath);
          if (targetDir && targetDir.type === 'dir') newPath = targetPath;
          else push(`cd: no such directory: ${args[1]}`);
        } else push(`cd: path error: ${args[1]}`);
        break;
      case 'pwd': push('pwd: permission denied. (Security policy restriction)'); break;
      case 'clear': newHistory.length = 0; break;
      case 'date': push(new Date().toString()); break;
      case 'neofetch': push(getNeofetchText()); break;
      case 'cat':
        if (!args[1]) push('cat: missing operand');
        else {
            const fileTarget = resolvePath(args[1], win.currentPath);
            const item = fileTarget ? getDirFromPath(fileTarget) : null;
            if (item?.type === 'file') {
                if (item.name === 'all-passage.txt') push(SYSTEM_DOCS);
                else push('[BINARY DATA]');
            } else push(`cat: ${args[1]}: No such file`);
        }
        break;
      case 'matrix': push(['INIT NEURAL OVERLAY...', 'DONE.']); break;
      case 'hack': push(['SEARCHING...', 'EXPLOITING...', 'ACCESS GRANTED.']); break;
      case 'cal': push(['    April 2026', 'Su Mo Tu We Th Fr Sa', '          1  2  3  4', ' 5  6  7  8  9 10 11', '12 13 14 15 16 17 18', '19 20 21 22 23 24 25', '26 27 28 29 30']); break;
      case 'tg': window.open('https://t.me/quadlegacybio', '_blank'); break;
      case 'exit': setWindows(prev => prev.filter(w => w.id !== windowId)); return;
      case 'USE':
        const currentDirObj = getDirFromPath(win.currentPath);
        if (currentDirObj?.url) window.open(currentDirObj.url, '_blank');
        else push('USE: No project URL found here.');
        break;
      case 'mkdir':
        if (args[1]) {
           const newFs = JSON.parse(JSON.stringify(fs));
           let walk = newFs;
           for(const p of win.currentPath) walk = walk.children[p];
           walk.children[args[1]] = { name: args[1], type: 'dir', children: {} };
           setFs(newFs);
           push(`Created directory ${args[1]}`);
        } else push('mkdir: missing operand');
        break;
      case 'zsh':
        setWindows(prev => [...prev, { 
            id: `term-${Date.now()}`, 
            title: 'zsh', 
            type: 'terminal',
            history: [],
            currentPath: [...win.currentPath]
        }]);
        push('[INFO] Window attached.');
        break;
      case 'rm':
        if (args.includes('-rf') && args.includes('/*')) push(['rm: cannot remove \'/\': Device or resource busy', 'To override, use --no-preserve-root']);
        else if (args[1]) {
            const newFs = JSON.parse(JSON.stringify(fs));
            let walk = newFs;
            const target = args[1];
            for(const p of win.currentPath) walk = walk.children[p];
            if (walk.children && walk.children[target]) {
                delete walk.children[target];
                setFs(newFs);
                push(`Removed ${target}`);
            } else push(`rm: cannot remove '${target}': No such file or directory`);
        }
        break;
      case 'sudo':
        if (args.join(' ') === 'sudo rm -rf /* --no-preserve-root') setIsNukeActive(true);
        else if (args.join(' ') === 'sudo rm -rf /*') push(['WARNING: IMMINENT SYSTEM DESTRUCTION.', 'CONFIRM WITH --no-preserve-root.']);
        break;
    }

    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, history: newHistory, currentPath: newPath } : w));
    setTimeout(() => terminalEndRefs.current[windowId]?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, windowId: string) => {
    const input = e.currentTarget;
    const value = input.value;
    const win = windows.find(w => w.id === windowId);
    if (!win) return;

    if (e.ctrlKey) {
        if (e.key === 'l') { e.preventDefault(); setWindows(prev => prev.map(w => w.id === windowId ? { ...w, history: [] } : w)); return; }
        if (e.key === 'c') { e.preventDefault(); setWindows(prev => prev.map(w => w.id === windowId ? { ...w, history: [...w.history, `${getPrompt(w.currentPath)} ${value}^C`] } : w)); input.value = ''; return; }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const args = value.trim().split(' ');
      const last = args[args.length - 1];
      const dirPath = last.includes('/') ? last.substring(0, last.lastIndexOf('/')) : null;
      const searchStr = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last;
      const targetPath = dirPath ? resolvePath(dirPath, win.currentPath) : win.currentPath;
      
      if (targetPath) {
          const dir = getDirFromPath(targetPath);
          if (dir?.children) {
              const matches = Object.keys(dir.children).filter(k => k.startsWith(searchStr));
              if (matches.length === 1) {
                  args[args.length - 1] = (dirPath ? dirPath + '/' : '') + matches[0];
                  input.value = args.join(' ');
              } else if (matches.length > 1) {
                  setWindows(prev => prev.map(w => w.id === windowId ? { ...w, history: [...w.history, matches.join('  ')] } : w));
              }
          }
      }
    }

    if (e.key === 'Enter') {
      handleCommand(value, windowId);
      input.value = '';
    }
  };

  const gridCols = windows.length > 1 ? 'grid-cols-2' : 'grid-cols-1';
  const gridRows = windows.length > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className={`screen w-full h-full relative font-mono overflow-hidden select-none ${isNukeActive ? 'glitch-active' : ''}`}>
      <MatrixBackground />
      <div className="scanline" />
      <CustomCursor />
      
      <div className={`absolute inset-0 grid ${gridCols} ${gridRows} p-2 gap-2 z-10 bg-transparent transition-all duration-300`}>
        {windows.map(win => (
          <motion.div
            key={win.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-[#00ff00] bg-[rgba(0,0,0,0.85)] flex flex-col shadow-[0_0_15px_rgba(0,255,0,0.2)] overflow-hidden"
          >
            <div className="bg-[#00ff00] text-black px-2 py-0.5 text-[10px] font-bold flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <span>{win.title.toUpperCase()}</span>
                <span className="opacity-50">PID:{win.id.split('-').pop()}</span>
              </div>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>

            <div 
              className="flex-1 p-4 overflow-y-auto overflow-x-hidden text-sm relative scrollbar-hide"
              onClick={() => inputRefs.current[win.id]?.focus()}
            >
              {isNukeActive ? (
                <div className="text-red-500 font-bold">
                  {nukeLogs.map((log, i) => <div key={i} className="whitespace-nowrap">{log}</div>)}
                </div>
              ) : (
                <>
                  {win.history.length === 0 && (
                    <div className="mb-4 opacity-80">
                      <pre className="text-xs leading-none">
{`
   ____                 _ _                                     
  / __ \\               | | |                                    
 | |  | |_   _  __ _  __| | |     ___  __ _  __ _  ___ _   _  
 | |  | | | | |/ _\` |/ _\` | |    / _ \\/ _\` |/ _\` |/ __| | | | 
 | |__| | |_| | (_| | (_| | |___|  __/ (_| | (_| | (__| |_| | 
  \\___\\_\\\\__,_|\\__,_|\\__,_|______\\___|\\__, |\\__,_|\\___|\\__, | 
                                        __/ |           __/ | 
                                       |___/           |___/  
`}
                      </pre>
                      <p className="mt-2 text-xs">WebUX OS v1.4.88-X. Multi-pane environment active.</p>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap break-all">
                    {win.history.map((line, i) => <div key={i} className="mb-1">{line}</div>)}
                  </div>

                  <div className="flex items-center">
                    <span className="text-[#00ff00] mr-2 shrink-0">{getPrompt(win.currentPath)}</span>
                    <input
                      ref={el => inputRefs.current[win.id] = el}
                      autoFocus
                      className="bg-transparent border-none outline-none text-[#00ff00] flex-1 p-0 m-0"
                      onKeyDown={(e) => handleKeyDown(e, win.id)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  <div ref={el => terminalEndRefs.current[win.id] = el} />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {!isNukeActive && (
        <div className="absolute bottom-2 right-4 text-[10px] opacity-40 z-20 hidden md:block">
            ZSH: NEW PANE | TAB: COMPLETE | CTRL+C: BREAK | CTRL+L: CLEAR
        </div>
      )}
    </div>
  );
};

export default App;
