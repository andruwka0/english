// Loaded lazily from the CDN in the browser — never bundled or run on the server.
const PYODIDE_VERSION = "314.0.3";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export interface RunResult {
  passed: boolean;
  output: string;
  error?: string;
  friendlyError?: string;
}

// Kid-friendly explanations for the most common exception types a beginner
// hits. AssertionError is deliberately excluded — that message is authored
// by the teacher per-homework and is already meant to be read directly.
const FRIENDLY_ERRORS: Record<string, string> = {
  SyntaxError:
    "Кажется, где-то опечатка в коде — проверь скобки, кавычки и двоеточия в конце строк с if/for/while/def.",
  IndentationError:
    "Проверь отступы (пробелы) перед этой строкой — в Python отступы обязательны и должны совпадать.",
  TabError:
    "Похоже, в отступах перемешались пробелы и табуляция — используй только пробелы.",
  NameError:
    "Используется переменная или функция, которая ещё не создана, или в названии опечатка.",
  TypeError:
    "Операция применяется не к тем типам данных — например, сложили число со строкой.",
  ZeroDivisionError: "На ноль делить нельзя!",
  IndexError:
    "Ты обращаешься к элементу списка, которого не существует — проверь номер (индекс).",
  KeyError: "В словаре нет такого ключа — проверь его название.",
  AttributeError: "У этого объекта нет такого метода или свойства — проверь название.",
  ValueError: "Значение не подходит для этой операции — проверь, что именно передаётся.",
  ModuleNotFoundError: "Такого модуля нет или он не подключён.",
  ImportError: "Не получилось что-то импортировать — проверь название модуля.",
  RecursionError: "Функция вызывает сама себя слишком много раз — проверь условие выхода.",
  OverflowError: "Число получилось слишком большим для вычисления.",
};

function explainError(rawLastLine: string): string | undefined {
  const match = rawLastLine.match(/^(\w+Error)\b/);
  return match ? FRIENDLY_ERRORS[match[1]] : undefined;
}

// Minimal shape of the pieces of the Pyodide JS API this module relies on.
interface PyodideInterface {
  globals: { get(name: string): (...args: unknown[]) => PyProxyDict };
  runPythonAsync(code: string, options?: { globals?: PyProxyDict }): Promise<unknown>;
  setStdout(options: { batched: (msg: string) => void }): void;
  setStderr(options: { batched: (msg: string) => void }): void;
}

interface PyProxyDict {
  set(key: string, value: unknown): void;
  destroy(): void;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodideReadyPromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Не удалось загрузить Pyodide"));
    document.head.appendChild(script);
  });
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      await loadScript(`${PYODIDE_CDN}pyodide.js`);
      if (!window.loadPyodide) {
        throw new Error("Pyodide не инициализировался");
      }
      return window.loadPyodide({ indexURL: PYODIDE_CDN });
    })();
  }
  return pyodideReadyPromise;
}

function formatPyError(err: unknown): string {
  const text = String(err instanceof Error ? err.message : err);
  const lines = text.trim().split("\n").filter(Boolean);
  return lines[lines.length - 1] ?? text;
}

// Runs the student's code with stdout redirected into a StringIO, then
// re-prints whatever it captured and exposes it as the `output` variable —
// this lets teacher-written tests assert on printed text (`assert "Итого"
// in output`) for beginner homeworks that only use variables/print, with no
// function definitions required.
const CAPTURE_STUDENT_OUTPUT = `
import sys, io as __io
__buf = __io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __buf
try:
    exec(__student_code__)
finally:
    sys.stdout = __old_stdout
output = __buf.getvalue()
print(output, end="")
`;

/**
 * Runs the student's code followed by the teacher's assert-based test code
 * in a shared, fresh Python namespace, and captures everything printed to
 * stdout/stderr so it can be shown back to the student. The student's own
 * printed output is also exposed to the test code as the `output` string,
 * so tests can assert on it directly instead of requiring the student to
 * define functions.
 */
export async function runStudentCode(
  studentCode: string,
  testCode: string,
): Promise<RunResult> {
  const pyodide = await getPyodide();
  let jsOutput = "";
  pyodide.setStdout({
    batched: (msg) => {
      jsOutput += msg + "\n";
    },
  });
  pyodide.setStderr({
    batched: (msg) => {
      jsOutput += msg + "\n";
    },
  });

  const namespace = pyodide.globals.get("dict")();
  namespace.set("__student_code__", studentCode);
  try {
    await pyodide.runPythonAsync(CAPTURE_STUDENT_OUTPUT, { globals: namespace });
    await pyodide.runPythonAsync(testCode, { globals: namespace });
    return { passed: true, output: jsOutput.trim() };
  } catch (err) {
    const error = formatPyError(err);
    return { passed: false, output: jsOutput.trim(), error, friendlyError: explainError(error) };
  } finally {
    namespace.destroy();
  }
}
