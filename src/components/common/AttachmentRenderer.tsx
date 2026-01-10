import { Download } from "lucide-react";
import { formatFileSize, getFileType } from "../../utils/helpers";
import { memo } from "react";

interface Attachment {
  url: string;
  mimeType: string;
  originalName?: string;
  size?: number;
}

interface AttachmentRendererProps {
  attachment: Attachment;
}

export const AttachmentRenderer = memo(({ attachment }: AttachmentRendererProps) => {
  const fileType = getFileType(attachment.mimeType);

  if (fileType === 'image') {
    return (
      <img
        src={attachment.url}
        alt={attachment.originalName || 'Image'}
        loading="lazy"
        className="max-w-full max-h-80 rounded-lg cursor-pointer hover:opacity-90"
        onClick={() => window.open(attachment.url, '_blank')}
      />
    );
  }

  if (fileType === 'video') {
    return (
      <video
        src={attachment.url}
        controls
        className="max-w-full max-h-80 rounded-lg"
      />
    );
  }

  if (fileType === 'audio') {
    return <audio src={attachment.url} controls className="w-full" />;
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-background/50 rounded-lg hover:bg-background/70"
    >
      <Download className="h-4 w-4" />
      <span className="text-sm truncate">{attachment.originalName || 'File'}</span>
      {attachment.size && (
        <span className="text-xs text-muted-foreground">
          ({formatFileSize(attachment.size)})
        </span>
      )}
    </a>
  );
});

AttachmentRenderer.displayName = 'AttachmentRenderer';
