export const shape = (fd: FormData) =>
  Object.fromEntries(fd) as { [k: string]: string }
