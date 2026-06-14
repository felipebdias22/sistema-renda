"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Plus,
  Pencil,
  Trash2,
  PlaySquare,
  Tags,
  Globe,
  Bot,
  ListPlus,
  Images,
} from "lucide-react";
import type { Agente, Nicho, Pais, Video } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  saveVideo,
  deleteVideo,
  importVideos,
  importCapas,
  saveNicho,
  deleteNicho,
  savePais,
  deletePais,
  saveAgente,
  deleteAgente,
} from "./actions";

type TabKey = "videos" | "nichos" | "paises" | "agentes";

const TABS: { key: TabKey; label: string; icon: typeof PlaySquare }[] = [
  { key: "videos", label: "Vídeos", icon: PlaySquare },
  { key: "nichos", label: "Nichos", icon: Tags },
  { key: "paises", label: "Países", icon: Globe },
  { key: "agentes", label: "Agentes", icon: Bot },
];

export function AdminPanel({
  videos,
  nichos,
  paises,
  agentes,
}: {
  videos: Video[];
  nichos: Nicho[];
  paises: Pais[];
  agentes: Agente[];
}) {
  const [tab, setTab] = useState<TabKey>("videos");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
              tab === key
                ? "bg-brand text-white shadow-glow"
                : "border border-navy-700 bg-navy-850 text-slate-300 hover:text-foreground"
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "videos" && (
        <VideosAdmin videos={videos} nichos={nichos} paises={paises} />
      )}
      {tab === "nichos" && <NichosAdmin nichos={nichos} />}
      {tab === "paises" && <PaisesAdmin paises={paises} />}
      {tab === "agentes" && <AgentesAdmin agentes={agentes} />}
    </div>
  );
}

/* ---------- reusable bits ---------- */

function DeleteButton({
  onConfirm,
  label,
}: {
  onConfirm: () => Promise<void>;
  label: string;
}) {
  return (
    <button
      onClick={async () => {
        if (confirm(`Excluir ${label}?`)) await onConfirm();
      }}
      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
      aria-label="Excluir"
    >
      <Trash2 size={16} />
    </button>
  );
}

/** Botão de envio que se desabilita enquanto a ação roda (evita duplicar). */
function SubmitButton({
  label = "Salvar",
  pendingLabel = "Salvando...",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="label-muted">{label}</span>
      {children}
    </label>
  );
}

function Toolbar({
  title,
  onAdd,
}: {
  title: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold">{title}</h3>
      <Button size="sm" onClick={onAdd}>
        <Plus size={15} /> Novo
      </Button>
    </div>
  );
}

/* ---------- VÍDEOS ---------- */

