import { fromPath } from "pdf2pic";
import { pipeline } from "stream/promises";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { convert } from "libreoffice-convert";
import { WriteImageResponse } from "pdf2pic/dist/types/convertResponse";
import { remove, readFile, createWriteStream, writeFile } from "fs-extra";
import { exec } from "child_process";
const execAsync = promisify(exec);

import s3 from "@/.server/s3.server";

const convertAsync = promisify(convert);

// Save file to local tmp directory
export const downloadFile = async ({
  filePath,
  tempDir,
}: {
  filePath: string;
  tempDir: string;
}): Promise<{ extension: string; localPath: string }> => {
  const fileNameExt = path.extname(filePath.split("?")[0]);
  const localPath = path.join(tempDir, uuidv4() + fileNameExt);

  const writer = createWriteStream(localPath);

  const fileReadableStream = await s3.docStoring.getStream(filePath);

  await pipeline(fileReadableStream, writer);
  console.log("piped");

  let extension = "pdf";

  if (!extension.startsWith(".")) {
    extension = `.${extension}`;
  }

  return { extension, localPath };
};

// Convert each page (from other formats like docx) to a png and save that image to tmp
export const convertFileToPdf = async ({
  extension,
  localPath,
  tempDir,
}: {
  extension: string;
  localPath: string;
  tempDir: string;
}): Promise<string> => {
  const inputBuffer = await readFile(localPath);
  const outputFilename = path.basename(localPath, extension) + ".pdf";
  const outputPath = path.join(tempDir, outputFilename);

  try {
    const pdfBuffer = await convertAsync(inputBuffer, ".pdf", undefined);
    await writeFile(outputPath, pdfBuffer);
    return outputPath;
  } catch (err) {
    console.error(`Error converting ${extension} to .pdf:`, err);
    throw err;
  }
};

// Convert each page to a png and save that image to tempDir
export const convertPdfToImages_dep = async ({
  imageDensity = 300,
  imageHeight = 2048,
  pdfPath,
  pagesToConvertAsImages,
  tempDir,
}: {
  imageDensity: number;
  imageHeight: number;
  pdfPath: string;
  pagesToConvertAsImages: number | number[];
  tempDir: string;
}): Promise<string[]> => {
  const options = {
    density: imageDensity,
    format: "png",
    height: imageHeight,
    preserveAspectRatio: true,
    saveFilename: path.basename(pdfPath, path.extname(pdfPath)),
    savePath: tempDir,
  };
  const storeAsImage = fromPath(pdfPath, options);

  try {
    const convertResults: WriteImageResponse[] = await storeAsImage.bulk(
      pagesToConvertAsImages,
    );

    // validate that all pages were converted
    const imagePaths: string[] = [];
    convertResults.forEach((result) => {
      if (!result.page || !result.path) {
        throw new Error("Could not identify page data");
      }
      imagePaths.push(result.path);
    });

    return imagePaths;
  } catch (err) {
    console.error("Error during PDF conversion:", err);
    throw err;
  }
};

export async function* bufferToAsyncIterable(
  buffer: Buffer,
): AsyncIterable<Uint8Array> {
  yield new Uint8Array(buffer);
}

export async function downloadFromS3(
  fileUrl: string,
  tempDir: string,
): Promise<string> {
  const fileName = path.basename(fileUrl);
  const localPath = path.join(tempDir, fileName);

  const pdfStream = await s3.docStoring.getStream(fileUrl);
  const writeStream = createWriteStream(localPath);

  await new Promise((resolve, reject) => {
    pdfStream.pipe(writeStream).on("finish", resolve).on("error", reject);
  });

  return localPath;
}

export async function convertPdfToImages(
  pdfPath: string,
  tempDir: string,
  GS_PATH: string,
): Promise<File[]> {
  const images: File[] = [];

  try {
    // Get the number of pages in the PDF

    const { stdout: pageCountStr } = await execAsync(
      `${GS_PATH} -q -dNODISPLAY -c "(${pdfPath}) (r) file runpdfbegin pdfpagecount = quit"`,
    );
    const pageCount = parseInt(pageCountStr.trim(), 10);

    // Convert each page to an image
    for (let page = 1; page <= pageCount; page++) {
      const outputPath = path.join(tempDir, `page-${page}.jpeg`);
      // console.log("outputPath", outputPath);
      await execAsync(
        `${GS_PATH} -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=jpeg ` +
          `-dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r300 ` +
          `-dFirstPage=${page} -dLastPage=${page} ` +
          `-sOutputFile=${outputPath} ${pdfPath}`,
      );

      const imageBuffer = await readFile(outputPath);
      // console.log("imageBuffer", imageBuffer);
      const file = new File([imageBuffer], `page-${page}.jpeg`, {
        type: "image/jpeg",
      });
      images.push(file);
      // console.log("file", file);
      // Clean up the temporary image file
      await remove(outputPath);
    }

    return images;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error;
  }
}
