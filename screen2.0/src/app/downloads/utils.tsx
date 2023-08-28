//Imported from old SCREEN
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")
  downloadLink.href = url
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

//Imported from old SCREEN
//Move to utils
export function downloadTSV(text, filename) {
  downloadBlob(new Blob([text], { type: "text/plain" }), filename)
}
