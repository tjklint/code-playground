import { Action, z } from "@botpress/runtime";
import { spawn } from "node:child_process";

/**
 * run_python - Execute Python code
 *
 * This action allows the agent to run Python code snippets
 * and return the results. Perfect for mathematical computations,
 * data analysis, and plotting.
 */
export default new Action({
  name: "runPython",
  title: "Run Python Code",
  description:
    "Execute Python code and return the result. " +
    "Great for mathematical computations, data analysis, plotting with matplotlib, " +
    "and scientific computing. Common libraries like math, numpy (if available), " +
    "and matplotlib (if available) can be used.",
  input: z.object({
    code: z
      .string()
      .describe(
        "The Python code to execute. Use print() to output results. " +
          "For plots, save to a file or use plt.show() in supported environments."
      ),
    timeout: z
      .number()
      .optional()
      .default(30000)
      .describe("Maximum execution time in milliseconds (default: 30000ms)"),
  }),
  output: z.object({
    stdout: z.string().describe("Standard output from the Python execution"),
    stderr: z.string().describe("Standard error output (warnings, errors)"),
    success: z.boolean().describe("Whether the execution completed successfully"),
    exitCode: z.number().describe("Process exit code (0 = success)"),
    executionTime: z
      .number()
      .describe("Time taken to execute the code in milliseconds"),
  }),
  handler: async ({ input }) => {
    const { code, timeout } = input;
    const startTime = Date.now();

    return new Promise((resolve) => {
      // Wrap the user's code to handle both expression evaluation and statements
      const wrappedCode = `
import sys
import math
import json
from io import StringIO

# Try to import common scientific libraries
try:
    import numpy as np
except ImportError:
    pass

try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
except ImportError:
    pass

# Execute user code
${code}
`;

      const python = spawn("python3", ["-c", wrappedCode], {
        timeout,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        python.kill("SIGTERM");
      }, timeout);

      python.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      python.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      python.on("close", (exitCode) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;

        if (timedOut) {
          resolve({
            stdout: stdout.trim(),
            stderr: `Execution timed out after ${timeout}ms`,
            success: false,
            exitCode: exitCode ?? -1,
            executionTime,
          });
        } else {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            success: exitCode === 0,
            exitCode: exitCode ?? -1,
            executionTime,
          });
        }
      });

      python.on("error", (err) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;

        resolve({
          stdout: "",
          stderr: `Failed to execute Python: ${err.message}. Make sure Python 3 is installed.`,
          success: false,
          exitCode: -1,
          executionTime,
        });
      });
    });
  },
});

