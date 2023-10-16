const configs: Record<string, { API_URL: string }> = {
  development: {
    API_URL: 'https://apidev.crm.ops.omie.us',
  },
  production: {
    API_URL: 'https://api.crm.ops.omie.us',
  },
  homolog: {
    API_URL: 'https://apihml.crm.ops.omie.us',
  },
};

export { configs };
