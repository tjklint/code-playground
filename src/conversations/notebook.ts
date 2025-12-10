import { Conversation, Autonomous, z } from "@botpress/runtime";
import { spawn } from "node:child_process";

/**
 * Code Playground Conversation
 *
 * An interactive code assistant that executes JavaScript code.
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
        "Execute JavaScript code using Node.js. The code must end with an expression (not a statement with semicolon) to return a value. Example: 'const f = n => n*2; f(5)' returns 10.",
      input: z.object({
        code: z.string().describe("JavaScript code to execute. Must end with an expression to return its value."),
      }),
      handler: async ({ code }: { code: string }) => {
        const startTime = Date.now();

        return new Promise<{ success: boolean; result: string; code: string; executionTimeMs: number }>((resolve) => {
          const node = spawn("node", ["-p", code], { timeout: 5000 });
          let stdout = "";
          let stderr = "";

          node.stdout.on("data", (data) => { stdout += data.toString(); });
          node.stderr.on("data", (data) => { stderr += data.toString(); });

          node.on("close", (exitCode) => {
            const result = stdout.trim() || "undefined";
            const execTime = Date.now() - startTime;

            resolve({
              success: exitCode === 0,
              result: exitCode === 0 ? result : stderr.trim(),
              code: code,
              executionTimeMs: execTime,
            });
          });

          node.on("error", (err) => {
            resolve({
              success: false,
              result: `Error: ${err.message}`,
              code: code,
              executionTimeMs: Date.now() - startTime,
            });
          });
        });
      },
    });

    // Run the autonomous agent with JavaScript execution
    await execute({
      instructions: `You are "Code Playground", an interactive JavaScript code assistant.

You have ONE tool: runJs - Execute JavaScript code using Node.js.

RULES:
1. When asked to calculate or compute ANYTHING, use the runJs tool - never answer from memory
2. Write clean, efficient JavaScript code
3. Code must END with an expression (no semicolon) to return a value
4. If the user asks for Python, politely explain you only support JavaScript and offer to write equivalent JS code

EXAMPLES OF GOOD CODE:
- Fibonacci: "const fib = n => n <= 1 ? n : fib(n-1) + fib(n-2); fib(20)"
- Factorial: "const fact = n => n <= 1 ? 1 : n * fact(n-1); fact(10)"
- Sum: "Array.from({length: 100}, (_, i) => i + 1).reduce((a, b) => a + b)"
- Prime check: "const isPrime = n => n > 1 && [...Array(Math.floor(Math.sqrt(n)))].every((_, i) => n % (i + 2) !== 0); isPrime(997)"

RESPONSE FORMAT:
**Result:** [the computed value]

\`\`\`javascript
[the code you executed]
\`\`\`
_Executed in [executionTimeMs]ms_`,
      tools: [runJsTool],
    });
  },
});
