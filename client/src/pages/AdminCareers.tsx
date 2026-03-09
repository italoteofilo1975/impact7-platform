import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

type JobForm = {
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange: string;
  description: string;
  requirements: string; // newline-separated
  benefits: string;     // newline-separated
  isActive: boolean;
  isNew: boolean;
  applyUrl: string;
};

const emptyForm: JobForm = {
  title: "",
  department: "",
  location: "",
  type: "Tempo Integral",
  salaryRange: "",
  description: "",
  requirements: "",
  benefits: "",
  isActive: true,
  isNew: true,
  applyUrl: "",
};

export default function AdminCareers() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: jobs = [], isLoading } = trpc.careers.adminList.useQuery();

  const createMutation = trpc.careers.create.useMutation({
    onSuccess: () => {
      toast.success("Vaga criada com sucesso!");
      utils.careers.adminList.invalidate();
      utils.careers.list.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error("Erro ao criar vaga: " + e.message),
  });

  const updateMutation = trpc.careers.update.useMutation({
    onSuccess: () => {
      toast.success("Vaga atualizada com sucesso!");
      utils.careers.adminList.invalidate();
      utils.careers.list.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error("Erro ao atualizar vaga: " + e.message),
  });

  const deleteMutation = trpc.careers.delete.useMutation({
    onSuccess: () => {
      toast.success("Vaga removida.");
      utils.careers.adminList.invalidate();
      utils.careers.list.invalidate();
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error("Erro ao remover vaga: " + e.message),
  });

  const toggleActiveMutation = trpc.careers.update.useMutation({
    onSuccess: () => {
      utils.careers.adminList.invalidate();
      utils.careers.list.invalidate();
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(job: (typeof jobs)[0]) {
    setEditingId(job.id);
    setForm({
      title: job.title,
      department: job.department ?? "",
      location: job.location ?? "",
      type: job.type ?? "Tempo Integral",
      salaryRange: job.salaryRange ?? "",
      description: job.description ?? "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
      isActive: job.isActive === 1,
      isNew: job.isNew === 1,
      applyUrl: job.applyUrl ?? "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = {
      title: form.title,
      department: form.department || undefined,
      location: form.location || undefined,
      type: form.type || undefined,
      salaryRange: form.salaryRange || undefined,
      description: form.description || undefined,
      requirements: form.requirements ? form.requirements.split("\n").map(s => s.trim()).filter(Boolean) : undefined,
      benefits: form.benefits ? form.benefits.split("\n").map(s => s.trim()).filter(Boolean) : undefined,
      isActive: form.isActive,
      isNew: form.isNew,
      applyUrl: form.applyUrl || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <AdminBreadcrumb
          items={[{ label: "Admin", href: "/admin" }, { label: "Carreiras" }]}
        />

        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BriefcaseBusiness className="w-6 h-6 text-primary" />
              Gerenciar Vagas
            </h1>
            <p className="text-muted-foreground mt-1">
              {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} cadastrada{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Vaga
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BriefcaseBusiness className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma vaga cadastrada</h3>
              <p className="text-muted-foreground mb-4">Crie a primeira vaga para aparecer na página de Carreiras.</p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar primeira vaga
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} className={job.isActive === 0 ? "opacity-60" : ""}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{job.title}</h3>
                        {job.isNew === 1 && (
                          <Badge variant="secondary" className="text-xs">Nova</Badge>
                        )}
                        <Badge
                          variant={job.isActive === 1 ? "default" : "outline"}
                          className="text-xs"
                        >
                          {job.isActive === 1 ? "Ativa" : "Inativa"}
                        </Badge>
                        {job.department && (
                          <Badge variant="outline" className="text-xs">{job.department}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{job.type}
                          </span>
                        )}
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />{job.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={job.isActive === 1 ? "Desativar" : "Ativar"}
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: job.id, isActive: job.isActive !== 1 })
                        }
                      >
                        {job.isActive === 1 ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Desenvolvedor(a) Full Stack Sênior"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Departamento</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Ex: Engenharia"
                  />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex: Remoto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Ex: Tempo Integral"
                  />
                </div>
                <div>
                  <Label>Faixa Salarial</Label>
                  <Input
                    value={form.salaryRange}
                    onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                    placeholder="Ex: R$10.000 – R$15.000"
                  />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva a vaga..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Requisitos (um por linha)</Label>
                <Textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder={"5+ anos de experiência\nReact, Node.js, TypeScript"}
                  rows={4}
                />
              </div>
              <div>
                <Label>Benefícios (um por linha)</Label>
                <Textarea
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  placeholder={"Trabalho 100% remoto\nPlano de saúde"}
                  rows={3}
                />
              </div>
              <div>
                <Label>URL para candidatura (opcional)</Label>
                <Input
                  value={form.applyUrl}
                  onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                  <Label>Vaga ativa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isNew}
                    onCheckedChange={(v) => setForm({ ...form, isNew: v })}
                  />
                  <Label>Marcar como nova</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !form.title.trim()}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Salvar alterações" : "Criar vaga"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Tem certeza que deseja remover esta vaga? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteMutation.mutate({ id: deleteConfirm })}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
