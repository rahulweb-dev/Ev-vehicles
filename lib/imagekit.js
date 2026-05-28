import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export default imagekit;

export async function uploadToImageKit(fileBuffer, fileName, folder = "/ev-news") {
  const result = await imagekit.upload({
    file: fileBuffer,
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
