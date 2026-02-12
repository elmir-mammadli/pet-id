"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { Document, DocumentType } from "@/lib/types/document";
import {
  deleteDocument,
  uploadDocument,
  type UploadDocumentResult,
} from "../documents/actions";

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
      router.refresh();
      fileInputRef.current!.value = "";
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">Documents</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Vet records, vaccine certificates, insurance.
      </p>

      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No documents yet. Upload one below.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {documents.map((doc) => (
            // Для простого превью определяем, является ли файл картинкой по расширению.
            <li
              key={doc.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/\.(jpe?g|png|webp|gif)$/i.test(doc.file_path) && (
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-zinc-100">
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
                  <span className="text-sm font-medium text-zinc-800">
                    {TYPE_LABELS[doc.type]}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === doc.id ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="mt-5 flex flex-col gap-3">
        <div>
          <label
            htmlFor="doc-type"
            className="block text-sm font-medium text-zinc-800"
          >
            Type
          </label>
          <select
            id="doc-type"
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {(Object.entries(TYPE_LABELS) as [DocumentType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label
            htmlFor="doc-file"
            className="block text-sm font-medium text-zinc-800"
          >
            File
          </label>
          <input
            ref={fileInputRef}
            id="doc-file"
            type="file"
            name="file"
            accept=".pdf,image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="mt-1 text-xs text-zinc-500">
            PDF or image, max 5 MB.
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload document"}
        </button>
      </form>
    </div>
  );
}
