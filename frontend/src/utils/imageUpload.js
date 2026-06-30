export const MAX_PRODUCT_IMAGE_SIZE = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validateProductImage = (file) => {
  if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }
  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return "Image must be 2MB or smaller.";
  }
  return "";
};

const loadImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error("Unable to read this image."));
  };
  image.src = url;
});

export const optimizeProductImage = async (file) => {
  const image = await loadImage(file);
  const maxDimension = 1400;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const outputType = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, 0.82));
  if (!blob || blob.size >= file.size) return file;

  const extension = outputType === "image/png" ? "png" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${extension}`, { type: outputType });
};
