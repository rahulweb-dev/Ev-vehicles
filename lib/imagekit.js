import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export default imagekit;

export async function uploadToImageKit(fileBuffer, fileName, folder = "/ev-news") {
  const base64 = fileBuffer.toString("base64");
  const result = await imagekit.upload({
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
