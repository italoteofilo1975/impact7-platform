import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, UserCog, Plus, Trash2 } from "lucide-react";
// Toast removido temporariamente

export default function AdminUsers() {
  const toast = (msg: any) => alert(msg.title + (msg.description ? '\n' + msg.description : ''));
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Queries
  const { data: users, refetch: refetchUsers } = trpc.rbac.listUsers.useQuery();
  const { data: roles } = trpc.rbac.listRoles.useQuery();
  const { data: userRBAC } = trpc.rbac.getUserRBAC.useQuery(
    { userId: selectedUser! },
    { enabled: !!selectedUser }
  );

  // Mutations
  const assignRoleMutation = trpc.rbac.assignRole.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Role atribuído com sucesso" });
      refetchUsers();
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao atribuir role", description: error.message });
    },
  });

  const removeRoleMutation = trpc.rbac.removeRole.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Role removido com sucesso" });
      refetchUsers();
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao remover role", description: error.message });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) return;
    assignRoleMutation.mutate({ userId: selectedUser, roleCode: selectedRole });
  };

  const handleRemoveRole = (userId: number, roleCode: string) => {
    removeRoleMutation.mutate({ userId, roleCode });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Gerenciamento de Usuários e Permissões
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie roles e permissões dos usuários do sistema
        </p>
      </div>

      <div className="grid gap-6">
        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role (Legacy)</TableHead>
                  <TableHead>RBAC Roles</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Ver Roles
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Roles de {user.name}</DialogTitle>
                            <DialogDescription>
                              Gerencie os roles RBAC deste usuário
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Roles Atuais */}
                            <div>
                              <h4 className="font-semibold mb-2">Roles Atuais:</h4>
                              <div className="flex flex-wrap gap-2">
                                {userRBAC?.roles.length === 0 && (
                                  <p className="text-sm text-muted-foreground">Nenhum role atribuído</p>
                                )}
                                {userRBAC?.roles.map((roleCode) => (
                                  <Badge key={roleCode} variant="default" className="flex items-center gap-2">
                                    {roleCode}
                                    <button
                                      onClick={() => handleRemoveRole(user.id, roleCode)}
                                      className="hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Adicionar Role */}
                            <div>
                              <h4 className="font-semibold mb-2">Adicionar Role:</h4>
                              <div className="flex gap-2">
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles?.map((role) => (
                                      <SelectItem key={role.id} value={role.code}>
                                        {role.name} ({role.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button onClick={handleAssignRole} disabled={!selectedRole}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>

                            {/* Permissões */}
                            <div>
                              <h4 className="font-semibold mb-2">Permissões Efetivas:</h4>
                              <div className="max-h-40 overflow-y-auto">
                                <div className="flex flex-wrap gap-1">
                                  {userRBAC?.permissions.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Nenhuma permissão</p>
                                  )}
                                  {userRBAC?.permissions.map((perm) => (
                                    <Badge key={perm} variant="outline" className="text-xs">
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Card de Roles Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Roles Disponíveis</CardTitle>
            <CardDescription>
              Hierarquia de roles do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles?.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription>Level: {role.level}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {role.code}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
