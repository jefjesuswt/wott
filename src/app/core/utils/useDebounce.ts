export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  // Usamos 'any' o 'ReturnType<typeof setTimeout>' en lugar de 'NodeJS.Timeout'
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
