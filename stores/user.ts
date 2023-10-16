export const useUserStore = defineStore('userStore', {
  state: () => ({
    userInfo: {},
    userTeams: [],
    userTeam: null,
    coworkers: [],
    userBusiness: [],
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
    getUserTeams: (state) => state.userTeams,
    getUserTeam: (state) => state.userTeam,
    getCoworkers: (state) => state.coworkers,
    getUserBusiness: (state) => state.userBusiness,
    getBusinessCategories: (state) => {
      const categories: any[] = state.userBusiness.flatMap(
        (business: any) => business.categories
      );
      return categories;
    },
    getBusinessItems: (state) => {
      const items: any[] = state.userBusiness.flatMap((business: any) =>
        business.categories.flatMap((category: any) => category.items)
      );
      return items;
    },
  },
  actions: {
    setUser(userInfo: any) {
      const user = JSON.parse(userInfo);
      const { capabilities, business } = user;
      const userTeams = capabilities.map(
        (capability: any) => capability.team_id
      );
      const [userTeam] = userTeams;

      this.userInfo = user;
      this.userTeams = userTeams;
      this.userTeam = userTeam;
      this.userBusiness = business;
     },
  },
});
