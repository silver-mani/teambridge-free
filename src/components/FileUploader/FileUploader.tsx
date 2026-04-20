/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · FileUploader
   Variants: 'area' (standalone drop zone) | 'inline' (input-row style)
   States:   'empty' | 'uploading' | 'complete' | 'error'

   Single-file mode (default):
     Fully controlled — the consumer drives state, progress, and file info.
     onFileSelect fires when the user picks or drops a file.
     onClear fires when the user clicks the remove button.

   Multi-file mode (multiple=true, area variant only):
     The drop zone stays visible so more files can be added at any time.
     files[] holds the accumulated list; onFilesSelect fires with every newly
     picked batch; onRemoveFile(index) removes a single entry.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useCallback, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '../Button/Button';
import { Tag } from '../Tag/Tag';
import { CloudUploadIcon } from '../icons/CloudUploadIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { AlertCircleIcon } from '../icons/AlertCircleIcon';
import { File04Icon } from '../icons/File04Icon';
import { Trash03Icon } from '../icons/Trash03Icon';
import styles from './FileUploader.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FileUploaderVariant = 'area' | 'inline';
export type FileUploaderState = 'empty' | 'uploading' | 'complete' | 'error';
export type FileUploaderFieldVariant = 'outlined' | 'underlined';

export interface FileInfo {
  /** Display name (e.g. "report.pdf") */
  name: string;
  /** MIME type (e.g. "application/pdf") — used to derive the badge label. */
  type?: string;
  /** File size in bytes — unused visually, carried for consumer convenience. */
  size?: number;
}

