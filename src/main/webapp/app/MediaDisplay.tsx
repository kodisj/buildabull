import { getTypeFromMimeType } from './shared/lib/metadata';
import React from 'react';

type MediaDisplayProps = {
  mimeType: string;
  mediaSrc: string | undefined;
};

export function MediaDisplay(props: MediaDisplayProps) {
  const type = getTypeFromMimeType(props.mimeType);

  let media = <div></div>;
  switch (type) {
    case 'audio':
      media = (
        <audio id="uploaded-media" controls>
          <source src={props.mediaSrc} type={props.mimeType} />
        </audio>
      );
      break;
    case 'video':
      media = (
        <video id="uploaded-media" controls>
          <source src={props.mediaSrc} type={props.mimeType} />
        </video>
      );
      break;
    default:
      media = <img id="uploaded-media" alt="NFT" src={props.mediaSrc} />;
  }

  return <div className="media-display content">{media}</div>;
}
