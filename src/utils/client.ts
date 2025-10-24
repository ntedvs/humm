export const shape = (fd: FormData) =>
  Object.fromEntries(fd) as { [k: string]: string }

export const end = (name: string) => {
  const index = name.lastIndexOf(".")

  if (index <= 0 || index === name.length - 1) return ""
  return name.slice(index + 1).toLowerCase()
}
