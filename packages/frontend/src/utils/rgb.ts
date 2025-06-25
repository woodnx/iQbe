export function hexToRgb(hex: string) {
  // カラーコードから `#` を取り除く
  hex = hex.replace("#", "");

  // 各ペアを16進数から10進数に変換
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

const toRgbItem = (item: number) => {
  const i = item / 255;
  return i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
};

export function chooseTextColor(red: number, green: number, blue: number) {
  // sRGB を RGB に変換し、背景色の相対輝度を求める

  const R = toRgbItem(red);
  const G = toRgbItem(green);
  const B = toRgbItem(blue);
  const Lbg = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  // 白と黒の相対輝度。定義からそれぞれ 1 と 0 になる。
  const Lw = 1;
  const Lb = 0;

  // 白と背景色のコントラスト比、黒と背景色のコントラスト比を
  // それぞれ求める。
  const Cw = (Lw + 0.05) / (Lbg + 0.05);
  const Cb = (Lbg + 0.05) / (Lb + 0.05);

  // コントラスト比が大きい方を文字色として返す。
  return Cw < Cb ? "#000000" : "#ffffff";
}
