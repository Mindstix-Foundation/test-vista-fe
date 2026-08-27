/** Debug helper shared by admin add-form pages. */
export function logContainerDimensions(selector: string, label: string): void {
  const container = document.querySelector(selector)
  console.log(`${label} - Window dimensions:`, {
    width: globalThis.innerWidth,
    height: globalThis.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    bodyHeight: document.body.scrollHeight,
    containerHeight: container?.scrollHeight,
    hasVerticalScroll: document.documentElement.scrollHeight > globalThis.innerHeight,
    overflowY: container
      ? globalThis.getComputedStyle(container).overflowY
      : undefined,
  })
}
