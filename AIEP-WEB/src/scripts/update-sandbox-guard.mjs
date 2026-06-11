/**
 * 沙箱检测：仅读环境变量与 process 元数据，**禁止** execSync/spawn。
 * 在 trae-sandbox 内调用 PowerShell 子进程会导致 Node 自身异常退出（如 -1073740791）。
 */

/** 已知 Agent/IDE 沙箱环境变量（值为 1/true/yes 时视为沙箱） */
const SANDBOX_ENV_KEYS = [
  'TRAE_SANDBOX',
  'TRAE_IN_SANDBOX',
  'TRAE_AGENT_SANDBOX',
  'CURSOR_SANDBOX',
  'CURSOR_AGENT_SANDBOX',
  'AGENT_SANDBOX',
  'LTC_SANDBOX_DETECTED'
]

/** process.argv / 可执行路径中的沙箱标记 */
const SANDBOX_ARG_PATTERNS = [/trae-sandbox/i, /traeai/i, /cursor.*sandbox/i, /cursorsandbox/i]

/** 非交互终端 + 下列环境前缀 → 视为 Agent 托管终端 */
const AGENT_ENV_PREFIXES = ['CURSOR_', 'TRAE_', 'VSCODE_IPC_', 'VSCODE_PID']

const CI_ENV_KEYS = ['CI', 'GITHUB_ACTIONS', 'GITLAB_CI', 'TF_BUILD', 'BUILD_BUILDID']

function isTruthyEnv(value) {
  if (value == null || value === '') return false
  const v = String(value).trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

export function isCiEnvironment() {
  return CI_ENV_KEYS.some((key) => isTruthyEnv(process.env[key]))
}

function matchesSandboxPattern(text) {
  if (!text) return false
  return SANDBOX_ARG_PATTERNS.some((pattern) => pattern.test(text))
}

function hasAgentHostEnv() {
  for (const key of Object.keys(process.env)) {
    if (AGENT_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))) return true
    if (/^(CURSOR|TRAE)/i.test(key) && isTruthyEnv(process.env[key])) return true
  }
  return false
}

function detectArgvSandboxMarker() {
  const blob = [process.execPath, ...process.argv].join(' ')
  if (matchesSandboxPattern(blob)) {
    return `命令行/可执行路径含沙箱标记（${blob.slice(0, 160)}）`
  }
  return null
}

/**
 * 检测当前是否在 Agent/IDE 沙箱中（纯同步，无子进程）。
 * @returns {{ sandbox: boolean, reasons: string[] }}
 */
export function detectRestrictedExecutionEnvironment() {
  const reasons = []

  for (const key of SANDBOX_ENV_KEYS) {
    if (isTruthyEnv(process.env[key])) {
      reasons.push(`环境变量 ${key}=${process.env[key]}`)
    }
  }

  if (isTruthyEnv(process.env.SANDBOX) && !isCiEnvironment()) {
    reasons.push(`环境变量 SANDBOX=${process.env.SANDBOX}`)
  }

  const argvMarker = detectArgvSandboxMarker()
  if (argvMarker) reasons.push(argvMarker)

  // 仅拦截非交互执行（Agent 代跑、管道）；用户在 IDE 终端或 .bat 中手动运行（isTTY）不受限
  if (!process.stdin.isTTY && !isCiEnvironment()) {
    reasons.push('非交互终端（Agent 代跑命令，无法在此确认安装）')
    if (hasAgentHostEnv()) {
      reasons.push('检测到 Cursor/Trae Agent 托管进程')
    }
  }

  return { sandbox: reasons.length > 0, reasons }
}

export function isSandboxBypassEnabled(cli = {}) {
  return cli.allowSandbox === true || isTruthyEnv(process.env.LTC_ALLOW_SANDBOX)
}

/** Windows 异常退出码说明（供日志/文档引用） */
export const WINDOWS_CRASH_EXIT_HINT =
  '退出码 -1073740791 (0xC0000409) 表示进程被系统/沙箱强杀（Fast Fail），不是 npm 业务失败；ACCESS_VIOLATION 通常为 -1073741819 (0xC0000005)'

export function printSandboxBlockedHelp() {
  console.error(`\n${WINDOWS_CRASH_EXIT_HINT}`)
  console.error('\nupdate.js 备份/合并/构建步骤文件量大，Agent 自动代跑易在沙箱中崩溃，须由你本人确认后执行。')
  console.error('\n任选一种方式（无需会 PowerShell）：')
  console.error('  【推荐】双击更新包内的「预览更新.bat」→「安装更新.bat」')
  console.error('  【或】Cursor / Trae 菜单：终端 → 新建终端，粘贴下面一行后回车：')
  console.error('        node ltc-demo-update-v*/update.js --yes')
  console.error('  【或】Win+R 输入 cmd 回车，cd 到项目目录后粘贴同上命令')
  console.error('\n预览（Agent 可代跑）：node ltc-demo-update-v*/update.js --dry-run')
  console.error('CI / 流水线：加 --allow-sandbox 或设置 LTC_ALLOW_SANDBOX=1。\n')
}

/**
 * 会修改项目的操作（--yes / --rollback）禁止在沙箱内执行；--dry-run 不受限。
 */
export function assertNotSandboxedForMutatingUpdate(cli = {}) {
  if (cli.dryRun && !cli.yes && !cli.rollback) return
  if (isSandboxBypassEnabled(cli)) return

  const { sandbox, reasons } = detectRestrictedExecutionEnvironment()
  if (!sandbox) return

  console.error('\n❌ 检测到 Agent 沙箱或非交互环境，已阻止会修改项目的更新操作。')
  console.error('\n原因：')
  for (const r of reasons) console.error(`  · ${r}`)
  printSandboxBlockedHelp()
  process.exit(1)
}
