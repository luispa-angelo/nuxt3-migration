interface ProfileState {
  preferences: object;
  profileLoaded: boolean;
}

export const useProfileStore = defineStore('ecosystem-profile', {
  state: (): ProfileState => ({ preferences: {}, profileLoaded: false }),
  getters: {
    getPreferences: (state: ProfileState) => state.preferences,
    getPreference: (state: ProfileState) => {
      return (preference: string) => {
        const preferences = state.preferences;
        if (preferences && preference in preferences) {
          const selectedPreference =
            preferences[preference as keyof typeof preferences];
          return selectedPreference;
        } else {
          return null;
        }
      };
    },
  },
  actions: {
    setPreferences(preferences: any) {
      this.preferences = preferences;
    },
    setProfileLoaded(status: boolean) {
      this.profileLoaded = status;
    },
  },
});
