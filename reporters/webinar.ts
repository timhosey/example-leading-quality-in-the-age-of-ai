import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

/**
 * Presentation reporter.
 *
 * Playwright's default output renders a visual diff as a red DiffsFoundError with a
 * stack trace into node_modules, which reads as "the tooling broke" rather than
 * "the test caught a regression". This prints the same outcome as an intentional
 * finding, with the dashboard link and nothing else.
 */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

/**
 * Eyes result URLs end in `~~` or `__` — that is part of the account id, not noise.
 * Only trailing punctuation that could not belong to a URL is trimmed.
 */
function extractEyesUrl(message: string): string | undefined {
  const match = stripAnsi(message).match(/https:\/\/eyes\.applitools\.com\/app\/\S+/);
  return match ? match[0].replace(/[)\].,;:'"]+$/, '') : undefined;
}

function isVisualDiff(message: string): boolean {
  const plain = stripAnsi(message);
  return plain.includes('DiffsFoundError') || /detected differences/i.test(plain);
}

class WebinarReporter implements Reporter {
  private passed = 0;
  private diffed = 0;
  private broke = 0;

  printsToStdio() {
    return true;
  }

  onBegin(_config: FullConfig, suite: Suite) {
    const target = process.env.DEMO_URL ?? 'https://demo.applitools.com/';
    console.log('');
    console.log(`${BOLD}Applitools Eyes${RESET} ${DIM}· Ultrafast Grid${RESET}`);
    console.log(`${DIM}target${RESET}  ${CYAN}${target}${RESET}`);
    console.log(`${DIM}tests${RESET}   ${suite.allTests().length}`);
    console.log('');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const secs = `${(result.duration / 1000).toFixed(1)}s`;

    if (result.status === 'passed') {
      this.passed++;
      console.log(`${GREEN}✓${RESET}  ${test.title} ${DIM}(${secs})${RESET}`);
      return;
    }

    const message = result.error?.message ?? '';

    if (isVisualDiff(message)) {
      this.diffed++;
      const url = extractEyesUrl(message);
      console.log(`${YELLOW}▲${RESET}  ${test.title} ${DIM}(${secs})${RESET}`);
      console.log('');
      console.log(`   ${YELLOW}${BOLD}Visual differences found.${RESET}`);
      console.log(`   ${DIM}Checked against the accepted baseline across every grid config.${RESET}`);
      if (url) {
        console.log('');
        console.log(`   ${BOLD}Review →${RESET} ${CYAN}${url}${RESET}`);
      }
      console.log('');
      return;
    }

    // A genuine failure: show the message, drop the node_modules frames.
    this.broke++;
    console.log(`${RED}✗${RESET}  ${test.title} ${DIM}(${secs})${RESET}`);
    const lines = stripAnsi(message)
      .split('\n')
      .filter((l) => !l.includes('node_modules') && !l.trim().startsWith('at '))
      .slice(0, 6);
    for (const line of lines) console.log(`   ${RED}${line}${RESET}`);
    console.log('');
  }

  onEnd(_result: FullResult) {
    const parts: string[] = [];
    if (this.passed) parts.push(`${GREEN}${this.passed} matched baseline${RESET}`);
    if (this.diffed) parts.push(`${YELLOW}${this.diffed} with visual differences${RESET}`);
    if (this.broke) parts.push(`${RED}${this.broke} failed${RESET}`);
    console.log(`${DIM}${'─'.repeat(52)}${RESET}`);
    console.log(parts.join(`${DIM} · ${RESET}`) || `${DIM}no tests ran${RESET}`);
    console.log('');
  }
}

export default WebinarReporter;
