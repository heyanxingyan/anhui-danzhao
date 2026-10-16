const { spawn } = require('child_process');
const path = require('path');

const siteDir = path.resolve(__dirname);
const domain = 'anhui-danzhao.surge.sh';

const child = spawn('surge.cmd', [siteDir, domain], {
  cwd: siteDir,
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let step = 0;

child.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
  
  // 自动输入邮箱和密码
  if (step === 0 && (text.includes('email') || text.includes('Email'))) {
    setTimeout(() => {
      child.stdin.write('anhuidanzhao2026@maildrop.cc\n');
      step = 1;
    }, 500);
  }
  if (step === 1 && (text.includes('password') || text.includes('Password'))) {
    setTimeout(() => {
      child.stdin.write('Anhui2026danzhao\n');
      step = 2;
    }, 500);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log(`\n=== 部署完成，退出码: ${code} ===`);
  console.log(`访问地址: https://${domain}`);
  process.exit(code);
});

// 超时保护
setTimeout(() => {
  console.log('部署超时');
  child.kill();
  process.exit(1);
}, 180000);
