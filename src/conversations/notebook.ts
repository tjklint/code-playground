import { Conversation, Autonomous, z } from "@botpress/runtime";
import { spawn } from "node:child_process";

/**
 * Notebook Runner Conversation
 *
 * An interactive code assistant that can execute JavaScript and Python code.
 */
export default new Conversation({
  channel: ["chat.channel", "webchat.channel"] as const,
  state: z.object({}),

  handler: async (props) => {
    const { execute } = props as { execute: Autonomous.ConvoExecuteFn };

    // JavaScript execution tool - runs code via Node.js child process
    const runJsTool = new Autonomous.Tool({
      name: "runJs",
      description:
        "Execute JavaScript code using Node.js. IMPORTANT: The code must end with an expression (not a statement with semicolon) to return a value. Example: 'const f = n => n*2; f(5)' returns 10. Or use console.log() to print output.",
      input: z.object({
        code: z.string().describe("JavaScript code. Must end with an expression to return its value, e.g. 'const x = 5; x * 2' (no semicolon at end)"),
      }),
      handler: async ({ code }: { code: string }) => {
        console.log(`\n🟡 [runJs] EXECUTING:\n${code.substring(0, 200)}${code.length > 200 ? '...' : ''}\n`);
        const startTime = Date.now();

        return new Promise<{ success: boolean; result: string; code: string; language: string; executionTimeMs: number }>((resolve) => {
          // Use -p flag to print the result of the last expression
          // Also capture console.log output separately
          const node = spawn("node", ["-p", code], { timeout: 5000 });
          let stdout = "";
          let stderr = "";

          node.stdout.on("data", (data) => { stdout += data.toString(); });
          node.stderr.on("data", (data) => { stderr += data.toString(); });

          node.on("close", (exitCode) => {
            const result = stdout.trim() || "undefined";
            const execTime = Date.now() - startTime;

            const output = {
              success: exitCode === 0,
              result: exitCode === 0 ? result : stderr.trim(),
              code: code,
              language: "javascript",
              executionTimeMs: execTime,
            };
            
            console.log(`🟢 [runJs] RESULT: ${output.success ? '✓' : '✗'} (${execTime}ms)`);
            console.log(`   → ${String(output.result).substring(0, 100)}${String(output.result).length > 100 ? '...' : ''}\n`);
            
            resolve(output);
          });

          node.on("error", (err) => {
            console.log(`🔴 [runJs] ERROR: ${err.message}\n`);
            resolve({
              success: false,
              result: `Failed to run Node.js: ${err.message}`,
              code: code,
              language: "javascript",
              executionTimeMs: Date.now() - startTime,
            });
          });
        });
      },
    });

    // Python execution tool - spawns python3 process
    const runPythonTool = new Autonomous.Tool({
      name: "runPython",
      description:
        "Execute Python code. Use print() to output results. Libraries like math, numpy (if installed), and matplotlib (if installed) are available.",
      input: z.object({
        code: z.string().describe("The Python code to execute"),
      }),
      handler: async ({ code }: { code: string }) => {
        console.log(`\n🟡 [runPython] EXECUTING:\n${code.substring(0, 200)}${code.length > 200 ? '...' : ''}\n`);
        const startTime = Date.now();

        return new Promise<{ success: boolean; result: string; code: string; language: string; executionTimeMs: number }>((resolve) => {
          const wrappedCode = `
import math
import json
try:
    import numpy as np
except ImportError:
    pass
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except ImportError:
    pass

${code}
`;
          const python = spawn("python3", ["-c", wrappedCode], { timeout: 30000 });
          let stdout = "";
          let stderr = "";

          python.stdout.on("data", (data) => { stdout += data.toString(); });
          python.stderr.on("data", (data) => { stderr += data.toString(); });

          python.on("close", (exitCode) => {
            const execTime = Date.now() - startTime;
            const output = {
              success: exitCode === 0,
              result: exitCode === 0 ? stdout.trim() : stderr.trim(),
              code: code,
              language: "python",
              executionTimeMs: execTime,
            };
            
            console.log(`🟢 [runPython] RESULT: ${output.success ? '✓' : '✗'} (${execTime}ms)`);
            console.log(`   → ${output.result.substring(0, 100)}${output.result.length > 100 ? '...' : ''}\n`);
            
            resolve(output);
          });

          python.on("error", (err) => {
            console.log(`🔴 [runPython] ERROR: ${err.message}\n`);
            resolve({
              success: false,
              result: `Failed to run Python: ${err.message}`,
              code: code,
              language: "python",
              executionTimeMs: Date.now() - startTime,
            });
          });
        });
      },
    });

    // Run the autonomous agent with code execution tools
    await execute({
      instructions: `You are "Notebook Runner", an interactive code assistant.

TOOLS AVAILABLE:
- runJs: Execute JavaScript code (use for quick calculations, algorithms, data transformations)
- runPython: Execute Python code (use for math, numpy, matplotlib plots)

RULES:
1. When asked to calculate or compute something, ALWAYS use a tool - never answer from memory
2. After getting the tool result, format your response nicely showing the result AND the code
3. For Fibonacci, factorials, sums, etc. - write and run the actual code

IMPORTANT FOR runJs:
- Code must END with an expression (no semicolon) to return a value
- GOOD: "const fact = n => n <= 1 ? 1 : n * fact(n-1); fact(5)" → returns 120

RESPONSE FORMAT:
**Result:** [the computed value]

\`\`\`[language]
[the code that was executed]
\`\`\`
_Executed in [executionTimeMs]ms_

Example response:
**Result:** 6765

\`\`\`javascript
const fib = n => n <= 1 ? n : fib(n-1) + fib(n-2); fib(20)
\`\`\`
_Executed in 28ms_`,
      tools: [runJsTool, runPythonTool],
    });
  },
});
