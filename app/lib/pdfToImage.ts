export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  
  try {
    const lib = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.mjs");
    
    // Create a Blob containing the worker code
    const blob = new Blob([worker.default], { type: 'text/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    // Set the worker source to the blob URL
    lib.GlobalWorkerOptions.workerSrc = workerUrl;
    
    pdfjsLib = lib;
    isLoading = false;
    loadPromise = Promise.resolve(lib);
    return lib;
  } catch (error) {
    console.error("Failed to load PDF.js:", error);
    throw error;
  }

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    try {
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (renderError) {
      console.error("PDF render error:", renderError);
      throw new Error(`Failed to render PDF: ${renderError}`);
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
