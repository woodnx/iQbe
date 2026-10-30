import { Button, Center, Slider } from "@mantine/core";
import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";

import classes from "./styles/ImageCropper.module.css";

const defaultArea: Area = {
  width: 100,
  height: 100,
  x: 0,
  y: 0,
};

export interface ImageCropperProps {
  image?: string;
  onSave?: (croppedAreaPixels: Area) => void;
}

export default function ImageCropper({
  image,
  onSave = () => {},
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const completeCrop = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <>
      <div className={classes.cropContainer}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          objectFit="cover"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={completeCrop}
          onZoomChange={setZoom}
        />
      </div>

      <div className={classes.controls}>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          label={null}
          onChange={setZoom}
        />
        <Center>
          <Button
            mt="xl"
            size="md"
            radius="xl"
            onClick={() => onSave(croppedAreaPixels || defaultArea)}
          >
            保存する
          </Button>
        </Center>
      </div>
    </>
  );
}
