import { Area } from "react-easy-crop";

/**
 * urlをもとにimage要素を作成
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // CodeSandboxでCORSエラーを回避するために必要
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * 画像トリミングを行い新たな画像urlを作成
 */
export default async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // canvasサイズを設定
  canvas.width = image.width;
  canvas.height = image.height;

  // canvas上に画像を描画
  ctx.drawImage(image, 0, 0);

  // トリミング後の画像を抽出
  const data = ctx.getImageData(
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  // canvasのサイズ指定(切り取り後の画像サイズに更新)
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // 抽出した画像データをcanvasの左隅に貼り付け
  ctx.putImageData(data, 0, 0);

  // canvasを画像に変換
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file !== null) resolve(file);
    }, "image/png");
  });
}
