export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Downloads .svg from given SVG ref
 * 
 * @param ref ref passed to parent svg container
 * @param filename prefix (.svg added)
 * 
 * @info Taken straight from ChatGPT, use with caution
 * 
 */
export const downloadSVG = (ref: React.MutableRefObject<SVGSVGElement>, filename: string) => {
  if (!ref.current) {
    console.error('SVG reference is not set.');
    return;
  }
  
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(ref.current);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads .png from given SVG ref
 * 
 * @param ref ref passed to parent svg container
 * @param filename prefix (.png added)
 * 
 * @info Mostly taken straight from ChatGPT, use with caution
 * 
 */
export const downloadSvgAsPng = (ref: React.MutableRefObject<SVGSVGElement>, filename: string) => {
  const svg = ref.current;

  if (!svg) {
    console.error('SVG reference is not set.');
    return;
  }

  // Get the parent element and cast it to HTMLElement
  const parent = svg.parentNode as HTMLElement;

  if (!parent) {
    console.error('SVG does not have a parent node.');
    return;
  }

  const originalDisplay = parent.style.display;

  // Temporarily show the parent
  // This is needed in cases that the svg is not actually on the page and thus can't be measured
  parent.style.display = 'block';

  // Serialize SVG and create an image
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const svgWidth = svg.viewBox.baseVal?.width || svg.clientWidth;
  const svgHeight = svg.viewBox.baseVal?.height || svg.clientHeight;

  canvas.width = svgWidth;
  canvas.height = svgHeight;

  image.onload = () => {
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);

    const pngData = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngData;
    downloadLink.download = `${filename}.png`;
    document.body.appendChild(downloadLink); 
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Revert display property after download
    parent.style.display = originalDisplay;
  };

  image.src = url;
};

/**
 * 
 * @param exportObj 
 * @param filename prefix (.json added)
 * 
 * @info Taken straight from ChatGPT, use with caution
 */
export const downloadObjectAsJson = (exportObj: {[key: string]: any}, filename: string) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${filename}.json`);
  document.body.appendChild(downloadAnchorNode); // Required for Firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

/**
 * 
 * @param exportArr 
 * @param filename prefix (.tsv added)
 * @info IMPORTANT - removes single apostrophes to be compatible with R's `read.table` default `quote="\"'"`
 * @info Taken straight from ChatGPT, use with caution
 */
export const downloadObjArrayAsTSV = (exportArr: {[key: string]: string | number}[], filename: string) => {
  //extract headers
  const headers = Object.keys(exportArr[0]);

  // Map each object to a TSV row by joining values with tabs
  const tsvContent = [
    headers.join("\t"), // Header row
    ...exportArr.map(
      (obj) => headers.map((header) => obj[header] || "").join("\t") // Data rows
    ),
  ]
    .join("\n")// Join rows with newlines
    .replaceAll("'", ""); //remove all single quotes

  // Create a downloadable TSV file
  const dataStr =
    "data:text/tab-separated-values;charset=utf-8," +
    encodeURIComponent(tsvContent);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${filename}.tsv`);
  document.body.appendChild(downloadAnchorNode); // Required for Firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}