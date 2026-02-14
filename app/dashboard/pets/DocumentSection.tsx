"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { Document, DocumentType } from "@/lib/types/document";

import { deleteDocument, uploadDocument, type UploadDocumentResult } from "../documents/actions";

const TYPE_LABELS: Record<DocumentType, string> = {
  vet: "Vet / health",
  vaccine: "Vaccine",
  insurance: "Insurance",
  other: "Other",
};

type Props = {
  petId: string;
  documents: Document[];
};

export function DocumentSection({ petId, documents }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocumentType>("vet");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("file", file);
    const result: UploadDocumentResult = await uploadDocument(petId, formData);
    setUploading(false);

    if (result.ok) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
      return;
    }

    setError(result.error);
  }

  async function handleDelete(docId: string) {
    if (!confirm("Remove this document?")) return;

    setDeletingId(docId);
    const result = await deleteDocument(docId);
    if (result.ok) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setDeletingId(null);
  }

  return (
    <section className="brand-card p-5 md:p-6">
      <h3 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">Documents</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Store vet records, vaccine certificates, and insurance files.</p>

      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-soft)]">No documents yet. Upload your first file below.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/\.(jpe?g|png|webp|gif)$/i.test(doc.file_path) && (
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-[#e6ece3]">
                    <Image
                      src={`/api/documents/${doc.id}/download`}
                      alt={TYPE_LABELS[doc.type]}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[var(--ink)]">{TYPE_LABELS[doc.type]}</span>
                  <span className="ml-2 text-xs text-[var(--ink-soft)]">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--brand-strong)] hover:underline"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {deletingId === doc.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="mt-5 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <div>
          <label htmlFor="doc-type" className="block text-sm font-semibold text-[var(--ink)]">
            Type
          </label>
          <select
            id="doc-type"
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType)}
            className="brand-input mt-1"
          >
            {(Object.entries(TYPE_LABELS) as [DocumentType, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="doc-file" className="block text-sm font-semibold text-[var(--ink)]">
            File
          </label>
          <input
            ref={fileInputRef}
            id="doc-file"
            type="file"
            name="file"
            accept=".pdf,image/jpeg,image/png,image/webp,image/gif"
            className="brand-input mt-1"
          />
          <p className="mt-1 text-xs text-[var(--ink-soft)]">PDF or image, max 5 MB.</p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="brand-button brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload document"}
        </button>
      </form>
    </section>
  );
}
