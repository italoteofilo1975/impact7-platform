import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Edit2, Trash2, Tag, Palette, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const PRESET_COLORS = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#84cc16", // Lime
];

export default function AdminTags() {
  const { user, isAuthenticated } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<{ id: number; name: string; color: string; description: string | null } | null>(null);
  
  const [newTag, setNewTag] = useState({ name: "", color: "#f97316", description: "" });
  const [editTag, setEditTag] = useState({ name: "", color: "#f97316", description: "" });
  
  const utils = trpc.useUtils();
  
  const { data: tags, isLoading: tagsLoading } = trpc.tags.list.useQuery();
  
  const createMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      toast.success("Tag criada com sucesso!");
      utils.tags.list.invalidate();
      setIsCreateOpen(false);
      setNewTag({ name: "", color: "#f97316", description: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar tag");
    },
  });
  
  const updateMutation = trpc.tags.update.useMutation({
    onSuccess: () => {
      toast.success("Tag atualizada com sucesso!");
      utils.tags.list.invalidate();
      setIsEditOpen(false);
      setSelectedTag(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar tag");
    },
  });
  
  const deleteMutation = trpc.tags.delete.useMutation({
    onSuccess: () => {
      toast.success("Tag deletada com sucesso!");
      utils.tags.list.invalidate();
      setIsDeleteOpen(false);
      setSelectedTag(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar tag");
    },
  });
  
  const handleCreate = () => {
    if (!newTag.name.trim()) {
      toast.error("Nome da tag é obrigatório");
      return;
    }
    createMutation.mutate({
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim() || undefined,
    });
  };
  
  const handleEdit = () => {
    if (!selectedTag || !editTag.name.trim()) {
      toast.error("Nome da tag é obrigatório");
      return;
    }
    updateMutation.mutate({
      id: selectedTag.id,
      name: editTag.name.trim(),
      color: editTag.color,
      description: editTag.description.trim() || undefined,
    });
  };
  
  const handleDelete = () => {
    if (!selectedTag) return;
    deleteMutation.mutate({ id: selectedTag.id });
  };
  
  const openEdit = (tag: typeof selectedTag) => {
    if (!tag) return;
    setSelectedTag(tag);
    setEditTag({
      name: tag.name,
      color: tag.color,
      description: tag.description || "",
    });
    setIsEditOpen(true);
  };
  
  const openDelete = (tag: typeof selectedTag) => {
    setSelectedTag(tag);
    setIsDeleteOpen(true);
  };
  
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Esta página é restrita a administradores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button>Voltar ao Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <AdminBreadcrumb items={[{ label: 'Tags de Cases' }]} />
              <h1 className="text-3xl font-bold">Gerenciar Tags</h1>
              <p className="text-muted-foreground">
                Crie e gerencie tags para organizar os cases
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Tag
          </Button>
        </div>
        
        {/* Tags Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tagsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))
          ) : tags?.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma tag criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie tags para organizar e categorizar os cases de impacto.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tag
                </Button>
              </CardContent>
            </Card>
          ) : (
            tags?.map((tag) => (
              <Card key={tag.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      style={{ backgroundColor: tag.color, color: "#fff" }}
                      className="text-sm px-3 py-1"
                    >
                      {tag.name}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(tag)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDelete(tag)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {tag.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tag.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.color}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tag</DialogTitle>
              <DialogDescription>
                Adicione uma nova tag para categorizar os cases de impacto.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Tag</Label>
                <Input
                  id="name"
                  placeholder="Ex: Inovação Social"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        newTag.color === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTag({ ...newTag, color })}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="#f97316"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-28"
                  />
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: newTag.color }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito desta tag..."
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "Criando..." : "Criar Tag"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tag</DialogTitle>
              <DialogDescription>
                Atualize as informações da tag.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Tag</Label>
                <Input
                  id="edit-name"
                  value={editTag.name}
                  onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        editTag.color === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditTag({ ...editTag, color })}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={editTag.color}
                    onChange={(e) => setEditTag({ ...editTag, color: e.target.value })}
                    className="w-28"
                  />
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: editTag.color }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição (opcional)</Label>
                <Textarea
                  id="edit-description"
                  value={editTag.description}
                  onChange={(e) => setEditTag({ ...editTag, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar a tag "{selectedTag?.name}"?
                Esta ação não pode ser desfeita e removerá a tag de todos os cases associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deletando..." : "Deletar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
