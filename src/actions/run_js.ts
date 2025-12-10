import { Action, z } from "@botpress/runtime";
import * as vm from "node:vm";

/**
 * run_js - Execute JavaScript code in a sandboxed environment
 *
 * This action allows the agent to run JavaScript code snippets
 * and return the results. Perfect for calculations, data processing,
 * and interactive coding assistance.
 */
export default new Action({
  name: "runJs",
  title: "Run JavaScript Code",
  description:
    "Execute JavaScript code in a sandboxed environment and return the result. " +
    "Use this for calculations, data transformations, generating sequences, " +
    "or any JavaScript computation. The code runs in an isolated VM context.",
  input: z.object({
    code: z
      .string()
      .describe(
        "The JavaScript code to execute. The last expression's value will be returned. " +
          "Use console.log() for intermediate output which will be captured."
      ),
    timeout: z
      .number()
      .optional()
      .default(5000)
      .describe("Maximum execution time in milliseconds (default: 5000ms)"),
  }),
  output: z.object({
    result: z.string().describe("The result of the code execution"),
    logs: z
      .array(z.string())
      .describe("Any console.log outputs captured during execution"),
    success: z.boolean().describe("Whether the execution completed successfully"),
    error: z
      .string()
      .optional()
      .describe("Error message if execution failed"),
    executionTime: z
      .number()
      .describe("Time taken to execute the code in milliseconds"),
  }),
  handler: async ({ input }) => {
    const { code, timeout } = input;
    const logs: string[] = [];
    const startTime = Date.now();

    // Create a sandbox with safe globals
    const sandbox: vm.Context = {
      console: {
        log: (...args: unknown[]) => {
          logs.push(
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
              )
              .join(" ")
          );
        },
        error: (...args: unknown[]) => {
          logs.push(
            "[ERROR] " +
              args
                .map((arg) =>
                  typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
                )
                .join(" ")
          );
        },
        warn: (...args: unknown[]) => {
          logs.push(
            "[WARN] " +
              args
                .map((arg) =>
                  typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
                )
                .join(" ")
          );
        },
      },
      // Safe Math utilities
      Math,
      // JSON utilities
      JSON,
      // Array and Object utilities
      Array,
      Object,
      // String utilities
      String,
      Number,
      Boolean,
      Date,
      RegExp,
      // Useful functions
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      // Allow Map, Set, etc.
      Map,
      Set,
      WeakMap,
      WeakSet,
      // Promise support (limited)
      Promise,
      // Typed arrays for numerical computation
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      BigInt64Array,
      BigUint64Array,
      ArrayBuffer,
      DataView,
      BigInt,
      // Error types
      Error,
      TypeError,
      RangeError,
      SyntaxError,
    };

    try {
      vm.createContext(sandbox);

      const script = new vm.Script(code, {
        filename: "user-code.js",
      });

      const result = script.runInContext(sandbox, {
        timeout,
        displayErrors: true,
      });

      const executionTime = Date.now() - startTime;

      // Format the result for display
      let formattedResult: string;
      if (result === undefined) {
        formattedResult = "undefined";
      } else if (result === null) {
        formattedResult = "null";
      } else if (typeof result === "object") {
        try {
          formattedResult = JSON.stringify(result, null, 2);
        } catch {
          formattedResult = String(result);
        }
      } else {
        formattedResult = String(result);
      }

      return {
        result: formattedResult,
        logs,
        success: true,
        executionTime,
      };
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        result: "",
        logs,
        success: false,
        error: errorMessage,
        executionTime,
      };
    }
  },
});

