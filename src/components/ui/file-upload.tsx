import * as React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface FileUploadProps {
  className?: string;
  label?: string;
  description?: string;
  onChange?: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  className,
  label = "Verificación de Identidad (KYC)",
  description = "Sube una foto de tu identificación oficial. Se usa solo para validar tu mayoría de edad y se protege bajo nuestras políticas de privacidad y consentimiento.",
  onChange,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
    if (onChange) {
      onChange(file);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border border-dashed border-purple-500/40 bg-black/60 backdrop-blur-xl p-4 sm:p-6 text-left",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600/30 border border-purple-400/40">
          <UploadCloud className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-zinc-300 max-w-md">{description}</p>
          <button
            type="button"
            onClick={handleClick}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-purple-500/60 px-4 py-1.5 text-xs font-medium text-purple-100 hover:bg-purple-600/30 transition-colors"
          >
            Seleccionar archivo seguro
          </button>
          {fileName && (
            <p className="mt-1 text-xs text-zinc-300 truncate">Archivo seleccionado: {fileName}</p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
