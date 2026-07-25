import { describe, it, expect, vi, beforeAll } from "vitest"
import { renderHook, act } from "@testing-library/react"
import useImageUpload from "./useImageUpload"

// jsdom doesn't implement object URLs.
beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock") as unknown as typeof URL.createObjectURL
  globalThis.URL.revokeObjectURL = vi.fn()
})

/** Build a File with a controlled `size` without allocating huge buffers. */
function makeFile(name: string, type: string, size = 1024): File {
  const file = new File(["x"], name, { type })
  Object.defineProperty(file, "size", { value: size, configurable: true })
  return file
}

function fireChange(files: File[]) {
  return {
    target: { files },
  } as unknown as React.ChangeEvent<HTMLInputElement>
}

describe("useImageUpload", () => {
  it("accepts a valid PNG under 10MB", () => {
    const { result } = renderHook(() => useImageUpload())
    act(() => result.current.handleFileChange(fireChange([makeFile("ok.png", "image/png")])))
    expect(result.current.file?.name).toBe("ok.png")
    expect(result.current.error).toBeNull()
    expect(result.current.preview).toBeTruthy()
  })

  it("rejects an invalid file type", () => {
    const { result } = renderHook(() => useImageUpload())
    act(() => result.current.handleFileChange(fireChange([makeFile("doc.txt", "text/plain")])))
    expect(result.current.file).toBeNull()
    expect(result.current.error).toMatch(/invalid file type/i)
  })

  it("rejects a file over 10MB", () => {
    const { result } = renderHook(() => useImageUpload())
    act(() => result.current.handleFileChange(fireChange([makeFile("big.png", "image/png", 11 * 1024 * 1024)])))
    expect(result.current.file).toBeNull()
    expect(result.current.error).toMatch(/too large/i)
  })

  it("rejects an empty file", () => {
    const { result } = renderHook(() => useImageUpload())
    act(() => result.current.handleFileChange(fireChange([makeFile("empty.png", "image/png", 0)])))
    expect(result.current.file).toBeNull()
    expect(result.current.error).toMatch(/empty/i)
  })
})
