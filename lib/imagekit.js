import ImageKit from "imagekit";

// Created on first use — the SDK throws at construction when keys are missing,
// which would otherwise crash every route that merely imports this file.
let client;
function getImageKit() {
  if (!client) {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error("ImageKit not configured: set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT");
    }
    client = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return client;
}

export default getImageKit;

export async function uploadToImageKit(fileBuffer, fileName, folder = "/ev-news") {
  const base64 = fileBuffer.toString("base64");
  const result = await getImageKit().upload({
    file: base64,
    fileName: fileName,
    folder: folder,
    useUniqueFileName: true,
    tags: ["ev-news-india"],
  });
  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl,
    width: result.width,
    height: result.height,
  };
}