export interface FileUploaderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** Visual variant. @default 'area' */
  variant?: FileUploaderVariant;
  /**
   * Allow selecting multiple files at once (area variant only).
   * When true, use `files` / `onFilesSelect` / `onRemoveFile` instead of
   * the single-file props.
   * @default false
   */
  multiple?: boolean;
  /** Current upload state. @default 'empty' */
  state?: FileUploaderState;
  /** Upload progress 0–100, shown while state='uploading'. @default 0 */
  progress?: number;
  /** File to display in uploading / complete states (single-file mode). */
  file?: FileInfo | null;
  /**
   * Accumulated file list displayed below the drop zone (multi-file mode).
   * The consumer is responsible for managing this array.
   */
  files?: FileInfo[];
  /** Error message shown in error state. */
  errorMessage?: string;
  /** Drop zone title. @default 'Choose a file or drag & drop it here.' */
  title?: string;
  /** Drop zone description. @default 'JPEG, PNG, PDF, and MP4 formats, up to 50 MB.' */
  description?: string;
  /** Native <input accept> string (e.g. ".pdf,image/*"). */
  accept?: string;
  /** Called when the user picks or drops a file (single-file mode). */
  onFileSelect?: (file: File) => void;
  /**
   * Called with every newly picked / dropped batch (multi-file mode).
   * Receives only the new files — the consumer appends them to `files`.
   */
  onFilesSelect?: (files: File[]) => void;
  /** Called when the user clicks the remove button (single-file mode). */
  onClear?: () => void;
  /**
   * Called with the list index when a file row's remove button is clicked
   * (multi-file mode).
   */
  onRemoveFile?: (index: number) => void;
  /**
   * Field style for the inline variant.
   * 'outlined' — full border box (default).
   * 'underlined' — bottom border only, transparent background.
   * @default 'outlined'
   */
  fieldVariant?: FileUploaderFieldVariant;
  /** Disables all interaction. */
  disabled?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFileExt(file: FileInfo): string {
  const dot = file.name.lastIndexOf('.');
  if (dot !== -1) return file.name.slice(dot + 1).toUpperCase();
  if (file.type) return (file.type.split('/').pop() ?? 'FILE').toUpperCase();
  return 'FILE';
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      variant = 'area',
      multiple = false,
      state = 'empty',
      progress = 0,
      file,
      files,
      errorMessage,
      title = 'Choose a file or drag & drop it here.',
      description = 'JPEG, PNG, PDF, and MP4 formats, up to 50 MB.',
      accept,
      onFileSelect,
      onFilesSelect,
      onClear,
      onRemoveFile,
      fieldVariant = 'outlined',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // In multi-file mode the drop zone is always interactive.
    const isAreaInteractive = !disabled && (multiple || state === 'empty');

    const openPicker = useCallback(() => {
      if (!disabled && (multiple || state === 'empty')) inputRef.current?.click();
    }, [disabled, multiple, state]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (multiple) {
          const picked = e.target.files ? Array.from(e.target.files) : [];
          if (picked.length) onFilesSelect?.(picked);
        } else {
          const picked = e.target.files?.[0];
          if (picked) onFileSelect?.(picked);
        }
        e.target.value = ''; // allow re-selecting the same file(s)
      },
      [multiple, onFileSelect, onFilesSelect],
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        if (isAreaInteractive) setIsDragOver(true);
      },
      [isAreaInteractive],
    );

    const handleDragLeave = useCallback(() => setIsDragOver(false), []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!isAreaInteractive) return;
        if (multiple) {
          const dropped = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
          if (dropped.length) onFilesSelect?.(dropped);
        } else {
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onFileSelect?.(dropped);
        }
      },
      [isAreaInteractive, multiple, onFileSelect, onFilesSelect],
    );

    /* ── Hidden input (shared by both variants) ───────────────────────────── */
    const hiddenInput = (
      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
    );

    /* ── File row: file icon + name + type badge + status + remove ─────────── */
    const fileRow = file ? (
      <div className={styles.fileRow}>
        <span className={`${styles.fileIcon} alloy-icon-slot`} aria-hidden="true">
          <File04Icon size={16} />
        </span>
        <span className={styles.fileName}>{file.name}</span>
        <Tag size="sm" variant="subtle">{getFileExt(file)}</Tag>
        {state === 'complete' && (
          <span className={`${styles.successIcon} alloy-icon-slot`} aria-hidden="true">
            <CheckCircleIcon size={16} />
          </span>
        )}
        <button
          type="button"
          className={styles.removeBtn}
          onClick={onClear}
          aria-label="Remove file"
        >
          <span className="alloy-icon-slot" style={{ width: 14, height: 14 }} aria-hidden="true">
            <Trash03Icon size={14} />
          </span>
        </button>
      </div>
    ) : null;

    /* ════════════════════════════════════════════════════════════════════════
       Area variant
       ════════════════════════════════════════════════════════════════════════ */
    if (variant === 'area') {
      /* ── Multi-file mode ────────────────────────────────────────────────── */
      if (multiple) {
        const fileList = files ?? [];
        return (
          <div
            ref={ref}
            className={clsx(styles.areaMulti, className)}
            data-drag-over={isDragOver || undefined}
            data-disabled={disabled || undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            {...props}
          >
            {hiddenInput}

            {/* Drop zone — always visible so more files can be added */}
            <div className={styles.multiDropZone}>
              <span className={`${styles.uploadIcon} alloy-icon-slot`} aria-hidden="true">
                <CloudUploadIcon size={24} />
              </span>
              <div className={styles.textBlock}>
                <p className={styles.title}>{title}</p>
                <p className={styles.description}>{description}</p>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={openPicker}
                disabled={disabled}
              >
                Browse Files
              </Button>
            </div>

            {/* File list — rendered once at least one file has been added */}
            {fileList.length > 0 && (
              <ul className={styles.fileList} aria-label="Selected files">
                {fileList.map((f, i) => (
                  <li key={`${f.name}-${i}`} className={styles.fileListItem}>
                    <span className={`${styles.fileIcon} alloy-icon-slot`} aria-hidden="true">
                      <File04Icon size={16} />
                    </span>
                    <span className={styles.fileName}>{f.name}</span>
                    <Tag size="sm" variant="subtle">{getFileExt(f)}</Tag>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemoveFile?.(i)}
                      aria-label={`Remove ${f.name}`}
                      disabled={disabled}
                    >
                      <span className="alloy-icon-slot" style={{ width: 14, height: 14 }} aria-hidden="true">
                        <Trash03Icon size={14} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      /* ── Single-file mode ───────────────────────────────────────────────── */
      return (
        <div
          ref={ref}
          className={clsx(styles.area, className)}
          data-state={state}
          data-drag-over={isDragOver || undefined}
          data-disabled={disabled || undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          {...props}
        >
          {hiddenInput}

          {/* ── Empty ─────────────────────────────────────────────────────── */}
          {state === 'empty' && (
            <>
              <span className={`${styles.uploadIcon} alloy-icon-slot`} aria-hidden="true">
                <CloudUploadIcon size={24} />
              </span>
              <div className={styles.textBlock}>
                <p className={styles.title}>{title}</p>
                <p className={styles.description}>{description}</p>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={openPicker}
                disabled={disabled}
              >
                Browse File
              </Button>
            </>
          )}

          {/* ── Uploading ─────────────────────────────────────────────────── */}
          {state === 'uploading' && (
            <>
              {fileRow}
              <div className={styles.progressWrap}>
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                >
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
                <p className={styles.progressLabel}>{progress}% uploaded</p>
              </div>
            </>
          )}

          {/* ── Complete ──────────────────────────────────────────────────── */}
          {state === 'complete' && fileRow}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {state === 'error' && (
            <>
              <div className={styles.errorRow}>
                <span className={`${styles.errorIcon} alloy-icon-slot`} aria-hidden="true">
                  <AlertCircleIcon size={20} />
                </span>
                <p className={styles.errorText}>
                  {errorMessage ?? 'Upload failed. Please try again.'}
                </p>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={openPicker}
                disabled={disabled}
              >
                Try Again
              </Button>
            </>
          )}
        </div>
      );
    }

    /* ════════════════════════════════════════════════════════════════════════
       Inline variant — compact input-row
       ════════════════════════════════════════════════════════════════════════ */
    const inlineIcon = {
      empty:     <CloudUploadIcon size={16} />,
      uploading: <File04Icon size={16} />,
      complete:  <CheckCircleIcon size={16} />,
      error:     <AlertCircleIcon size={16} />,
    }[state];

    const hasFile = (state === 'uploading' || state === 'complete') && !!file;

    return (
      <div
        ref={ref}
        className={clsx(styles.inline, className)}
        data-state={state}
        data-field-variant={fieldVariant}
        data-disabled={disabled || undefined}
        {...props}
      >
        {hiddenInput}

        <span className={`${styles.inlineIcon} alloy-icon-slot`} aria-hidden="true">
          {inlineIcon}
        </span>

        <span
          className={styles.inlineText}
          data-has-file={hasFile ? '' : undefined}
        >
          {state === 'empty'   && title}
          {state === 'uploading' && file?.name}
          {state === 'complete'  && file?.name}
          {state === 'error'     && (errorMessage ?? 'Upload failed. Please try again.')}
        </span>

        {/* File type tag — uploading + complete */}
        {hasFile && (
          <Tag size="sm" variant="subtle">{getFileExt(file!)}</Tag>
        )}

        {/* Remove / cancel button for uploading + complete + error */}
        {(state === 'uploading' || state === 'complete' || state === 'error') && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onClear}
            aria-label="Remove file"
          >
            <span className="alloy-icon-slot" style={{ width: 14, height: 14 }} aria-hidden="true">
              <Trash03Icon size={14} />
            </span>
          </button>
        )}

        {/* Browse button for empty */}
        {state === 'empty' && (
          <Button
            variant="tertiary"
            size="xs"
            onClick={openPicker}
            disabled={disabled}
          >
            Browse
          </Button>
        )}

        {/* Progress bar strip at bottom */}
        {state === 'uploading' && (
          <div
            className={styles.inlineProgress}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
          >
            <div
              className={styles.inlineProgressFill}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    );
  },
);

FileUploader.displayName = 'FileUploader';
