export const useRoutes = {
  translateRoutes: (route) => ({
    'default': route,
    'contact': 'contatos',
    'configure': 'organizações',
    'business': 'negócios',
    'configure tenant_id-business': 'negócios',
    'configure tenant_id-business-create-business': 'criar negócio',
    'configure tenant_id-task': 'tarefas',
    'configure tenant_id-template': 'templates',
    'configure tenant_id-team': 'times',
    'configure tenant_id-user': 'usuários',
    'configure tenant_id-role': 'cargos',
    'configure tenant_id-permission-group': 'permissões',
    'configure tenant_id-support-entities': 'entidades de apoio',
    'company': 'empresas',
    'company repository': 'diretório de empresas'
  }[route] || route),
}