function VideosAdmin({
  videos,
  nichos,
  paises,
}: {
  videos: Video[];
  nichos: Nicho[];
  paises: Pais[];
}) {
  const [editing, setEditing] = useState<Video | null>(null);
  const [open, setOpen] = useState(false);
  const [capaPreview, setCapaPreview] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [impNicho, setImpNicho] = useState("");
  const [impPais, setImpPais] = useState("");
  const [capasOpen, setCapasOpen] = useState(false);
  const [capasNicho, setCapasNicho] = useState("");

  function add() {
    setEditing(null);
    setCapaPreview(null);
    setOpen(true);
  }
  function edit(v: Video) {
    setEditing(v);
    setCapaPreview(v.capa_url ?? null);
    setOpen(true);
  }
  function onCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setCapaPreview(f ? URL.createObjectURL(f) : editing?.capa_url ?? null);
  }

  const tituloBase = nichos.find((n) => n.id === impNicho)?.nome ?? "Vídeo viral";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Vídeos</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCapasOpen(true)}
          >
            <Images size={15} /> Capas em massa
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
            <ListPlus size={15} /> Importar em massa
          </Button>
          <Button size="sm" onClick={add}>
            <Plus size={15} /> Novo
          </Button>
        </div>
      </div>
      <div className="card divide-y divide-navy-700">
        {videos.length === 0 && (
          <p className="p-5 text-sm text-slate-400">Nenhum vídeo cadastrado.</p>
        )}
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{v.titulo}</p>
              <p className="truncate text-xs text-slate-400">
                {v.nicho?.nome ?? "—"} · {v.pais?.nome ?? "—"} ·{" "}
                <span className="text-slate-500">{v.vimeo_url}</span>
              </p>
            </div>
            {!v.ativo && (
              <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                Inativo
              </span>
            )}
            <button
              onClick={() => edit(v)}
              className="rounded-lg p-2 text-slate-400 hover:bg-navy-700 hover:text-foreground"
            >
              <Pencil size={16} />
            </button>
            <DeleteButton
              label={v.titulo}
              onConfirm={() => deleteVideo(v.id)}
            />
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar vídeo" : "Novo vídeo"}
        className="max-w-lg"
      >
        <form
          action={async (fd) => {
            await saveVideo(fd);
            setOpen(false);
          }}
          className="space-y-4 p-5"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Título">
            <input
              name="titulo"
              required
              defaultValue={editing?.titulo}
              className="input-field"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              name="descricao"
              rows={2}
              defaultValue={editing?.descricao ?? ""}
              className="input-field resize-none"
            />
          </Field>
          <Field label="Link do vídeo (Vimeo, Facebook, YouTube...)">
            <input
              name="vimeo_url"
              required
              defaultValue={editing?.vimeo_url}
              placeholder="https://www.facebook.com/reel/... ou https://vimeo.com/..."
              className="input-field"
            />
          </Field>

          <Field label="Capa do vídeo (print) — recomendado">
            <div className="space-y-2">
              {capaPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capaPreview}
                  alt="prévia da capa"
                  className="aspect-video w-full rounded-lg border border-navy-700 object-cover"
                />
              )}
              <input
                type="file"
                name="capa"
                accept="image/*"
                onChange={onCapaChange}
                className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-600"
              />
              <p className="text-xs text-slate-500">
                Suba um print do vídeo (ideal 16:9). Ou cole uma URL de imagem:
              </p>
              <input
                name="capa_url"
                placeholder="https://...imagem.jpg (opcional)"
                className="input-field"
              />
            </div>
          </Field>
          <input
            type="hidden"
            name="capa_atual"
            value={editing?.capa_url ?? ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nicho">
              <select
                name="nicho_id"
                defaultValue={editing?.nicho_id ?? ""}
                className="input-field"
              >
                <option value="">—</option>
                {nichos.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="País">
              <select
                name="pais_id"
                defaultValue={editing?.pais_id ?? ""}
                className="input-field"
              >
                <option value="">—</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={editing ? editing.ativo : true}
              className="h-4 w-4 accent-brand"
            />
            Ativo
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>

      {/* Importação em massa */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar vídeos em massa"
        className="max-w-lg"
      >
        <form
          action={async (fd) => {
            await importVideos(fd);
            setImportOpen(false);
            setImpNicho("");
            setImpPais("");
          }}
          className="space-y-4 p-5"
        >
          <Field label="Cole os links (um por linha)">
            <textarea
              name="links"
              required
              rows={8}
              placeholder={
                "https://www.facebook.com/reel/123...\nhttps://www.facebook.com/share/r/abc...\n\n(opcional: Título personalizado | https://link)"
              }
              className="input-field resize-none font-mono text-xs"
            />
          </Field>
          <p className="-mt-2 text-xs text-slate-500">
            Cada linha vira um vídeo. O nicho/país escolhidos abaixo valem para
            todos. Os títulos são gerados automaticamente (você pode editar
            depois).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nicho (todos)">
              <select
                name="nicho_id"
                value={impNicho}
                onChange={(e) => setImpNicho(e.target.value)}
                className="input-field"
              >
                <option value="">—</option>
                {nichos.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="País (todos)">
              <select
                name="pais_id"
                value={impPais}
                onChange={(e) => setImpPais(e.target.value)}
                className="input-field"
              >
                <option value="">—</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <input type="hidden" name="titulo_base" value={tituloBase} />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked
              className="h-4 w-4 accent-brand"
            />
            Ativos
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setImportOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton label="Importar" pendingLabel="Importando..." />
          </div>
        </form>
      </Modal>

      {/* Capas em massa */}
      <Modal
        open={capasOpen}
        onClose={() => setCapasOpen(false)}
        title="Capas em massa"
        className="max-w-lg"
      >
        <form
          action={async (fd) => {
            await importCapas(fd);
            setCapasOpen(false);
            setCapasNicho("");
          }}
          className="space-y-4 p-5"
        >
          <div className="rounded-xl border border-navy-700 bg-navy-900/50 p-3 text-xs leading-relaxed text-slate-400">
            <p className="font-semibold text-slate-300">Como usar:</p>
            <p className="mt-1">
              1. Tire o print de cada vídeo e <b>nomeie com o número</b> do
              vídeo: <code>1.jpg</code>, <code>2.jpg</code>, <code>3.jpg</code>...
              <br />
              2. Escolha o nicho abaixo e selecione <b>todos os prints de uma
              vez</b>.
              <br />
              3. O sistema casa cada print com o vídeo correspondente
              (<code>Nicho #1</code>, <code>#2</code>...).
            </p>
          </div>
          <Field label="Nicho">
            <select
              name="nicho_id"
              required
              value={capasNicho}
              onChange={(e) => setCapasNicho(e.target.value)}
              className="input-field"
            >
              <option value="">Selecione o nicho...</option>
              {nichos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Selecione os prints (vários de uma vez)">
            <input
              type="file"
              name="capas"
              accept="image/*"
              multiple
              required
              className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-600"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCapasOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton label="Enviar capas" pendingLabel="Enviando..." />
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- NICHOS ---------- */

function NichosAdmin({ nichos }: { nichos: Nicho[] }) {
  const [editing, setEditing] = useState<Nicho | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Toolbar
        title="Nichos"
        onAdd={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <div className="card divide-y divide-navy-700">
        {nichos.length === 0 && (
          <p className="p-5 text-sm text-slate-400">Nenhum nicho.</p>
        )}
        {nichos.map((n) => (
          <div key={n.id} className="flex items-center gap-3 p-4">
            <p className="flex-1 font-semibold">{n.nome}</p>
            <button
              onClick={() => {
                setEditing(n);
                setOpen(true);
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-navy-700 hover:text-foreground"
            >
              <Pencil size={16} />
            </button>
            <DeleteButton label={n.nome} onConfirm={() => deleteNicho(n.id)} />
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar nicho" : "Novo nicho"}
        className="max-w-md"
      >
        <form
          action={async (fd) => {
            await saveNicho(fd);
            setOpen(false);
          }}
          className="space-y-4 p-5"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Nome">
            <input
              name="nome"
              required
              defaultValue={editing?.nome}
              className="input-field"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- PAÍSES ---------- */

function PaisesAdmin({ paises }: { paises: Pais[] }) {
  const [editing, setEditing] = useState<Pais | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Toolbar
        title="Países"
        onAdd={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <div className="card divide-y divide-navy-700">
        {paises.length === 0 && (
          <p className="p-5 text-sm text-slate-400">Nenhum país.</p>
        )}
        {paises.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <p className="flex-1 font-semibold">
              {p.nome}{" "}
              <span className="text-xs font-normal text-slate-500">
                ({p.codigo})
              </span>
            </p>
            <button
              onClick={() => {
                setEditing(p);
                setOpen(true);
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-navy-700 hover:text-foreground"
            >
              <Pencil size={16} />
            </button>
            <DeleteButton label={p.nome} onConfirm={() => deletePais(p.id)} />
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar país" : "Novo país"}
        className="max-w-md"
      >
        <form
          action={async (fd) => {
            await savePais(fd);
            setOpen(false);
          }}
          className="space-y-4 p-5"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Nome">
            <input
              name="nome"
              required
              defaultValue={editing?.nome}
              className="input-field"
            />
          </Field>
          <Field label="Código (ISO)">
            <input
              name="codigo"
              required
              maxLength={3}
              defaultValue={editing?.codigo}
              placeholder="BR"
              className="input-field uppercase"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- AGENTES ---------- */

function AgentesAdmin({ agentes }: { agentes: Agente[] }) {
  const [editing, setEditing] = useState<Agente | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Toolbar
        title="Agentes GPT"
        onAdd={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <div className="card divide-y divide-navy-700">
        {agentes.length === 0 && (
          <p className="p-5 text-sm text-slate-400">Nenhum agente.</p>
        )}
        {agentes.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-4">
            <span className="w-6 text-center text-xs font-bold text-slate-500">
              {a.ordem}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{a.nome}</p>
              <p className="truncate text-xs text-slate-400">{a.link_agente}</p>
            </div>
            {!a.ativo && (
              <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                Inativo
              </span>
            )}
            <button
              onClick={() => {
                setEditing(a);
                setOpen(true);
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-navy-700 hover:text-foreground"
            >
              <Pencil size={16} />
            </button>
            <DeleteButton label={a.nome} onConfirm={() => deleteAgente(a.id)} />
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar agente" : "Novo agente"}
        className="max-w-lg"
      >
        <form
          action={async (fd) => {
            await saveAgente(fd);
            setOpen(false);
          }}
          className="space-y-4 p-5"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Nome">
            <input
              name="nome"
              required
              defaultValue={editing?.nome}
              className="input-field"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              name="descricao"
              rows={2}
              defaultValue={editing?.descricao ?? ""}
              className="input-field resize-none"
            />
          </Field>
          <Field label="URL do tutorial (Vimeo)">
            <input
              name="video_tutorial_url"
              required
              defaultValue={editing?.video_tutorial_url}
              placeholder="https://vimeo.com/123456789"
              className="input-field"
            />
          </Field>
          <Field label="Link do agente (GPT)">
            <input
              name="link_agente"
              required
              defaultValue={editing?.link_agente}
              placeholder="https://chatgpt.com/g/..."
              className="input-field"
            />
          </Field>
          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Ordem">
              <input
                name="ordem"
                type="number"
                defaultValue={editing?.ordem ?? 0}
                className="input-field"
              />
            </Field>
            <label className="flex h-11 items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="ativo"
                defaultChecked={editing ? editing.ativo : true}
                className="h-4 w-4 accent-brand"
              />
              Ativo
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
}
